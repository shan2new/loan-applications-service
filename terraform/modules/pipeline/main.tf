# AWS CodePipeline resources

# S3 bucket for pipeline artifacts
resource "aws_s3_bucket" "artifacts" {
  bucket = "${var.prefix}-codepipeline-artifacts-${var.environment}"

  tags = {
    Name        = "${var.prefix}-codepipeline-artifacts"
    Environment = var.environment
  }
}

# Block public access to artifacts bucket
resource "aws_s3_bucket_public_access_block" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable server-side encryption for artifacts bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CodeBuild project for testing the application
resource "aws_codebuild_project" "test" {
  name          = "${var.prefix}-test-${var.environment}"
  description   = "Run tests for the ${var.prefix} application"
  service_role  = var.codebuild_role_arn
  build_timeout = 30
  queued_timeout = 15

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    type                        = "LINUX_CONTAINER"
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/amazonlinux2-x86_64-standard:5.0"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = false

    environment_variable {
      name  = "NODE_ENV"
      value = "test"
    }

    environment_variable {
      name  = "STAGE"
      value = "test"
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = "testspec.yml"  # Dedicated buildspec for testing

    # Ensure we're in the correct directory
    location = "/"
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "/aws/codebuild/${var.prefix}-test-${var.environment}"
      stream_name = "test-log"
    }
  }

  tags = {
    Name        = "${var.prefix}-test"
    Environment = var.environment
  }
}

# CodeBuild project for building the application
resource "aws_codebuild_project" "build" {
  name          = "${var.prefix}-build-${var.environment}"
  description   = "Build the ${var.prefix} application"
  service_role  = var.codebuild_role_arn
  build_timeout = 30
  queued_timeout = 15

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    type                        = "LINUX_CONTAINER"
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/amazonlinux2-x86_64-standard:5.0"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = false

    environment_variable {
      name  = "NODE_ENV"
      value = var.environment
    }

    environment_variable {
      name  = "STAGE"
      value = "build"
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = "buildspec.yml"  # Explicitly use root buildspec.yml

    # Ensure we're in the correct directory
    location = "/"
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "/aws/codebuild/${var.prefix}-build-${var.environment}"
      stream_name = "build-log"
    }
  }

  tags = {
    Name        = "${var.prefix}-build"
    Environment = var.environment
  }
}

# CloudWatch alarm for test failures
resource "aws_cloudwatch_metric_alarm" "test_failure_alarm" {
  alarm_name          = "${var.prefix}-test-failure-alarm-${var.environment}"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "FailedTests"
  namespace           = "AWS/CodeBuild"
  period              = 300
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "This alarm monitors for test failures in the ${var.prefix} pipeline"

  dimensions = {
    ProjectName = aws_codebuild_project.test.name
  }

  alarm_actions = [
    # Add SNS topic ARN here if you want notifications
    # var.sns_topic_arn
  ]

  tags = {
    Name        = "${var.prefix}-test-failure-alarm"
    Environment = var.environment
  }
}

# CodePipeline for CI/CD workflow
resource "aws_codepipeline" "pipeline" {
  name     = "${var.prefix}-pipeline-${var.environment}"
  role_arn = var.codepipeline_role_arn

  artifact_store {
    location = aws_s3_bucket.artifacts.bucket
    type     = "S3"
  }

  # Source stage - Pull code from GitHub
  stage {
    name = "Source"

    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeStarSourceConnection"
      version          = "1"
      output_artifacts = ["source_output"]

      configuration = {
        ConnectionArn        = var.codestar_connection_arn
        FullRepositoryId     = var.repository_name
        BranchName           = var.branch_name
        DetectChanges        = true  # Enable built-in change detection
      }
    }
  }

  # Test stage - Run tests before building
  stage {
    name = "Test"

    action {
      name             = "Test"
      category         = "Test"
      owner            = "AWS"
      provider         = "CodeBuild"
      input_artifacts  = ["source_output"]
      output_artifacts = ["test_output"]
      version          = "1"

      configuration = {
        ProjectName = aws_codebuild_project.test.name
      }
    }
  }

  # Build stage - Build the application
  stage {
    name = "Build"

    action {
      name             = "Build"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      input_artifacts  = ["source_output"]
      output_artifacts = ["build_output"]
      version          = "1"

      configuration = {
        ProjectName = aws_codebuild_project.build.name
      }
    }
  }

  # Deploy stage - Deploy to Elastic Beanstalk
  stage {
    name = "Deploy"

    action {
      name            = "Deploy"
      category        = "Deploy"
      owner           = "AWS"
      provider        = "ElasticBeanstalk"
      input_artifacts = ["build_output"]
      version         = "1"

      configuration = {
        ApplicationName = var.elastic_beanstalk_application
        EnvironmentName = var.elastic_beanstalk_environment
      }
    }
  }

  tags = {
    Name        = "${var.prefix}-pipeline"
    Environment = var.environment
  }
}

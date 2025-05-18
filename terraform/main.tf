# Terraform version configuration
terraform {
  required_version = "~> 1.8.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "loan-application-terraform-state"
    key            = "loan-applications-service/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}

# AWS Provider configuration
provider "aws" {
  region = var.aws_region
  # Profile is typically configured via AWS CLI
  # profile = "default"
}

# Local variables
locals {
  prefix = "${var.service_name}-${var.environment}"
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  prefix                = local.prefix
  environment           = var.environment
  vpc_cidr              = var.vpc_cidr
  public_subnet_cidrs   = var.public_subnet_cidrs
  private_subnet_cidrs  = var.private_subnet_cidrs
  availability_zones    = var.availability_zones
}

# Security Module (IAM roles, security groups)
module "security" {
  source = "./modules/security"

  prefix      = local.prefix
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  secrets_manager_arn = module.rds.secrets_manager_arn
}

# RDS Module (PostgreSQL database)
module "rds" {
  source = "./modules/rds"

  prefix            = local.prefix
  environment       = var.environment
  security_group_id = module.security.rds_security_group_id
  subnet_ids        = module.vpc.private_subnet_ids

  # Database configuration
  instance_class    = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  db_name           = var.db_name
  test_db_name      = var.test_db_name
  db_username       = var.db_username
  multi_az          = var.environment == "prod" ? true : false
}

# Data source for RDS secrets
data "aws_secretsmanager_secret" "rds_secret" {
  arn = module.rds.secrets_manager_arn
}

data "aws_secretsmanager_secret_version" "rds_secret_version" {
  secret_id = data.aws_secretsmanager_secret.rds_secret.id
}

# Additional local variables that depend on data sources
locals {
  # Parse the JSON secret
  db_creds = jsondecode(data.aws_secretsmanager_secret_version.rds_secret_version.secret_string)
}

# Elastic Beanstalk Module
module "eb" {
  source = "./modules/eb"

  prefix              = local.prefix
  environment         = var.environment
  solution_stack_name = var.eb_solution_stack_name

  # VPC configuration
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  elb_subnet_ids     = module.vpc.public_subnet_ids

  # Security configuration
  instance_profile_name = module.security.eb_instance_profile_name
  security_group_id     = module.security.eb_instance_security_group_id
  service_role_arn      = aws_iam_role.eb_service_role.arn

  # Instance configuration
  instance_type = var.eb_instance_type
  min_instances = var.eb_min_instances
  max_instances = var.eb_max_instances

  # Environment variables - provided directly to the application
  env_vars = {
    NODE_ENV         = var.environment
    PORT             = var.eb_port
    LOG_LEVEL        = var.log_level
    API_ACCESS_TOKEN = var.api_access_token
    DATABASE_URL     = var.db_url
  }
}

# IAM Role for Elastic Beanstalk service
resource "aws_iam_role" "eb_service_role" {
  name = "${local.prefix}-eb-service-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "elasticbeanstalk.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${local.prefix}-eb-service-role"
  }
}

# Attach policies to Elastic Beanstalk service role
resource "aws_iam_role_policy_attachment" "eb_service" {
  role       = aws_iam_role.eb_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkService"
}

resource "aws_iam_role_policy_attachment" "eb_enhanced_health" {
  role       = aws_iam_role.eb_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth"
}

# Add CloudWatch Logs permissions
resource "aws_iam_role_policy_attachment" "eb_cloudwatch_logs" {
  role       = aws_iam_role.eb_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}

# CI/CD Pipeline Module
module "pipeline" {
  source = "./modules/pipeline"

  service_name = var.service_name
  prefix       = local.prefix
  environment  = var.environment

  # IAM roles
  codepipeline_role_arn = module.security.codepipeline_role_arn
  codebuild_role_arn    = module.security.codebuild_role_arn

  # Source configuration - use a variable for the connection ARN
  codestar_connection_arn = var.codestar_connection_arn
  repository_name         = var.github_repository
  branch_name             = var.github_branch

  # Database secrets
  db_secrets_arn = module.rds.secrets_manager_arn

  # Elastic Beanstalk deployment
  elastic_beanstalk_application = module.eb.application_name
  elastic_beanstalk_environment = module.eb.environment_name
}

# Add EventBridge rule to monitor CodeStar Connection status
resource "aws_cloudwatch_event_rule" "codestar_connection_status" {
  name        = "${local.prefix}-codestar-connection-status"
  description = "Monitor CodeStar Connection status changes"

  event_pattern = jsonencode({
    source      = ["aws.codestar-connections"],
    detail-type = ["CodeStar Connection Status Change"],
    resources   = [var.codestar_connection_arn]
  })
}

# CloudWatch log group for connection status events
resource "aws_cloudwatch_log_group" "codestar_connection_logs" {
  name              = "/aws/events/codestar-connections-status"
  retention_in_days = 7
}

# EventBridge rule target to send events to CloudWatch Logs
resource "aws_cloudwatch_event_target" "log_codestar_events" {
  rule      = aws_cloudwatch_event_rule.codestar_connection_status.name
  target_id = "SendToCloudWatchLogs"
  arn       = aws_cloudwatch_log_group.codestar_connection_logs.arn
}



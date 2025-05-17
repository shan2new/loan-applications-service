output "artifacts_bucket_name" {
  description = "Name of the S3 bucket used for pipeline artifacts"
  value       = aws_s3_bucket.artifacts.bucket
}

output "artifacts_bucket_arn" {
  description = "ARN of the S3 bucket used for pipeline artifacts"
  value       = aws_s3_bucket.artifacts.arn
}

output "codebuild_project_name" {
  description = "Name of the CodeBuild project"
  value       = aws_codebuild_project.build.name
}

output "codebuild_project_arn" {
  description = "ARN of the CodeBuild project"
  value       = aws_codebuild_project.build.arn
}

output "codepipeline_name" {
  description = "Name of the CodePipeline"
  value       = aws_codepipeline.pipeline.name
}

output "codepipeline_arn" {
  description = "ARN of the CodePipeline"
  value       = aws_codepipeline.pipeline.arn
}

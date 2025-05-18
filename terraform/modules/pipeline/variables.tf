variable "prefix" {
  description = "Prefix for all resources"
  type        = string
}

variable "service_name" {
  description = "Name of the service"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
}

variable "codepipeline_role_arn" {
  description = "ARN of the IAM role for CodePipeline"
  type        = string
}

variable "codebuild_role_arn" {
  description = "ARN of the IAM role for CodeBuild"
  type        = string
}

variable "codestar_connection_arn" {
  description = "ARN of the CodeStar connection to GitHub"
  type        = string
}

variable "repository_name" {
  description = "GitHub repository name (format: username/repository)"
  type        = string
}

variable "branch_name" {
  description = "GitHub branch name"
  type        = string
  default     = "main"
}

variable "buildspec_path" {
  description = "Path to the buildspec file"
  type        = string
  default     = "buildspec.yml"
}

variable "codebuild_image_version" {
  description = "CodeBuild image version"
  type        = string
  default     = "5.0"
}

variable "elastic_beanstalk_application" {
  description = "Name of the Elastic Beanstalk application"
  type        = string
}

variable "elastic_beanstalk_environment" {
  description = "Name of the Elastic Beanstalk environment"
  type        = string
}

variable "db_secrets_arn" {
  description = "ARN of the Secrets Manager secret containing database credentials"
  type        = string
}

# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

# RDS Outputs
output "rds_endpoint" {
  description = "Endpoint of the RDS instance"
  value       = module.rds.endpoint
}

output "rds_secrets_manager_arn" {
  description = "ARN of the Secrets Manager secret containing database credentials"
  value       = module.rds.secrets_manager_arn
}

# Elastic Beanstalk Outputs
output "eb_application_name" {
  description = "Name of the Elastic Beanstalk application"
  value       = module.eb.application_name
}

output "eb_environment_name" {
  description = "Name of the Elastic Beanstalk environment"
  value       = module.eb.environment_name
}

output "eb_environment_endpoint" {
  description = "CNAME of the Elastic Beanstalk environment"
  value       = module.eb.environment_endpoint
}

# CI/CD Pipeline Outputs
output "codepipeline_name" {
  description = "Name of the CodePipeline"
  value       = module.pipeline.codepipeline_name
}

# GitHub connection is now using an existing connection from outside Terraform
output "github_connection_arn" {
  description = "ARN of the GitHub connection (externally managed)"
  value       = "arn:aws:codeconnections:ap-south-1:119030453285:connection/b20e04a5-1756-44d1-b79d-f797b728ae4d"
}

# Output variables
output "elastic_beanstalk_url" {
  description = "URL of the Elastic Beanstalk environment"
  value       = module.eb.environment_endpoint
}

output "eb_instance_profile" {
  description = "IAM instance profile for EC2 instances in Elastic Beanstalk"
  value       = module.security.eb_instance_profile_name
}

output "eb_instance_role" {
  description = "IAM role for EC2 instances in Elastic Beanstalk"
  value       = "loan-applications-service-${var.environment}-eb-ec2-role"
}

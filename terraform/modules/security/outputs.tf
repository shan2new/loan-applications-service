output "eb_instance_security_group_id" {
  description = "Security group ID for Elastic Beanstalk instances"
  value       = aws_security_group.eb_instances.id
}

output "rds_security_group_id" {
  description = "Security group ID for RDS database"
  value       = aws_security_group.rds.id
}

output "eb_instance_profile_name" {
  description = "Name of the IAM instance profile for Elastic Beanstalk"
  value       = aws_iam_instance_profile.eb_ec2.name
}

output "eb_instance_profile_arn" {
  description = "ARN of the IAM instance profile for Elastic Beanstalk"
  value       = aws_iam_instance_profile.eb_ec2.arn
}

output "codepipeline_role_arn" {
  description = "ARN of the CodePipeline IAM role"
  value       = aws_iam_role.codepipeline.arn
}

output "codebuild_role_arn" {
  description = "ARN of the CodeBuild IAM role"
  value       = aws_iam_role.codebuild.arn
}

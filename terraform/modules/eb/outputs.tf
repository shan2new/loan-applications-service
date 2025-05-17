output "application_name" {
  description = "Name of the Elastic Beanstalk Application"
  value       = aws_elastic_beanstalk_application.app.name
}

output "environment_name" {
  description = "Name of the Elastic Beanstalk Environment"
  value       = aws_elastic_beanstalk_environment.env.name
}

output "environment_id" {
  description = "ID of the Elastic Beanstalk Environment"
  value       = aws_elastic_beanstalk_environment.env.id
}

output "environment_endpoint" {
  description = "CNAME of the Elastic Beanstalk environment"
  value       = aws_elastic_beanstalk_environment.env.cname
}

output "environment_load_balancers" {
  description = "Load balancers in use by the environment"
  value       = aws_elastic_beanstalk_environment.env.load_balancers
}

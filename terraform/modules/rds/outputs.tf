output "endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.postgresql.endpoint
}

output "address" {
  description = "RDS instance address"
  value       = aws_db_instance.postgresql.address
}

output "port" {
  description = "RDS instance port"
  value       = aws_db_instance.postgresql.port
}

output "db_name" {
  description = "Database name"
  value       = aws_db_instance.postgresql.db_name
}

output "instance_id" {
  description = "RDS instance ID"
  value       = aws_db_instance.postgresql.id
}

output "secrets_manager_arn" {
  description = "ARN of the Secrets Manager secret containing database credentials"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

# RDS PostgreSQL Database

# DB Subnet Group
resource "aws_db_subnet_group" "default" {
  name        = "${var.prefix}-db-subnet-group"
  description = "DB subnet group for ${var.prefix}"
  subnet_ids  = var.subnet_ids

  tags = {
    Name        = "${var.prefix}-db-subnet-group"
    Environment = var.environment
  }
}

# Random password for RDS master user
resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Store the database credentials in Secrets Manager
resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${var.prefix}-${var.environment}-db-creds-${formatdate("YYYYMMDDHHmmss", timestamp())}"
  description             = "RDS credentials for ${var.prefix}"
  recovery_window_in_days = 7

  tags = {
    Name        = "${var.prefix}-db-credentials"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_password.result
    engine   = "postgres"
    host     = aws_db_instance.postgresql.address
    port     = aws_db_instance.postgresql.port
    dbname   = var.db_name
    dbInstanceIdentifier = aws_db_instance.postgresql.id
  })
}

# The RDS PostgreSQL instance
resource "aws_db_instance" "postgresql" {
  identifier             = "${var.prefix}-postgres"
  engine                 = "postgres"
  engine_version         = var.engine_version
  instance_class         = var.instance_class
  allocated_storage      = var.allocated_storage
  storage_type           = var.storage_type
  storage_encrypted      = true

  db_name                = var.db_name
  username               = var.db_username
  password               = random_password.db_password.result
  port                   = 5432

  vpc_security_group_ids = [var.security_group_id]
  db_subnet_group_name   = aws_db_subnet_group.default.name

  parameter_group_name   = aws_db_parameter_group.postgresql.name

  backup_retention_period = var.backup_retention_period
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  multi_az               = var.multi_az
  publicly_accessible    = false
  skip_final_snapshot    = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.prefix}-postgres-final-snapshot"
  deletion_protection    = var.deletion_protection

  # Enhanced monitoring
  monitoring_interval    = 60
  monitoring_role_arn    = aws_iam_role.rds_monitoring.arn

  tags = {
    Name        = "${var.prefix}-postgres"
    Environment = var.environment
  }
}

# Parameter Group for RDS PostgreSQL
resource "aws_db_parameter_group" "postgresql" {
  name        = "${var.prefix}-postgres-params"
  family      = "postgres15"
  description = "Parameter group for ${var.prefix} PostgreSQL database"

  # Security-related parameters
  parameter {
    name  = "log_statement"
    value = "ddl"  # Log only DDL statements
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"  # Log statements taking more than 1 second
  }

  tags = {
    Name        = "${var.prefix}-postgres-params"
    Environment = var.environment
  }
}

# IAM Role for Enhanced Monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "${var.prefix}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.prefix}-rds-monitoring-role"
  }
}

# Attach the necessary policy for Enhanced Monitoring
resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# SSM Parameter for database connection string (for application)
resource "aws_ssm_parameter" "db_connection_string" {
  name        = "/${var.prefix}/${var.environment}/database-url"
  description = "PostgreSQL connection string for the application"
  type        = "SecureString"
  value       = "postgresql://${var.db_username}:${urlencode(random_password.db_password.result)}@${aws_db_instance.postgresql.endpoint}/${var.db_name}?schema=public"

  tags = {
    Name        = "${var.prefix}-db-connection-string"
    Environment = var.environment
  }
}

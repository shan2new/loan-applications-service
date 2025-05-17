variable "prefix" {
  description = "Prefix for all resources"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
}

variable "security_group_id" {
  description = "ID of the security group for the RDS instance"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the DB subnet group"
  type        = list(string)
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.small"
}

variable "allocated_storage" {
  description = "Allocated storage for RDS instance (in GB)"
  type        = number
  default     = 20
}

variable "storage_type" {
  description = "Storage type for RDS instance"
  type        = string
  default     = "gp2"
}

variable "engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "15"
}

variable "db_name" {
  description = "Name of the initial database"
  type        = string
  default     = "loandb"
}

variable "db_username" {
  description = "Master username for the RDS instance"
  type        = string
  default     = "dbadmin"
}

variable "backup_retention_period" {
  description = "Backup retention period (in days)"
  type        = number
  default     = 7
}

variable "multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = true
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot when deleting the database"
  type        = bool
  default     = false
}

variable "deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

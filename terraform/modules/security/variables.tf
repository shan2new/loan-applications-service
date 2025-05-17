variable "prefix" {
  description = "Prefix for all resources"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "secrets_manager_arn" {
  description = "ARN of the Secrets Manager secret"
  type        = string
  default     = null
}

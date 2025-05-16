# Variables for Terraform configuration

variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "The deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "service_name" {
  description = "The name of the service"
  type        = string
  default     = "loan-applications-service"
}

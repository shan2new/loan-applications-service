# Variables for Terraform configuration

variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "The deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "service_name" {
  description = "The name of the service"
  type        = string
  default     = "loan-apps-svc"
}

# VPC Variables
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "availability_zones" {
  description = "Availability zones to use"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b"]
}

# Database Variables
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.small"
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS instance (in GB)"
  type        = number
  default     = 20
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

# Elastic Beanstalk Variables
variable "eb_solution_stack_name" {
  description = "Elastic Beanstalk solution stack name"
  type        = string
  default     = "64bit Amazon Linux 2023 v6.1.0 running Node.js 20"
}

variable "eb_instance_type" {
  description = "EC2 instance type for Elastic Beanstalk"
  type        = string
  default     = "t3.small"
}

variable "eb_min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 1
}

variable "eb_max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 2
}

# CI/CD Pipeline Variables
variable "github_repository" {
  description = "GitHub repository name (format: username/repository)"
  type        = string
  default     = "username/loan-applications-service"
}

variable "github_branch" {
  description = "GitHub branch name"
  type        = string
  default     = "main"
}

variable "codestar_connection_arn" {
  description = "ARN of the CodeStar connection to GitHub"
  type        = string
  default     = null
}

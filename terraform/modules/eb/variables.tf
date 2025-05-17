variable "prefix" {
  description = "Prefix for all resources"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
}

variable "solution_stack_name" {
  description = "Elastic Beanstalk solution stack name"
  type        = string
  default     = "64bit Amazon Linux 2023 v6.1.0 running Node.js 20"
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for the Elastic Beanstalk instances"
  type        = list(string)
}

variable "elb_subnet_ids" {
  description = "List of subnet IDs for the Elastic Load Balancer"
  type        = list(string)
}

variable "instance_profile_name" {
  description = "IAM instance profile name for Elastic Beanstalk EC2 instances"
  type        = string
}

variable "security_group_id" {
  description = "Security group ID for Elastic Beanstalk instances"
  type        = string
}

variable "service_role_arn" {
  description = "ARN of the service role for Elastic Beanstalk"
  type        = string
}

variable "ec2_key_name" {
  description = "Name of the EC2 key pair"
  type        = string
  default     = null
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small"
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 2
}

variable "node_version" {
  description = "Node.js version"
  type        = string
  default     = "20"
}

variable "env_vars" {
  description = "Environment variables for the application"
  type        = map(string)
  default     = {}
}

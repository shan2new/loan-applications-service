# Terraform version configuration
terraform {
  required_version = "~> 1.8.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # Uncomment to use a backend for state storage
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "loan-applications-service/terraform.tfstate"
  #   region = "us-west-2"
  # }
}

# AWS Provider configuration
provider "aws" {
  region = "us-west-2"
  # Profile is typically configured via AWS CLI
  # profile = "default"
}

# Example resource
# resource "aws_lambda_function" "loan_application_handler" {
#   function_name = "loan-application-handler"
#   runtime       = "nodejs18.x"
#   handler       = "index.handler"
#   role          = aws_iam_role.lambda_exec.arn
#   filename      = "../dist/lambda.zip"
#   
#   environment {
#     variables = {
#       NODE_ENV = "production"
#     }
#   }
# }

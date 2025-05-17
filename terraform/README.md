# Loan Applications Service - Terraform Infrastructure

This directory contains Terraform configuration for deploying the Loan Applications Service to AWS.

## Architecture

The infrastructure consists of:

- **VPC**: Isolated network with public and private subnets
- **RDS**: PostgreSQL database in private subnets
- **Elastic Beanstalk**: Node.js application environment
- **CI/CD Pipeline**: AWS CodePipeline with GitHub integration

## Prerequisites

- Terraform v1.8.0+
- AWS CLI configured with appropriate permissions
- S3 bucket for Terraform state
- DynamoDB table for state locking

## Setup

1. Create the S3 bucket and DynamoDB table for state management:

```bash
aws s3 mb s3://loan-application-terraform-state
aws dynamodb create-table \
  --table-name terraform-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

2. Initialize Terraform:

```bash
terraform init
```

## Deployment

1. Create a `terraform.tfvars` file with your specific configuration:

```hcl
environment       = "dev"
github_repository = "your-username/loan-applications-service"
github_branch     = "main"
```

2. Plan the deployment:

```bash
terraform plan -out=tfplan
```

3. Apply the changes:

```bash
terraform apply tfplan
```

## GitHub Connection Setup

After deploying, you need to manually complete the GitHub connection:

1. Go to the AWS Developer Tools Console
2. Navigate to Settings > Connections
3. Find the connection created by Terraform
4. Click "Update pending connection"
5. Follow the prompts to authorize AWS to access your GitHub repository

## Environment Variables

The application requires environment variables that are stored in AWS Systems Manager Parameter Store. After deployment, set up the required parameters:

```bash
aws ssm put-parameter \
  --name "/loan-applications-service/dev/database-url" \
  --type "SecureString" \
  --value "postgresql://username:password@hostname:5432/dbname"
```

## Destroying the Infrastructure

To tear down all resources:

```bash
terraform destroy
```

## Security Notes

- Database credentials are stored in AWS Secrets Manager
- All security groups follow least privilege principle
- RDS instance is deployed in private subnets
- All data is encrypted at rest and in transit

# Loan Applications Service

A Node.js backend service for processing loan applications with secure API endpoints.

## Features

- REST API for loan applications
- PostgreSQL database integration
- Secure authentication
- Monthly payment calculation
- CI/CD pipeline with AWS CodePipeline

## Overview

This service manages loan applications processing.

## Local Development Setup

### Prerequisites

- Node.js (LTS version recommended)
- npm
- Python (for pre-commit hooks)
- AWS CLI
- Terraform 1.8.x
- PostgreSQL database

### Getting Started

1. Clone this repository
2. Run the setup script to configure the development environment:

```bash
./setup.sh
```

This will install:

- TypeScript with strict mode enabled
- ESLint and Prettier for code quality
- Husky pre-commit hooks
- pre-commit hooks for ESLint, Prettier, and Terraform validation

### Environment Configuration

Copy the `.env.example` file to `.env` and configure the following variables:

```
# Database settings
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/loan_applications_db?schema=public"

# API security
API_ACCESS_TOKEN="your-secure-token-here"
CORS_ORIGINS="http://localhost:3000,https://your-frontend-domain.com"
```

### Database Setup

1. Make sure you have a PostgreSQL database running
2. Update the `.env` file with your database connection string
3. Run the Prisma migrations to set up your database schema:

```bash
npx prisma migrate dev
```

### Running the Service

```bash
# Development mode
npm run dev

# Build the project
npm run build

# Run in production mode
npm run start
```

## AWS Deployment

### Infrastructure as Code

This project uses Terraform to provision AWS infrastructure:

1. Set up the Terraform backend:

```bash
cd terraform
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

3. Configure deployment variables:

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your configuration
```

4. Deploy the infrastructure:

```bash
terraform apply
```

### CI/CD Pipeline

The CI/CD pipeline is automatically set up with the Terraform deployment. It includes:

1. Source stage: Pull code from GitHub
2. Build stage: Run tests and build the application
3. Deploy stage: Deploy to Elastic Beanstalk

After deployment, you need to manually complete the GitHub connection in the AWS Developer Tools Console.

### API Endpoints

> **Authentication Required**: All API endpoints require the `x-access-token` header with a valid token.

#### Public Endpoints

- `GET /health` - Health check endpoint (no authentication required)

#### Customers

- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get a customer by ID
- `POST /api/customers` - Create a new customer
- `PATCH /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer

#### Loan Applications

- `GET /api/loan-applications` - List all loan applications
- `GET /api/loan-applications/:id` - Get a loan application by ID
- `GET /api/loan-applications/customer/:customerId` - Get loan applications by customer ID
- `POST /api/loan-applications` - Create a new loan application

### Prisma Database Management

The project uses Prisma ORM for database operations and migrations.

#### Available Prisma Commands

- `npx prisma migrate dev` - Apply migrations to your local development database
- `npx prisma migrate deploy` - Apply migrations to production/staging environments
- `npx prisma db seed` - Seed the database with initial data (if configured)
- `npx prisma generate` - Generate Prisma Client based on your schema
- `npx prisma studio` - Open Prisma Studio to view and edit your database data

#### Creating New Migrations

When you make changes to the Prisma schema (`prisma/schema.prisma`), you need to create a new migration:

```bash
npx prisma migrate dev --name descriptive_name_of_your_changes
```

This command will:

1. Generate a new SQL migration file
2. Run the migration against your development database
3. Regenerate the Prisma Client

### Available Scripts

- `npm run build` - Build the TypeScript project
- `npm run lint` - Run ESLint on the codebase
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

### Project Structure

```
├── .husky/                 # Git hooks with Husky
├── prisma/                 # Prisma ORM schema and migrations
│   ├── schema.prisma       # Database schema definition
│   └── migrations/         # Database migrations
├── src/                    # TypeScript source code
├── terraform/              # Terraform infrastructure as code
├── .editorconfig           # Editor configuration
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore rules
├── .npmrc                  # npm configuration
├── .pre-commit-config.yaml # pre-commit hooks configuration
├── .prettierrc             # Prettier configuration
├── package.json            # Project dependencies and scripts
├── setup.sh                # Setup script
└── tsconfig.json           # TypeScript configuration with strict mode
```

## Toolchain

- TypeScript with strict mode
- AWS CLI for AWS interactions
- Terraform 1.8.x for infrastructure as code
- ESLint and Prettier for code quality
- Husky for Git hooks
- pre-commit for additional hooks
- Prisma ORM for database operations

## Architecture

This service follows a modular monolith architecture with clear separation of concerns:

### Layers

1. **Domain Layer** (`/src/domain`)

   - Contains entities, value objects, and repository interfaces
   - Represents the core business concepts and rules
   - No dependencies on other layers

2. **Application Layer** (`/src/application`)

   - Contains use cases that implement business logic
   - Depends on the domain layer
   - No dependencies on infrastructure or API layers

3. **Infrastructure Layer** (`/src/infrastructure`)

   - Contains implementations of repository interfaces
   - Database access using Prisma ORM
   - External services integration

4. **API Layer** (`/src/api`)
   - Contains controllers and DTOs
   - Handles HTTP requests and responses
   - Routes to appropriate use cases

### Security Implementation

The service implements a comprehensive security approach:

1. **Authentication**

   - Strategy pattern for flexible authentication mechanisms
   - Token-based authentication (current implementation)
   - Protected API routes by default
   - See `/src/shared/auth/README.md` for details

2. **API Security**

   - Rate limiting (global and per-endpoint)
   - Security headers with Content Security Policy
   - CORS protection with configurable origins
   - Input validation using Zod

3. **Environment Configuration**
   - Strong typing with validation
   - Secure defaults
   - Environment-specific settings

### Modular Structure

The application uses a plugin-based architecture for modularity:

- **Core** (`/src/core`)

  - Base application setup and module registration
  - Dependency injection container (using tsyringe)
  - Plugin system for dynamic module loading

- **Modules** (`/src/modules`)

  - Each module is a self-contained feature area (e.g., Loans, Credit Cards)
  - Modules register their own dependencies and routes
  - Can be added or removed without affecting other modules

- **Shared** (`/src/shared`)
  - Common utilities, error handling, logging, etc.
  - Used across multiple modules

## Extending the Application

### Adding a New Module

1. Create a new directory under `/src/modules/[your-module-name]`
2. Create a module class that extends `BaseModule`
3. Implement the required methods:
   - `registerDependencies`
   - `registerRoutes`
   - `initialize` (optional)
4. Register your module in `src/index.ts`

Example:

```typescript
// src/modules/credit-card/credit-card.module.ts
import { Express, Router } from 'express';
import { DependencyContainer, injectable } from 'tsyringe';
import { BaseModule } from '@core/module';

@injectable()
export class CreditCardModule extends BaseModule {
  readonly name = 'credit-card';

  registerDependencies(container: DependencyContainer): void {
    // Register your dependencies
  }

  registerRoutes(app: Express): void {
    const router = Router();
    // Register your routes
    app.use('/api', router);
  }

  async initialize(): Promise<void> {
    // Initialize your module
  }
}
```

### Using the Plugin System

Alternatively, you can use the plugin system to dynamically load modules:

```typescript
// src/modules/credit-card/credit-card.plugin.ts
import { createPlugin } from '@core/plugin';
import { CreditCardModule } from './credit-card.module';

createPlugin(() => new CreditCardModule(), {
  name: 'credit-card',
  description: 'Credit card management module',
  version: '1.0.0',
  author: 'Your Name',
});
```

## Debugging Private EC2 Instances with SSM

This project is configured with AWS Systems Manager (SSM) for debugging Elastic Beanstalk instances in private subnets.

### Prerequisites

1. Install the AWS CLI and Session Manager plugin:

   ```bash
   # macOS (with Homebrew)
   brew install awscli
   brew install session-manager-plugin

   # Linux
   curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/linux_64bit/session-manager-plugin.rpm" -o "session-manager-plugin.rpm"
   sudo yum install -y session-manager-plugin.rpm
   ```

2. Ensure you have the appropriate IAM permissions to use SSM.

### Connecting to Instances

1. List the available EC2 instances in your environment:

   ```bash
   aws ec2 describe-instances \
     --filters "Name=tag:elasticbeanstalk:environment-name,Values=loan-apps-svc-dev" \
     --query "Reservations[*].Instances[*].[InstanceId,PrivateIpAddress,Tags[?Key=='Name'].Value|[0]]" \
     --output table
   ```

2. Start an SSM session with a specific instance:

   ```bash
   aws ssm start-session --target i-instanceid
   ```

3. Execute a specific command on the instance:
   ```bash
   aws ssm start-session \
     --target i-instanceid \
     --document-name AWS-RunShellScript \
     --parameters 'commands=["cd /var/app/current && npm list"]'
   ```

### Common Debugging Commands

Once connected to an instance via SSM, you can use these commands for debugging:

```bash
# View application logs
cd /var/log/eb-activity.log
tail -f /var/log/eb-activity.log

# View Node.js application logs
cd /var/log/nodejs
cat nodejs.log

# Check the deployed application
cd /var/app/current
ls -la

# Check environment variables
printenv | grep -v AWS_ | grep -v SECRET

# Test database connectivity
nc -zv $(echo $DATABASE_URL | cut -d'@' -f2 | cut -d':' -f1) $(echo $DATABASE_URL | cut -d':' -f4 | cut -d'/' -f1)

# Check if the application is running
ps aux | grep node

# View SSM agent logs
tail -f /var/log/amazon/ssm/amazon-ssm-agent.log
```

### Viewing Extended Debug Logs

Custom debug logs are automatically collected and can be viewed:

```bash
# View the comprehensive debug log
cat /var/log/eb-debug.log

# Check if SSM agent is installed and running properly
systemctl status amazon-ssm-agent
```

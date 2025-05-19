# Loan Applications Service

A Node.js backend service for processing loan applications with secure API endpoints, built using modern architectural patterns and AWS infrastructure.

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Management](#database-management)
- [AWS Deployment](#aws-deployment)
- [Security Implementation](#security-implementation)
- [Extending the Application](#extending-the-application)
- [Development Practices](#development-practices)
- [Debugging and Troubleshooting](#debugging-and-troubleshooting)
- [AI Tools](#ai-tools)

## Features

- RESTful API for loan applications and customer management
- Clean Architecture/Domain-Driven Design implementation
- PostgreSQL database integration with Prisma ORM
- Secure API endpoints with token-based authentication
- Financial calculations for loan amortization
- Modular, extensible design with dependency injection
- Comprehensive error handling and logging
- CI/CD pipeline with AWS CodePipeline
- Infrastructure as Code using Terraform
- Elastic Beanstalk deployment with private networking

## Architecture Overview

This service follows modern architectural patterns including Clean Architecture, Domain-Driven Design (DDD), and Hexagonal Architecture (Ports and Adapters).

For more information about the architecture diagrams and how to update them, see [Architecture Diagrams Documentation](docs/architecture-diagrams.md).

### Architectural Layers

![High-Level Architecture](docs/images/high-level-architecture.png)

#### Detailed Architecture

![Low-Level Architecture](docs/images/low-level-architecture.png)

#### Deployment Architecture

![Deployment Architecture](docs/images/deployment-architecture.png)

1. **Domain Layer** (`/src/domain`)

   - Core business entities, value objects, and repository interfaces
   - Implements business rules and invariants (e.g., loan calculation)
   - Pure TypeScript with no external dependencies
   - Represents the "inner hexagon" in Hexagonal Architecture

2. **Application Layer** (`/src/application`)

   - Orchestrates domain objects to implement business use cases
   - Defines input/output ports for interacting with the domain
   - Enforces application-specific validation rules
   - Implements transaction boundaries and application services

3. **Infrastructure Layer** (`/src/infrastructure`)

   - Provides concrete implementations of repository interfaces
   - Manages database connections through Prisma ORM
   - Connects to external services and APIs
   - Functions as "adapters" in Hexagonal Architecture

4. **API Layer** (`/src/api`)
   - Exposes HTTP endpoints with Express
   - Maps between API DTOs and domain objects
   - Handles authentication and request validation
   - Functions as "driving adapters" in Hexagonal Architecture

### Core Module System

The application uses a plugin-based architecture with a dependency injection container:

- **ModuleRegistry**: Manages registration and initialization of modules
- **PluginRegistry**: Supports dynamic loading of plugins
- **DI Container**: Implemented using TSyringe for dependency injection

### Domain-Driven Design Concepts

- **Entities**: Objects with identity (e.g., `LoanApplication`, `Customer`)
- **Value Objects**: Immutable objects defined by their attributes (e.g., `MoneyAmount`)
- **Repositories**: Interfaces for data access with domain-specific methods
- **Domain Services**: Stateless operations that don't belong to any entity
- **Aggregates**: Clusters of domain objects treated as a unit (e.g., Loan Application)

## Getting Started

### Prerequisites

- Node.js (v20.x LTS recommended)
- npm (v10.x or newer)
- PostgreSQL (v15.x or newer)
- Python 3.x (for pre-commit hooks)
- AWS CLI (configured with appropriate credentials)
- Terraform (v1.8.x) for infrastructure deployment

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-organization/loan-applications-service.git
cd loan-applications-service
```

2. Run the setup script to configure the development environment:

```bash
chmod +x setup.sh
./setup.sh
```

This script installs and configures:

- All npm dependencies
- TypeScript with strict mode enabled
- ESLint and Prettier for code quality
- Husky for Git hooks
- pre-commit hooks for linting and Terraform validation

### Environment Configuration

1. Create your environment file:

```bash
cp .env.example .env
```

2. Configure the following variables in your `.env` file:

```
# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Database settings
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/loan_applications_db?schema=public"

# API security
API_ACCESS_TOKEN="your-secure-token-here"
CORS_ORIGINS="http://localhost:3000,https://your-frontend-domain.com"
```

### Database Setup

1. Ensure PostgreSQL is running locally
2. Create your development database:

```bash
createdb loan_applications_db
```

3. Run Prisma migrations to set up your schema:

```bash
npx prisma migrate dev
```

4. (Optional) Seed the database with initial data:

```bash
npx prisma db seed
```

### Running the Service

```bash
# Start in development mode with hot reloading
npm run dev

# Build the project
npm run build

# Run tests
npm run test

# Run in production mode (after building)
npm run start
```

## API Documentation

> **Authentication**: All API endpoints require the `x-access-token` header with a valid token, except where noted.

### Health Check Endpoint

- `GET /health` - Service health check (no authentication required)

### Customer Endpoints

| Method | Endpoint             | Description                    |
| ------ | -------------------- | ------------------------------ |
| GET    | `/api/customers`     | List all customers (paginated) |
| GET    | `/api/customers/:id` | Get a customer by ID           |
| POST   | `/api/customers`     | Create a new customer          |
| PATCH  | `/api/customers/:id` | Update a customer              |
| DELETE | `/api/customers/:id` | Delete a customer              |

### Loan Application Endpoints

| Method | Endpoint                                      | Description                            |
| ------ | --------------------------------------------- | -------------------------------------- |
| GET    | `/api/loan-applications`                      | List all loan applications (paginated) |
| GET    | `/api/loan-applications/:id`                  | Get a loan application by ID           |
| GET    | `/api/loan-applications/customer/:customerId` | Get loan applications by customer ID   |
| POST   | `/api/loan-applications`                      | Create a new loan application          |

### Request/Response Examples

#### Create Loan Application

Request:

```json
POST /api/loan-applications
Content-Type: application/json
x-access-token: your-api-token

{
  "customer_id": "uuid-here",
  "amount": 5000,
  "term_months": 36,
  "annual_interest_rate": 5.0
}
```

Response:

```json
{
  "data": {
    "id": "generated-uuid",
    "customer_id": "uuid-here",
    "amount": 5000,
    "term_months": 36,
    "annual_interest_rate": 5.0,
    "monthly_payment": 149.85,
    "created_at": "2023-01-15T08:30:00Z"
  }
}
```

## Database Management

The project uses Prisma ORM for database operations and migrations.

### Entities

The core database schema consists of two main entities:

- `customers`: Stores customer information
- `loan_applications`: Stores loan application data with a relation to customers

### Schema Details

#### Customers

Contains customer information:

- id (UUID primary key)
- full_name (String)
- email (String, unique)
- created_at (DateTime)
- Relationship to loan applications (one-to-many)

#### Loan Applications

The core table that stores loan application data including:

- id (UUID primary key)
- customer_id (UUID, foreign key to customers)
- amount (Decimal)
- term_months (Integer)
- annual_interest_rate (Decimal)
- monthly_payment (Decimal)
- created_at (DateTime)

### Migration Commands

- **Create and Apply Migrations**:

  ```bash
  npx prisma migrate dev --name descriptive_name
  ```

- **Apply Migrations in Production**:

  ```bash
  npx prisma migrate deploy
  ```

- **View Database with Prisma Studio**:
  ```bash
  npx prisma studio
  ```

### Best Practices

1. Always use migrations for schema changes
2. Include meaningful names for migrations
3. Test migrations on non-production environments first
4. Back up the database before applying migrations to production

## AWS Deployment

### Infrastructure Components

The AWS infrastructure for this service includes:

- **Elastic Beanstalk**: Hosting the Node.js application
- **RDS PostgreSQL**: Database instance in a private subnet
- **VPC**: Custom VPC with public and private subnets
- **CodePipeline**: CI/CD pipeline for automated deployments
- **SSM Parameter Store**: Secure storage for configuration values
- **IAM Roles**: Least-privilege access for all components

### Deployment with Terraform

1. Navigate to the Terraform directory:

   ```bash
   cd terraform
   ```

2. Set up the Terraform backend (one-time):

   ```bash
   aws s3 mb s3://loan-application-terraform-state
   aws dynamodb create-table \
     --table-name terraform-lock \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
   ```

3. Initialize Terraform:

   ```bash
   terraform init
   ```

4. Configure deployment variables:

   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your specific configuration
   ```

5. Plan and apply changes:
   ```bash
   terraform plan
   terraform apply
   ```

### CI/CD Pipeline Configuration

The CI/CD pipeline is automatically set up with Terraform and includes:

1. **Source Stage**: Connects to your GitHub repository
2. **Build Stage**:

   - Runs tests
   - Performs static code analysis
   - Builds the application
   - Generates deployment artifacts

3. **Deploy Stage**:
   - Deploys to Elastic Beanstalk
   - Runs database migrations
   - Performs health checks

After initial deployment, you'll need to manually authorize the GitHub connection in the AWS Developer Tools Console.

## Security Implementation

### Authentication

The service uses a flexible authentication system based on the Strategy pattern:

- Current implementation: Token-based authentication
- Easily extensible for JWT, OAuth, or other mechanisms
- See [src/shared/auth/README.md](src/shared/auth/README.md) for details

### API Security Measures

- **Rate Limiting**: Prevents abuse and DoS attacks
- **CORS Protection**: Configurable allowed origins
- **Security Headers**: Comprehensive Helmet.js configuration
- **Input Validation**: Schema validation with Zod
- **Parameterized Queries**: Prevents SQL injection via Prisma

### Infrastructure Security

- **Private Subnets**: Database and application instances in private subnets
- **Security Groups**: Tight network controls for all components
- **Least Privilege**: IAM roles with minimal necessary permissions
- **Secrets Management**: Environment variables stored in SSM Parameter Store
- **HTTPS**: All production endpoints require HTTPS

## Extending the Application

### Adding a New Module

The service follows a modular architecture. To add a new feature module:

1. Create a directory structure within `src/modules/[module-name]/`
2. Implement the necessary domain, application, and infrastructure components
3. Create a module class that extends `BaseModule`
4. Register the module in `src/index.ts`

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
    // Register repositories, services, controllers
  }

  registerRoutes(app: Express): void {
    const router = Router();
    // Configure routes
    app.use('/api', router);
  }

  async initialize(): Promise<void> {
    // Initialization logic
  }
}

// src/index.ts
app.registerModules([LoanModule, CreditCardModule]);
```

### Using the Plugin System

For dynamically loadable modules, use the plugin system:

```typescript
// src/modules/credit-card/credit-card.plugin.ts
import { createPlugin } from '@core/plugin';
import { CreditCardModule } from './credit-card.module';

createPlugin(() => new CreditCardModule(), {
  name: 'credit-card',
  description: 'Credit card management functionality',
  version: '1.0.0',
});
```

## Development Practices

### Code Quality Tools

- **TypeScript**: Strict mode with comprehensive type checking
- **ESLint**: Enforces code quality rules
- **Prettier**: Ensures consistent code formatting
- **Husky**: Runs checks on Git operations
- **pre-commit**: Additional pre-commit hooks

### Testing

The project uses Jest for testing with a focus on:

- Unit tests for domain logic
- Integration tests for repositories
- API tests for endpoints

To run tests:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode during development
npm run test:watch
```

### Logging

The service uses Pino for structured JSON logging:

- **Development**: Human-readable logs with pino-pretty
- **Production**: JSON logs for easy ingestion into monitoring systems
- **Request Context**: Request IDs propagated through the application
- **Sensitive Data**: Automatically redacted from logs

## Debugging and Troubleshooting

### Local Debugging

- Use the `debug` npm package for detailed logs
- Run with Node.js inspector for breakpoints:
  ```bash
  node --inspect -r ts-node/register src/index.ts
  ```

### Debugging Deployed Instances

The service is configured with AWS Systems Manager for remote debugging:

1. List instances:

   ```bash
   aws ec2 describe-instances \
     --filters "Name=tag:elasticbeanstalk:environment-name,Values=loan-apps-svc-dev" \
     --query "Reservations[*].Instances[*].[InstanceId]" \
     --output text
   ```

2. Connect via SSM:

   ```bash
   aws ssm start-session --target i-instanceid
   ```

3. View common log files:

   ```bash
   # Application logs
   tail -f /var/log/nodejs/nodejs.log

   # Elastic Beanstalk logs
   tail -f /var/log/eb-activity.log
   ```

### Common Issues and Solutions

- **Database Connection Issues**: Check security groups and network ACLs
- **Authentication Failures**: Verify the API_ACCESS_TOKEN is set correctly
- **Deployment Failures**: Check CodePipeline logs for specific errors
- **Performance Issues**: Review database query patterns and indexes

# AI Tools Used in This Project

This document outlines the artificial intelligence (AI) tools that were utilized during the development of the Loan Applications Service. These tools helped streamline development, enhance code quality, and accelerate the implementation of various features.

## Overview of AI Tools

The following AI tools were strategically employed for different aspects of the project development:

### Cursor with Auto Mode

**Purpose**: General code development and implementation

**Usage in this project**:

- Writing boilerplate code for service classes and repositories
- Implementing standard patterns and architectural components
- Generating TypeScript interfaces and types
- Creating unit and integration tests
- Implementing validation logic

Cursor's Auto mode was particularly helpful for maintaining consistency across the codebase and implementing Clean Architecture patterns efficiently.

### Cursor with Claude 3.7 Sonnet (Anthropic)

**Purpose**: Complex code changes and thorough code reviews

**Usage in this project**:

- Implementing the complex domain logic for loan calculations
- Refactoring large components to improve maintainability
- Creating and optimizing database migration scripts
- Conducting detailed code reviews to ensure compliance with best practices
- Implementing architectural diagrams using Mermaid
- Handling intricate TypeScript type definitions and generics

Claude 3.7 Sonnet was invaluable for tasks that required deep understanding of the codebase and careful consideration of design choices, particularly when implementing the core business logic.

### ChatGPT with o4-mini (OpenAI)

**Purpose**: Brainstorming ideas and researching tools/libraries

**Usage in this project**:

- Exploring suitable npm packages and libraries for specific requirements
- Brainstorming architectural approaches and design patterns
- Researching AWS infrastructure best practices
- Finding solutions to technical challenges and debugging issues
- Evaluating alternative implementation approaches

The o4-mini model proved effective for quick ideation and gathering information about potential tools and approaches without requiring extensive context about the entire codebase.

## AI-Assisted Development Approach

Throughout this project, these AI tools were used as augmentative assistants rather than replacements for human engineering judgment. All code suggestions and architectural recommendations from AI tools were carefully reviewed and adapted before implementation.

Key principles followed when using AI tools:

- Maintain security best practices by not sharing sensitive information
- Verify all generated code against project requirements
- Ensure performance and maintainability of AI-suggested implementations
- Adapt AI suggestions to align with the project's established patterns and standards

## Benefits Realized

The strategic use of these AI tools contributed to the project in several ways:

- Accelerated implementation of standard components
- Improved code quality through AI-assisted reviews
- Reduced boilerplate coding time
- Enhanced architectural consistency
- Facilitated exploration of alternative approaches

# Challenges Faced

- High probability of random syntax / linter issues
- Ocassionally diverges from the mentione approach, despite explicitly mentioning.
- Adds unecessary code without explicit confirmation

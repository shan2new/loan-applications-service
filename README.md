# Loan Applications Service

## Overview

This service manages loan applications processing.

## Local Development Setup

### Prerequisites

- Node.js (LTS version recommended)
- npm
- Python (for pre-commit hooks)
- AWS CLI
- Terraform 1.8.x

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

### Available Scripts

- `npm run build` - Build the TypeScript project
- `npm run lint` - Run ESLint on the codebase
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

### Project Structure

```
├── .husky/                 # Git hooks with Husky
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

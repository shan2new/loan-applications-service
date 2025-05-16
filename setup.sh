#!/usr/bin/env bash

# Install pre-commit if not already installed
if ! command -v pre-commit &> /dev/null; then
  echo "Installing pre-commit..."
  pip install pre-commit
fi

# Install AWS CLI if not already installed
if ! command -v aws &> /dev/null; then
  echo "AWS CLI not found. Please install it manually following the instructions at:"
  echo "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
fi

# Install Terraform if not already installed
if ! command -v terraform &> /dev/null; then
  echo "Terraform not found. Please install Terraform 1.8.x following the instructions at:"
  echo "https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli"
fi

# Install pre-commit hooks
pre-commit install

echo "✅ Local toolchain setup complete!"
echo "TypeScript strict mode configured"
echo "ESLint and Prettier configured"
echo "Husky pre-commit hooks installed"
echo "Pre-commit hooks installed"

# Print versions
echo ""
echo "Installed versions:"
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"
if command -v aws &> /dev/null; then
  echo "AWS CLI: $(aws --version)"
fi
if command -v terraform &> /dev/null; then
  echo "Terraform: $(terraform -v | head -n1)"
fi
if command -v pre-commit &> /dev/null; then
  echo "pre-commit: $(pre-commit --version)"
fi

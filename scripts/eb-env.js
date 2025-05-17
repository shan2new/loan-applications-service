#!/usr/bin/env node

// Using CommonJS syntax since this is a Node.js script

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV_FILE_PATH = path.join(process.cwd(), '.env');

// Function to retrieve a parameter from SSM Parameter Store
async function getParameter(paramName) {
  try {
    const command = `aws ssm get-parameter --name "${paramName}" --with-decryption --query "Parameter.Value" --output text`;
    const result = execSync(command).toString().trim();
    return result;
  } catch (error) {
    console.error(`Failed to retrieve parameter ${paramName}: ${error.message}`);
    return null;
  }
}

// Function to fetch all environment variables from Parameter Store
async function fetchEnvironmentVariables() {
  try {
    console.log('Fetching environment variables from SSM Parameter Store...');
    const appName = process.env.APP_NAME || 'loan-applications-service';
    const environment = process.env.NODE_ENV || 'production';
    const paramPrefix = `/${appName}/${environment}/`;

    // List all parameters with the prefix
    const listCommand = `aws ssm get-parameters-by-path --path "${paramPrefix}" --recursive --with-decryption --query "Parameters[].Name" --output text`;
    const paramNames = execSync(listCommand).toString().trim().split('\t');

    if (!paramNames || paramNames.length === 0 || paramNames[0] === '') {
      console.log('No parameters found with prefix:', paramPrefix);
      return {};
    }

    // Fetch each parameter value
    const variables = {};
    for (const paramName of paramNames) {
      const value = await getParameter(paramName);
      if (value) {
        // Extract the variable name from the parameter path
        const varName = paramName.replace(paramPrefix, '').replace(/-/g, '_').toUpperCase();
        variables[varName] = value;
      }
    }

    return variables;
  } catch (error) {
    console.error('Error fetching environment variables:', error.message);
    return {};
  }
}

// Function to write variables to .env file
function writeEnvFile(variables) {
  try {
    let envContent = '';

    for (const [key, value] of Object.entries(variables)) {
      envContent += `${key}=${value}\n`;
    }

    fs.writeFileSync(ENV_FILE_PATH, envContent);
    console.log(`Environment variables written to ${ENV_FILE_PATH}`);

    // Also export to current shell
    for (const [key, value] of Object.entries(variables)) {
      process.env[key] = value;
      console.log(`Exported ${key}`);
    }
  } catch (error) {
    console.error('Error writing .env file:', error.message);
  }
}

// Main function
async function main() {
  console.log('Starting environment setup...');
  const variables = await fetchEnvironmentVariables();

  if (Object.keys(variables).length) {
    writeEnvFile(variables);
    console.log('Environment setup complete!');
  } else {
    console.log('No environment variables found or error occurred.');
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

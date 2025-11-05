# Terraform Infrastructure for sta-lambda

This directory contains Terraform configuration to deploy the sta-lambda Lambda function and API Gateway.

## Prerequisites

1. **Terraform installed** (>= 1.0)
   ```bash
   terraform version
   ```

2. **AWS CLI configured** with appropriate credentials
   ```bash
   aws configure
   ```

3. **Node.js and npm** for building the Lambda function
   ```bash
   node --version  # Should be >= 18.0.0
   ```

## Setup

1. **Copy the example variables file:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Edit `terraform.tfvars`** with your actual values:
   ```bash
   # Edit terraform.tfvars with your secrets
   nano terraform.tfvars
   ```

3. **Initialize Terraform:**
   ```bash
   cd terraform
   terraform init
   ```

## Build and Deploy

### Build the Lambda Function

From the project root:
```bash
npm install
npm run build
```

### Deploy Infrastructure

1. **Review what will be created:**
   ```bash
   cd terraform
   terraform plan
   ```

2. **Deploy:**
   ```bash
   terraform apply
   ```

3. **Confirm deployment** by typing `yes` when prompted

### Deploy to Different Environments

Using Terraform workspaces:

```bash
# Development
terraform workspace new dev
terraform apply -var-file=dev.tfvars

# Production
terraform workspace new prod
terraform apply -var-file=prod.tfvars
```

Or use npm scripts from project root:
```bash
npm run deploy:dev
npm run deploy:prod
```

## Files Structure

```
terraform/
├── main.tf              # Main provider configuration
├── versions.tf          # Terraform and provider versions
├── variables.tf         # Input variables
├── outputs.tf           # Output values
├── lambda.tf            # Lambda function definition
├── api-gateway.tf       # API Gateway configuration
├── iam.tf               # IAM roles and policies
├── terraform.tfvars.example  # Example variables file
└── README.md            # This file
```

## Variables

All variables are defined in `variables.tf`. Key variables:

- `environment` - Environment name (dev, staging, prod)
- `region` - AWS region (default: us-east-1)
- `function_name` - Lambda function name
- `runtime` - Lambda runtime (default: nodejs18.x)
- `memory_size` - Lambda memory in MB (default: 1536)
- `timeout` - Lambda timeout in seconds (default: 300)
- Environment variables (Infura, Pinata, etc.) - Marked as sensitive

## Outputs

After deployment, Terraform will output:

- `lambda_function_name` - Lambda function name
- `lambda_function_arn` - Lambda function ARN
- `api_gateway_url` - API Gateway endpoint URL
- `api_gateway_id` - API Gateway ID
- `lambda_role_arn` - IAM role ARN

View outputs:
```bash
terraform output
```

## Lambda Function Package

The Lambda function code is packaged from the `dist/` directory:

1. TypeScript is compiled to `dist/` using `npm run build`
2. Terraform creates a zip file from `dist/`
3. The zip file is uploaded to Lambda

**Note:** For production deployments, you may need to bundle `node_modules` dependencies. The current setup assumes dependencies are available at runtime (Lambda layers) or bundled separately.

## State Management

Terraform state is stored locally by default. For team collaboration, consider:

1. **Remote state** (S3 backend)
2. **State locking** (DynamoDB)

Example backend configuration:
```hcl
terraform {
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "sta-lambda/terraform.tfstate"
    region = "us-east-1"
  }
}
```

## Destroying Resources

To remove all created resources:

```bash
cd terraform
terraform destroy
```

## Troubleshooting

### Lambda Handler Not Found
- Ensure `npm run build` completed successfully
- Check that `dist/functions/property-creation/handler.js` exists
- Verify handler path in `variables.tf` matches the actual file structure

### API Gateway 502 Errors
- Check CloudWatch Logs for Lambda errors
- Verify Lambda permissions for API Gateway
- Check API Gateway stage deployment

### Missing Environment Variables
- Ensure all variables are set in `terraform.tfvars`
- Check that sensitive variables are not empty
- Verify AWS Secrets Manager or Parameter Store if using those

## Security Notes

1. **Never commit `terraform.tfvars`** - It contains sensitive data
2. **Use AWS Secrets Manager** or **Parameter Store** for sensitive values in production
3. **Review IAM permissions** - Least privilege principle
4. **Enable encryption** for state files if using S3 backend

## Migration from Serverless Framework

This Terraform configuration replaces `serverless.yml`. The functionality is equivalent:

- ✅ Lambda function with same configuration
- ✅ API Gateway with CORS
- ✅ IAM roles and policies
- ✅ Environment variables
- ✅ CloudWatch Logs

The main difference is infrastructure management:
- **Serverless Framework**: `serverless deploy`
- **Terraform**: `terraform apply`




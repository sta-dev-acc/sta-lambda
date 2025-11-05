# Lambda Module

A reusable Terraform module for creating AWS Lambda functions.

## Usage

```hcl
module "my_lambda" {
  source = "./modules/lambda"

  function_name    = "my-function-name"
  handler         = "handler.functionName"
  runtime         = "nodejs18.x"
  memory_size     = 512
  timeout         = 30
  description     = "My Lambda function description"
  source_code_path = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  iam_role_arn    = aws_iam_role.lambda_role.arn

  environment_variables = {
    NODE_ENV = "production"
    API_KEY  = var.api_key
  }

  tags = {
    Environment = "production"
    Project     = "my-project"
  }
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| function_name | Name of the Lambda function | `string` | - | yes |
| handler | Lambda handler (e.g., handler.functionName) | `string` | - | yes |
| runtime | Lambda runtime | `string` | `"nodejs18.x"` | no |
| memory_size | Lambda memory size in MB | `number` | `512` | no |
| timeout | Lambda timeout in seconds | `number` | `30` | no |
| description | Lambda function description | `string` | `""` | no |
| source_code_path | Path to the Lambda deployment package (zip file) | `string` | - | yes |
| source_code_hash | Hash of the source code | `string` | - | yes |
| environment_variables | Environment variables for the Lambda | `map(string)` | `{}` | no |
| iam_role_arn | IAM role ARN for the Lambda function | `string` | - | yes |
| tags | Tags to apply to the Lambda function | `map(string)` | `{}` | no |
| log_retention_days | CloudWatch log retention in days | `number` | `14` | no |

## Outputs

| Name | Description |
|------|-------------|
| function_name | Name of the Lambda function |
| function_arn | ARN of the Lambda function |
| invoke_arn | Invoke ARN (for API Gateway integration) |
| function_id | ID of the Lambda function |
| cloudwatch_log_group_name | Name of the CloudWatch log group |

## Example: Adding a New Lambda

```hcl
# In lambda.tf or a new lambda-email.tf file
module "email_sender_lambda" {
  source = "./modules/lambda"

  function_name    = "sta-lambda-emailSender"
  handler         = "emailHandler.sendEmail"
  runtime         = "nodejs18.x"
  memory_size     = 512
  timeout         = 30
  description     = "Email sending service"
  source_code_path = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  iam_role_arn    = aws_iam_role.lambda_role.arn

  environment_variables = {
    NODE_ENV    = var.environment
    SES_REGION  = "us-east-1"
    FROM_EMAIL  = var.from_email
  }

  tags = local.tags
}
```

## Resources Created

- `aws_lambda_function` - The Lambda function
- `aws_cloudwatch_log_group` - Log group for Lambda logs


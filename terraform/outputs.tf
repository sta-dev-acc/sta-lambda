# Property Creation Lambda Outputs
output "property_lambda_function_name" {
  description = "Name of the Property Creation Lambda function"
  value       = module.property_creation_lambda.function_name
}

output "property_lambda_function_arn" {
  description = "ARN of the Property Creation Lambda function"
  value       = module.property_creation_lambda.function_arn
}

# Legacy outputs (for backward compatibility)
output "lambda_function_name" {
  description = "Name of the Lambda function (Property Creation)"
  value       = module.property_creation_lambda.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function (Property Creation)"
  value       = module.property_creation_lambda.function_arn
}

output "api_gateway_id" {
  description = "ID of the API Gateway"
  value       = aws_api_gateway_rest_api.api.id
}

output "api_gateway_url" {
  description = "URL of the API Gateway"
  value       = "${aws_api_gateway_stage.api.invoke_url}/property/create"
}

output "api_gateway_execution_arn" {
  description = "Execution ARN of the API Gateway"
  value       = aws_api_gateway_rest_api.api.execution_arn
}

output "lambda_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = aws_iam_role.lambda_role.arn
}




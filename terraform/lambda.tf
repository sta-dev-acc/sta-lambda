# Archive Lambda function code (shared across all Lambda functions)
# Note: Each Lambda function can have different handlers in the same zip
# The dist/handler.js file contains all handlers bundled
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../dist"
  output_path = "${path.module}/../lambda-deployment.zip"
  excludes    = ["**/*.map", "**/*.d.ts"]
}

# Note: Individual Lambda functions are defined in separate files:
# - lambda-property.tf  (Property creation with Pinata + Blockchain)
# - lambda-email.tf     (Email sending - add when needed)
# - lambda-*.tf         (Other functions - add as needed)

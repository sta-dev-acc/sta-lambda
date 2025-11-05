variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "development"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "function_name" {
  description = "Lambda function name"
  type        = string
  default     = "sta-lambda-propertyCreation"
}

variable "runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "nodejs18.x"
}

variable "memory_size" {
  description = "Lambda memory size in MB"
  type        = number
  default     = 1536 # Often use for medium weight functions, Billing is based on memory allocation and execution time
}

variable "timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 300 # 5 minutes, default timeout is 3 seconds
}

variable "handler" {
  description = "Lambda handler (bundled file)"
  type        = string
  default     = "handler.propertyCreationHandler"
}

# Environment Variables
variable "infura_rpc_url" {
  description = "Infura RPC URL for blockchain"
  type        = string
  sensitive   = true
}

variable "master_wallet_private_key" {
  description = "Master wallet private key"
  type        = string
  sensitive   = true
}

variable "smart_tags_contract_address" {
  description = "Smart Tags contract address"
  type        = string
  sensitive   = true
}

variable "pinata_api_key" {
  description = "Pinata API key"
  type        = string
  sensitive   = true
}

variable "pinata_secret_api_key" {
  description = "Pinata secret API key"
  type        = string
  sensitive   = true
}

variable "website_url" {
  description = "Website URL"
  type        = string
  default     = "https://app.smarttaganalytics.com"
}

# API Gateway
variable "api_gateway_name" {
  description = "API Gateway name"
  type        = string
  default     = "sta-lambda-api"
}

variable "api_path" {
  description = "API Gateway path"
  type        = string
  default     = "property/create"
}

variable "api_method" {
  description = "API Gateway HTTP method"
  type        = string
  default     = "POST"
}

variable "enable_cors" {
  description = "Enable CORS for API Gateway"
  type        = bool
  default     = true
}


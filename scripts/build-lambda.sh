#!/bin/bash

# Build script for Lambda deployment package
# This script:
# 1. Compiles TypeScript to JavaScript
# 2. Bundles the code with dependencies using esbuild
# 3. Creates a deployment-ready package

set -e

echo "🔨 Building Lambda function..."

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist
rm -f lambda-deployment.zip

# Step 1: Compile TypeScript (for type checking and shared code)
echo "📦 Compiling TypeScript..."
npm run build

# Step 2: Bundle Lambda handler with esbuild
echo "📦 Bundling Lambda handler with dependencies..."
npm run bundle

echo "✅ Build complete!"

echo ""
echo "📝 Next steps:"
echo "1. Run 'cd terraform && terraform init'"
echo "2. Copy 'terraform.tfvars.example' to 'terraform.tfvars' and fill in values"
echo "3. Run 'terraform plan' to review changes"
echo "4. Run 'terraform apply' to deploy"

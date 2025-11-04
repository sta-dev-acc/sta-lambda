# Smart Tags Analytics Lambda Functions

A simplified AWS Lambda-based serverless architecture for handling property creation workflows with blockchain integration.

## Architecture

This repository contains a streamlined Lambda function with service-based architecture for better organization and reusability.

```
src/
├── functions/
│   └── property-creation/
│       └── handler.ts          # Main Lambda handler
├── shared/
│   ├── services/              # Business logic services
│   │   ├── blockchain.service.ts
│   │   ├── pinata.service.ts
│   └── types/
│       └── lambda.types.ts    # TypeScript type definitions
├── contracts/
│   └── abis/
│       └── SmartTags.json     # Smart contract ABI
└── types/
    └── lambda.types.ts        # Legacy types (for compatibility)
```

## Function: Property Creation

### Purpose
Handles the complete property creation workflow when files need to be registered on the blockchain.

### Workflow
1. **Uploads property files to Pinata/IPFS** → Returns metadata CID
2. **Registers property on blockchain** with metadata CID → Returns token ID and transaction hash
3. Returns blockchain details to caller in sta-api

### Input
```typescript
{
  propertyId: string;        // Required - unique property identifier
  propertyName: string;     // Required - property name
  fileUrls: string[];       // Required - array of S3 URLs to upload
  userId: number;            // Required - user ID
  userEmail: string;        // Required - recipient email
  userFullName: string;      // Required - user full name
}
```

### Output
```typescript
{
  success: boolean;
  tokenId: number;              // Blockchain token ID
  transactionHash: string;       // Blockchain transaction hash
  metadataCID: string;           // IPFS metadata content ID
  message: string;              // Success message
  warnings?: string[];          // Optional warnings
}
```

## Services

### BlockchainService
- Handles all blockchain operations
- Wallet balance checking
- Gas estimation
- Property registration
- Transaction confirmation

### PinataService
- File upload to IPFS
- Metadata creation and upload
- File validation and type checking
- S3 URL processing

Note: Email notifications are handled by sta-api. This Lambda focuses solely on Pinata/IPFS and blockchain operations.

## Environment Variables

### Required

```bash
# Blockchain Configuration
INFURA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
MASTER_WALLET_PRIVATE_KEY=your_private_key
SMART_TAGS_CONTRACT_ADDRESS=0x...

# Pinata/IPFS Configuration  
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key

# Website Configuration
WEBSITE_URL=https://app.smarttaganalytics.com
```

## Deployment

### Prerequisites
- Node.js v18.0.0+
- AWS CLI configured
- Serverless Framework installed

### Install Dependencies
```bash
npm install
```

### Build TypeScript
```bash
npm run build
```

### Deploy to Development
```bash
npm run deploy:dev
```

### Deploy to Production
```bash
npm run deploy:prod
```

### View Logs
```bash
serverless logs -f propertyCreation --tail
```

## Code Structure

### Service-Based Architecture
The handler uses service classes for better organization:

1. **Handler** - Main Lambda entry point
2. **Services** - Business logic separation
3. **Types** - TypeScript definitions
4. **Contracts** - Smart contract ABI

### Handler Flow
```typescript
1. Parse and validate request
2. Initialize services
3. Upload files to Pinata (if provided)
4. Check wallet balance
5. Register on blockchain
6. Return response
```

### Service Pattern
Each service handles a specific domain:
- **BlockchainService** - Blockchain operations
- **PinataService** - IPFS file operations

## Usage from Main API (sta-api)

```typescript
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const lambda = new LambdaClient({ region: 'us-east-1' });

// Invoke the Lambda function
const result = await lambda.send(new InvokeCommand({
  FunctionName: 'sta-lambda-dev-propertyCreation',
  Payload: JSON.stringify({
    propertyId: 'prop-123',
    propertyName: 'My Property',
    fileUrls: [
      'https://s3.amazonaws.com/bucket/file1.pdf',
      'https://s3.amazonaws.com/bucket/file2.pdf'
    ],
    userId: 1,
    userEmail: 'user@example.com',
    userFullName: 'John Doe'
  })
}));
```

## Integration with sta-api

This Lambda function is designed to be called from **sta-api** (the main NestJS API):

- **sta-api** handles database operations and business logic
- **sta-lambda** handles blockchain and IPFS operations
- Separation of concerns: Database logic stays in sta-api, blockchain/IPFS in Lambda

### Flow Diagram
```
User creates property in sta-api
    ↓
sta-api saves to database
    ↓
sta-api invokes Lambda function
    ↓
Lambda uploads files to pinata/IPFS → registers on blockchain
    ↓
Lambda returns result to sta-api
    ↓
sta-api updates database with blockchain info
```

## Monitoring

### CloudWatch Metrics
- Invocations
- Duration
- Errors
- Throttles

### Logs
All Lambda execution logs are available in CloudWatch Logs.

## Security

### IAM Permissions
- CloudWatch Logs: CreateLogGroup, CreateLogStream, PutLogEvents

### Environment Variables
All sensitive data stored as environment variables and encrypted at rest.

## Troubleshooting

### Common Issues

1. **Insufficient Balance** - Check wallet has enough ETH for gas
2. **File Upload Timeout** - Large files may exceed Lambda timeout
3. **Invalid File Types** - Only specific file types allowed
4. **API Keys Missing** - Ensure all environment variables are set

### Error Codes
- `400` - Bad Request (invalid input)
- `402` - Payment Required (insufficient balance)
- `500` - Internal Server Error
- `503` - Service Unavailable (AWS service errors)

## Cost Optimization

### Current Configuration
- Memory: 1536 MB (optimized for blockchain operations)
- Timeout: 300 seconds (5 minutes)
- Cold start: ~2-3 seconds

### Optimization Tips
- Use provisioned concurrency for consistent performance
- Monitor and adjust memory allocation based on actual usage
- Consider async invocation for non-critical paths

## Contributing

1. Make changes to services or handler
2. Build with `npm run build`
3. Test locally
4. Deploy to dev environment
5. Test the deployed function
6. Deploy to production

## Support

For issues and questions, contact the Smart Tags Analytics development team.
// Lambda Event Types
export interface PropertyCreationEvent {
  propertyId: string;
  propertyName: string;
  fileUrls: string[]; // Required - files must exist for blockchain registration
  userId: number;
  userEmail: string;
  userFullName: string;
}

// Lambda Response Types
export interface LambdaResponse {
  success: boolean;
  data?: any;
  error?: string;
  messageId?: string;
}

export interface PropertyCreationResult {
  success: boolean;
  tokenId?: number;
  transactionHash?: string;
  metadataCID?: string;
  message?: string;
  error?: string;
  warnings?: string[];
}

// AWS Lambda Context
export interface LambdaContext {
  functionName: string;
  functionVersion: string;
  invokedFunctionArn: string;
  memoryLimitInMB: string;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
  getRemainingTimeInMillis(): number;
  done(error?: Error, result?: any): void;
  fail(error: Error | string): void;
  succeed(messageOrObject: any): void;
}

// Environment Variables
export interface LambdaEnvironment {
  NODE_ENV: string;
  INFURA_RPC_URL: string;
  MASTER_WALLET_PRIVATE_KEY: string;
  SMART_TAGS_CONTRACT_ADDRESS: string;
  PINATA_API_KEY: string;
  PINATA_SECRET_API_KEY: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  AWS_S3_BUCKET_NAME: string;
  WEBSITE_URL: string;
}

// Service Types
export interface UploadedFileMetadata {
  name: string;
  documentType: string;
  cid: string;
}

export interface PropertyDocumentsMetadata {
  propertyId: string;
  propertyOwnerName: string;
  propertyType: string;
  propertyName: string;
  documents: UploadedFileMetadata[];
  timestamp: string;
}

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  stream: any;
  destination: string;
  filename: string;
  path: string;
}

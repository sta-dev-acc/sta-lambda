import pinataSDK from "@pinata/sdk";
import { Readable } from "stream";
import axios from "axios";

export interface UploadedFileMetadata {
  name: string;
  documentType: string;
  cid: string;
}

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  stream: Readable;
  destination: string;
  filename: string;
  path: string;
}

export interface PropertyDocumentsMetadata {
  propertyId: string;
  propertyOwnerName: string;
  propertyType: string;
  propertyName: string;
  documents: UploadedFileMetadata[];
  timestamp: string;
}

export class PinataService {
  private pinata: any;

  constructor() {
    // Validate environment variables
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
      throw new Error("Pinata API keys are not configured");
    }

    try {
      const PinataClient = (pinataSDK as any).default || pinataSDK;
      this.pinata = new PinataClient({
        pinataApiKey: process.env.PINATA_API_KEY,
        pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
      });
    } catch (error) {
      console.error("Failed to initialize Pinata client:", error);
      throw new Error("Failed to initialize Pinata client");
    }
  }

  async uploadFile(file: MulterFile): Promise<string> {
    try {
      const readableStream = Readable.from(file.buffer);

      const options = {
        pinataMetadata: {
          name: file.originalname,
        },
      };

      const result = await this.pinata.pinFileToIPFS(
        readableStream as any,
        options
      );
      return result.IpfsHash;
    } catch (error) {
      console.error("Pinata upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to upload file to IPFS: ${errorMessage}`);
    }
  }

  async uploadMetadata(metadata: PropertyDocumentsMetadata): Promise<string> {
    try {
      const options = {
        pinataMetadata: {
          name: `metadata-${metadata.propertyId}-${Date.now()}`,
        },
      };

      const result = await this.pinata.pinJSONToIPFS(metadata, options);
      return result.IpfsHash;
    } catch (error) {
      console.error("Pinata metadata upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to upload metadata to IPFS: ${errorMessage}`);
    }
  }

  async uploadFileFromS3Url(s3Url: string): Promise<UploadedFileMetadata> {
    try {
      console.log(`Downloading file from S3 URL: ${s3Url}`);

      // Download file from S3 URL
      const response = await axios.get(s3Url, {
        responseType: "arraybuffer",
        timeout: 30000, // 30 seconds timeout
      });

      // Extract filename from URL
      const urlParts = s3Url.split("/");
      let fileName = urlParts[urlParts.length - 1];

      // Remove query parameters if any
      if (fileName.includes("?")) {
        fileName = fileName.split("?")[0];
      }

      // Extract file extension and determine MIME type
      const fileExtension = fileName.split(".").pop()?.toLowerCase();
      let mimeType = "application/octet-stream";

      // Map property-related file extensions to MIME types
      const mimeTypeMap: { [key: string]: string } = {
        // Property Documents
        pdf: "application/pdf",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        // Property Images
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",

        // Property Data
        json: "application/json",
        txt: "text/plain",
        csv: "text/csv",

        // Excel Files
        xls: "application/vnd.ms-excel",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        // Presentation Files
        ppt: "application/vnd.ms-powerpoint",
        pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      };

      if (fileExtension && mimeTypeMap[fileExtension]) {
        mimeType = mimeTypeMap[fileExtension];
      } else {
        throw new Error(
          `Unsupported file type: ${fileExtension}. Only PDF, DOC, DOCX, JPG, PNG, JSON, TXT, CSV, XLS, XLSX, PPT, PPTX are allowed for property documents.`
        );
      }

      // Create a buffer from the downloaded data
      const fileBuffer = Buffer.from(response.data as ArrayBuffer);

      // File size validation - 10MB limit
      const maxFileSize = 10 * 1024 * 1024;
      if (fileBuffer.length > maxFileSize) {
        throw new Error(
          `File ${fileName} exceeds 10MB limit. Size: ${fileBuffer.length} bytes`
        );
      }

      // Create a mock file object similar to Express.Multer.File
      const mockFile: MulterFile = {
        fieldname: "file",
        originalname: fileName,
        encoding: "7bit",
        mimetype: mimeType,
        size: fileBuffer.length,
        buffer: fileBuffer,
        stream: Readable.from(fileBuffer),
        destination: "",
        filename: fileName,
        path: "",
      };

      // Upload to IPFS using existing method
      const cid = await this.uploadFile(mockFile);

      return {
        name: fileName,
        documentType: mimeType,
        cid,
      };
    } catch (error) {
      console.error(`Failed to upload file from S3 URL ${s3Url}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to upload file from S3 URL: ${errorMessage}`);
    }
  }

  /**
   * Upload multiple S3 files to Pinata/IPFS with validation
   */
  async uploadS3Files(dto: {
    propertyId: string;
    fileUrls: string[];
    propertyOwnerName?: string;
    propertyType?: string;
    propertyName?: string;
  }): Promise<{
    success: boolean;
    message: string;
    metadataCID?: string;
    uploadedFiles?: Array<{ fileName: string; cid: string; size: number }>;
  }> {
    try {
      // Validate input files
      if (!dto.fileUrls || dto.fileUrls.length === 0) {
        throw new Error("No file URLs provided");
      }

      // URL count limit
      const maxUrlCount = 20;
      if (dto.fileUrls.length > maxUrlCount) {
        throw new Error(
          `Too many URLs provided. Maximum ${maxUrlCount} URLs allowed, received ${dto.fileUrls.length}`
        );
      }

      // Remove duplicate URLs
      const uniqueUrls = [...new Set(dto.fileUrls)];
      if (uniqueUrls.length !== dto.fileUrls.length) {
        const duplicateCount = dto.fileUrls.length - uniqueUrls.length;
        console.warn(`Removed ${duplicateCount} duplicate URLs from request`);
      }

      // Validate file types from URLs
      const allowedExtensions = [
        "pdf",
        "doc",
        "docx",
        "jpg",
        "jpeg",
        "png",
        "json",
        "txt",
        "csv",
        "xls",
        "xlsx",
      ];
      const invalidFiles = uniqueUrls.filter(url => {
        const urlParts = url.split("/");
        const fileName = urlParts[urlParts.length - 1].split("?")[0];
        const fileExtension = fileName.split(".").pop()?.toLowerCase();
        return !fileExtension || !allowedExtensions.includes(fileExtension);
      });

      if (invalidFiles.length > 0) {
        throw new Error(
          `Invalid file types detected. Only PDF, DOC, DOCX, JPG, PNG, JSON, TXT, CSV, XLS, XLSX are allowed for property documents. Invalid files: ${invalidFiles.join(", ")}`
        );
      }

      // Process unique S3 URLs in parallel
      const uploadPromises = uniqueUrls.map(
        async (s3Url, index): Promise<UploadedFileMetadata> => {
          try {
            console.log(
              `Processing S3 URL ${index + 1}/${uniqueUrls.length}: ${s3Url}`
            );
            const result = await this.uploadFileFromS3Url(s3Url);
            return result;
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : "Unknown error";
            console.error(
              `Failed to upload file from S3 URL ${s3Url}: ${message}`
            );
            throw new Error(`Failed to upload file from S3 URL: ${s3Url}`);
          }
        }
      );

      // Wait for all file uploads to complete
      const uploadedFiles: UploadedFileMetadata[] =
        await Promise.all(uploadPromises);

      // Create and upload metadata
      const metadata: PropertyDocumentsMetadata = {
        propertyId: dto.propertyId,
        propertyOwnerName: dto.propertyOwnerName || "Unknown Owner",
        propertyType: dto.propertyType || "",
        propertyName: dto.propertyName || "",
        documents: uploadedFiles,
        timestamp: new Date().toISOString(),
      };

      const metadataCID = await this.uploadMetadata(metadata);

      return {
        success: true,
        message: `Successfully uploaded ${uploadedFiles.length} files to Pinata/IPFS`,
        metadataCID,
        uploadedFiles: uploadedFiles.map(file => ({
          fileName: file.name,
          cid: file.cid,
          size: 0, // Size not available in UploadedFileMetadata
        })),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Pinata upload failed:", errorMessage);
      throw new Error(`Pinata upload failed: ${errorMessage}`);
    }
  }
}

export interface StorageConfig {
  maxSizeMB: number;
  allowedImageTypes: string[];
  programImages: {
    path: string;
    maxWidth: number;
    maxHeight: number;
  };
}

export interface UploadOptions {
  path: string;
  metadata?: Record<string, string>;
  contentType?: string;
}

export interface UploadResult {
  url: string;
  path: string;
  metadata?: Record<string, string>;
}

export interface UploadProfileImageOptions {
  file: File;
  userId: string;
}

export interface UploadProgramImageOptions {
  file: File;
  programId: string;
}
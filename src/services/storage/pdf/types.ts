export interface PDFMetadata {
  userId: string;
  programName: string;
  programId: string;
}

export interface PDFUploadResult {
  url: string;
  path: string;
  metadata: {
    userId: string;
    programName: string;
    createdAt: string;
  };
}
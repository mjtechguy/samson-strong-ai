export interface Program {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  template: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgram {
  id: string;
  userId: string;
  programId: string;
  customizedPlan: string;
  pdfUrl?: string;
  pdfPath?: string;
  createdAt: Date;
}

export interface ProgramYAML {
  name: string;
  description: string;
  image_url?: string;
  template: string;
  metadata?: {
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    duration?: string;
    equipment?: string[];
    tags?: string[];
  };
}

export interface ProgramValidationError {
  field: string;
  message: string;
  line?: number;
}
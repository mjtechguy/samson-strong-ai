import { Program, UserProgram } from '../../../types/program';

export interface CreateProgramData {
  name: string;
  description: string;
  template: string;
  imageFile: File;
}

export interface UpdateProgramData extends Partial<Omit<Program, 'id' | 'createdAt' | 'updatedAt'>> {}

export interface CreateUserProgramData extends Omit<UserProgram, 'id' | 'createdAt'> {}

export interface ProgramWithTimestamps extends Program {
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgramWithDetails extends UserProgram {
  program: Program;
  createdAt: Date;
}
import { supabase } from '../../../config/supabase';
import { Program, UserProgram } from '../../../types/program';
import { logger } from '../../logging';
import { storageService } from '../../storage';
import { v4 as uuidv4 } from 'uuid';

export class ProgramService {
  async getProgram(programId: string): Promise<Program | null> {
    try {
      logger.debug('Fetching program', { programId });
      
      const { data, error } = await supabase
        .from('programs')
        .select()
        .eq('id', programId)
        .single();
      
      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } as Program;
    } catch (error) {
      logger.error('Failed to fetch program', error);
      throw error;
    }
  }

  async createProgram(data: { name: string; description: string; template: string; imageFile: File }): Promise<Program> {
    try {
      logger.debug('Creating program');
      
      const programId = uuidv4();
      const imageUrl = await storageService.uploadProgramImage({
        file: data.imageFile,
        programId
      });

      const programData = {
        id: programId,
        name: data.name,
        description: data.description,
        template: data.template,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: program, error } = await supabase
        .from('programs')
        .insert(programData)
        .select()
        .single();

      if (error) throw error;
      if (!program) throw new Error('Program not found after creation');

      logger.debug('Program created successfully', { programId });
      return {
        ...program,
        createdAt: new Date(program.created_at),
        updatedAt: new Date(program.updated_at)
      } as Program;
    } catch (error) {
      logger.error('Failed to create program', error);
      throw error;
    }
  }

  async createUserProgram(data: Omit<UserProgram, 'id' | 'createdAt'>): Promise<void> {
    try {
      logger.debug('Creating user program', {
        userId: data.userId,
        programId: data.programId
      });

      const userProgramData = {
        id: uuidv4(),
        user_id: data.userId,
        program_id: data.programId,
        customized_plan: data.customizedPlan,
        pdf_url: data.pdfUrl,
        pdf_path: data.pdfPath,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_programs')
        .insert(userProgramData);

      if (error) throw error;

      logger.debug('User program created successfully');
    } catch (error) {
      logger.error('Failed to create user program', error);
      throw error;
    }
  }

  async getAllPrograms(): Promise<Program[]> {
    try {
      logger.debug('Fetching all programs');
      
      const { data, error } = await supabase
        .from('programs')
        .select()
        .order('created_at', { ascending: false });

      if (error) throw error;

      const programs = data.map(program => ({
        ...program,
        createdAt: new Date(program.created_at),
        updatedAt: new Date(program.updated_at)
      })) as Program[];

      logger.debug('Programs fetched successfully', { count: programs.length });
      return programs;
    } catch (error) {
      logger.error('Failed to fetch programs', error);
      throw error;
    }
  }

  async getUserPrograms(userId: string): Promise<UserProgram[]> {
    try {
      logger.debug('Fetching user programs', { userId });
      
      const { data, error } = await supabase
        .from('user_programs')
        .select()
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const programs = data.map(program => ({
        ...program,
        createdAt: new Date(program.created_at)
      })) as UserProgram[];

      logger.debug('User programs fetched successfully', { count: programs.length });
      return programs;
    } catch (error) {
      logger.error('Failed to fetch user programs', error);
      throw error;
    }
  }

  async updateProgram(programId: string, data: Partial<Program>): Promise<void> {
    try {
      logger.debug('Updating program', { programId });

      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('programs')
        .update(updateData)
        .eq('id', programId);

      if (error) throw error;

      logger.debug('Program updated successfully', { programId });
    } catch (error) {
      logger.error('Failed to update program', error);
      throw error;
    }
  }

  async deleteProgram(programId: string): Promise<void> {
    try {
      logger.debug('Deleting program', { programId });
      
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', programId);

      if (error) throw error;

      logger.debug('Program deleted successfully', { programId });
    } catch (error) {
      logger.error('Failed to delete program', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const programService = new ProgramService();
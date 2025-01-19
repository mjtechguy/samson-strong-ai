import { supabase } from '../../config/supabase';
import { Program } from '../../types/program';
import { logger } from '../logging';
import { storageService } from '../storage/service';
import { v4 as uuidv4 } from 'uuid';

export class ProgramService {
  async getAllPrograms(): Promise<Program[]> {
    try {
      logger.debug('Fetching all programs');
      
      const { data, error } = await supabase
        .from('programs')
        .select()
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(program => ({
        id: program.id,
        name: program.name,
        description: program.description,
        imageUrl: program.image_url,
        template: program.template,
        createdAt: new Date(program.created_at),
        updatedAt: new Date(program.updated_at)
      }));
    } catch (error) {
      logger.error('Failed to fetch programs', error);
      throw error;
    }
  }

  async createProgram(data: { 
    name: string; 
    description: string; 
    template: string; 
    imageFile: File | null;
  }): Promise<Program> {
    try {
      logger.debug('Creating program');
      
      const programId = uuidv4();
      let imageUrl = '';

      // Upload image if provided
      if (data.imageFile) {
        const result = await storageService.uploadFile({
          file: data.imageFile,
          path: `programs/${programId}/${data.imageFile.name}`,
          metadata: {
            programId,
            type: 'program'
          }
        });
        imageUrl = result.url;
      }

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
        id: program.id,
        name: program.name,
        description: program.description,
        imageUrl: program.image_url,
        template: program.template,
        createdAt: new Date(program.created_at),
        updatedAt: new Date(program.updated_at)
      };
    } catch (error) {
      logger.error('Failed to create program', error);
      throw error;
    }
  }

  async updateProgram(programId: string, data: Partial<Program>): Promise<void> {
    try {
      logger.debug('Updating program', { programId });

      const updateData = {
        name: data.name,
        description: data.description,
        template: data.template,
        image_url: data.imageUrl,
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

      // Delete program files from storage
      const { data: files, error: listError } = await supabase.storage
        .from('public')
        .list(programId);

      if (listError) throw listError;

      if (files?.length) {
        const { error: deleteError } = await supabase.storage
          .from('public')
          .remove(files.map(file => `${programId}/${file.name}`));

        if (deleteError) throw deleteError;
      }

      // Delete the program itself
      const { error: programError } = await supabase
        .from('programs')
        .delete()
        .eq('id', programId);

      if (programError) throw programError;

      logger.debug('Program deleted successfully', { programId });
    } catch (error) {
      logger.error('Failed to delete program', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const programService = new ProgramService();
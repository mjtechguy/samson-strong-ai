import { supabase } from '../../config/supabase';
import { UserProfile } from '../../types/user';
import { logger } from '../logging';

export class UserService {
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserProfile[];
    } catch (error) {
      logger.error('Failed to fetch users', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<UserProfile>): Promise<void> {
    try {
      logger.debug('Updating user', { userId });
      
      // Remove id from update data
      const { id, ...updateData } = userData;
      
      // Add updated timestamp
      const dataToUpdate = {
        ...updateData,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('users')
        .update(dataToUpdate)
        .eq('id', userId);

      if (error) throw error;
      
      logger.debug('User updated successfully', { userId });
    } catch (error) {
      logger.error('Failed to update user', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      logger.debug('Deleting user', { userId });
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      logger.debug('User deleted successfully', { userId });
    } catch (error) {
      logger.error('Failed to delete user', error);
      throw error;
    }
  }
}

export const userService = new UserService();
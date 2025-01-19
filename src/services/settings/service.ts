import { supabase } from '../../config/supabase';
import { logger } from '../logging';

export interface SystemSetting {
  key: string;
  value: string;
  description: string;
  updated_at: string;
  updated_by: string | null;
}

export class SettingsService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  private async withRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // Ensure we have a valid session before making requests
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No authenticated session');
        }

        return await operation();
      } catch (error) {
        const isLastAttempt = attempt === this.MAX_RETRIES;
        const message = error instanceof Error ? error.message : 'Unknown error';
        
        logger.warn(`${context} attempt ${attempt} failed: ${message}`);
        
        if (isLastAttempt) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
      }
    }

    throw new Error(`Failed after ${this.MAX_RETRIES} retries`);
  }

  async getAllSettings(): Promise<SystemSetting[]> {
    try {
      return await this.withRetry(async () => {
        const { data, error } = await supabase
          .from('system_settings')
          .select()
          .order('key');

        if (error) throw error;
        return data || [];
      }, 'Get all settings');
    } catch (error) {
      logger.error('Failed to fetch settings', error);
      throw error;
    }
  }

  async getSetting(key: string): Promise<string> {
    try {
      // Return empty string if no session to avoid unnecessary errors
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return '';

      return await this.withRetry(async () => {
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', key)
          .single();

        if (error) {
          // Handle common error cases gracefully
          switch (error.code) {
            case 'PGRST116': // Not found
              logger.debug(`Setting not found: ${key}`);
              return '';
            case '42P01': // Table doesn't exist
              logger.debug('Settings table not initialized yet');
              return '';
            default:
              throw error;
          }
        }

        return data?.value || '';
      }, `Get setting: ${key}`);
    } catch (error) {
      // Only log as error for unexpected issues
      if (error instanceof Error && !error.message.includes('Settings table not initialized')) {
        logger.error('Failed to fetch setting', { key, error });
      }
      return ''; // Return empty string as fallback
    }
  }

  async updateSetting(key: string, value: string): Promise<void> {
    try {
      await this.withRetry(async () => {
        const { error } = await supabase
          .from('system_settings')
          .update({ 
            value,
            updated_at: new Date().toISOString(),
            updated_by: (await supabase.auth.getUser()).data.user?.id
          })
          .eq('key', key);

        if (error) throw error;
      }, `Update setting: ${key}`);
    } catch (error) {
      logger.error('Failed to update setting', error);
      throw error;
    }
  }

  async getSupabaseUrl(): Promise<string> {
    return this.getSetting('VITE_SUPABASE_URL');
  }

  async getSupabaseAnonKey(): Promise<string> {
    return this.getSetting('VITE_SUPABASE_ANON_KEY');
  }

  async updateSupabaseUrl(url: string): Promise<void> {
    await this.updateSetting('VITE_SUPABASE_URL', url);
  }

  async updateSupabaseAnonKey(key: string): Promise<void> {
    await this.updateSetting('VITE_SUPABASE_ANON_KEY', key);
  }
}

export const settingsService = new SettingsService();

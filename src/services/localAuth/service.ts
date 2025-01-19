import bcrypt from 'bcryptjs';
import { logger } from '../logging';

class LocalAuthService {
  private readonly STORAGE_KEY = 'local_admin';

  constructor() {
    this.initializeDefaultAdmin();
  }

  private async initializeDefaultAdmin() {
    const email = import.meta.env.VITE_DEFAULT_ADMIN_EMAIL;
    const password = import.meta.env.VITE_DEFAULT_ADMIN_PASSWORD;
    const name = import.meta.env.VITE_DEFAULT_ADMIN_NAME;

    if (!email || !password || !name) {
      logger.warn('Default admin credentials not configured');
      return;
    }

    try {
      // Check if admin already exists
      const existingAdmin = localStorage.getItem(this.STORAGE_KEY);
      if (existingAdmin) {
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Store admin credentials
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        email,
        passwordHash,
        name
      }));

      logger.info('Local admin initialized');
    } catch (error) {
      logger.error('Failed to initialize local admin:', error);
    }
  }

  async verifyAdmin(email: string, password: string): Promise<boolean> {
    try {
      const adminData = localStorage.getItem(this.STORAGE_KEY);
      if (!adminData) {
        return false;
      }

      const admin = JSON.parse(adminData);
      if (admin.email !== email) {
        return false;
      }

      return bcrypt.compare(password, admin.passwordHash);
    } catch (error) {
      logger.error('Local admin verification failed:', error);
      return false;
    }
  }
}

export const localAuthService = new LocalAuthService();
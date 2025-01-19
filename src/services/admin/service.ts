import { supabase } from '../../config/supabase';
import { UserStats } from '../../types/user';
import { logger } from '../logging';

export class AdminService {
  async getStats(): Promise<UserStats> {
    try {
      logger.debug('Fetching admin statistics');

      // Get total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Get active users (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: activeMessages, error: activeError } = await supabase
        .from('messages')
        .select('user_id')
        .gte('timestamp', sevenDaysAgo.toISOString())
        .order('user_id');

      if (activeError) throw activeError;

      const activeUserIds = new Set(activeMessages.map(msg => msg.user_id));
      const activeUsers = activeUserIds.size;

      // Get total messages
      const { count: totalMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      if (messagesError) throw messagesError;

      // Calculate average messages per user
      const averageMessagesPerUser = totalUsers && totalUsers > 0
        ? Math.round((totalMessages || 0) / totalUsers)
        : 0;

      logger.debug('Admin statistics fetched successfully', {
        totalUsers,
        activeUsers,
        totalMessages,
        averageMessagesPerUser
      });

      return {
        totalUsers: totalUsers || 0,
        activeUsers,
        totalMessages: totalMessages || 0,
        averageMessagesPerUser
      };
    } catch (error) {
      logger.error('Failed to fetch admin statistics', error);
      throw new Error('Failed to fetch admin statistics');
    }
  }
}

// Create and export singleton instance
export const adminService = new AdminService();
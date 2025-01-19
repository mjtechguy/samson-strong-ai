import React, { useEffect, useState } from 'react';
import { UserStats } from '../../types/user';
import { admin } from '../../services/db';
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { logger } from '../../services/logging';

export const StatsOverview: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await admin.getStats();
        setStats(stats);
      } catch (error) {
        logger.error('Failed to load admin statistics', error);
      }
    };
    loadStats();
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white h-32 rounded-lg shadow"></div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: UsersIcon,
      description: 'Total registered users'
    },
    {
      name: 'Active Users',
      value: stats.activeUsers,
      icon: UserGroupIcon,
      description: 'Users active in the last 7 days'
    },
    {
      name: 'Total Messages',
      value: stats.totalMessages,
      icon: ChatBubbleLeftRightIcon,
      description: 'Total chat messages'
    },
    {
      name: 'Avg Messages/User',
      value: stats.averageMessagesPerUser,
      icon: ChartBarIcon,
      description: 'Average messages per user'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {statItems.map((item) => (
        <div
          key={item.name}
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <item.icon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {item.value}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
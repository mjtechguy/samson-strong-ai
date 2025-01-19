import React from 'react';
import { UserStats } from '../../types/user';
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface StatsPanelProps {
  stats: UserStats;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  const statItems = [
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: UsersIcon,
    },
    {
      name: 'Active Users (7d)',
      value: stats.activeUsers,
      icon: UserGroupIcon,
    },
    {
      name: 'Total Messages',
      value: stats.totalMessages,
      icon: ChatBubbleLeftRightIcon,
    },
    {
      name: 'Avg Messages/User',
      value: stats.averageMessagesPerUser,
      icon: ChartBarIcon,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {statItems.map((item) => (
        <div
          key={item.name}
          className="bg-white overflow-hidden shadow rounded-lg"
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
                  <dd className="text-lg font-medium text-gray-900">
                    {item.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
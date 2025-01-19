import React from 'react';
import { useLocation } from 'react-router-dom';

export const AdminHeader: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.split('/').filter(Boolean)[1]; // Get the second part of the path

  const getHeaderContent = () => {
    switch (path) {
      case 'programs':
        return {
          title: 'Programs',
          description: 'Manage workout programs and templates'
        };
      case 'users':
        return {
          title: 'Users',
          description: 'Manage user accounts and permissions'
        };
      case 'settings':
        return {
          title: 'Settings',
          description: 'Configure system-wide settings'
        };
      default:
        return {
          title: 'Admin Dashboard',
          description: 'Monitor system activity and manage resources'
        };
    }
  };

  const { title, description } = getHeaderContent();

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-sm text-gray-600">
        {description}
      </p>
    </div>
  );
};
import React from 'react';
import { NavLink } from 'react-router-dom';

export const AdminNav: React.FC = () => {
  return (
    <nav className="mt-6 border-b border-gray-200">
      <div className="flex space-x-8">
        <NavLink
          to="programs"
          className={({ isActive }) =>
            `border-b-2 px-1 pb-4 text-sm font-medium ${
              isActive
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`
          }
        >
          Programs
        </NavLink>
        <NavLink
          to="users"
          className={({ isActive }) =>
            `border-b-2 px-1 pb-4 text-sm font-medium ${
              isActive
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`
          }
        >
          Users
        </NavLink>
        <NavLink
          to="settings"
          className={({ isActive }) =>
            `border-b-2 px-1 pb-4 text-sm font-medium ${
              isActive
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`
          }
        >
          Settings
        </NavLink>
      </div>
    </nav>
  );
};
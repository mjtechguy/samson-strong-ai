import React, { useEffect, useState } from 'react';
import { UserProfile } from '../../types/user';
import { users } from '../../services/db';
import { UserTable } from './UserTable';
import { UserFilters } from './UserFilters';
import { logger } from '../../services/logging';

export const UserManagement: React.FC = () => {
  const [userList, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await users.getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      logger.error('Failed to load users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = userList.filter(user => {
    if (filter === 'admin') return user.isAdmin;
    if (filter === 'regular') return !user.isAdmin;
    return true;
  });

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          User Management
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Manage user accounts and permissions
        </p>
      </div>
      <div className="px-4 py-3 border-b border-gray-200">
        <UserFilters filter={filter} setFilter={setFilter} />
      </div>
      <UserTable 
        users={filteredUsers} 
        loading={loading} 
        onUserUpdated={loadUsers}
      />
    </div>
  );
};
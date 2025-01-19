import React from 'react';
import { users } from '../../services/db';
import { logger } from '../../services/logging';
import { toast } from 'react-hot-toast';

interface UserActionsProps {
  userId: string;
  isAdmin: boolean;
  onUserUpdated: () => void;
}

export const UserActions: React.FC<UserActionsProps> = ({ userId, isAdmin, onUserUpdated }) => {
  const handleDeleteUser = async () => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await users.deleteUser(userId);
      onUserUpdated();
      toast.success('User deleted successfully');
    } catch (error) {
      logger.error('Failed to delete user', error);
      toast.error('Failed to delete user');
    }
  };

  const handleToggleAdmin = async () => {
    try {
      await users.updateUser(userId, { isAdmin: !isAdmin });
      onUserUpdated();
      toast.success(`User ${isAdmin ? 'removed from' : 'added to'} admin role`);
    } catch (error) {
      logger.error('Failed to update user admin status', error);
      toast.error('Failed to update user admin status');
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleToggleAdmin}
        className={`px-2 py-1 text-xs font-semibold rounded ${
          isAdmin
            ? 'bg-indigo-100 text-indigo-700'
            : 'bg-gray-100 text-gray-700'
        }`}
      >
        {isAdmin ? 'Admin' : 'User'}
      </button>
      <button
        onClick={handleDeleteUser}
        className="text-red-600 hover:text-red-900"
      >
        Delete
      </button>
    </div>
  );
};
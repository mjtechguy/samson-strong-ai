import React from 'react';
import { UserProfile } from '../../types/user';
import { UserActions } from './UserActions';

interface UserTableRowProps {
  user: UserProfile;
  onUserUpdated: () => void;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({ user, onUserUpdated }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {user.name}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {user.fitnessGoals?.join(', ') || 'No goals set'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {user.experienceLevel || 'Not specified'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <UserActions
          userId={user.id}
          isAdmin={user.isAdmin || false}
          onUserUpdated={onUserUpdated}
        />
      </td>
    </tr>
  );
};
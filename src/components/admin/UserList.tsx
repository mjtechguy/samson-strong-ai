import { useEffect, useState } from 'react';
import { UserProfile } from '../../types/user';
import { userService } from '../../services/users';

export const UserList = () => {
  const [userList, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    const loadedUsers = await userService.getAllUsers();
    setUsers(loadedUsers);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Rest of the component implementation...
  return (
    <div>User list component</div>
  );
};
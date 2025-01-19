import React from 'react';

interface UserFiltersProps {
  filter: string;
  setFilter: (filter: string) => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({ filter, setFilter }) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setFilter('all')}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          filter === 'all'
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        All Users
      </button>
      <button
        onClick={() => setFilter('admin')}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          filter === 'admin'
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Admins
      </button>
      <button
        onClick={() => setFilter('regular')}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          filter === 'regular'
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Regular Users
      </button>
    </div>
  );
};
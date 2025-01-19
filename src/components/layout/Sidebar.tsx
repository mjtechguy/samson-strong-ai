import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { logger } from '../../services/logging';
import {
  ChatBubbleLeftIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentListIcon,
  BuildingLibraryIcon,
  Cog6ToothIcon,
  UsersIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';
import { useUserStore } from '../../store/userStore';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Get user and logout function from store
  const user = useUserStore(state => state.user);
  const logoutFn = useUserStore(state => state.logout);

  const isAdmin = user?.is_admin === true;

  const handleLogout = async () => {
    try {
      // Prevent multiple clicks
      if (isLoggingOut) return;
      setIsLoggingOut(true);

      logger.debug('Starting logout process');
      await logoutFn();
      
      // Navigate is handled by the store
    } catch (error) {
      logger.error('Logout failed:', error);
      toast.error('Failed to logout. Please try again.');
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {/* Regular User Navigation */}
          <div className="pb-4 border-b border-gray-200 space-y-1">
            <Link
              to="/chat"
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                location.pathname === '/chat'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChatBubbleLeftIcon className="h-5 w-5 flex-shrink-0" />
              <span>Chat</span>
            </Link>

            <Link
              to="/programs"
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                location.pathname === '/programs'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <DocumentDuplicateIcon className="h-5 w-5 flex-shrink-0" />
              <span>Browse Programs</span>
            </Link>

            <Link
              to="/my-programs"
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                location.pathname === '/my-programs'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ClipboardDocumentListIcon className="h-5 w-5 flex-shrink-0" />
              <span>My Programs</span>
            </Link>
          </div>

          {/* Admin Navigation */}
          {isAdmin && (
            <div className="pt-4 space-y-1">
              <div className="px-4 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Admin
                </h3>
              </div>
              
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  location.pathname === '/admin'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BuildingLibraryIcon className="h-5 w-5 flex-shrink-0" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/admin/programs"
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  location.pathname === '/admin/programs'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Square3Stack3DIcon className="h-5 w-5 flex-shrink-0" />
                <span>Programs</span>
              </Link>

              <Link
                to="/admin/users"
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  location.pathname === '/admin/users'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UsersIcon className="h-5 w-5 flex-shrink-0" />
                <span>Users</span>
              </Link>

              <Link
                to="/admin/settings"
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  location.pathname === '/admin/settings'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Cog6ToothIcon className="h-5 w-5 flex-shrink-0" />
                <span>Settings</span>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Fixed Bottom Section */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="space-y-1">
          <Link
            to="/profile"
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              location.pathname === '/profile'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <UserCircleIcon className="h-5 w-5 flex-shrink-0" />
            <span>Profile</span>
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-gray-700 hover:bg-gray-100 w-full text-left disabled:opacity-50"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

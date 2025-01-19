import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useUserStore } from '../../store/userStore';
import { ProgramImage } from '../programs/ProgramImage';
import { settingsService } from '../../services/settings/service';
import { logger } from '../../services/logging';

const ProfileImage: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <UserCircleIcon className="h-8 w-8 text-gray-600" />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-8 w-8 rounded-full object-cover"
      onError={() => setError(true)}
    />
  );
};

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const user = useUserStore(state => state.user);
  const [appTitle, setAppTitle] = useState('Fitness AI');
  const [logoUrl, setLogoUrl] = useState('');
  
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [title, logo] = await Promise.all([
        settingsService.getSetting('app_title'),
        settingsService.getSetting('app_logo_url')
      ]);

      if (title) setAppTitle(title);
      if (logo) setLogoUrl(logo);
    } catch (error) {
      logger.error('Failed to load app settings:', error);
    }
  };

  return (
    <div className="bg-white shadow">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <ProgramImage
                  src={logoUrl}
                  alt={appTitle}
                  className="h-8 w-8 rounded-full object-cover"
                  fallbackType="LOGO"
                />
              ) : null}
              <h1 className="text-xl font-bold text-indigo-600">{appTitle}</h1>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user.name}</span>
              <button
                onClick={() => navigate('/profile')}
                className="relative rounded-full overflow-hidden hover:opacity-80 transition-opacity"
              >
                <ProfileImage 
                  key={user.imageUrl} // Force re-render when URL changes
                  src={user.imageUrl}
                  alt={user.name}
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

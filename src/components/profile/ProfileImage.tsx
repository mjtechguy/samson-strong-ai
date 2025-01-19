import React, { useState } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { storageService } from '../../services/storage/service';
import { useUserStore } from '../../store/userStore';
import { toast } from 'react-hot-toast';
import { logger } from '../../services/logging';

interface ProfileImageProps {
  imageUrl?: string;
  onImageUpdate: (url: string) => Promise<void>;
}

export const ProfileImage: React.FC<ProfileImageProps> = ({ imageUrl, onImageUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const user = useUserStore(state => state.user);
  const updateProfile = useUserStore(state => state.updateProfile);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      setError(false);

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload image
      const result = await storageService.uploadProfileImage({
        file,
        userId: user.id
      });

      // Update both global and local state
      await Promise.all([
        updateProfile({ imageUrl: result.url }),
        onImageUpdate(result.url)
      ]);

      toast.success('Profile image updated successfully');
    } catch (error) {
      setError(true);
      const message = error instanceof Error ? error.message : 'Failed to upload image';
      logger.error('Profile image upload failed:', error);
      toast.error(message);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Cleanup preview URL on unmount or when image changes
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const displayUrl = previewUrl || imageUrl;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        {displayUrl && !error ? (
          <img
            src={displayUrl}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            onError={() => setError(true)}
          />
        ) : (
          <UserCircleIcon className="w-32 h-32 text-gray-400" />
        )}
        <label
          htmlFor="profile-image"
          className={`absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-indigo-700 transition-colors ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          <input
            id="profile-image"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isUploading}
          />
        </label>
      </div>
      <p className="text-sm text-gray-500">
        {isUploading ? 'Uploading...' : 'Click to update profile image'}
      </p>
    </div>
  );
};
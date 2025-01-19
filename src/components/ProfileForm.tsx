import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { UserProfile } from '../types/user';
import { UnitSystemToggle } from './profile/UnitSystemToggle';
import { MeasurementInputs } from './profile/MeasurementInputs';
import { ProfileImage } from './profile/ProfileImage';
import { logger } from '../services/logging';
import { supabase } from '../config/supabase';
import { toast } from 'react-hot-toast';

export const ProfileForm: React.FC = () => {
  const navigate = useNavigate();
  const user = useUserStore(state => state.user);
  const updateProfile = useUserStore(state => state.updateProfile);

  const defaultHeight = user?.unitSystem === 'standard' 
    ? { feet: Math.floor((user?.height || 70) / 12), inches: (user?.height || 70) % 12 }
    : user?.height || 170;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age?.toString() || '',
    weight: user?.weight?.toString() || '',
    height: defaultHeight,
    sex: user?.sex || 'other',
    fitnessGoals: user?.fitnessGoals || [] as string[],
    experienceLevel: user?.experienceLevel || 'beginner',
    unitSystem: user?.unitSystem || 'standard',
    imageUrl: user?.imageUrl,
    medicalConditions: user?.medicalConditions || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user?.id) {
      logger.error('No user ID found for profile update');
      toast.error('Please log in to create your profile');
      return;
    }

    try {
      const userId = session.user.id;
      
      const heightInStandard = formData.unitSystem === 'standard' && typeof formData.height === 'object'
        ? (formData.height.feet * 12) + formData.height.inches
        : formData.height as number;

      // Update existing profile
      const profileData = {
        name: formData.name,
        age: parseInt(formData.age),
        weight: parseInt(formData.weight),
        height: heightInStandard,
        sex: formData.sex as UserProfile['sex'],
        fitnessGoals: formData.fitnessGoals,
        experienceLevel: formData.experienceLevel as UserProfile['experienceLevel'],
        unitSystem: formData.unitSystem,
        is_profile_complete: true,
        image_url: formData.imageUrl || null,
        medicalConditions: formData.medicalConditions || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      // Update store
      useUserStore.setState({
        user: profileData,
        isAuthenticated: true,
        error: null
      });

      toast.success('Profile created successfully');
      navigate('/chat');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create profile';
      logger.error('Profile creation failed:', error);
      toast.error(message);
    }
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals.includes(goal)
        ? prev.fitnessGoals.filter(g => g !== goal)
        : [...prev.fitnessGoals, goal]
    }));
  };

  const handleImageUpdate = async (imageUrl: string) => {
    try {
      await updateProfile({ imageUrl });
      setFormData(prev => ({ ...prev, imageUrl }));
    } catch (error) {
      logger.error('Failed to update profile image:', error);
      throw error;
    }
  };

  const handleUnitSystemChange = (system: 'metric' | 'standard') => {
    const currentHeight = formData.height;
    const currentWeight = parseInt(formData.weight);

    if (system === 'metric' && typeof currentHeight === 'object') {
      const totalInches = (currentHeight.feet * 12) + currentHeight.inches;
      setFormData(prev => ({
        ...prev,
        unitSystem: system,
        height: Math.round(totalInches * 2.54),
        weight: currentWeight ? Math.round(currentWeight * 0.453592).toString() : ''
      }));
    } else if (system === 'standard' && typeof currentHeight === 'number') {
      const inches = Math.round(currentHeight / 2.54);
      setFormData(prev => ({
        ...prev,
        unitSystem: system,
        height: { feet: Math.floor(inches / 12), inches: inches % 12 },
        weight: currentWeight ? Math.round(currentWeight * 2.20462).toString() : ''
      }));
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please log in first</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">
        {user ? 'Edit Your Profile' : 'Complete Your Profile'}
      </h2>
      
      <div className="mb-8">
        <ProfileImage
          imageUrl={formData.imageUrl}
          onImageUpdate={handleImageUpdate}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <UnitSystemToggle
          unitSystem={formData.unitSystem}
          onChange={handleUnitSystemChange}
        />

        <MeasurementInputs
          weight={formData.weight}
          height={formData.height}
          unitSystem={formData.unitSystem}
          onWeightChange={(value) => setFormData(prev => ({ ...prev, weight: value }))}
          onHeightChange={(value) => setFormData(prev => ({ ...prev, height: value }))}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sex</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.sex}
              onChange={(e) => setFormData(prev => ({ ...prev, sex: e.target.value as UserProfile['sex'] }))}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Goals</label>
          <div className="space-y-2">
            {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility'].map(goal => (
              <label key={goal} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  checked={formData.fitnessGoals.includes(goal)}
                  onChange={() => handleGoalToggle(goal)}
                />
                <span className="ml-2">{goal}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Experience Level</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.experienceLevel}
            onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value as UserProfile['experienceLevel'] }))}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medical Conditions & Additional Goals
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={4}
            placeholder="Please list any injuries, medical conditions, or specific fitness goals we should know about..."
            value={formData.medicalConditions}
            onChange={(e) => setFormData(prev => ({ ...prev, medicalConditions: e.target.value }))}
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {user ? 'Update Profile' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

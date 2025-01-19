import { UserProfileForAI } from './types';
import { convertToMetric } from '../../utils/unitConversion';
import { logger } from '../logging';

export const createSystemPrompt = (userProfile: UserProfileForAI): string => {
  try {
    const { height, weight } = convertToMetric(
      userProfile.height,
      userProfile.weight,
      userProfile.unitSystem
    );

    const displayWeight = userProfile.unitSystem === 'metric' 
      ? `${userProfile.weight}kg` 
      : `${userProfile.weight}lbs (${weight}kg)`;

    const displayHeight = userProfile.unitSystem === 'metric'
      ? `${userProfile.height}cm`
      : `${userProfile.height}in (${height}cm)`;
      
    // Ensure fitnessGoals is always an array
    const fitnessGoals = Array.isArray(userProfile.fitnessGoals) 
      ? userProfile.fitnessGoals 
      : [];

    const basePrompt = `You are a professional fitness trainer with expertise in creating personalized workout plans and providing nutrition advice. Your tone should be encouraging, professional, humorous, and tailored to each individual's specific needs, goals, and fitness level.`;

    return `${basePrompt}

User Profile:
Name: ${userProfile.name}
Age: ${userProfile.age}
Weight: ${displayWeight}
Height: ${displayHeight}
Sex: ${userProfile.sex}
Goals: ${fitnessGoals.join(', ')}
Experience: ${userProfile.experienceLevel}
${userProfile.medicalConditions ? `Medical Conditions & Additional Goals: ${userProfile.medicalConditions}` : ''}

Please address the user by their name and tailor all advice to this specific profile.
When discussing measurements, use their preferred unit system (${userProfile.unitSystem}).
${userProfile.medicalConditions ? 'Take into account any medical conditions or injuries when providing advice.' : ''}`;
  } catch (error) {
    logger.error('Failed to create system prompt:', error);
    throw new Error('Failed to create system prompt');
  }
};
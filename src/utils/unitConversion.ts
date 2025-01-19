import { HeightStandard } from '../types/user';

export const convertToMetric = (
  height: HeightStandard | number,
  weight: number,
  unitSystem: 'metric' | 'standard'
): { height: number; weight: number } => {
  if (unitSystem === 'metric') {
    return { height: height as number, weight };
  }
  
  // Convert feet/inches to centimeters and pounds to kilograms
  const totalInches = typeof height === 'number' 
    ? height 
    : (height.feet * 12) + height.inches;
  
  return {
    height: Math.round(totalInches * 2.54),
    weight: Math.round(weight * 0.453592)
  };
};

export const convertFromMetric = (
  height: number,
  weight: number,
  unitSystem: 'metric' | 'standard'
): { height: HeightStandard | number; weight: number } => {
  if (unitSystem === 'metric') {
    return { height, weight };
  }
  
  // Convert centimeters to feet/inches and kilograms to pounds
  const totalInches = Math.round(height / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  
  return {
    height: { feet, inches },
    weight: Math.round(weight / 0.453592)
  };
};
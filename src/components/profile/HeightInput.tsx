import React from 'react';
import { HeightStandard } from '../../types/user';

interface HeightInputProps {
  height: HeightStandard | number;
  unitSystem: 'metric' | 'standard';
  onChange: (value: HeightStandard | number) => void;
}

export const HeightInput: React.FC<HeightInputProps> = ({
  height,
  unitSystem,
  onChange
}) => {
  if (unitSystem === 'metric') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Height (cm)
        </label>
        <input
          type="number"
          required
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={height as number || ''}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        />
      </div>
    );
  }

  const standardHeight = height as HeightStandard || { feet: 0, inches: 0 };
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Height
      </label>
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <input
              type="number"
              required
              min="0"
              max="8"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={standardHeight.feet || ''}
              onChange={(e) => onChange({
                ...standardHeight,
                feet: parseInt(e.target.value) || 0
              })}
            />
            <span className="text-sm text-gray-600">ft</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <input
              type="number"
              required
              min="0"
              max="11"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={standardHeight.inches || ''}
              onChange={(e) => onChange({
                ...standardHeight,
                inches: parseInt(e.target.value) || 0
              })}
            />
            <span className="text-sm text-gray-600">in</span>
          </div>
        </div>
      </div>
    </div>
  );
};
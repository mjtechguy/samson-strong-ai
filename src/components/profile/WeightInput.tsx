import React from 'react';

interface WeightInputProps {
  weight: string;
  unitSystem: 'metric' | 'standard';
  onChange: (value: string) => void;
}

export const WeightInput: React.FC<WeightInputProps> = ({
  weight,
  unitSystem,
  onChange
}) => {
  const unit = unitSystem === 'metric' ? 'kg' : 'lbs';
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Weight
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          required
          min="0"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={weight}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="text-sm text-gray-600">{unit}</span>
      </div>
    </div>
  );
};
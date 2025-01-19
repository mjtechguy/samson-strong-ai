import React from 'react';

interface UnitSystemToggleProps {
  unitSystem: 'metric' | 'standard';
  onChange: (system: 'metric' | 'standard') => void;
}

export const UnitSystemToggle: React.FC<UnitSystemToggleProps> = ({ unitSystem, onChange }) => {
  return (
    <div className="flex items-center space-x-4">
      <label className="text-sm font-medium text-gray-700">Unit System:</label>
      <div className="flex rounded-md shadow-sm">
        <button
          type="button"
          onClick={() => onChange('metric')}
          className={`px-4 py-2 text-sm font-medium rounded-l-md ${
            unitSystem === 'metric'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } border border-gray-300`}
        >
          Metric
        </button>
        <button
          type="button"
          onClick={() => onChange('standard')}
          className={`px-4 py-2 text-sm font-medium rounded-r-md ${
            unitSystem === 'standard'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } border border-l-0 border-gray-300`}
        >
          Standard
        </button>
      </div>
    </div>
  );
};
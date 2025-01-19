import React from 'react';
import { HeightInput } from './HeightInput';
import { WeightInput } from './WeightInput';
import { HeightStandard } from '../../types/user';

interface MeasurementInputsProps {
  weight: string;
  height: HeightStandard | number;
  unitSystem: 'metric' | 'standard';
  onWeightChange: (value: string) => void;
  onHeightChange: (value: HeightStandard | number) => void;
}

export const MeasurementInputs: React.FC<MeasurementInputsProps> = ({
  weight,
  height,
  unitSystem,
  onWeightChange,
  onHeightChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="w-full max-w-[200px]">
        <WeightInput
          weight={weight}
          unitSystem={unitSystem}
          onChange={onWeightChange}
        />
      </div>
      <div>
        <HeightInput
          height={height}
          unitSystem={unitSystem}
          onChange={onHeightChange}
        />
      </div>
    </div>
  );
};
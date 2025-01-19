import React from 'react';
import { Program } from '../../types/program';
import { ProgramImage } from './ProgramImage';

interface ProgramCardProps {
  program: Program;
  onSelect: (program: Program) => void;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({ program, onSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative w-full pb-[56.25%]">
        <ProgramImage
          src={program.imageUrl}
          alt={program.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
        <p className="mt-2 text-sm text-gray-600">{program.description}</p>
        <button
          onClick={() => onSelect(program)}
          className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Select Program
        </button>
      </div>
    </div>
  );
};
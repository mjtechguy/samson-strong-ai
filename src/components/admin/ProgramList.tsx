import React from 'react';
import { Program } from '../../types/program';
import { ProgramImage } from './ProgramImage';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface ProgramListProps {
  programs: Program[];
  loading: boolean;
  error: string | null;
  onDelete: (id: string) => Promise<void>;
  onEdit: (program: Program) => void;
  isAdmin: boolean;
}

export const ProgramList: React.FC<ProgramListProps> = ({
  programs,
  loading,
  error,
  onDelete,
  onEdit,
  isAdmin
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-100 rounded-lg h-64"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No programs available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {programs.map((program) => (
        <div
          key={program.id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="relative w-full pb-[56.25%]">
            <ProgramImage
              src={program.imageUrl}
              alt={program.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {program.name}
            </h3>
            <p className="mt-2 text-sm text-gray-600 line-clamp-3">
              {program.description}
            </p>
            {isAdmin && (
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => onEdit(program)}
                  className="text-indigo-600 hover:text-indigo-800 p-2"
                  title="Edit program"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(program.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
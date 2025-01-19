import React from 'react';
import { Program } from '../../types/program';
import { logger } from '../../services/logging';
import { useUserStore } from '../../store/userStore';
import { ProgramImage } from './ProgramImage';
import { PencilIcon } from '@heroicons/react/24/outline';

interface BrowseProgramListProps {
  programs?: Program[];
  loading?: boolean;
  error?: string | null;
  onSelect: (program: Program) => void;
  onDelete?: (programId: string) => void;
  deletingProgramId?: string | null;
  onEdit?: (program: Program) => void;
}

export const BrowseProgramList: React.FC<BrowseProgramListProps> = ({
  programs = [],
  loading = false,
  error = null,
  onSelect,
  onDelete,
  deletingProgramId,
  onEdit
}) => {
  const user = useUserStore(state => state.user);
  const isAdmin = user?.isAdmin === true;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="relative w-full pb-[56.25%] bg-gray-100 rounded-t-lg">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-b-lg">
              <div className="h-6 bg-gray-100 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-full mb-4"></div>
              <div className="h-10 bg-gray-100 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-indigo-600 hover:text-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!programs || programs.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Programs Available
        </h3>
        <p className="text-gray-500">
          {isAdmin 
            ? 'Create your first program in the admin dashboard.'
            : 'Check back later for new programs.'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
        <p className="text-gray-500 mb-4">{error}</p>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Programs Available
        </h3>
        <p className="text-gray-500">
          Check back later for new programs
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {programs.map((program) => (
        <div
          key={program.id}
          className="bg-white rounded-lg shadow-md overflow-hidden group"
        >
          <div className="relative w-full pb-[56.25%]">
            <ProgramImage
              src={program.imageUrl}
              alt={program.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {isAdmin && onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(program);
                }}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                title="Edit program"
              >
                <PencilIcon className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
            <p className="mt-2 text-sm text-gray-600 line-clamp-3">
              {program.description}
            </p>
            <button
              onClick={() => onSelect(program)}
              className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Select Program
            </button>
          </div>
          {isAdmin && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(program.id);
              }}
              disabled={deletingProgramId === program.id}
              className="absolute top-2 right-16 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
              title="Delete program"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
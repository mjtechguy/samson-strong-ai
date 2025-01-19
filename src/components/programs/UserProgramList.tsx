import React from 'react';
import { UserProgram, Program } from '../../types/program';
import { formatDate } from '../../utils/dateFormatter';
import { Link } from 'react-router-dom';
import { logger } from '../../services/logging';
import { useUserStore } from '../../store/userStore';
import { PencilIcon } from '@heroicons/react/24/outline';

interface UserProgramListProps {
  programs: (UserProgram & { program?: Program })[];
  loading?: boolean;
  error?: string | null;
  onSelect: (program: UserProgram & { program: Program }) => void;
  onDownload: (program: UserProgram & { program: Program }) => void;
  onEdit?: (program: Program) => void;
}

export const UserProgramList: React.FC<UserProgramListProps> = ({
  programs = [],
  loading = false,
  error = null,
  onSelect,
  onDownload,
  onEdit
}) => {
  const user = useUserStore(state => state.user);
  const isAdmin = user?.isAdmin === true;

  logger.debug('Rendering user programs list', {
    programCount: programs.length,
    loading,
    hasError: !!error
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
        ))}
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
          No Programs Yet
        </h3>
        <p className="text-gray-500 mb-4">
          You haven't customized any programs yet.
        </p>
        <Link
          to="/programs"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Browse Programs
        </Link>
      </div>
    );
  }

  const validPrograms = programs.filter((program): program is UserProgram & { program: Program } => {
    if (!program.program) {
      logger.warn('Program data missing for user program', { 
        userProgramId: program.id,
        programId: program.programId 
      });
      return false;
    }
    return true;
  });

  if (validPrograms.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="mb-2">Unable to load program details</p>
        <button
          onClick={() => window.location.reload()}
          className="text-indigo-600 hover:text-indigo-700"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {validPrograms.map((program) => (
        <div
          key={program.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {program.program.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Created on {formatDate(program.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && onEdit && (
                <button
                  onClick={() => onEdit(program.program)}
                  className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                  title="Edit program"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => onSelect(program)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View Details
              </button>
              <button
                onClick={() => onDownload(program)}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
import React from 'react';
import { UserProgram, Program } from '../../types/program';
import { formatDate } from '../../utils/dateFormatter';
import { Link } from 'react-router-dom';

interface ProgramListProps {
  programs: (UserProgram & { program: Program })[];
  loading: boolean;
  error: string | null;
  onSelect: (program: UserProgram & { program: Program }) => void;
  onDownload: (program: UserProgram & { program: Program }) => void;
}

export const ProgramList: React.FC<ProgramListProps> = ({
  programs,
  loading,
  error,
  onSelect,
  onDownload
}) => {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg h-24"></div>
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

  return (
    <div className="space-y-4">
      {programs.map((program) => (
        <div
          key={program.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="flex">
            <div className="relative w-48">
              <div className="relative w-full pb-[56.25%]">
                <img
                  src={program.program.imageUrl}
                  alt={program.program.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {program.program.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Created on {formatDate(program.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSelect(program)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onDownload(program)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
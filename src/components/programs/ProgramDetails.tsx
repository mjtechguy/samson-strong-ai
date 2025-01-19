import React from 'react';
import { UserProgram, Program } from '../../types/program';
import { formatDate } from '../../utils/dateFormatter';
import ReactMarkdown from 'react-markdown';

interface ProgramDetailsProps {
  program: UserProgram & { program: Program };
  onClose: () => void;
}

export const ProgramDetails: React.FC<ProgramDetailsProps> = ({ program, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{program.program.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Created on {formatDate(program.createdAt)}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-indigo max-w-none">
            <ReactMarkdown>{program.customizedPlan}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};
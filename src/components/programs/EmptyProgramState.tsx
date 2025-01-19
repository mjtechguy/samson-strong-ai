import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

export const EmptyProgramState: React.FC = () => {
  return (
    <div className="text-center py-16 bg-white rounded-lg shadow">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-indigo-100 rounded-full">
          <ClipboardDocumentIcon className="h-12 w-12 text-indigo-600" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        No Custom Programs Yet
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Looks like you haven't customized any programs yet. Browse our program templates and let AI customize one for your specific goals and fitness level.
      </p>
      <Link
        to="/programs"
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      >
        Browse Program Templates
        <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" />
      </Link>
    </div>
  );
};
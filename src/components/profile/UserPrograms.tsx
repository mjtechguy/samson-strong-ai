import React, { useEffect, useState } from 'react';
import { UserProgram, Program } from '../../types/program';
import { programService } from '../../services/programs/service';
import { PDFDocument } from '../../utils/pdfGenerator';
import { toast } from 'react-hot-toast';
import { logger } from '../../services/logging';

interface UserProgramsProps {
  userId: string;
}

export const UserPrograms: React.FC<UserProgramsProps> = ({ userId }) => {
  const [userPrograms, setUserPrograms] = useState<(UserProgram & { program?: Program })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user programs
        const programs = await programService.getUserPrograms(userId);
        
        // Get base program details for each user program
        const programsWithDetails = await Promise.all(
          programs.map(async (userProgram) => {
            try {
              const program = await programService.getProgram(userProgram.programId);
              return {
                ...userProgram,
                program: program || undefined
              };
            } catch (error) {
              logger.error('Failed to fetch program details', {
                programId: userProgram.programId,
                error
              });
              return userProgram;
            }
          })
        );

        setUserPrograms(programsWithDetails);
      } catch (error) {
        const message = 'Failed to load your programs';
        logger.error(message, error);
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, [userId]);

  const handleDownload = async (userProgram: UserProgram & { program?: Program }) => {
    if (!userProgram.program) {
      toast.error('Program details not available');
      return;
    }

    try {
      const pdf = new PDFDocument(userProgram.program.name, userId);
      await pdf.addContent(userProgram.customizedPlan);
      const pdfBlob = await pdf.generate();

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${userProgram.program.name.toLowerCase().replace(/\s+/g, '-')}-plan.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Program downloaded successfully');
    } catch (error) {
      logger.error('Failed to download program', error);
      toast.error('Failed to download program');
    }
  };

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
      <div className="text-center py-8 text-gray-500">
        <p className="text-red-500 mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-indigo-600 hover:text-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (userPrograms.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No customized programs yet. Visit the Programs tab to get started!
      </div>
    );
  }

  // Filter out programs with missing data
  const validPrograms = userPrograms.filter((program): program is UserProgram & { program: Program } => {
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
      <div className="text-center py-8 text-gray-500">
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
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {program.program.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Created on {program.createdAt.toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDownload(program)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Download PDF
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

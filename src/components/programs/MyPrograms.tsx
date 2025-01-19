import React, { useState, useEffect } from 'react';
import { UserProgram, Program } from '../../types/program';
import { useUserStore } from '../../store/userStore';
import { toast } from 'react-hot-toast';
import { logger } from '../../services/logging';
import { UserProgramList } from './UserProgramList';
import { ProgramDetails } from './ProgramDetails';
import { EmptyProgramState } from './EmptyProgramState';
import { pdfStorage } from '../../services/storage/pdf/service';
import { supabase } from '../../config/supabase';

export const MyPrograms: React.FC = () => {
  const [userPrograms, setUserPrograms] = useState<(UserProgram & { program: Program })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<UserProgram & { program: Program } | null>(null);
  const user = useUserStore(state => state.user);

  useEffect(() => {
    if (!user?.id) {
      setError('Please log in to view your programs');
      setLoading(false);
      return;
    }

    loadPrograms();
  }, [user?.id]);

  const loadPrograms = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data: userProgramsData, error: userProgramsError } = await supabase
        .from('user_programs')
        .select(`
          *,
          program:programs(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userProgramsError) throw userProgramsError;

      const validPrograms = (userProgramsData || [])
        .filter((p): p is UserProgram & { program: Program } => {
          if (!p.program) {
            logger.warn('Program data missing for user program', { 
              userProgramId: p.id,
              programId: p.program_id 
            });
            return false;
          }
          return true;
        })
        .map(p => ({
          id: p.id,
          userId: p.user_id,
          programId: p.program_id,
          customizedPlan: p.customized_plan,
          pdfUrl: p.pdf_url,
          pdfPath: p.pdf_path,
          createdAt: new Date(p.created_at),
          program: {
            id: p.program.id,
            name: p.program.name,
            description: p.program.description,
            imageUrl: p.program.image_url,
            template: p.program.template,
            createdAt: new Date(p.program.created_at),
            updatedAt: new Date(p.program.updated_at)
          }
        }));

      setUserPrograms(validPrograms);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load your programs';
      logger.error('Failed to load user programs:', error);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (program: UserProgram & { program: Program }) => {
    try {
      if (!program.pdfPath) {
        throw new Error('PDF file not found for this program');
      }

      try {
        // Get fresh URL (in case the token expired)
        const url = await pdfStorage.getPDFUrl(program.pdfPath);
        
        // Create download link
        const link = document.createElement('a');
        const filename = `${program.program.name.toLowerCase().replace(/\s+/g, '-')}-plan.pdf`;
        
        // Start download
        link.href = url;
        link.download = filename;
        link.target = '_blank'; // Open in new tab as fallback
        link.rel = 'noopener noreferrer';
        
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);

        toast.success('Downloading program...');
      } catch (error) {
        logger.error('Failed to download PDF:', error);
        throw new Error('Failed to download program. Please try again.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download program';
      logger.error('Program download failed:', error);
      toast.error(message);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">Please log in to view your programs</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">My Programs</h2>
      
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => loadPrograms()}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Try Again
          </button>
        </div>
      ) : userPrograms.length === 0 ? (
        <EmptyProgramState />
      ) : (
        <UserProgramList
          programs={userPrograms}
          onSelect={setSelectedProgram}
          onDownload={handleDownload}
        />
      )}

      {selectedProgram && (
        <ProgramDetails
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
        />
      )}
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { Program } from '../../types/program';
import { supabase } from '../../config/supabase';
import { programService } from '../../services';
import { toast } from 'react-hot-toast';
import { logger } from '../../services/logging';
import { BrowseProgramList } from './BrowseProgramList';
import { CustomizeProgramModal } from './CustomizeProgramModal';
import { EditProgramModal } from './EditProgramModal';
import { useUserStore } from '../../store/userStore';

export const Programs: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [deletingProgram, setDeletingProgram] = useState<string | null>(null);
  const user = useUserStore(state => state.user);

  useEffect(() => {
    if (!user?.id) return;
    loadPrograms();
  }, [user?.id]);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      
      // Get programs directly from Supabase
      const { data, error } = await supabase
        .from('programs')
        .select()
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match Program type
      const transformedPrograms = (data || []).map(program => ({
        id: program.id,
        name: program.name,
        description: program.description,
        imageUrl: program.image_url,
        template: program.template,
        createdAt: new Date(program.created_at),
        updatedAt: new Date(program.updated_at)
      }));

      setPrograms(transformedPrograms);
      setError(null);
    } catch (error) {
      logger.error('Failed to load programs:', error);
      setError('Failed to load programs. Please try again.');
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleProgramUpdate = async (updatedProgram: Program) => {
    try {
      await programService.updateProgram(updatedProgram.id, updatedProgram);
      await loadPrograms(); // Reload all programs to ensure consistency
      setEditingProgram(null);
      toast.success('Program updated successfully');
    } catch (error) {
      logger.error('Failed to update program:', error);
      toast.error('Failed to update program');
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!window.confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingProgram(programId);
      await programService.deleteProgram(programId);
      await loadPrograms();
      toast.success('Program deleted successfully');
    } catch (error) {
      logger.error('Failed to delete program:', error);
      toast.error('Failed to delete program');
    } finally {
      setDeletingProgram(null);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">Please log in to view programs</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Browse Programs</h2>
        <p className="text-sm text-gray-600">
          Select a program to customize it for your goals
        </p>
      </div>
      
      <BrowseProgramList
        programs={programs}
        loading={loading}
        error={error}
        onSelect={setSelectedProgram}
        onDelete={user.isAdmin ? handleDeleteProgram : undefined}
        deletingProgramId={deletingProgram}
        onEdit={user.isAdmin ? setEditingProgram : undefined}
      />

      {selectedProgram && (
        <CustomizeProgramModal
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
        />
      )}

      {editingProgram && (
        <EditProgramModal
          program={editingProgram}
          onClose={() => setEditingProgram(null)}
          onUpdate={handleProgramUpdate}
        />
      )}
    </div>
  );
};
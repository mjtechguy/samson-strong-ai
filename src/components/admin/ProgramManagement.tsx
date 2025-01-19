import { useState, useEffect } from 'react';
import { ProgramForm } from './ProgramForm';
import { ProgramUpload } from './ProgramUpload';
import { Program, ProgramYAML } from '../../types/program';
import { programService } from '../../services';
import { toast } from 'react-hot-toast';
import { ProgramList } from './ProgramList';
import { logger } from '../../services/logging';
import { generateTemplateYAML } from '../../utils/yaml/generator';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { EditProgramModal } from './EditProgramModal';

export const ProgramManagement = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await programService.getAllPrograms();
      setPrograms(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load programs';
      logger.error('Failed to load programs:', error);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component implementation...
  return (
    <div>Program management component</div>
  );
};
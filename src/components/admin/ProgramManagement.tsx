import { useState, useEffect } from 'react';
import { programService } from '../../services';
import { toast } from 'react-hot-toast';
import { logger } from '../../services/logging';

export const ProgramManagement = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>Program management component</div>
  );
};

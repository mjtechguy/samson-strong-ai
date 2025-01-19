import { useEffect, useState } from 'react';
import { SystemSetting, settingsService } from '../../services/settings/service';
import { toast } from 'react-hot-toast';
import { logger } from '../../services/logging';
import { validateOpenAIKey, getAvailableModels, OpenAIModel } from '../../services/openai/validation';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../config/supabase';

export const SystemSettings = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [modifiedSettings, setModifiedSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [validatingAPI, setValidatingAPI] = useState(false);
  const [availableModels, setAvailableModels] = useState<OpenAIModel[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getAllSettings();
      setSettings(data);
      setModifiedSettings({});
    } catch (error) {
      logger.error('Failed to load settings', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component implementation...
  return (
    <div>Settings component</div>
  );
};
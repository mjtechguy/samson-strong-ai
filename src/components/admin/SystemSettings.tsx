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

  const handleInputChange = (key: string, value: string) => {
    setModifiedSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      for (const [key, value] of Object.entries(modifiedSettings)) {
        await settingsService.updateSetting(key, value);
      }
      toast.success('Settings saved successfully');
      loadSettings();
    } catch (error) {
      logger.error('Failed to save settings', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleValidateAPI = async () => {
    try {
      setValidatingAPI(true);
      const apiKey = modifiedSettings['openai_api_key'] || settings.find(s => s.key === 'openai_api_key')?.value || '';
      if (!validateOpenAIKey(apiKey)) {
        toast.error('Invalid OpenAI API key');
        return;
      }
      const models = await getAvailableModels(apiKey);
      setAvailableModels(models);
      toast.success('API key validated successfully');
    } catch (error) {
      logger.error('Failed to validate API key', error);
      toast.error('Failed to validate API key');
    } finally {
      setValidatingAPI(false);
    }
  };

  const handleUploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const { data, error } = await supabase.storage.from('public').upload(`logos/${file.name}`, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (error) throw error;

      const logoUrl = supabase.storage.from('public').getPublicUrl(data.path).publicURL;
      handleInputChange('VITE_APP_LOGO_URL', logoUrl);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      logger.error('Failed to upload logo', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">System Settings</h2>
      {loading ? (
        <p>Loading settings...</p>
      ) : (
        <div className="space-y-4">
          {settings.map((setting) => (
            <div key={setting.key} className="flex items-center space-x-4">
              <label className="w-1/3 text-right">{setting.description}</label>
              <input
                type="text"
                value={modifiedSettings[setting.key] || setting.value}
                onChange={(e) => handleInputChange(setting.key, e.target.value)}
                className="w-2/3 p-2 border rounded"
              />
            </div>
          ))}
          <div className="flex items-center space-x-4">
            <label className="w-1/3 text-right">Supabase URL</label>
            <input
              type="text"
              value={modifiedSettings['VITE_SUPABASE_URL'] || settings.find(s => s.key === 'VITE_SUPABASE_URL')?.value || ''}
              onChange={(e) => handleInputChange('VITE_SUPABASE_URL', e.target.value)}
              className="w-2/3 p-2 border rounded"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/3 text-right">Supabase Anon Key</label>
            <input
              type="text"
              value={modifiedSettings['VITE_SUPABASE_ANON_KEY'] || settings.find(s => s.key === 'VITE_SUPABASE_ANON_KEY')?.value || ''}
              onChange={(e) => handleInputChange('VITE_SUPABASE_ANON_KEY', e.target.value)}
              className="w-2/3 p-2 border rounded"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/3 text-right">App Logo</label>
            <input
              type="file"
              onChange={handleUploadLogo}
              className="w-2/3 p-2 border rounded"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-1/3 text-right">OpenAI API Key</label>
            <input
              type="text"
              value={modifiedSettings['openai_api_key'] || settings.find(s => s.key === 'openai_api_key')?.value || ''}
              onChange={(e) => handleInputChange('openai_api_key', e.target.value)}
              className="w-2/3 p-2 border rounded"
            />
            <button
              onClick={handleValidateAPI}
              className="p-2 bg-blue-500 text-white rounded"
              disabled={validatingAPI}
            >
              {validatingAPI ? 'Validating...' : 'Validate'}
            </button>
          </div>
          <button
            onClick={handleSave}
            className="p-2 bg-green-500 text-white rounded"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
};

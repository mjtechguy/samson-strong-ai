import React, { useState } from 'react';
import { Program } from '../../types/program';
import { supabase } from '../../config/supabase';
import { toast } from 'react-hot-toast';
import { logger } from '../../services/logging';
import { ProgramImage } from './ProgramImage';

interface EditProgramModalProps {
  program: Program;
  onClose: () => void;
  onUpdate: (updatedProgram: Program) => void;
}

export const EditProgramModal: React.FC<EditProgramModalProps> = ({
  program,
  onClose,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    name: program.name,
    description: program.description,
    template: program.template
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      logger.debug('Updating program', { programId: program.id });

      let imageUrl = program.imageUrl;

      // Upload new image if provided
      if (imageFile) {
        const timestamp = Date.now();
        const extension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${program.id}/program-${timestamp}.${extension}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('public')
          .upload(path, imageFile, {
            upsert: true,
            contentType: imageFile.type,
            cacheControl: '3600'
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('public')
          .getPublicUrl(uploadData.path);

        imageUrl = publicUrl;
      }

      // Update program in database
      const { error: updateError } = await supabase
        .from('programs')
        .update({
          name: formData.name,
          description: formData.description,
          template: formData.template,
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', program.id);

      if (updateError) throw updateError;

      // Update local state
      onUpdate({
        ...program,
        ...formData,
        imageUrl,
        updatedAt: new Date()
      });

      toast.success('Program updated successfully');
      onClose();
    } catch (error) {
      logger.error('Failed to update program', error);
      toast.error('Failed to update program');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Edit Program</h2>
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
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Program Name
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                required
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Program Image
              </label>
              <div className="mt-2 flex items-center gap-4">
                <ProgramImage
                  src={program.imageUrl}
                  alt={program.name}
                  className="h-32 w-32 object-cover rounded-lg"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Program Template (Markdown)
              </label>
              <textarea
                required
                rows={15}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono"
                value={formData.template}
                onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
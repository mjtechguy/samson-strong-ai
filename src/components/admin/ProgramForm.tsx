import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { logger } from '../../services/logging';

interface ProgramFormData {
  name: string;
  description: string;
  template: string;
  imageFile: File | null;
}

interface ProgramFormProps {
  onSubmit: (formData: ProgramFormData) => Promise<void>;
}

export const ProgramForm = ({ onSubmit }: ProgramFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      
      // Get form values
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;
      const template = formData.get('template') as string;
      const imageFile = formData.get('image') as File;

      if (!name?.trim() || !description?.trim() || !template?.trim()) {
        throw new Error('All fields are required');
      }

      if (!imageFile && !form.getAttribute('data-has-image')) {
        throw new Error('Program image is required');
      }

      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        template: template.trim(),
        imageFile: imageFile || null
      });

      form.reset();
      toast.success('Program created successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create program';
      logger.error('Error creating program:', error);
      toast.error(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Program Name
        </label>
        <input
          type="text"
          name="name"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          required
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Program Image
        </label>
        <input
          type="file"
          name="image"
          accept="image/*"
          required
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Program Template (Markdown)
        </label>
        <textarea
          name="template"
          required
          rows={10}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono"
          placeholder="# Program Overview&#10;&#10;## Week 1&#10;- Exercise 1&#10;- Exercise 2&#10;&#10;## Week 2&#10;..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Program'}
      </button>
    </form>
  );
};
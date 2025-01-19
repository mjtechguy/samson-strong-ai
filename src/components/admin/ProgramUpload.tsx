import React, { useState, useRef } from 'react';
import { ProgramYAML, ProgramValidationError } from '../../types/program';
import { parseProgramYAML } from '../../utils/yaml/parser';
import { toast } from 'react-hot-toast';
import { logger } from '../../services/logging';

interface ProgramUploadProps {
  onUpload: (program: ProgramYAML) => Promise<void>;
}

export const ProgramUpload: React.FC<ProgramUploadProps> = ({ onUpload }) => {
  const [errors, setErrors] = useState<ProgramValidationError[]>();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setErrors(undefined);

      // Read file content
      const content = await file.text();
      
      // Parse and validate YAML
      const { data, errors } = parseProgramYAML(content);
      
      if (errors) {
        setErrors(errors);
        toast.error('Invalid program file');
        return;
      }

      if (!data) {
        throw new Error('No data parsed from file');
      }

      // Upload program
      await onUpload(data);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success('Program uploaded successfully');
    } catch (error) {
      logger.error('Program upload failed:', error);
      toast.error('Failed to upload program');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".yml,.yaml"
          onChange={handleFileChange}
          disabled={isUploading}
          className="text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100
            disabled:opacity-50"
        />
        {isUploading && (
          <div className="text-sm text-gray-500">Uploading...</div>
        )}
      </div>

      {errors && errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            Validation Errors:
          </h4>
          <ul className="list-disc list-inside text-sm text-red-700">
            {errors.map((error, index) => (
              <li key={index}>
                {error.field}: {error.message}
                {error.line !== undefined && ` (line ${error.line + 1})`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p className="font-medium mb-2">Program file format (YAML):</p>
        <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
{`name: "Program Name"
description: "Program description"
image_url: "https://example.com/image.jpg" # Optional
template: |
  # Workout Program
  
  ## Warm Up (5 Minutes)
  1. Exercise 1
  2. Exercise 2
  
  ## Main Workout (20 Minutes)
  ...

metadata: # Optional
  difficulty: beginner # beginner, intermediate, or advanced
  duration: "30 minutes"
  equipment:
    - "Dumbbells"
    - "Yoga Mat"
  tags:
    - "Strength"
    - "HIIT"`}
        </pre>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Program } from '../../types/program';
import { useUserStore } from '../../store/userStore';
import { generateFitnessResponse } from '../../services/openai';
import { programService } from '../../services';
import { PDFDocument } from '../../utils/pdfGenerator';
import { pdfStorage } from '../../services/storage/pdf/service';
import { toast } from 'react-hot-toast';
import { logger } from '../../services/logging';
import ReactMarkdown from 'react-markdown';
import { ProgramImage } from './ProgramImage';

interface CustomizeProgramModalProps {
  program: Program;
  onClose: () => void;
}

export const CustomizeProgramModal: React.FC<CustomizeProgramModalProps> = ({
  program,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [customizedPlan, setCustomizedPlan] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const user = useUserStore(state => state.user);

  if (!user) {
    logger.error('Cannot customize program: No user found');
    return null;
  }

  const handleCustomize = async () => {
    try {
      setIsLoading(true);
      setCustomizedPlan(null);
      
      logger.debug('Starting program customization', { 
        programId: program.id,
        programName: program.name,
        userId: user.id
      });

      // Validate user profile
      if (!user.fitnessGoals?.length) {
        throw new Error('Please set your fitness goals in your profile first');
      }

      const prompt = `Please customize this fitness program template for me based on my profile:

${program.template}

Please maintain the markdown format but adjust all exercises, sets, reps, and intensity levels according to my profile and goals. Consider my experience level, any medical conditions, and ensure the program aligns with my fitness objectives.`;

      const response = await generateFitnessResponse(prompt, {
        name: user.name,
        age: user.age,
        weight: user.weight,
        height: user.height,
        sex: user.sex,
        fitnessGoals: user.fitnessGoals || [],
        experienceLevel: user.experienceLevel,
        unitSystem: user.unitSystem,
        medicalConditions: user.medicalConditions
      }, []);

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.content?.trim()) {
        throw new Error('Failed to generate customized program');
      }

      setCustomizedPlan(response.content);
      logger.debug('Program customized successfully', {
        programId: program.id,
        contentLength: response.content.length
      });
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to customize program. Please try again.';
      logger.error('Program customization failed:', { 
        error: message, 
        details: error,
        programId: program.id,
        userId: user.id
      });
      toast.error(message);
      if (message.includes('API key') || message.includes('goals')) {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!customizedPlan) return;

    try {
      setIsSaving(true);
      logger.debug('Starting program save', {
        programId: program.id,
        userId: user.id,
        contentLength: customizedPlan.length
      });

      // First save the program without PDF
      await programService.createUserProgram({
        userId: user.id,
        programId: program.id,
        customizedPlan,
        pdfUrl: null,
        pdfPath: null
      });

      logger.debug('Program saved, generating PDF...');

      // Then generate and upload PDF in background
      generatePDFInBackground();

      toast.success('Program saved successfully! You can view it in My Programs.');
      onClose();
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Failed to save program. Please try again.';
      logger.error('Failed to save program:', { 
        error: message, 
        details: error,
        programId: program.id,
        userId: user.id
      });
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const generatePDFInBackground = async () => {
    if (!customizedPlan) return;

    try {
      // Generate PDF
      const pdf = new PDFDocument(program.name, user.name);
      await pdf.addContent(customizedPlan, program.imageUrl);
      const pdfBlob = await pdf.generate();

      logger.debug('PDF generated', {
        size: pdfBlob.size,
        sizeInMB: Math.round(pdfBlob.size / (1024 * 1024)),
        type: pdfBlob.type
      });

      // Upload PDF
      const { url: pdfUrl, path: pdfPath } = await pdfStorage.uploadPDF(
        pdfBlob,
        user.id,
        program.id
      );

      logger.debug('PDF uploaded', {
        url: pdfUrl,
        path: pdfPath
      });

      // Update program with PDF info
      await programService.updateUserProgram(user.id, program.id, {
        pdfUrl,
        pdfPath
      });

      logger.debug('Program updated with PDF info');
    } catch (error) {
      logger.error('Failed to generate/upload PDF in background:', error);
      // Don't show error to user since program is already saved
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <ProgramImage
                  src={program.imageUrl}
                  alt={program.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{program.name}</h2>
                <p className="text-sm text-gray-500">{program.description}</p>
              </div>
            </div>
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

        <div className="flex-1 overflow-y-auto">
          {!customizedPlan ? (
            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Your Profile:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>Name: {user.name}</li>
                  <li>Age: {user.age}</li>
                  <li>Weight: {user.weight}{user.unitSystem === 'metric' ? 'kg' : 'lbs'}</li>
                  <li>Height: {
                    user.unitSystem === 'metric' 
                      ? `${user.height}cm`
                      : `${Math.floor(user.height/12)}'${user.height%12}"`
                  }</li>
                  <li>Goals: {user.fitnessGoals.join(', ')}</li>
                  <li>Experience: {user.experienceLevel}</li>
                  {user.medicalConditions && (
                    <li>Medical Conditions: {user.medicalConditions}</li>
                  )}
                </ul>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Program Template:</h3>
                <div className="prose prose-indigo max-w-none bg-gray-50 p-4 rounded-lg">
                  <ReactMarkdown>{program.template}</ReactMarkdown>
                </div>
              </div>

              <button
                onClick={handleCustomize}
                disabled={isLoading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Customizing...' : 'Customize Program'}
              </button>
            </div>
          ) : (
            <div className="p-6">
              <h3 className="font-semibold mb-2">Your Customized Program:</h3>
              <div className="prose prose-indigo max-w-none mb-6">
                <ReactMarkdown>{customizedPlan}</ReactMarkdown>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Program'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
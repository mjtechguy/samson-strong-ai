import yaml from 'js-yaml';
import { ProgramYAML, ProgramValidationError } from '../../types/program';
import { validateProgramYAML } from './programSchema';
import { logger } from '../../services/logging';

export const parseProgramYAML = (content: string): { 
  data?: ProgramYAML; 
  errors?: ProgramValidationError[] 
} => {
  try {
    // Parse YAML
    const parsed = yaml.load(content);
    
    // Validate against schema
    const result = validateProgramYAML(parsed);
    
    if (!result.success) {
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return { errors };
    }

    return { data: result.data };
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      logger.error('YAML parsing error:', error);
      return {
        errors: [{
          field: 'yaml',
          message: 'Invalid YAML format',
          line: error.mark?.line
        }]
      };
    }
    
    logger.error('Program YAML parsing failed:', error);
    return {
      errors: [{
        field: 'general',
        message: 'Failed to parse program file'
      }]
    };
  }
};
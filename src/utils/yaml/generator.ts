import { Program, ProgramYAML } from '../../types/program';
import yaml from 'js-yaml';
import { logger } from '../../services/logging';

export const generateProgramYAML = (program: Program): string => {
  try {
    const programData: ProgramYAML = {
      name: program.name,
      description: program.description,
      image_url: program.imageUrl,
      template: program.template
    };

    return yaml.dump(programData, {
      indent: 2,
      lineWidth: -1, // Don't wrap lines
      noRefs: true,
      sortKeys: true
    });
  } catch (error) {
    logger.error('Failed to generate program YAML:', error);
    throw new Error('Failed to generate program YAML');
  }
};

export const generateTemplateYAML = (): string => {
  const template: ProgramYAML = {
    name: "Program Name",
    description: "Program description",
    image_url: "https://example.com/image.jpg",
    template: `# Workout Program

## Warm Up (5 Minutes)
1. Exercise 1: Description and form tips
2. Exercise 2: Description and form tips

## Main Workout (20 Minutes)
1. Exercise 1
   - Sets: 3
   - Reps: 12
   - Rest: 60 seconds
   - Notes: Form tips and modifications

2. Exercise 2
   - Sets: 3
   - Reps: 15
   - Rest: 45 seconds
   - Notes: Form tips and modifications

## Cool Down (5 Minutes)
1. Stretch 1: Description and duration
2. Stretch 2: Description and duration`,
    metadata: {
      difficulty: "beginner",
      duration: "30 minutes",
      equipment: [
        "Dumbbells",
        "Yoga Mat"
      ],
      tags: [
        "Strength",
        "HIIT"
      ]
    }
  };

  return yaml.dump(template, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: true
  });
};
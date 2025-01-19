export interface UserProfileForAI {
  name: string;
  age: number;
  weight: number;
  height: number;
  sex: string;
  fitnessGoals: string[];
  experienceLevel: string;
  unitSystem: 'metric' | 'standard';
  medicalConditions?: string;
}

export interface AIResponse {
  content: string;
  error?: string;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type StreamingCallback = (chunk: string) => void;
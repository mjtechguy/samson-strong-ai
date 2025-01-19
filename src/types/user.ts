export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  sex: 'male' | 'female' | 'other';
  fitnessGoals: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  isAdmin?: boolean;
  unitSystem: 'metric' | 'standard';
  imageUrl?: string;
  medicalConditions?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HeightStandard {
  feet: number;
  inches: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  averageMessagesPerUser: number;
}

export interface UnitConversion {
  height: number;
  weight: number;
}
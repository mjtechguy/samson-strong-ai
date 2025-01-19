import { UserProfile } from '../../../types/user';

export interface AuthCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  user: UserProfile;
}

export interface UserRegistrationData extends Omit<UserProfile, 'id'> {
  password: string;
}
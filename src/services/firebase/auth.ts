import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { UserProfile } from '../../types/user';
import { logger } from '../logging';

export const createUser = async (
  email: string, 
  password: string, 
  userData: Omit<UserProfile, 'id'>
): Promise<UserProfile> => {
  try {
    logger.info('Creating new user', { email });
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userProfile: UserProfile = {
      id: user.uid,
      email: user.email!,
      ...userData
    };

    await setDoc(doc(db, 'users', user.uid), {
      ...userProfile,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    logger.info('User created successfully', { userId: user.uid });
    return userProfile;
  } catch (error: any) {
    logger.error('Failed to create user', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<UserProfile> => {
  try {
    logger.info('Attempting user login', { email });
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }

    logger.info('User logged in successfully', { userId: user.uid });
    return { id: userDoc.id, ...userDoc.data() } as UserProfile;
  } catch (error: any) {
    logger.error('Login failed', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    logger.info('Logging out user');
    await signOut(auth);
    logger.info('User logged out successfully');
  } catch (error: any) {
    logger.error('Logout failed', error);
    throw error;
  }
};

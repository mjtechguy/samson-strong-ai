import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import { UserProfile } from '../../../types/user';
import { AuthCredentials, AuthResponse, UserRegistrationData } from './types';
import { validateAuthCredentials } from './validation';

export const registerUser = async (
  credentials: AuthCredentials,
  userData: Omit<UserProfile, 'id' | 'email'>
): Promise<AuthResponse> => {
  validateAuthCredentials(credentials);

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    credentials.email,
    credentials.password
  );

  if (credentials.name) {
    await updateProfile(userCredential.user, {
      displayName: credentials.name
    });
  }

  const userProfile: UserProfile = {
    id: userCredential.user.uid,
    email: credentials.email,
    name: credentials.name || credentials.email.split('@')[0],
    ...userData
  };

  await setDoc(doc(db, 'users', userCredential.user.uid), {
    ...userProfile,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return {
    success: true,
    user: userProfile
  };
};

export const loginUser = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  validateAuthCredentials(credentials);

  const userCredential = await signInWithEmailAndPassword(
    auth,
    credentials.email,
    credentials.password
  );

  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  if (!userDoc.exists()) {
    throw new Error('User profile not found');
  }

  const userProfile = {
    id: userDoc.id,
    ...userDoc.data()
  } as UserProfile;

  return {
    success: true,
    user: userProfile
  };
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) return null;

  return {
    id: userDoc.id,
    ...userDoc.data()
  } as UserProfile;
};
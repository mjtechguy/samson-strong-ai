import { app, auth } from './core';
import { logger } from '../logging';
import { authService } from '../authService';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

let initialized = false;

export const initializeFirebase = async (): Promise<void> => {
  if (initialized) {
    logger.debug('Firebase already initialized');
    return;
  }

  try {
    logger.info('Initializing Firebase');

    // Initialize Firestore
    const db = getFirestore(app);

    // Enable offline persistence
    try {
      await enableIndexedDbPersistence(db);
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        logger.warn('Multiple tabs open, persistence enabled in first tab only');
      } else if (err.code === 'unimplemented') {
        logger.warn('Browser doesn\'t support persistence');
      }
    }

    // Wait for auth to be ready
    await auth.authStateReady();

    // Initialize admin after auth is ready
    try {
      await authService.createDefaultAdmin();
    } catch (error) {
      logger.warn('Admin initialization skipped:', error);
      // Don't throw here - continue initialization
    }

    initialized = true;
    logger.info('Firebase initialized successfully');
  } catch (error) {
    logger.error('Firebase initialization failed:', error);
    throw error;
  }
};
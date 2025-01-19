import { collection, query, where, QueryConstraint } from 'firebase/firestore';
import { db } from '../core';

const programsCollection = collection(db, 'programs');
const userProgramsCollection = collection(db, 'user_programs');

export const createProgramQueries = {
  all: () => query(programsCollection),
  byId: (programId: string) => 
    query(programsCollection, where('__name__', '==', programId)),
};

export const createUserProgramQueries = {
  byUserId: (userId: string) =>
    query(userProgramsCollection, where('userId', '==', userId)),
  byProgramId: (programId: string) =>
    query(userProgramsCollection, where('programId', '==', programId)),
};
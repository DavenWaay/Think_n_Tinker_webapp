import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  addDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { 
  SubjectDocument, 
  Section, 
  Level,
  AlphabetLevel,
  NumberLevel,
  ColorLevel,
  ShapeLevel,
  SubjectType
} from '../types';

const SUBJECTS_COLLECTION = 'subjects';

// ===================================
// SUBJECT OPERATIONS
// ===================================

export const getSubjects = async () => {
  const subjectsRef = collection(db, SUBJECTS_COLLECTION);
  const snapshot = await getDocs(subjectsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getSubject = async (subjectId: string) => {
  const docRef = doc(db, SUBJECTS_COLLECTION, subjectId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const createSubject = async (subjectId: string, data: SubjectDocument) => {
  const docRef = doc(db, SUBJECTS_COLLECTION, subjectId);
  await setDoc(docRef, {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
};

export const updateSubject = async (subjectId: string, data: Partial<SubjectDocument>) => {
  const docRef = doc(db, SUBJECTS_COLLECTION, subjectId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString()
  });
};

export const deleteSubject = async (subjectId: string) => {
  const docRef = doc(db, SUBJECTS_COLLECTION, subjectId);
  await deleteDoc(docRef);
};

// ===================================
// SECTION OPERATIONS
// ===================================

export const getSections = async (subjectId: SubjectType) => {
  const sectionsRef = collection(db, SUBJECTS_COLLECTION, subjectId, 'sections');
  const snapshot = await getDocs(sectionsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Section));
};

export const getSection = async (subjectId: SubjectType, sectionId: string) => {
  const docRef = doc(db, SUBJECTS_COLLECTION, subjectId, 'sections', sectionId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Section : null;
};

export const createSection = async (subjectId: SubjectType, data: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>) => {
  // Get existing sections to determine next section number
  const sections = await getSections(subjectId);
  const nextSectionNumber = sections.length + 1;
  const sectionId = `section${nextSectionNumber}`;
  
  const docRef = doc(db, SUBJECTS_COLLECTION, subjectId, 'sections', sectionId);
  await setDoc(docRef, {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  return sectionId;
};

export const updateSection = async (subjectId: SubjectType, sectionId: string, data: Partial<Section>) => {
  const docRef = doc(db, SUBJECTS_COLLECTION, subjectId, 'sections', sectionId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString()
  });
};

export const deleteSection = async (subjectId: SubjectType, sectionId: string) => {
  const docRef = doc(db, SUBJECTS_COLLECTION, subjectId, 'sections', sectionId);
  await deleteDoc(docRef);
};

// ===================================
// LEVEL OPERATIONS
// ===================================

export const getLevels = async (subjectId: SubjectType, sectionId: string) => {
  const levelsRef = collection(db, SUBJECTS_COLLECTION, subjectId, 'sections', sectionId, 'levels');
  const q = query(levelsRef, orderBy('levelIndex', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Level));
};

export const getLevel = async (subjectId: SubjectType, sectionId: string, levelId: string) => {
  const docRef = doc(db, SUBJECTS_COLLECTION, subjectId, 'sections', sectionId, 'levels', levelId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Level : null;
};

export const createLevel = async (
  subjectId: SubjectType, 
  sectionId: string, 
  data: Omit<AlphabetLevel | NumberLevel | ColorLevel | ShapeLevel, 'levelIndex' | 'createdAt' | 'updatedAt'>
) => {
  // Get existing levels to determine next level index
  const levels = await getLevels(subjectId, sectionId);
  const nextLevelIndex = levels.length > 0 
    ? Math.max(...levels.map(l => l.levelIndex)) + 1 
    : 1;
  
  const levelsRef = collection(db, SUBJECTS_COLLECTION, subjectId, 'sections', sectionId, 'levels');
  const docRef = await addDoc(levelsRef, {
    ...data,
    levelIndex: nextLevelIndex,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  return docRef.id;
};

export const updateLevel = async (
  subjectId: SubjectType, 
  sectionId: string, 
  levelId: string, 
  data: Partial<Level>
) => {
  const docRef = doc(db, SUBJECTS_COLLECTION, subjectId, 'sections', sectionId, 'levels', levelId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString()
  });
};

export const deleteLevel = async (subjectId: SubjectType, sectionId: string, levelId: string) => {
  const docRef = doc(db, SUBJECTS_COLLECTION, subjectId, 'sections', sectionId, 'levels', levelId);
  await deleteDoc(docRef);
};

// ===================================
// HELPER FUNCTIONS
// ===================================

export const getNextLevelIndex = async (subjectId: SubjectType, sectionId: string): Promise<number> => {
  const levels = await getLevels(subjectId, sectionId);
  return levels.length > 0 ? Math.max(...levels.map(l => l.levelIndex)) + 1 : 1;
};

export const getNextSectionNumber = async (subjectId: SubjectType): Promise<number> => {
  const sections = await getSections(subjectId);
  return sections.length + 1;
};

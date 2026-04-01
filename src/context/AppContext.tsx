import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AppState, User, TyreScan, DrivingLog, Badge } from '../types';
import { BADGES } from '../constants';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

interface AppContextType {
  state: AppState;
  loading: boolean;
  updateUser: (user: Partial<User>) => Promise<void>;
  addTyreScan: (scan: Omit<TyreScan, 'uid'>) => Promise<void>;
  addDrivingLog: (log: Omit<DrivingLog, 'uid'>) => Promise<void>;
  resetData: () => void;
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  earnBadge: (id: string) => void;
  authError: string | null;
}

const initialState: AppState = {
  user: {
    uid: 'guest-user',
    name: 'Eco Driver',
    email: 'guest@ecodrive.ai',
    location: 'San Francisco, CA',
    carModel: 'Tesla Model 3',
    carYear: 2023,
    carPurchaseDate: '2023-01-15',
    mileage: 12500,
    joinDate: new Date().toISOString(),
    fuelType: 'Electric',
    lastTyreChangeYear: 2023,
    role: 'user',
    createdAt: new Date().toISOString(),
  },
  isAuthenticated: true,
  tyreScans: [],
  tyreReplacements: [],
  drivingLogs: [],
  ecoScores: [],
  savings: {
    total: 0,
    monthly: [],
    fromTyres: 0,
    fromDriving: 0,
  },
  co2: {
    total: 0,
    monthly: [],
  },
  badges: BADGES.map(b => ({ ...b, earned: false })),
  settings: {
    notifications: {
      weeklyReports: true,
      tyreAgeWarnings: true,
      maintenanceReminders: true,
    },
    theme: 'light',
    units: 'metric',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Authentication is removed, using guest user by default
    setLoading(false);
  }, []);

  const updateUser = async (userData: Partial<User>) => {
    if (!auth.currentUser) return;
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await setDoc(userDocRef, { ...state.user, ...userData }, { merge: true });
      setState(prev => ({ ...prev, user: { ...prev.user, ...userData } }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  };

  const addTyreScan = async (scan: Omit<TyreScan, 'uid'>) => {
    if (!auth.currentUser) return;
    const scanData = { ...scan, uid: auth.currentUser.uid };
    try {
      await setDoc(doc(db, 'tyreScans', scan.id), scanData);
      if (state.tyreScans.length === 0) earnBadge('first_scan');
      if (!scan.safeToUse) earnBadge('safety_first');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tyreScans');
    }
  };

  const addDrivingLog = async (log: Omit<DrivingLog, 'uid'>) => {
    if (!auth.currentUser) return;
    const logData = { ...log, uid: auth.currentUser.uid };
    try {
      await setDoc(doc(db, 'drivingLogs', log.id), logData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'drivingLogs');
    }
  };

  const earnBadge = (id: string) => {
    setState(prev => ({
      ...prev,
      badges: prev.badges.map(b => 
        b.id === id ? { ...b, earned: true, earnedDate: new Date().toISOString() } : b
      )
    }));
  };

  const resetData = () => {
    setState(initialState);
  };

  const login = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed:", error);
      setAuthError(error.message);
      toast.error(error.message || "Login failed");
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Email login failed:", error);
      setAuthError(error.message);
      toast.error(error.message || "Email login failed");
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setAuthError(null);
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(firebaseUser, { displayName: name });
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userData: User = {
        ...initialState.user,
        uid: firebaseUser.uid,
        name: name,
        email: email,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, userData);
      toast.success("Account created successfully!");
    } catch (error: any) {
      console.error("Email sign up failed:", error);
      setAuthError(error.message);
      toast.error(error.message || "Sign up failed");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AppContext.Provider value={{ 
      state, 
      loading, 
      updateUser, 
      addTyreScan, 
      addDrivingLog, 
      resetData, 
      login, 
      loginWithEmail,
      signUpWithEmail,
      logout, 
      earnBadge,
      authError
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

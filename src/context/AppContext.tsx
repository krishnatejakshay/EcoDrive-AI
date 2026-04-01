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
    uid: '',
    name: '',
    email: '',
    location: '',
    carModel: '',
    carYear: new Date().getFullYear(),
    carPurchaseDate: '',
    mileage: 0,
    joinDate: new Date().toISOString(),
    fuelType: 'Petrol',
    lastTyreChangeYear: new Date().getFullYear(),
    role: 'user',
    createdAt: new Date().toISOString(),
  },
  isAuthenticated: false,
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("onAuthStateChanged triggered:", firebaseUser?.uid || "No user");
      if (firebaseUser) {
        setLoading(true); // Ensure loading is true while fetching doc
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          console.log("Auth state changed: User logged in", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let userData: User;
          if (userDoc.exists()) {
            console.log("User document found");
            userData = userDoc.data() as User;
          } else {
            console.log("User document not found, creating new profile...");
            userData = {
              ...initialState.user,
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              role: 'user',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, userData);
            console.log("User document created successfully");
          }

          setState(prev => ({
            ...prev,
            user: userData,
            isAuthenticated: true,
          }));

          // Listen for tyre scans
          const scansQuery = query(collection(db, 'tyreScans'), where('uid', '==', firebaseUser.uid));
          const unsubscribeScans = onSnapshot(scansQuery, (snapshot) => {
            const scans = snapshot.docs.map(doc => doc.data() as TyreScan);
            setState(prev => ({ ...prev, tyreScans: scans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }));
          }, (error) => {
            console.error("Tyre scans listener error:", error);
            // Don't throw here to avoid breaking the whole app
          });

          // Listen for driving logs
          const logsQuery = query(collection(db, 'drivingLogs'), where('uid', '==', firebaseUser.uid));
          const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
            const logs = snapshot.docs.map(doc => doc.data() as DrivingLog);
            const sortedLogs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            // Calculate basic stats
            const totalSavings = sortedLogs.reduce((acc, log) => acc + (log.distance * 0.5), 0);
            const totalCO2 = sortedLogs.reduce((acc, log) => acc + (log.distance * 0.12), 0);

            setState(prev => ({ 
              ...prev, 
              drivingLogs: sortedLogs,
              savings: {
                ...prev.savings,
                total: totalSavings,
                monthly: [totalSavings / 12, totalSavings / 24],
              },
              co2: {
                ...prev.co2,
                total: totalCO2,
                monthly: [totalCO2 / 12, totalCO2 / 24],
              }
            }));
          }, (error) => {
            console.error("Driving logs listener error:", error);
          });

          setLoading(false);
          toast.success("Welcome back!");
          return () => {
            unsubscribeScans();
            unsubscribeLogs();
          };
        } catch (error) {
          console.error("Error fetching user data:", error);
          const msg = error instanceof Error ? error.message : "Failed to fetch user profile";
          setAuthError(msg);
          toast.error(msg);
          // If we can't fetch the doc, we should still probably set isAuthenticated to true
          // if the user is authenticated in Firebase Auth, but maybe with partial data
          setState(prev => ({ ...prev, isAuthenticated: true }));
          setLoading(false);
        }
      } else {
        console.log("No user authenticated");
        setState(initialState);
        setLoading(false);
      }
    });

    return () => unsubscribe();
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

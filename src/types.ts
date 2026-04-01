export interface User {
  uid: string;
  name: string;
  email: string;
  location: string;
  carModel: string;
  carYear: number;
  carPurchaseDate: string;
  mileage: number;
  joinDate: string;
  fuelType: 'Petrol' | 'Diesel' | 'CNG' | 'Electric';
  lastTyreChangeYear?: number;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface TyreScan {
  id: string;
  uid: string;
  date: string;
  visualCondition: number;
  issues: string[];
  detectedProblems: DetectedProblem[];
  safetyScore: number;
  safeToUse: boolean;
  verdict: string;
  photoUrl: string;
  recommendations: Recommendation[];
  fuelImpactPercentage: number;
  monthlyFuelWaste: number;
  urgency: string;
}

export interface DetectedProblem {
  type: 'tread_depth' | 'cracks' | 'wear_pattern' | 'damage';
  severity: 'critical' | 'warning' | 'caution' | 'normal';
  description: string;
  location?: string;
  risk?: string;
  action?: string;
  image?: string;
}

export interface Recommendation {
  priority: 'critical' | 'warning' | 'maintenance' | 'caution';
  action: string;
  timeline: string;
  safety?: string;
  benefit?: string;
}

export interface DrivingLog {
  id: string;
  uid: string;
  date: string;
  distance: number;
  speed: number;
  braking: 'rare' | 'normal' | 'frequent';
  acceleration: 'smooth' | 'normal' | 'aggressive';
  idleTime: number;
}

export interface EcoScoreEntry {
  week: string;
  score: number;
  tyreCondition: number;
}

export interface AppState {
  user: User;
  isAuthenticated: boolean;
  tyreScans: TyreScan[];
  tyreReplacements: any[];
  drivingLogs: DrivingLog[];
  ecoScores: EcoScoreEntry[];
  savings: {
    total: number;
    monthly: number[];
    fromTyres: number;
    fromDriving: number;
  };
  co2: {
    total: number;
    monthly: number[];
  };
  badges: Badge[];
  settings: {
    notifications: {
      weeklyReports: boolean;
      tyreAgeWarnings: boolean;
      maintenanceReminders: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    units: 'metric' | 'imperial';
  };
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  description: string;
}

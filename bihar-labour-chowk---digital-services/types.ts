
export enum WorkerCategory {
  PLUMBER = 'Plumber (नलसाज)',
  ELECTRICIAN = 'Electrician (मिस्त्री)',
  LABOUR = 'Labour (मजदूर)',
  PAINTER = 'Painter (पेंटर)',
  CARPENTER = 'Carpenter (बढ़ई)',
  MASON = 'Mason (राजमिस्त्री)',
  DRIVER = 'Driver (ड्राइवर)',
  CLEANER = 'Cleaner (सफाईकर्मी)'
}

export interface Worker {
  id: string;
  name: string;
  skill: WorkerCategory;
  experience: number; // in years
  location: string; // District
  village?: string; // Village/Gaw
  photoUrl: string;
  contactNumber: string; // Hidden from users
  isVerified: boolean;
  description: string;
  createdAt: number;
}

export interface CallRequest {
  id: string;
  userName: string;
  userPhone: string;
  workerId: string;
  workerName: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'cancelled';
  adminNote?: string;
}

export interface UserProfile {
  phone: string;
  name: string;
  createdAt: number;
}

export type UserRole = 'USER' | 'ADMIN';

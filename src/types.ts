export interface UserProfile {
  id: string; // Document ID
  email: string;
  name: string;
  bio?: string;
  studentId?: string;
  contactNumber?: string;
  avatarUrl?: string;
  skills?: string[];
  languages?: string[];
  privacyPreferences?: {
    showEmail?: boolean;
    showLocation?: boolean;
  };
  redeemedCoupons?: string[];
  claimedAchievements?: string[];
  completedTaskCount?: number;
  credits: number;
  trustScore: number;
  role: 'student' | 'admin';
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface UserCoupon {
  id: string;
  userId: string;
  couponId: string;
  name: string;
  vendor: string;
  description: string;
  code: string;
  expiresAt: any;
  status: 'active' | 'used' | 'expired';
  createdAt: any;
  updatedAt: any;
}

export interface AppMessage {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'reward' | 'admin' | 'reminder';
  createdAt: any;
  updatedAt: any;
  read: boolean;
  rewardAmount?: number;
}

export interface Task {
  id: string;
  type: 'request' | 'offer';
  title: string;
  description: string;
  category: string;
  expectedDuration: number;
  location: string;
  urgency?: 'low' | 'medium' | 'high';
  status: 'open' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  creatorId: string;
  acceptedById?: string;
  acceptedAt?: any;
  createdAt: any;
  updatedAt: any;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export interface Transaction {
  id: string;
  taskId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  reason: string;
  createdAt: any;
}

export interface Feedback {
  id: string;
  taskId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  createdAt: any;
}

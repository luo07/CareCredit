import { create } from 'zustand';
import { User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInIdp: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  signInIdp: async () => {
    set({ loading: true, error: null });
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ 
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      
      const email = result.user.email;
      if (!email || !email.endsWith('.edu.my')) {
        await auth.signOut();
        set({ error: "Only .edu.my student emails are allowed.", loading: false });
        return;
      }
      
      const studentId = email.split('@')[0];
      
      // Check if profile exists
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const newProfile: Omit<UserProfile, 'id'> = {
          email,
          name: result.user.displayName || 'Student',
          studentId: studentId,
          credits: 2.0,
          trustScore: 100,
          role: 'student',
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, newProfile);
        set({ profile: { ...newProfile, id: result.user.uid } as UserProfile });
      } else {
        const data = userSnap.data();
        const profileToSet = { id: userSnap.id, ...data } as UserProfile;
        
        if (!data.studentId && studentId) {
          await updateDoc(userRef, { 
            studentId: studentId,
            updatedAt: serverTimestamp()
          });
          profileToSet.studentId = studentId;
        }
        
        set({ profile: profileToSet });
      }
      set({ user: result.user, loading: false });
    } catch (err: any) {
      console.error(err);
      set({ error: err.message || 'Failed to sign in', loading: false });
    }
  },
  logout: async () => {
    await signOut(auth);
    set({ user: null, profile: null });
  }
}));

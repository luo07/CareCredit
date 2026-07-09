import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useAuthStore } from './store/useAuthStore';
import { UserProfile } from './types';
import Layout from './components/Layout';
import Landing from './routes/Landing';
import Feed from './routes/Feed';
// import TaskDetail from './routes/TaskDetail';
import Profile from './routes/Profile';
import CreateTask from './routes/CreateTask';
import Settings from './routes/Settings';
import Store from './routes/Store';
import Achievements from './routes/Achievements';
import Recommendations from './routes/Recommendations';
import Inbox from './routes/Inbox';
import MyCoupons from './routes/MyCoupons';
import Rules from './routes/Rules';
import CampusMap from './routes/CampusMap';
import { useCouponReminders } from './hooks/useCouponReminders';

export default function App() {
  const { setUser, setProfile, user, loading } = useAuthStore();
  
  // Initialize simulated cron jobs for prototype
  useCouponReminders();

  useEffect(() => {
    // Apply theme globally
    const theme = localStorage.getItem('app-theme') || 'default';
    document.documentElement.className = theme === 'default' ? '' : `theme-${theme}`;
  }, []);

  useEffect(() => {
    useAuthStore.setState({ loading: true });
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setProfile({ id: userSnap.id, ...data } as UserProfile);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setProfile(null);
      }
      useAuthStore.setState({ loading: false });
    });

    return () => unsubscribe();
  }, [setUser, setProfile]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading CareCredit...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!user ? <Landing /> : <Navigate to="/profile" />} />
        
        {/* Protected Routes */}
        {user && (
          <Route element={<Layout />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/create" element={<CreateTask />} />
            {/* <Route path="/task/:id" element={<TaskDetail />} /> */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/store" element={<Store />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/coupons" element={<MyCoupons />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/map" element={<CampusMap />} />
            <Route path="*" element={<Navigate to="/profile" replace />} />
          </Route>
        )}
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

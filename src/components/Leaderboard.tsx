import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';
import { Trophy, Medal } from 'lucide-react';

export default function Leaderboard() {
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const qUsers = query(
          collection(db, 'users'),
          orderBy('trustScore', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(qUsers);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as UserProfile);
        setTopUsers(fetched);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'users');
      } finally {
        setLoading(false);
      }
    };
    fetchTopUsers();
  }, []);

  if (loading) {
     return (
       <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-pulse h-64"></div>
     );
  }

  if (topUsers.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
          <Trophy className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Monthly Leaderboard</h2>
          <p className="text-sm text-slate-500">Top 10 helpers this month earn bonus rewards!</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {topUsers.map((user, index) => (
          <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-400 text-yellow-900 shadow-md' : index === 1 ? 'bg-slate-300 text-slate-700 shadow-sm' : index === 2 ? 'bg-amber-700 text-amber-50 shadow-sm' : 'bg-white text-slate-500 border border-slate-200'}`}>
                 {index + 1}
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                   {user.avatarUrl ? (
                     <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-indigo-600 font-bold uppercase">{user.name.charAt(0)}</span>
                   )}
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900">{user.name}</h3>
                   <p className="text-xs text-slate-500 font-medium">Trust Score: {user.trustScore}</p>
                 </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm self-start sm:self-auto ml-12 sm:ml-0">
               <Medal className="w-4 h-4 text-indigo-500" />
               <span className="text-sm font-bold text-slate-700">{user.completedTaskCount || 0} Tasks Completed</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

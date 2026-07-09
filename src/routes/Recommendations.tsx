import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Task } from '../types';
import TaskCard from '../components/TaskCard';
import { Sparkles, FileText, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Recommendations() {
  const { profile } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.skills || profile.skills.length === 0) {
      setLoading(false);
      return;
    }
    
    let unsubscribe: () => void;

    try {
      const qTasks = query(
        collection(db, 'tasks'),
        where('status', '==', 'open')
      );
      
      unsubscribe = onSnapshot(qTasks, (snapshot) => {
        const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Task);
        
        const recommended = fetchedTasks.filter(
          t => t.type === 'request' && t.creatorId !== profile.id && profile.skills!.includes(t.category)
        );
        
        recommended.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setTasks(recommended);
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tasks');
        setLoading(false);
      });

    } catch (error) {
       handleFirestoreError(error, OperationType.LIST, 'tasks');
       setLoading(false);
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-6 mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-amber-500" />
          Recommended Tasks
        </h1>
        <p className="text-slate-500 mt-2">Requests that match your specified skills.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
             <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (!profile.skills || profile.skills.length === 0) ? (
        <div className="bg-white border rounded-3xl p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Skills Added</h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Add skills to your profile to receive personalized task recommendations from the community!
          </p>
          <Link to="/settings" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5" /> Go to Settings
          </Link>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white border rounded-3xl p-10 text-center flex flex-col items-center">
           <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
             <FileText className="w-8 h-8" />
           </div>
           <h2 className="text-xl font-bold text-slate-800 mb-2">No Matches Found</h2>
           <p className="text-slate-500">
             There are currently no open requests matching your skills. Check back soon!
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {tasks.map(task => (
             <TaskCard key={task.id} task={task} />
           ))}
        </div>
      )}
    </div>
  );
}

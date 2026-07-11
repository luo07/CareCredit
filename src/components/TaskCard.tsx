import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Tag } from 'lucide-react';
import { Task } from '../types';
import { cn } from '../lib/utils';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';

import { useActiveTask } from '../hooks/useActiveTask';

interface TaskCardProps {
  task: Task;
  key?: React.Key | string | number;
}

export default function TaskCard({ task }: TaskCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeTask } = useActiveTask();
  const [accepting, setAccepting] = useState(false);

  const isOwner = user?.uid === task.creatorId;
  const isRequest = task.type === 'request';
  
  // 1 hr = 1 Credit, so duration / 60
  const creditValue = (task.expectedDuration / 60).toFixed(1);

  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || isOwner || accepting || activeTask) return;
    
    setAccepting(true);
    try {
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        status: 'in_progress',
        acceptedById: user.uid,
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      // the global layout banner takes over from here
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${task.id}`);
      setAccepting(false);
    }
  };

  return (
    <div 
      // onClick={() => navigate(`/task/${task.id}`)}
      className="bg-white vibrant-card border border-slate-100 p-6 flex flex-col h-full group hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
          isRequest ? "accent-coral/10 text-coral-600" : "accent-teal/10 text-teal-600"
        )}>
           <Tag className="w-6 h-6" />
        </div>
        <div className="flex gap-2">
          <span className="text-[10px] font-bold uppercase px-2 py-1 bg-indigo-soft text-indigo-600 rounded-md underline">
            {creditValue} UU
          </span>
        </div>
      </div>

      <div className="flex items-start justify-between mb-2 gap-2 flex-wrap">
        <div className={cn(
          "px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase inline-block",
          isRequest ? "bg-red-50 text-red-700" : "bg-teal-50 text-teal-700"
        )}>
          {isRequest ? 'Needs Help' : 'Offering Help'}
        </div>
        <div className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase inline-block bg-slate-100 text-slate-600">
          {task.category}
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
        {task.title}
      </h3>
      
      <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow">
        {task.description}
      </p>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{task.expectedDuration} mins</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="truncate">{task.location}</span>
        </div>
      </div>

      <div className="mt-auto">
        {isOwner ? (
          <button 
            disabled
            className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm cursor-not-allowed"
          >
            Your Post
          </button>
        ) : (
          <button
            onClick={handleAccept}
            disabled={accepting || activeTask !== null}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {accepting ? 'Accepting...' : activeTask !== null ? 'Finish active task first' : isRequest ? 'Accept Request' : 'Accept Offer'}
          </button>
        )}
      </div>
    </div>
  );
}

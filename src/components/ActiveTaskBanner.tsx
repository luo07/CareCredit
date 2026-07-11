import React, { useState, useEffect } from 'react';
import { useActiveTask } from '../hooks/useActiveTask';
import { Clock, CheckCircle2, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { doc, updateDoc, serverTimestamp, increment, runTransaction } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../lib/utils';

export default function ActiveTaskBanner() {
  const { activeTask, loading } = useActiveTask();
  const { user } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [expanded, setExpanded] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!activeTask || !activeTask.acceptedAt) return;

    // Use task's actual expected duration (converted to ms)
    // Scale duration to seconds for testing purposes if desired, but here we use minutes
    const durationMs = activeTask.expectedDuration * 60 * 1000;
    
    // acceptedAt could be a Firestore Timestamp or a number (Date.now())
    const acceptedTime = activeTask.acceptedAt?.toMillis ? activeTask.acceptedAt.toMillis() : (activeTask.acceptedAt || Date.now());
    
    const calculateTimeLeft = () => {
      const now = Date.now();
      const end = acceptedTime + durationMs;
      return Math.max(0, end - now);
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTask]);

  if (loading || !activeTask || !user) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const isFinished = timeLeft === 0;

  const handleComplete = async () => {
    if (completing) return;
    setCompleting(true);
    try {
      const taskRef = doc(db, 'tasks', activeTask.id);
      const userRef = doc(db, 'users', user.uid);
      const creditsEarned = (activeTask.expectedDuration / 60);

      await runTransaction(db, async (transaction) => {
        const taskDoc = await transaction.get(taskRef);
        if (!taskDoc.exists()) throw new Error("Task does not exist!");
        if (taskDoc.data().status !== "in_progress") {
          throw new Error("Task is not in progress. Perhaps already completed?");
        }

        transaction.update(taskRef, {
          status: 'completed',
          updatedAt: serverTimestamp()
        });

        transaction.update(userRef, {
          credits: increment(creditsEarned),
          completedTaskCount: increment(1),
          updatedAt: serverTimestamp()
        });
      });

    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-auto md:right-6 md:w-96 z-50">
      <div className="bg-indigo-600 text-white rounded-t-2xl md:rounded-2xl shadow-2xl border border-indigo-500 overflow-hidden transition-all duration-300">
        
        {/* Header - Always visible */}
        <div 
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-indigo-700 transition"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-indigo-100 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Active Task</p>
              <h4 className="font-bold text-sm line-clamp-1">{activeTask.title}</h4>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-mono font-bold font-numeric",
              isFinished ? "bg-emerald-500 text-white animate-bounce" : "bg-indigo-800 text-indigo-100"
            )}>
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
            {expanded ? <ChevronDown className="w-5 h-5 text-indigo-300" /> : <ChevronUp className="w-5 h-5 text-indigo-300" />}
          </div>
        </div>

        {/* Expanded Body */}
        {expanded && (
          <div className="p-4 bg-indigo-50 text-slate-800 border-t border-indigo-100">
            <p className="text-sm text-slate-600 mb-4">{activeTask.description}</p>
            
            <div className="flex items-center justify-between text-sm mb-4">
              <span className="font-semibold text-slate-700">Expected Time:</span>
              <span>{activeTask.expectedDuration} mins</span>
            </div>

            <div className="flex items-center justify-between text-sm mb-6">
              <span className="font-semibold text-slate-700">Reward:</span>
              <span className="text-indigo-600 font-bold">{(activeTask.expectedDuration / 60).toFixed(1)} UU</span>
            </div>

            <button
              onClick={handleComplete}
              disabled={!isFinished || completing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <CheckCircle2 className="w-5 h-5" />
              {completing ? 'Completing...' : isFinished ? 'Submit Task & Claim UU' : 'Wait for time to finish...'}
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">
              {isFinished ? 'Task duration has ended. You can now claim your reward.' : 'You must wait until the expected duration passes.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

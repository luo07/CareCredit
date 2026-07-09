import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { Task } from '../types';

export function useActiveTask() {
  const { user } = useAuthStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setActiveTask(null);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'tasks'),
      where('acceptedById', '==', user.uid),
      where('status', '==', 'in_progress')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        // Take the first active task
        setActiveTask({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Task);
      } else {
        setActiveTask(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { activeTask, loading };
}

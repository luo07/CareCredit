import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { Trophy, CheckCircle2, Star, Target } from 'lucide-react';

const ACHIEVEMENT_CHAINS = [
  [
    { id: 'profile_complete', title: 'Start Your Journey', requirement: 'Complete all fields in your Profile Settings', reward: 0.5, type: 'milestone', target: 1 },
  ],
  [
    { id: 'weekly_1', title: 'Weekly Starter', requirement: 'Help 1 time this week', reward: 0.5, type: 'weekly', target: 1 },
    { id: 'weekly_2', title: 'Weekly Warrior', requirement: 'Help 3 times this week', reward: 1.5, type: 'weekly', target: 3 },
    { id: 'weekly_3', title: 'Weekly Hero', requirement: 'Help 5 times this week', reward: 2.0, type: 'weekly', target: 5 },
  ],
  [
    { id: 'milestone_1', title: 'First Helper', requirement: 'Complete 1 task', reward: 0.5, type: 'milestone', target: 1 },
    { id: 'milestone_2', title: 'Super Sharer', requirement: 'Complete 5 tasks total', reward: 2.0, type: 'milestone', target: 5 },
    { id: 'milestone_3', title: 'Community Pillar', requirement: 'Complete 15 tasks total', reward: 5.0, type: 'milestone', target: 15 },
  ],
  [
    { id: 'academic_1', title: 'Peer Tutor', requirement: 'Complete 1 Academic Support task', reward: 0.5, type: 'milestone', target: 1 },
    { id: 'academic_2', title: 'Expert Tutor', requirement: 'Complete 3 Academic Support tasks', reward: 1.5, type: 'milestone', target: 3 },
    { id: 'academic_3', title: 'Master Tutor', requirement: 'Complete 10 Academic Support tasks', reward: 5.0, type: 'milestone', target: 10 },
  ]
];

export default function Achievements() {
  const { profile, setProfile } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);

  if (!profile) return null;

  // Active achievements to display
  const activeAchievements = ACHIEVEMENT_CHAINS.map(chain => {
    // Find the first achievement in the chain that is not claimed
    return chain.find(ach => !profile.claimedAchievements?.includes(ach.id));
  }).filter((ach): ach is NonNullable<typeof ach> => Boolean(ach));

  const [completedTasksCount, setCompletedTasksCount] = useState<number>(0);

  useEffect(() => {
    const fetchCompletedCount = async () => {
      if (!profile) return;
      try {
        const q = query(
          collection(db, 'tasks'),
          where('acceptedById', '==', profile.id),
          where('status', '==', 'completed')
        );
        const snapshot = await getDocs(q);
        setCompletedTasksCount(snapshot.docs.length);
      } catch (err) {
        console.error("Error fetching completed tasks:", err);
      }
    };
    fetchCompletedCount();
  }, [profile]);

  // Mock progress for prototype - in a real app, this would be calculated from actual task history
  const getProgress = (id: string, target: number) => {
    if (id === 'profile_complete') {
      const isComplete = profile?.name && profile?.bio && profile?.studentId && profile?.contactNumber && profile?.skills?.length > 0 && profile?.languages?.length > 0;
      return isComplete ? 1 : 0;
    }
    const count = Math.max(profile?.completedTaskCount || 0, completedTasksCount);
    if (id.startsWith('weekly_') || id.startsWith('milestone_') || id.startsWith('academic_')) {
      return count;
    }
    return 0;
  }

  const handleClaim = async (achievement: typeof ACHIEVEMENT_CHAINS[0][0]) => {
    setLoading(achievement.id);
    try {
      const userRef = doc(db, 'users', profile.id);
      const newCredits = profile.credits + achievement.reward;
      const newClaimed = [...(profile.claimedAchievements || []), achievement.id];
      
      await updateDoc(userRef, {
        credits: newCredits,
        claimedAchievements: newClaimed,
        updatedAt: serverTimestamp()
      });

      setProfile({
        ...profile,
        credits: newCredits,
        claimedAchievements: newClaimed,
        updatedAt: new Date()
      });

    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-500" />
          Achievements
        </h1>
        <p className="text-slate-500 mt-2">Complete tasks to unlock achievements and earn bonus Time Credits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeAchievements.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">You're a Legend!</h3>
            <p className="text-slate-500">You've claimed all available achievements right now. Check back later for more.</p>
          </div>
        )}
        {activeAchievements.map(achievement => {
          const isClaimed = profile.claimedAchievements?.includes(achievement.id);
          const target = achievement.target;
          const currentProgress = getProgress(achievement.id, target);
          const isCompleted = currentProgress >= target;

          return (
             <div key={achievement.id} className="bg-white vibrant-card border border-slate-100 p-6 flex flex-col h-full hover:-translate-y-1 transition-all">
               <div className="flex justify-between items-start mb-4">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isClaimed ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                   {achievement.type === 'weekly' ? <Target className="w-6 h-6" /> : <Star className="w-6 h-6" />}
                 </div>
                 <div className="flex items-center gap-1 font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                   +{achievement.reward} UU
                 </div>
               </div>
               
               <h3 className="text-xl font-bold text-slate-900 mb-2">{achievement.title}</h3>
               <p className="text-slate-500 text-sm mb-6">{achievement.requirement}</p>
               
               <div className="mt-auto space-y-4">
                 <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold text-slate-500">
                     <span>Progress</span>
                     <span>{currentProgress} / {target}</span>
                   </div>
                   <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                     <div 
                      className={`h-full rounded-full transition-all duration-500 ${isClaimed || isCompleted ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                      style={{ width: Math.min((currentProgress / target) * 100, 100) + '%' }}
                     />
                   </div>
                 </div>

                 {isClaimed ? (
                   <button disabled className="w-full py-3 bg-slate-50 text-slate-400 rounded-xl font-bold text-sm flex justify-center items-center gap-2">
                     <CheckCircle2 className="w-5 h-5" /> Claimed
                   </button>
                 ) : isCompleted ? (
                   <button 
                    onClick={() => handleClaim(achievement)}
                    disabled={loading === achievement.id}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/30 transition-all flex justify-center items-center gap-2"
                   >
                     {loading === achievement.id ? 'Claiming...' : 'Claim Reward'}
                   </button>
                 ) : (
                   <button disabled className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold text-sm cursor-not-allowed">
                     In Progress
                   </button>
                 )}
               </div>
             </div>
          )
        })}
      </div>
    </div>
  );
}

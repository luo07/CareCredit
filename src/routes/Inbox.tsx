import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { AppMessage } from '../types';
import { Mail, Gift, AlertTriangle, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Inbox() {
  const { profile, setProfile } = useAuthStore();
  const [messages, setMessages] = useState<AppMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!profile) return;
      try {
        const qMessages = query(
          collection(db, 'messages'),
          where('userId', '==', profile.id),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(qMessages);
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AppMessage));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [profile]);

  const markAsRead = async (message: AppMessage) => {
    if (message.read) return;
    try {
      await updateDoc(doc(db, 'messages', message.id), {
        read: true,
        updatedAt: serverTimestamp()
      });
      setMessages(messages.map(m => m.id === message.id ? { ...m, read: true } : m));
    } catch (error) {
      console.error(error);
    }
  };

  const handleClaimReward = async (message: AppMessage) => {
    if (!profile || message.type !== 'reward' || !message.rewardAmount || message.read) return;
    
    try {
      // Claim reward and mark as read
      await updateDoc(doc(db, 'users', profile.id), {
        credits: profile.credits + message.rewardAmount,
        updatedAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'messages', message.id), {
        read: true,
        updatedAt: serverTimestamp()
      });
      
      setProfile({
        ...profile,
        credits: profile.credits + message.rewardAmount,
        updatedAt: new Date()
      });
      
      setMessages(messages.map(m => m.id === message.id ? { ...m, read: true } : m));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <Mail className="w-8 h-8 text-indigo-500" />
              Inbox
            </h1>
            <p className="text-slate-500 mt-2">Check your notifications, rewards, and admin messages.</p>
          </div>
          <Link to="/profile" className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors shrink-0 self-start md:self-auto">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white border rounded-3xl p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No messages yet</h2>
          <p className="text-slate-500">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`p-5 rounded-2xl border transition-all ${message.read ? 'bg-slate-50 border-slate-100' : 'bg-white border-indigo-100 shadow-sm relative overflow-hidden'}`}
              onClick={() => message.type !== 'reward' ? markAsRead(message) : undefined}
            >
              {!message.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}
              
              <div className="flex gap-4 items-start">
                <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center ${
                  message.type === 'reward' ? 'bg-amber-100 text-amber-600' :
                  message.type === 'admin' ? 'bg-blue-100 text-blue-600' :
                  'bg-coral-100 text-coral-600' // Reminder
                }`}>
                  {message.type === 'reward' && <Gift className="w-6 h-6" />}
                  {message.type === 'admin' && <ShieldCheck className="w-6 h-6" />}
                  {message.type === 'reminder' && <AlertTriangle className="w-6 h-6" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold ${message.read ? 'text-slate-700' : 'text-slate-900'}`}>{message.title}</h3>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                      {message.createdAt?.toDate ? new Date(message.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">{message.content}</p>
                  
                  {message.type === 'reward' && message.rewardAmount && !message.read && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleClaimReward(message); }}
                      className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-md transition-colors"
                    >
                      Claim {message.rewardAmount} UU
                    </button>
                  )}
                  {message.type === 'reward' && message.read && (
                    <div className="inline-flex items-center gap-1.5 text-slate-400 text-sm font-bold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      <CheckCircle2 className="w-4 h-4" /> Claimed
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

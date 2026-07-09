import React, { useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { HeartHandshake, CheckCircle2, Mail, Ticket, Store, Upload, BookOpen } from 'lucide-react';
import Leaderboard from '../components/Leaderboard';
import { Link } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export default function Profile() {
  const { profile, setProfile } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!profile) return null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please select an image smaller than 2MB");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const base64String = canvas.toDataURL('image/jpeg', 0.8);
          
          try {
            await updateDoc(doc(db, 'users', profile.id), {
              avatarUrl: base64String,
              updatedAt: serverTimestamp()
            });
            setProfile({ ...profile, avatarUrl: base64String });
          } catch(err) {
            console.error(err);
          } finally {
            setUploading(false);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Profile Header & Wallet */}
      <div className="bg-white vibrant-card border border-slate-100 p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-24 h-24 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-3xl font-extrabold uppercase flex-shrink-0 overflow-hidden border-4 border-white shadow-md">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile.name?.charAt(0) || 'U'
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Upload className="w-6 h-6 text-white" />
          </div>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleAvatarUpload} 
            disabled={uploading}
          />
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900">{profile.name}</h1>
          <p className="text-slate-500 font-medium">{profile.email}</p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" /> Trust Score: {profile.trustScore}
            </div>
          </div>
          <div className="pt-4 grid grid-cols-2 gap-3 w-full md:w-auto md:flex md:flex-row">
             <Link to="/inbox" className="inline-flex justify-center items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors">
               <Mail className="w-3.5 h-3.5 text-indigo-500" />
               Inbox
             </Link>
             <Link to="/rules" className="inline-flex justify-center items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors">
               <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
               Rules
             </Link>
          </div>
        </div>

        <div className="bg-indigo-600 border border-indigo-500 rounded-2xl p-4 md:min-w-[200px] text-center text-white shadow-lg overflow-hidden relative flex flex-col justify-between">
          <div className="relative z-10">
            <div className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5" /> Your Wallet
            </div>
            <div className="text-3xl font-black mb-4">
              {profile.credits.toFixed(1)} <span className="text-sm font-normal opacity-80">UC</span>
            </div>
            <div className="flex flex-col gap-1.5">
               <Link to="/store" className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                  <Store className="w-3.5 h-3.5 text-emerald-300" /> Rewards Store
               </Link>
               <Link to="/coupons" className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                  <Ticket className="w-3.5 h-3.5 text-amber-300" /> My Coupons
               </Link>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        </div>
      </div>

      <Leaderboard />
    </div>
  );
}

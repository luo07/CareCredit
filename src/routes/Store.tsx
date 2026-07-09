import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection, Timestamp } from 'firebase/firestore';
import { Store as StoreIcon, ExternalLink, HeartHandshake, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const COUPONS = [
  { id: 'c1_1', name: 'Coffee Free Size Upgrade', cost: 1, vendor: 'Campus Cafe', description: 'Get a free size upgrade on any coffee drink.' },
  { id: 'c1_2', name: 'RM5 Off Any Drink', cost: 2, vendor: 'Campus Cafe', description: 'RM5 discount on any drink. Minimum spend RM10.' },
  { id: 'c1_3', name: 'Free Drink', cost: 4, vendor: 'Campus Cafe', description: 'Redeem one free drink of your choice (up to RM15).' },

  { id: 'c2_1', name: 'RM5 Off Stationery', cost: 2, vendor: "Taylor's Bookshop", description: 'RM5 discount on stationery.' },
  { id: 'c2_2', name: 'RM15 Off Merchandise', cost: 5, vendor: "Taylor's Bookshop", description: 'RM15 discount on university merchandise.' },

  { id: 'c3_1', name: 'Free Printing (10 pages)', cost: 1, vendor: 'Library', description: 'Print up to 10 pages for free.' },
  { id: 'c3_2', name: 'Free Printing (50 pages)', cost: 3, vendor: 'Library', description: 'Print up to 50 pages for free.' },

  { id: 'c4_1', name: 'RM3 Off Lunch', cost: 2, vendor: 'Food Court', description: 'RM3 discount on any lunch combo meal.' },
  { id: 'c4_2', name: 'RM10 Off Feast', cost: 5, vendor: 'Food Court', description: 'RM10 discount when you spend over RM25.' },
];

export default function Store() {
  const { profile, setProfile } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);

  if (!profile) return null;

  const handleRedeem = async (coupon: typeof COUPONS[0]) => {
    if (profile.credits < coupon.cost) return;

    setLoading(coupon.id);
    try {
      // 1. Add new coupon document
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1); // Valid for 1 month
      
      const newCouponRef = collection(db, 'userCoupons');
      const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
      const code = `UC-${randomPart}`;
      
      await addDoc(newCouponRef, {
        userId: profile.id,
        couponId: coupon.id,
        name: coupon.name,
        vendor: coupon.vendor,
        description: coupon.description,
        code: code,
        status: 'active',
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Update user profile
      const userRef = doc(db, 'users', profile.id);
      const newCredits = profile.credits - coupon.cost;
      const newCoupons = [...(profile.redeemedCoupons || []), coupon.id];
      
      await updateDoc(userRef, {
        credits: newCredits,
        redeemedCoupons: newCoupons,
        updatedAt: serverTimestamp()
      });

      setProfile({
        ...profile,
        credits: newCredits,
        redeemedCoupons: newCoupons,
        updatedAt: new Date()
      });

    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unknown error");
      // handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <StoreIcon className="w-8 h-8 text-indigo-600" />
            Rewards Store
          </h1>
          <p className="text-slate-500 mt-2">Redeem your Time Credits for real-world rewards.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/profile" className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Link>
          <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/30">
            <HeartHandshake className="w-5 h-5" />
            <span className="font-bold">{profile.credits.toFixed(1)} UC Available</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {COUPONS.map(coupon => {
          const isRedeemed = profile.redeemedCoupons?.includes(coupon.id);
          const canAfford = profile.credits >= coupon.cost;

          return (
             <div key={coupon.id} className="bg-white vibrant-card border border-slate-100 p-6 flex flex-col h-full group hover:-translate-y-1">
               <div className="flex justify-between items-start mb-4">
                 <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                   {coupon.vendor}
                 </div>
                 <div className="flex items-center gap-1 font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                   {coupon.cost} UC
                 </div>
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">{coupon.name}</h3>
               <p className="text-slate-500 text-sm mb-6 flex-grow">{coupon.description}</p>
               
               {/* {isRedeemed && (
                 <div className="absolute top-4 right-4 bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded">
                   Redeemed Before
                 </div>
               )} */}

               <button 
                onClick={() => handleRedeem(coupon)}
                disabled={!canAfford || loading === coupon.id}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${canAfford ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
               >
                 {loading === coupon.id ? 'Redeeming...' : 'Redeem Reward'}
               </button>
             </div>
          )
        })}
      </div>
    </div>
  );
}

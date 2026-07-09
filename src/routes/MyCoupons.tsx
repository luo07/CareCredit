import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { UserCoupon } from '../types';
import { Ticket, Clock, CheckCircle2, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Link } from 'react-router-dom';

export default function MyCoupons() {
  const { profile } = useAuthStore();
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!profile) return;
      try {
        const qCoupons = query(
          collection(db, 'userCoupons'),
          where('userId', '==', profile.id)
        );
        const snapshot = await getDocs(qCoupons);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as UserCoupon);
        
        const nowMs = Date.now();
        const activeOrUsed = fetched.filter(c => {
          if (c.status === 'used') return true;
          const exp = c.expiresAt?.toMillis ? c.expiresAt.toMillis() : 0;
          return exp > nowMs; // Expired coupons disappear
        });
        
        activeOrUsed.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
        setCoupons(activeOrUsed);
        
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'userCoupons');
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <Ticket className="w-8 h-8 text-indigo-500" />
              My Coupons
            </h1>
            <p className="text-slate-500 mt-2">View and manage your redeemed rewards.</p>
          </div>
          <Link to="/profile" className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors shrink-0 self-start md:self-auto">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-3xl animate-pulse"></div>)}
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white border rounded-3xl p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <Ticket className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No active coupons</h2>
          <p className="text-slate-500">Go to the Rewards Store to redeem your Time Credits!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {coupons.map(coupon => {
            const expDate = coupon.expiresAt?.toDate ? new Date(coupon.expiresAt.toDate()) : new Date();
            const isExpanded = expandedIds.has(coupon.id);
            
            return (
              <div key={coupon.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all">
                {/* Horizontal Strip Summary */}
                <div className="flex items-stretch relative">
                  <div className="w-4 bg-indigo-600 flex-shrink-0"></div>
                  
                  <div className="flex-1 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-1">{coupon.vendor}</div>
                      <h3 className="text-xl font-black text-slate-900">{coupon.name}</h3>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      {coupon.status === 'used' ? (
                        <div className="bg-slate-100 px-3 py-1 rounded-full text-slate-500 text-xs font-bold flex items-center gap-1 border border-slate-200">
                          <CheckCircle2 className="w-4 h-4" /> Used
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <div className="bg-amber-50 px-3 py-1 rounded-full text-amber-600 text-xs font-bold flex items-center gap-1 border border-amber-200">
                             <Clock className="w-3 h-3" /> Valid
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                            Until {expDate.toLocaleDateString()} {expDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          const newSet = new Set(expandedIds);
                          if (isExpanded) {
                            newSet.delete(coupon.id);
                          } else {
                            newSet.add(coupon.id);
                          }
                          setExpandedIds(newSet);
                        }}
                        className="flex items-center gap-1 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold transition-colors"
                      >
                        {isExpanded ? 'Hide' : 'View'}
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-dashed border-slate-200 p-6 bg-slate-50 flex flex-col md:flex-row items-center md:items-start gap-8">
                     <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex-shrink-0">
                       <QRCode value={coupon.code} size={150} style={{ height: "auto", maxWidth: "100%", width: "150px" }} />
                     </div>
                     <div className="flex-1 space-y-4 w-full text-center md:text-left">
                       <div>
                         <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Description</h4>
                         <p className="text-slate-800">{coupon.description}</p>
                       </div>
                       
                       <div className="bg-white p-4 rounded-xl border border-slate-200 text-center md:text-left">
                         <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Redemption Code</span>
                         <span className="text-2xl font-mono font-bold tracking-widest text-slate-800">{coupon.code}</span>
                       </div>

                       <div className="bg-amber-100 p-3 rounded-xl border border-amber-200 text-amber-800 font-medium text-sm flex items-center justify-center md:justify-start gap-2">
                         <Clock className="w-5 h-5 flex-shrink-0" />
                         Valid until {expDate.toLocaleString()}
                       </div>
                     </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useAuthStore } from '../store/useAuthStore';
import { HeartHandshake, ShieldCheck, Clock, Users } from 'lucide-react';

export default function Landing() {
  const { signInIdp, loading, error } = useAuthStore();

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            Taylor's University Pilot
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Mutual aid, powered by <span className="text-indigo-600">time.</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
            CareCredit is a time banking system for our campus. Exchange your skills, help others, and earn CareCredit. Perfect for language support, digital help, errands, or just peer companionship.
          </p>
          
          <div className="pt-4">
            <button
              onClick={signInIdp}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connecting...' : "Sign in with Student Email"}
            </button>
            {error && <p className="mt-3 text-sm font-bold text-coral-600 bg-red-50 p-3 rounded-xl">{error}</p>}
          </div>

          <div className="flex items-center gap-6 pt-8 text-sm text-slate-500 border-t border-slate-200">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="w-5 h-5 text-teal-500" /> Safe & Verified
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <Clock className="w-5 h-5 text-amber-500" /> Time Banking
            </div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-md relative">
          <div className="absolute inset-0 bg-indigo-100 rounded-[2rem] transform rotate-3 scale-105" />
          <div className="relative bg-white p-8 vibrant-card space-y-6">
            <div className="bg-indigo-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <HeartHandshake className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">How it works</h3>
            <ul className="space-y-5">
              <li className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 flex-shrink-0">1</div>
                <p className="text-slate-600 text-sm"><strong className="text-slate-900 block font-bold text-base">Offer Help</strong> Give 30 minutes of support, earn 0.5 CareCredit.</p>
              </li>
              <li className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 flex-shrink-0">2</div>
                <p className="text-slate-600 text-sm"><strong className="text-slate-900 block font-bold text-base">Bank Time</strong> Save up your earned credits in your digital wallet.</p>
              </li>
              <li className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 flex-shrink-0">3</div>
                <p className="text-slate-600 text-sm"><strong className="text-slate-900 block font-bold text-base">Spend Time</strong> Spend credits to request help from peers, or redeem them in the Rewards Store for real-world coupons!</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

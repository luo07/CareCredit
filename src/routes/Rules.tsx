import { BookOpen, CheckCircle2, ShieldAlert, HeartHandshake, Gift, Star, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Rules() {
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-indigo-500" />
              CareCredit Rules
            </h1>
            <p className="text-slate-500 mt-2 font-medium">How to use and exchange time banking credits.</p>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors shrink-0 self-start md:self-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>

      <div className="bg-white vibrant-card border border-slate-100 p-8 space-y-8">
        
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <HeartHandshake className="text-indigo-500 w-5 h-5" /> 
            1. Earning CareCredit
          </h2>
          <ul className="space-y-3 text-slate-600 font-medium ml-7 list-disc">
            <li>You earn credits by helping other Taylor's University students.</li>
            <li><strong>30 minutes of help = 0.5 CareCredit.</strong></li>
            <li><strong>1 hour of help = 1.0 CareCredit.</strong></li>
            <li>Bonus credits may be awarded for high-quality interactions or special events.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <Gift className="text-indigo-500 w-5 h-5" /> 
            2. Spending CareCredit
          </h2>
          <ul className="space-y-3 text-slate-600 font-medium ml-7 list-disc">
            <li>You can spend your CareCredit to request help from others.</li>
            <li>Alternatively, use your credits to redeem rewards in the <strong>Rewards Store</strong> (e.g., dining coupons, stationery).</li>
            <li>You must have sufficient CareCredit in your wallet to post a new request.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <Star className="text-indigo-500 w-5 h-5" /> 
            3. Trust Score System
          </h2>
          <ul className="space-y-3 text-slate-600 font-medium ml-7 list-disc">
            <li>Every new user starts with a Trust Score of <strong>100</strong>.</li>
            <li>Successfully completing a request gives you <strong>+2 to +5 points</strong>.</li>
            <li>Receiving a 5-star rating gives you bonus points.</li>
            <li>Canceling a task at the last minute or failing to show up will deduct <strong>-10 to -20 points</strong>.</li>
            <li>Users with a Trust Score below 50 may have their accounts temporarily restricted.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <ShieldAlert className="text-indigo-500 w-5 h-5" /> 
            4. Safety & Conduct
          </h2>
          <ul className="space-y-3 text-slate-600 font-medium ml-7 list-disc">
            <li>Only register using your official <code>.edu.my</code> student email.</li>
            <li>Always meet in public campus areas (e.g., Library, Student Life Centre) for tasks.</li>
            <li>Be respectful, punctual, and communicate clearly with your peers.</li>
            <li>Any form of harassment, spam, or inappropriate behavior will result in an immediate permanent ban.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}

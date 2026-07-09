import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { SKILLS_LIST } from '../lib/constants';

export default function CreateTask() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'request',
    title: '',
    description: '',
    category: '',
    expectedDuration: 30,
    location: '',
    urgency: 'medium' as 'low' | 'medium' | 'high'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        ...formData,
        status: 'open',
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      navigate('/feed');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Request Help</h1>
        <p className="text-slate-500">Post a task so others can assist you.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white vibrant-card border border-slate-100 p-6 md:p-8 space-y-6">
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
            <input
              required
              type="text"
              maxLength={100}
              placeholder="e.g., Need help understanding React hooks"
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors outline-none shadow-sm"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea
              required
              rows={4}
              maxLength={1000}
              placeholder="Provide some details..."
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors outline-none resize-none shadow-sm"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <div className="relative">
                <input
                  type="text"
                  list="category-options"
                  placeholder="Select or type a category..."
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors outline-none shadow-sm"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                />
                <datalist id="category-options">
                  {SKILLS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </datalist>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Duration (minutes)</label>
              <select
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors outline-none shadow-sm"
                value={formData.expectedDuration}
                onChange={(e) => setFormData({...formData, expectedDuration: Number(e.target.value)})}
              >
                <option value={15}>15 mins (0.25 UC)</option>
                <option value={30}>30 mins (0.5 UC)</option>
                <option value={60}>1 hour (1 UC)</option>
                <option value={90}>1.5 hours (1.5 UC)</option>
                <option value={120}>2 hours (2 UC)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Location on Campus</label>
              <input
                required
                type="text"
                placeholder="e.g., Library Level 2, Cafe"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors outline-none shadow-sm"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Urgency</label>
              <select
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors outline-none shadow-sm"
                value={formData.urgency}
                onChange={(e) => setFormData({...formData, urgency: e.target.value as any})}
              >
                <option value="low">Flexible / Low</option>
                <option value="medium">Normal / Medium</option>
                <option value="high">Urgent / High</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/feed')}
            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-70 flex items-center justify-center min-w-[120px]"
          >
            {loading ? 'Posting...' : 'Post to Feed'}
          </button>
        </div>
      </form>
    </div>
  );
}

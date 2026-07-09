import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Task } from '../types';
import TaskCard from '../components/TaskCard';
import Leaderboard from '../components/Leaderboard';
import { Search, Filter, Sparkles, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';

export default function Feed() {
  const { profile } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'request' | 'offer'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [maxDuration, setMaxDuration] = useState<number | ''>('');

  const isProfileComplete = profile && profile.name && profile.bio && profile.studentId && profile.contactNumber && profile.skills && profile.skills.length > 0 && profile.languages && profile.languages.length > 0;

  useEffect(() => {
    if (!isProfileComplete) {
      setLoading(false);
      return;
    }
    // Only fetch open tasks for the feed
    const q = query(
      collection(db, 'tasks'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(taskList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    });

    return () => unsubscribe();
  }, [isProfileComplete]);

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.type === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = urgencyFilter === 'all' || task.urgency === urgencyFilter;
    const matchesLocation = locationFilter === '' || task.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesDuration = maxDuration === '' || task.expectedDuration <= maxDuration;
    
    return matchesFilter && matchesSearch && matchesUrgency && matchesLocation && matchesDuration;
  });

  if (!isProfileComplete) {
    return (
      <div className="max-w-xl mx-auto mt-20 bg-white p-10 rounded-3xl border border-slate-200 text-center shadow-sm">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Complete Your Profile First</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Before you can offer help to the community, please complete all the fields in your settings, including your skills and languages.
        </p>
        <Link to="/settings" className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-indigo-600/30">
          Go to Settings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Offer Help</h1>
          <p className="text-slate-500">Discover requests from the community to offer your skills.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search by keyword or category..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Urgency</label>
          <select 
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            <option value="all">Any Urgency</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Max Duration (mins)</label>
          <select 
            value={maxDuration}
            onChange={(e) => setMaxDuration(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            <option value="">Any Duration</option>
            <option value="15">Up to 15 mins</option>
            <option value="30">Up to 30 mins</option>
            <option value="60">Up to 1 hour</option>
            <option value="120">Up to 2 hours</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Location</label>
          <input 
            type="text"
            placeholder="E.g., Library"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 h-48 animate-pulse flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-4 bg-slate-200 rounded-full w-1/4"></div>
                <div className="h-6 bg-slate-200 rounded-full w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded-full w-full"></div>
              </div>
              <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-gray-200 border-dashed rounded-2xl">
          <Filter className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
          <p className="text-gray-500">Try adjusting your filters or search term.</p>
        </div>
      )}
    </div>
  );
}

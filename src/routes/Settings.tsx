import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Settings as SettingsIcon, Save, HeartHandshake, Shield, User as UserIcon, ChevronDown, Check, Palette } from 'lucide-react';
import { CATEGORIES, SKILLS_LIST, LANGUAGES_LIST } from '../lib/constants';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function Settings() {
  const { profile, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false);
  const [languagesDropdownOpen, setLanguagesDropdownOpen] = useState(false);
  
  const skillsDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (skillsDropdownRef.current && !skillsDropdownRef.current.contains(event.target as Node)) {
        setSkillsDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLanguagesDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    studentId: profile?.studentId || '',
    contactNumber: profile?.contactNumber || '',
    skills: profile?.skills || [],
    languages: profile?.languages || [],
    theme: localStorage.getItem('app-theme') || 'default',
    privacyPreferences: {
      showEmail: profile?.privacyPreferences?.showEmail ?? true,
      showLocation: profile?.privacyPreferences?.showLocation ?? true,
    }
  });

  if (!profile) return null;

  const toggleArrayItem = (field: 'skills' | 'languages', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleThemeChange = (newTheme: string) => {
    setFormData(prev => ({ ...prev, theme: newTheme }));
    localStorage.setItem('app-theme', newTheme);
    document.documentElement.className = newTheme === 'default' ? '' : `theme-${newTheme}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      let earnedCreditsDelta = 0;
      let newClaimedAchievements = profile.claimedAchievements || [];
      
      const isComplete = formData.name && formData.bio && formData.studentId && formData.contactNumber && formData.skills.length > 0 && formData.languages.length > 0;
      
      if (isComplete && !newClaimedAchievements.includes('profile_complete')) {
         earnedCreditsDelta = 0.5;
         newClaimedAchievements = [...newClaimedAchievements, 'profile_complete'];
      }

      const updatedData = {
        name: formData.name,
        bio: formData.bio,
        studentId: formData.studentId,
        contactNumber: formData.contactNumber,
        skills: formData.skills,
        languages: formData.languages,
        privacyPreferences: formData.privacyPreferences,
        credits: profile.credits + earnedCreditsDelta,
        claimedAchievements: newClaimedAchievements,
        updatedAt: serverTimestamp()
      };

      const userRef = doc(db, 'users', profile.id);
      await updateDoc(userRef, updatedData);

      setProfile({
        ...profile,
        name: updatedData.name,
        bio: updatedData.bio,
        studentId: updatedData.studentId,
        contactNumber: updatedData.contactNumber,
        skills: updatedData.skills,
        languages: updatedData.languages,
        privacyPreferences: updatedData.privacyPreferences,
        credits: updatedData.credits as number,
        claimedAchievements: updatedData.claimedAchievements as string[],
        updatedAt: new Date()
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-indigo-600" />
          Settings
        </h1>
        <p className="text-slate-500 mt-2">Manage your profile and preferences.</p>
      </div>

      {success && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 rounded-2xl flex items-center gap-2 animate-fade-in font-bold shadow-sm">
          <HeartHandshake className="w-5 h-5" /> 保存成功
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white vibrant-card border border-slate-100 p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
            <UserIcon className="w-5 h-5 text-indigo-500" /> Public Profile
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
              <input
                required
                type="text"
                disabled
                className="w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed shadow-sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Student ID</label>
              <input
                type="text"
                disabled
                className="w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed shadow-sm"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contact Number</label>
              <PhoneInput
                international
                defaultCountry="MY"
                placeholder="e.g., 123456789"
                value={formData.contactNumber}
                onChange={(value) => setFormData({ ...formData, contactNumber: value || '' })}
                className="flex gap-2 [&>input]:w-full [&>input]:px-5 [&>input]:py-3 [&>input]:bg-slate-50 [&>input]:border [&>input]:border-slate-200 [&>input]:rounded-xl [&>input]:focus:ring-2 [&>input]:focus:ring-indigo-500 [&>input]:focus:bg-white [&>input]:transition-colors [&>input]:outline-none [&>input]:shadow-sm [&>.PhoneInputCountry]:p-3 [&>.PhoneInputCountry]:bg-slate-50 [&>.PhoneInputCountry]:border [&>.PhoneInputCountry]:border-slate-200 [&>.PhoneInputCountry]:rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Bio</label>
              <textarea
                rows={3}
                placeholder="Tell the community a little about yourself..."
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors outline-none shadow-sm resize-none"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div ref={skillsDropdownRef} className="relative">
              <label className="block text-sm font-bold text-slate-700 mb-2">My Skills</label>
              
              <div 
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer flex justify-between items-center hover:bg-slate-100 transition-colors shadow-sm"
                onClick={() => setSkillsDropdownOpen(!skillsDropdownOpen)}
              >
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {formData.skills.length > 0 ? (
                     formData.skills.map(s => (
                       <span key={s} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg text-xs font-bold border border-indigo-200">
                         {s}
                       </span>
                     ))
                  ) : (
                    <span className="text-slate-400">Select your skills...</span>
                  )}
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${skillsDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {skillsDropdownOpen && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto py-2">
                  {SKILLS_LIST.map(skill => {
                    const isSelected = formData.skills.includes(skill);
                    return (
                      <div 
                        key={skill}
                        className="px-5 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors"
                        onClick={() => toggleArrayItem('skills', skill)}
                      >
                         <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                           {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                         </div>
                         <span className="text-sm font-medium text-slate-700">{skill}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div ref={langDropdownRef} className="relative">
              <label className="block text-sm font-bold text-slate-700 mb-2">Languages</label>
              
              <div 
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer flex justify-between items-center hover:bg-slate-100 transition-colors shadow-sm"
                onClick={() => setLanguagesDropdownOpen(!languagesDropdownOpen)}
              >
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {formData.languages.length > 0 ? (
                     formData.languages.map(s => (
                       <span key={s} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg text-xs font-bold border border-indigo-200">
                         {s}
                       </span>
                     ))
                  ) : (
                    <span className="text-slate-400">Select your languages...</span>
                  )}
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${languagesDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {languagesDropdownOpen && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto py-2">
                  {LANGUAGES_LIST.map(lang => {
                    const isSelected = formData.languages.includes(lang);
                    return (
                      <div 
                        key={lang}
                        className="px-5 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors"
                        onClick={() => toggleArrayItem('languages', lang)}
                      >
                         <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                           {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                         </div>
                         <span className="text-sm font-medium text-slate-700">{lang}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white vibrant-card border border-slate-100 p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Palette className="w-5 h-5 text-indigo-500" /> Display & Preferences
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Background Theme</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'default', label: 'Default', bg: 'bg-slate-50' },
                  { id: 'warm', label: 'Warm', bg: 'bg-orange-50' },
                  { id: 'ocean', label: 'Ocean', bg: 'bg-blue-50' },
                  { id: 'nature', label: 'Nature', bg: 'bg-green-50' },
                ].map(theme => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleThemeChange(theme.id)}
                    className={`flex items-center gap-3 px-4 py-3 border rounded-xl font-bold transition-all ${formData.theme === theme.id ? 'border-indigo-600 ring-2 ring-indigo-100 bg-white' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <div className={`w-6 h-6 rounded-full border border-slate-200 ${theme.bg}`}></div>
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={formData.privacyPreferences.showEmail}
                  onChange={(e) => setFormData({
                    ...formData,
                    privacyPreferences: { ...formData.privacyPreferences, showEmail: e.target.checked }
                  })}
                />
                <div className="w-12 h-6 bg-slate-200 group-hover:bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
              <span className="text-sm font-bold text-slate-700">Show Email to other users</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={formData.privacyPreferences.showLocation}
                  onChange={(e) => setFormData({
                    ...formData,
                    privacyPreferences: { ...formData.privacyPreferences, showLocation: e.target.checked }
                  })}
                />
                <div className="w-12 h-6 bg-slate-200 group-hover:bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
              <span className="text-sm font-bold text-slate-700">Share General Location on Tasks</span>
            </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-70 flex items-center justify-center min-w-[140px] gap-2"
          >
            {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}

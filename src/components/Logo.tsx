import React from 'react';
import { HeartHandshake } from 'lucide-react';

export const Logo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <div className={`flex items-center justify-center bg-indigo-600 rounded-xl text-white ${className}`}>
    <HeartHandshake className="w-3/5 h-3/5" />
  </div>
);

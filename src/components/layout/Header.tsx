import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { user, signOut } = useAuth();
  
  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10 relative">
      <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">Dashboard</h2>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">{user?.full_name} ({user?.role})</span>
        <button onClick={signOut} className="text-sm text-red-600 hover:text-red-800">Logout</button>
      </div>
    </header>
  );
}

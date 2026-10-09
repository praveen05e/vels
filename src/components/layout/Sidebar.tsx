import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, List, PlusCircle, Settings } from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || 'donor';

  const links = {
    donor: [
      { to: '/donor', label: 'Dashboard', icon: Home },
      { to: '/donor/food-list', label: 'My Food', icon: List },
      { to: '/donor/add-food', label: 'Add Food', icon: PlusCircle },
    ],
    receiver: [
      { to: '/receiver', label: 'Dashboard', icon: Home },
    ],
    driver: [
      { to: '/driver', label: 'Dashboard', icon: Home },
    ],
    coordinator: [
      { to: '/coordinator', label: 'Dashboard', icon: Home },
    ],
    admin: [
      { to: '/admin', label: 'Dashboard', icon: Home },
      { to: '/admin/users', label: 'Users', icon: Settings },
    ]
  };

  const navLinks = links[role as keyof typeof links] || links.donor;

  return (
    <aside className="w-64 bg-emerald-700 text-white flex-shrink-0 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-emerald-600">
        <h1 className="text-xl font-bold">FoodBridge AI</h1>
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-sm transition-colors ${isActive ? 'bg-emerald-800 border-l-4 border-accent' : 'hover:bg-emerald-600'}`
                }
              >
                <link.icon className="w-5 h-5 mr-3" />
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Scissors,
  Gift,
  BarChart,
  Settings,
  LogOut,
  MessageSquare,
  Calendar,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/admin/barbers', icon: Users, label: 'Barbers' },
    { path: '/admin/services', icon: Scissors, label: 'Services' },
    { path: '/admin/chat', icon: MessageSquare, label: 'Chat' },
    { path: '/admin/promotions', icon: Gift, label: 'Promotions' },
    { path: '/admin/loyalty', icon: Star, label: 'Loyalty' },
    { path: '/admin/reports', icon: BarChart, label: 'Reports' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#1c1c1c] border-r border-[#3c3c3c]">
        <div className="p-6">
          <Link to="/admin" className="flex items-center space-x-2">
            <Scissors className="h-8 w-8 text-[#c4a47c]" />
            <span className="text-2xl font-bold text-white">ADMIN</span>
          </Link>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-6 py-4 text-gray-400 hover:bg-[#2c2c2c] hover:text-[#c4a47c] transition-colors duration-200 ${
                location.pathname === item.path ? 'bg-[#2c2c2c] text-[#c4a47c]' : ''
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}

          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-6 py-4 text-gray-400 hover:bg-[#2c2c2c] hover:text-red-400 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#1c1c1c]">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
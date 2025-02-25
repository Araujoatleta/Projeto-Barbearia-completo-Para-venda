import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Scissors, 
  Calendar, 
  MessageSquare, 
  User, 
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const navLinks = [
    { to: '/services', label: 'Services' },
    ...(isAuthenticated ? [
      { to: '/appointments', label: 'Appointments', icon: Calendar },
      { to: '/chat', label: 'Chat', icon: MessageSquare }
    ] : [])
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#1c1c1c] border-b border-[#2c2c2c] sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Scissors className="h-8 w-8 text-[#c4a47c]" />
            <span className="text-2xl font-bold text-white hidden sm:inline">
              LUXURY<span className="text-[#c4a47c]">CUTS</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-2 transition-colors duration-300 ${
                  isActive(link.to)
                    ? 'text-[#c4a47c]'
                    : 'text-gray-300 hover:text-[#c4a47c]'
                }`}
              >
                {link.icon && <link.icon className="h-5 w-5" />}
                <span>{link.label}</span>
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-[#c4a47c] transition-colors duration-300"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden lg:inline">{user?.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#2c2c2c] rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#3c3c3c] hover:text-[#c4a47c]"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#3c3c3c] hover:text-[#c4a47c] flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-[#c4a47c] transition-colors duration-300"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#2c2c2c]">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-300 ${
                    isActive(link.to)
                      ? 'bg-[#2c2c2c] text-[#c4a47c]'
                      : 'text-gray-300 hover:bg-[#2c2c2c] hover:text-[#c4a47c]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon && <link.icon className="h-5 w-5" />}
                  <span>{link.label}</span>
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-[#2c2c2c] hover:text-[#c4a47c] rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-[#2c2c2c] hover:text-red-400 rounded-md w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary mx-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
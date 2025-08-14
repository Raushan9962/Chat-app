import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, LogOut, User, Settings } from "lucide-react";
import useAuthStore from "../store/useAuthStore"; // Import your Zustand store

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  
  // Get auth state and functions from Zustand store
  const { authUser, logout, checkAuth, isCheckingAuth } = useAuthStore();

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    navigate("/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <nav className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-white">
            <MessageSquare className="w-8 h-8" />
            <span className="text-xl font-bold">ChatApp</span>
          </Link>
          <div className="text-gray-400">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center space-x-2 text-white hover:text-indigo-400 transition-colors">
          <MessageSquare className="w-8 h-8" />
          <span className="text-xl font-bold">ChatApp</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-gray-300 hover:text-white transition-colors"
          >
            Home
          </Link>
          {authUser && (
            <>
              <Link 
                to="/chat" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Chat
              </Link>
              <Link 
                to="/contacts" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Contacts
              </Link>
            </>
          )}
        </div>

        {/* User Section */}
        <div className="flex items-center space-x-4">
          {authUser ? (
            <div className="relative dropdown-container">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center overflow-hidden">
                  {authUser.profilePic ? (
                    <img 
                      src={authUser.profilePic} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <span className="hidden sm:block">
                  {authUser.fullName || authUser.username || authUser.name}
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-lg shadow-lg border border-slate-600 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-400 border-b border-slate-600">
                      {authUser.email}
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-slate-600 hover:text-white transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-slate-600 hover:text-white transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-600 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {authUser && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-700">
          <div className="flex space-x-6">
            <Link 
              to="/chat" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Chat
            </Link>
            <Link 
              to="/contacts" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Contacts
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
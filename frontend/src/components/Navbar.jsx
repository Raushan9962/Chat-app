import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, LogOut, User, Settings } from "lucide-react";
import useAuthStore from "../store/useAuthStore";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const { authUser, logout, checkAuth, isCheckingAuth } = useAuthStore();

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isCheckingAuth) {
    return (
      <nav className="bg-neutral-900 border-b border-neutral-700 px-4 py-4 md:py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-white">
            <MessageSquare className="w-8 h-8 text-indigo-500" />
            <span className="text-2xl font-bold tracking-tight">ChatApp</span>
          </Link>
          <div className="text-gray-400">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-neutral-900 border-b border-neutral-700 px-4 py-4 md:py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Brand */}
        <Link
          to="/"
          className="flex items-center space-x-2 text-white transition-colors hover:text-indigo-400"
        >
          <MessageSquare className="w-8 h-8 text-indigo-500" />
          <span className="text-2xl font-bold tracking-tight">ChatApp</span>
        </Link>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className="text-gray-400 hover:text-white transition-colors font-medium"
          >
            Home
          </Link>
          {authUser && (
            <>
              <Link
                to="/chat"
                className="text-gray-400 hover:text-white transition-colors font-medium"
              >
                Chat
              </Link>
              <Link
                to="/contacts"
                className="text-gray-400 hover:text-white transition-colors font-medium"
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
                className="flex items-center gap-3 text-gray-300 transition-transform duration-200 hover:scale-105 focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full ring-2 ring-transparent transition-all hover:ring-indigo-500 overflow-hidden">
                  {authUser.profilePic ? (
                    <img
                      src={authUser.profilePic}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-full h-full p-2 text-white bg-indigo-600" />
                  )}
                </div>
                <span className="hidden sm:block font-medium">
                  {authUser.fullName || authUser.username || authUser.name}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-neutral-800 rounded-xl shadow-2xl border border-neutral-700 z-50 animate-fade-in">
                  <div className="p-1">
                    <div className="px-4 py-3 text-sm text-gray-400 font-semibold border-b border-neutral-700">
                      {authUser.email}
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-neutral-700 hover:text-white transition-colors rounded-lg mx-1 my-1"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-neutral-700 hover:text-white transition-colors rounded-lg mx-1 my-1"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-neutral-700 hover:text-red-300 transition-colors rounded-lg mx-1 my-1"
                    >
                      <LogOut className="w-4 h-4" />
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu (links moved here for better mobile UX) */}
      {authUser && (
        <div className="md:hidden mt-4 pt-4 border-t border-neutral-700 flex justify-center">
          <div className="flex space-x-6">
            <Link
              to="/chat"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Chat
            </Link>
            <Link
              to="/contacts"
              className="text-gray-400 hover:text-white transition-colors"
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
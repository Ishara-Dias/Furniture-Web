import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem('current_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleLogout = () => {
    localStorage.removeItem('current_user');
    setUser(null);
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <svg 
                className="h-8 w-8 mr-2" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              <span className="font-bold text-xl">RoomDesigner</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors">
              Home
            </Link>
            <Link to="/new-design" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors">
              New Design
            </Link>
            <Link to="/my-designs" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors">
              My Designs
            </Link>
            <Link to="/help" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors">
              Help
            </Link>
            
            {user ? (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={toggleMenu}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center mr-2">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="mr-1">{user.name || 'Account'}</span>
                  <svg 
                    className="h-4 w-4" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-gray-500 truncate">{user.email}</div>
                      </div>
                      <Link 
                        to="/my-account" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Account
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium bg-white text-indigo-600 hover:bg-gray-100 transition-colors">
                Sign in
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-500 focus:outline-none"
            >
              <svg 
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg 
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {user && (
            <div className="px-3 py-2 flex items-center border-b border-indigo-500 mb-2">
              <div className="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center mr-2">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="font-medium text-white">{user.name}</div>
                <div className="text-indigo-200 text-xs truncate">{user.email}</div>
              </div>
            </div>
          )}
          
          <Link 
            to="/" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/new-design" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500"
            onClick={() => setIsMenuOpen(false)}
          >
            New Design
          </Link>
          <Link 
            to="/my-designs" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500"
            onClick={() => setIsMenuOpen(false)}
          >
            My Designs
          </Link>
          <Link 
            to="/help" 
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500"
            onClick={() => setIsMenuOpen(false)}
          >
            Help
          </Link>
          
          {user ? (
            <>
              <Link 
                to="/my-account" 
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500"
                onClick={() => setIsMenuOpen(false)}
              >
                My Account
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="block px-3 py-2 rounded-md text-base font-medium bg-white text-indigo-600 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
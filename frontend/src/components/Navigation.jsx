import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="text-2xl transform group-hover:scale-110 transition-transform">🧬</div>
            <div>
              <span className="text-xl font-bold text-gray-900">LifeEmbedding</span>
              <span className="ml-2 text-xs text-gray-500 font-medium">Vector Trajectory Analysis</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-2">
            <Link
              to="/"
              className={`px-5 py-2 rounded-lg font-medium transition-all ${
                isActive('/')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              className={`px-5 py-2 rounded-lg font-medium transition-all ${
                isActive('/explore')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Explore
            </Link>
            <Link
              to="/about"
              className={`px-5 py-2 rounded-lg font-medium transition-all ${
                isActive('/about')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

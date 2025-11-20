import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, GitCompare, LayoutDashboard, TrendingUp, Tag, BarChart3, Settings, Sparkles } from 'lucide-react';
import { AIOverlay } from './AIOverlay';

export function Navigation() {
  const location = useLocation();
  const [isAIOpen, setIsAIOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/compare', label: 'Compare', icon: GitCompare },
    { path: '/market', label: 'Market Intel', icon: TrendingUp },
    { path: '/promotions', label: 'Promotions', icon: Tag },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin', label: 'Admin', icon: Settings },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MM</span>
              </div>
              <span className="font-bold text-gray-900 text-lg hidden sm:block">
                MobiMEA Intelligence
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              );
            })}

            {/* AI Assistant Button */}
            <button
              onClick={() => setIsAIOpen(true)}
              className="ml-2 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline">AI</span>
            </button>
          </div>

          <AIOverlay isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
        </div>
      </div>
    </nav>
  );
}

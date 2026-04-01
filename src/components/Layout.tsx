import React, { useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { FloatingPaths } from './ui/background-paths';
import { Home, Scan, Activity, FileText, User, Leaf, Wallet, Layout as LayoutIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/scanner', icon: Scan, label: 'Scanner' },
    { path: '/analyzer', icon: Activity, label: 'Analyzer' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/demo', icon: LayoutIcon, label: 'Demo' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-gray-200 px-6 py-3 rounded-full shadow-2xl flex items-center gap-8 z-50 md:top-6 md:bottom-auto">
      <div className="hidden lg:flex items-center gap-2 mr-4 border-r border-gray-200 pr-6">
        <div className="w-8 h-8 bg-[#065A82] rounded-lg flex items-center justify-center text-white font-black text-sm">E</div>
        <span className="font-black text-sm text-[#065A82] whitespace-nowrap">EcoDrive AI</span>
      </div>

      <div className="flex items-center gap-6 md:gap-8">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive ? 'text-[#065A82] scale-110' : 'text-gray-400 hover:text-gray-600 hover:scale-105'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="w-1 h-1 bg-[#065A82] rounded-full mt-0.5"
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="hidden sm:flex items-center gap-4 ml-4 border-l border-gray-200 pl-6">
        <Link to="/savings" className="text-gray-400 hover:text-[#065A82] transition-colors">
          <Wallet size={20} />
        </Link>
        <Link to="/carbon" className="text-gray-400 hover:text-[#065A82] transition-colors">
          <Leaf size={20} />
        </Link>
      </div>
    </nav>
  );
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useApp();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    if (!state.isAuthenticated && !isLanding && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [state.isAuthenticated, isLanding, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 pb-24 md:pb-0 md:pt-20 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>
      {!isLanding && <Navigation />}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

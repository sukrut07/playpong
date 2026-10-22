import React, { useState } from 'react';
import { Play, Hand, BarChart3, Bot, Network, Menu, X } from 'lucide-react';
import { StatusIndicator } from '../ui/StatusIndicator';

export interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  aiStatus?: 'online' | 'offline';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  aiStatus = 'online',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Play', path: '/play', icon: Play },
    { label: 'Gesture Lab', path: '/gesture-lab', icon: Hand },
    { label: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { label: 'AI Coach', path: '/coach', icon: Bot },
    { label: 'Architecture', path: '/architecture', icon: Network },
  ];

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#FFFDF6] border-b-[3px] border-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNav('/')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 bg-[#62F5AD] border-[2px] border-[#111111] rounded-xl flex items-center justify-center font-display font-black text-xl shadow-neo-sm group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              🏓
            </div>
            <div>
              <span className="font-display font-black text-xl tracking-tight text-[#111111] uppercase">
                PONG AI
              </span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.2 bg-[#D9FF55] border-[1.5px] border-[#111111] rounded font-mono text-[10px] font-bold">
                ITTF 2026
              </span>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 font-display font-extrabold text-sm uppercase tracking-wider rounded-xl transition-all duration-150 ${
                    isActive
                      ? 'bg-[#111111] text-[#FFFFFF] shadow-neo-sm'
                      : 'text-[#111111] hover:bg-[#F5EFE0]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Status Indicator & CTA */}
          <div className="hidden md:flex items-center gap-3">
            <StatusIndicator
              status={aiStatus === 'online' ? 'online' : 'idle'}
              label={aiStatus === 'online' ? 'Gemma 4' : 'Rules Engine'}
            />
            <button
              onClick={() => handleNav('/play')}
              className="px-4 py-2 font-display font-black text-xs uppercase tracking-wider bg-[#62F5AD] hover:bg-[#4ee69e] border-[2px] border-[#111111] rounded-xl shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-transform"
            >
              Play Now ↗
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border-[2px] border-[#111111] rounded-xl bg-[#FFFFFF] shadow-neo-sm"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-[2px] border-[#111111] bg-[#FFFDF6] px-4 pt-3 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 font-display font-extrabold text-base uppercase rounded-xl border-[2px] border-[#111111] ${
                  isActive ? 'bg-[#111111] text-[#FFFFFF] shadow-neo-sm' : 'bg-[#FFFFFF] text-[#111111]'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
          <div className="pt-2">
            <button
              onClick={() => handleNav('/play')}
              className="w-full py-3 font-display font-black text-sm uppercase bg-[#62F5AD] border-[2px] border-[#111111] rounded-xl shadow-neo"
            >
              PLAY NOW ↗
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

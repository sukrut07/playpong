import React, { useState, useEffect } from 'react';
import { useRouter } from './router';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { HomePage } from '../pages/HomePage';
import { GamePage } from '../pages/GamePage';
import { GestureLabPage } from '../pages/GestureLabPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CoachPage } from '../pages/CoachPage';
import { ArchitecturePage } from '../pages/ArchitecturePage';
import { modelService } from '../services/model-service';

export const App: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const [aiStatus, setAiStatus] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    modelService.getHealth().then((h) => {
      setAiStatus(h.available ? 'online' : 'offline');
    }).catch(() => {
      setAiStatus('offline');
    });
  }, []);

  const renderCurrentPage = () => {
    if (currentPath === '/' || currentPath === '') {
      return <HomePage onNavigate={navigate} />;
    }
    if (currentPath === '/play') {
      return <GamePage onNavigate={navigate} initialMode="setup" />;
    }
    if (currentPath.startsWith('/game')) {
      return <GamePage onNavigate={navigate} initialMode="playing" />;
    }
    if (currentPath === '/gesture-lab') {
      return <GestureLabPage onNavigate={navigate} />;
    }
    if (currentPath === '/dashboard') {
      return <DashboardPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/coach')) {
      return <CoachPage onNavigate={navigate} />;
    }
    if (currentPath === '/architecture') {
      return <ArchitecturePage onNavigate={navigate} />;
    }

    // Default fallback to HomePage
    return <HomePage onNavigate={navigate} />;
  };

  const isGameActive = currentPath.startsWith('/game');

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF6] text-[#111111] antialiased">
      <Navbar currentPath={currentPath} onNavigate={navigate} aiStatus={aiStatus} />
      <main className={`flex-1 ${isGameActive ? 'p-0' : 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8'}`}>
        {renderCurrentPage()}
      </main>
      {!isGameActive && <Footer onNavigate={navigate} />}
    </div>
  );
};

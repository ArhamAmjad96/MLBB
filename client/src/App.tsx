import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useMatchState } from './hooks/useMatchState';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { LiveControl } from './pages/LiveControl';
import { DraftControl } from './pages/DraftControl';
import { OverlaysHub } from './pages/OverlaysHub';
import { TeamsManager } from './pages/TeamsManager';

// Broadcast Overlays (Transparent 1920x1080 Viewports)
import { HudOverlay } from './overlays/HudOverlay';
import { DraftOverlay } from './overlays/DraftOverlay';
import { KillFeedOverlay } from './overlays/KillFeedOverlay';
import { MvpOverlay } from './overlays/MvpOverlay';

function MainLayout() {
  const { state, isConnected } = useMatchState();
  const location = useLocation();

  // If this is an individual overlay route (e.g. /overlay/hud), hide the operator navigation bar completely
  const isOverlay = location.pathname.startsWith('/overlay/');

  useEffect(() => {
    if (isOverlay) {
      document.documentElement.style.backgroundColor = 'transparent';
      document.body.style.backgroundColor = 'transparent';
      const root = document.getElementById('root');
      if (root) root.style.backgroundColor = 'transparent';
    } else {
      document.documentElement.style.backgroundColor = '#0B0F17';
      document.body.style.backgroundColor = '#0B0F17';
    }
  }, [isOverlay]);

  if (isOverlay) {
    return (
      <Routes>
        <Route path="/overlay/hud" element={<HudOverlay />} />
        <Route path="/overlay/draft" element={<DraftOverlay />} />
        <Route path="/overlay/feed" element={<KillFeedOverlay />} />
        <Route path="/overlay/mvp" element={<MvpOverlay />} />
      </Routes>
    );
  }

  return (
    <div className="operator-shell min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navigation state={state} isConnected={isConnected} />
      <main className="flex-1 pb-16">
        <Routes>
          <Route path="/" element={<Dashboard state={state} isConnected={isConnected} />} />
          <Route path="/live" element={<LiveControl state={state} />} />
          <Route path="/draft" element={<DraftControl state={state} />} />
          <Route path="/overlays" element={<OverlaysHub state={state} />} />
          <Route path="/teams" element={<TeamsManager state={state} />} />
        </Routes>
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}

export default App;

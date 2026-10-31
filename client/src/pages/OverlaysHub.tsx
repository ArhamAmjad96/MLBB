import React, { useState } from 'react';
import { 
  Tv, 
  Copy, 
  Check, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Settings2, 
  Monitor, 
  Layers 
} from 'lucide-react';
import { MatchLiveState } from '../../../shared/types';
import { api } from '../services/api';

interface OverlaysHubProps {
  state: MatchLiveState | null;
}

export const OverlaysHub: React.FC<OverlaysHubProps> = ({ state }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!state) return <div className="p-8 text-slate-400">Loading overlay configuration...</div>;

  const baseUrl = window.location.origin;

  const overlayLinks = [
    {
      id: 'hud',
      title: 'Live Scoreboard HUD (Top Bar)',
      description: '1920x1080 transparent bar with team names, logos, series points, kills, gold, towers, and Lord/Turtle or Tyrant/Overlord counters.',
      url: `${baseUrl}/overlay/hud`,
      isActive: state.overlayControls.showHud,
      toggleKey: 'showHud' as const,
      previewAspect: 'aspect-[1920/120]'
    },
    {
      id: 'draft',
      title: 'Draft Pick & Ban Broadcast Stage',
      description: 'Full-screen 1080p pick/ban screen with live phase highlights, bans footer, center countdown clock, and hero art.',
      url: `${baseUrl}/overlay/draft`,
      isActive: state.overlayControls.showDraft,
      toggleKey: 'showDraft' as const,
      previewAspect: 'aspect-video'
    },
    {
      id: 'feed',
      title: 'Live Kill Feed & Announcer Widget',
      description: 'Transparent top-right pop-up banners for kills, multikills (Double, Triple, Savage, Wipeout), and objective steals.',
      url: `${baseUrl}/overlay/feed`,
      isActive: state.overlayControls.showFeed,
      toggleKey: 'showFeed' as const,
      previewAspect: 'aspect-video'
    },
    {
      id: 'mvp',
      title: 'Post-Match MVP Spotlight Card',
      description: '1080p center stage highlight card showcasing player IGN, photo, hero, KDA, gold share, and analyst commentary.',
      url: `${baseUrl}/overlay/mvp`,
      isActive: state.overlayControls.showMvp,
      toggleKey: 'showMvp' as const,
      previewAspect: 'aspect-video'
    }
  ];

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggle = (key: keyof MatchLiveState['overlayControls'], currentValue: boolean) => {
    api.updateOverlayControls({ [key]: !currentValue });
  };

  return (
    <div className="max-w-[1700px] mx-auto p-4 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
            <Tv size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              OBS & VMix BROWSER OVERLAYS HUB
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              All overlays run natively at 1920×1080 with transparent backgrounds. Connect directly as Browser Sources.
            </p>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
          <span className="text-emerald-400 font-bold">● RESOLUTION:</span> 1920 × 1080
          <span className="text-slate-600">|</span>
          <span className="text-sky-400 font-bold">● FPS:</span> 60 FPS
        </div>
      </div>

      {/* Overlay Sources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {overlayLinks.map(ov => (
          <div 
            key={ov.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Layers size={17} className="text-sky-400" />
                  {ov.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {ov.description}
                </p>
              </div>

              {/* Show/Hide Live Toggle */}
              <button
                onClick={() => handleToggle(ov.toggleKey, ov.isActive)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  ov.isActive 
                    ? 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                    : 'bg-slate-800 border border-slate-700 text-slate-500'
                }`}
              >
                {ov.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                {ov.isActive ? 'VISIBLE' : 'HIDDEN'}
              </button>
            </div>

            {/* URL Box & Copy */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-300 truncate select-all px-1">
                {ov.url}
              </span>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleCopy(ov.id, ov.url)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                >
                  {copiedId === ov.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  {copiedId === ov.id ? 'Copied!' : 'Copy URL'}
                </button>

                <a
                  href={ov.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  title="Open Preview in New Tab"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="bg-black/50 border border-slate-800 rounded-xl overflow-hidden relative group">
              <div className="aspect-[16/9] w-full relative overflow-hidden bg-[#070a12]/80 flex items-center justify-center">
                <iframe 
                  src={ov.url}
                  title={ov.title}
                  className="w-[1920px] h-[1080px] pointer-events-none transform scale-[0.27] origin-top-left -mb-[788px] -mr-[1400px]"
                />
              </div>
              <div className="absolute top-2 right-2 bg-slate-900/90 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-slate-400">
                LIVE PREVIEW
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* OBS Studio Integration Guide */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Settings2 size={18} className="text-amber-400" />
          OBS Studio & vMix Setup Checklist
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-amber-400 block mb-1">1. Add Browser Source</span>
            <p className="text-slate-400">In OBS, click [+] in Sources, choose <b>Browser</b>, name it (e.g. <code>MARK47 HUD</code>), and paste the copied URL.</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-sky-400 block mb-1">2. Canvas Dimensions</span>
            <p className="text-slate-400">Set <b>Width</b> to <code>1920</code> and <b>Height</b> to <code>1080</code>. Check <b>Control audio via OBS</b> if sound alerts are added.</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400 block mb-1">3. Instant Reconnect</span>
            <p className="text-slate-400">Keep <b>Shutdown source when not visible</b> unchecked so overlays maintain instant WebSocket sync without reloads.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { 
  Tv, 
  Copy, 
  Check, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Settings2, 
  Layers, 
  Zap, 
  Undo2, 
  Sparkles, 
  Crown, 
  ShieldAlert, 
  Trophy 
} from 'lucide-react';
import { MatchLiveState, SpecialEventType } from '../../../shared/types';
import { api } from '../services/api';

interface OverlaysHubProps {
  state: MatchLiveState | null;
}

export const OverlaysHub: React.FC<OverlaysHubProps> = ({ state }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [simulatedBg, setSimulatedBg] = useState<'transparent' | 'dark-moba' | 'grid'>('dark-moba');
  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  if (!state) return <div className="p-8 text-[#9FB0C5]">Loading overlay configuration...</div>;

  const baseUrl = window.location.origin;

  const overlayLinks = [
    {
      id: 'hud',
      title: 'Live Scoreboard HUD (Top Banner)',
      description: '1920×1080 transparent top glass HUD with team names, logos, series score, hero kills, towers, and Lord/Turtle (MLBB) or Tyrant/Overlord (HOK) counters.',
      url: `${baseUrl}/overlay/hud`,
      isActive: state.overlayControls.showHud,
      toggleKey: 'showHud' as const
    },
    {
      id: 'feed',
      title: 'In-Match Broadcast Event Overlays',
      description: 'Priority-driven event overlay system: First Blood, Savage / Maniac / Triple Kill, Lord / Turtle secured, Lord Steal, Turret drop, Shutdown, and Victory.',
      url: `${baseUrl}/overlay/feed`,
      isActive: state.overlayControls.showFeed,
      toggleKey: 'showFeed' as const
    },
    {
      id: 'draft',
      title: 'Draft Pick & Ban Broadcast Stage',
      description: 'Full-screen 1080p drafting screen with phase highlight glow, bans footer, center auto countdown clock, and hero art.',
      url: `${baseUrl}/overlay/draft`,
      isActive: state.overlayControls.showDraft,
      toggleKey: 'showDraft' as const
    },
    {
      id: 'mvp',
      title: 'Post-Match MVP Spotlight Card',
      description: '1080p center stage highlight card showcasing victorious player IGN, photo, hero, KDA, gold share, and analyst commentary.',
      url: `${baseUrl}/overlay/mvp`,
      isActive: state.overlayControls.showMvp,
      toggleKey: 'showMvp' as const
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

  const triggerTestSimulation = async (specialType: SpecialEventType, team: 'blue' | 'red') => {
    setTestFeedback(`Fired test [${specialType.toUpperCase()}] for ${team.toUpperCase()}`);
    await api.registerSpecialEvent({
      team,
      specialType
    });
    setTimeout(() => setTestFeedback(null), 3000);
  };

  const handleUndoTest = async () => {
    await api.undoLastEvent();
    setTestFeedback('Reverted test event via synchronized undo');
    setTimeout(() => setTestFeedback(null), 3000);
  };

  return (
    <div className="max-w-[1700px] mx-auto p-4 space-y-6 select-none font-sans">
      
      {/* ============================================================== */}
      {/* 1. HEADER BANNER                                               */}
      {/* ============================================================== */}
      <div className="bg-[#121922] border border-[#273244] p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#00D1C7]/15 text-[#00D1C7] border border-[#00D1C7]/30 rounded-xl">
            <Tv size={26} />
          </div>
          <div>
            <h1 className="text-lg font-black text-[#F3F6FA] flex items-center gap-2 uppercase tracking-wide">
              BROADCAST OVERLAYS & OBS TESTBENCH
            </h1>
            <p className="text-xs text-[#9FB0C5] font-mono mt-0.5">
              1920×1080 transparent browser sources for OBS Studio, vMix, and Streamlabs.
            </p>
          </div>
        </div>

        {/* Resolution & Settings Info */}
        <div className="flex items-center gap-3 bg-[#0B0F14] px-4 py-2 rounded-xl border border-[#273244] text-xs font-mono">
          <span className="text-[#22C55E] font-bold">● RESOLUTION:</span>
          <span className="text-[#F3F6FA]">1920 × 1080</span>
          <span className="text-[#273244]">|</span>
          <span className="text-[#00D1C7] font-bold">● REFRESH:</span>
          <span className="text-[#F3F6FA]">60 FPS</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. INTERACTIVE EVENT SIMULATOR (TESTBENCH)                     */}
      {/* ============================================================== */}
      <div className="bg-[#121922] border border-[#273244] rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-[#273244] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#F5B942]" />
            <h2 className="text-sm font-black text-[#F3F6FA] uppercase tracking-wider">
              ON-AIR EVENT SIMULATION TESTBENCH
            </h2>
            <span className="text-xs text-[#9FB0C5] font-mono">
              (Click to test overlay animations directly)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {testFeedback && (
              <span className="text-xs font-mono font-bold text-[#00D1C7] bg-[#00D1C7]/10 px-2.5 py-1 rounded border border-[#00D1C7]/30">
                {testFeedback}
              </span>
            )}
            <button
              onClick={handleUndoTest}
              className="px-3 py-1 bg-[#182231] hover:bg-[#273244] border border-[#273244] text-[#F5B942] rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Undo2 size={13} />
              Undo Test
            </button>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1">
          <button
            onClick={() => triggerTestSimulation('first_blood', 'blue')}
            className="p-2.5 bg-[#0B0F14] hover:bg-[#182231] border border-[#F5B942]/50 rounded-xl text-center transition-all group"
          >
            <span className="text-base block mb-0.5">🩸</span>
            <span className="text-xs font-black text-[#F5B942] block uppercase">First Blood</span>
            <span className="text-[9px] font-mono text-[#9FB0C5]">Blue Team</span>
          </button>

          <button
            onClick={() => triggerTestSimulation('savage', 'blue')}
            className="p-2.5 bg-[#0B0F14] hover:bg-[#182231] border border-[#F5B942]/80 rounded-xl text-center transition-all group glow-gold"
          >
            <Crown size={16} className="text-[#F5B942] mx-auto mb-0.5" />
            <span className="text-xs font-black text-[#F5B942] block uppercase">Savage / Penta</span>
            <span className="text-[9px] font-mono text-[#9FB0C5]">Escalating Aura</span>
          </button>

          <button
            onClick={() => triggerTestSimulation('lord_steal', 'red')}
            className="p-2.5 bg-[#0B0F14] hover:bg-[#182231] border border-[#F59E0B]/60 rounded-xl text-center transition-all group"
          >
            <span className="text-base block mb-0.5">⚡</span>
            <span className="text-xs font-black text-[#F59E0B] block uppercase">Lord Steal</span>
            <span className="text-[9px] font-mono text-[#9FB0C5]">Red Team</span>
          </button>

          <button
            onClick={() => triggerTestSimulation('turtle_secured', 'blue')}
            className="p-2.5 bg-[#0B0F14] hover:bg-[#182231] border border-[#00D1C7]/50 rounded-xl text-center transition-all group"
          >
            <span className="text-base block mb-0.5">🐢</span>
            <span className="text-xs font-black text-[#00D1C7] block uppercase">Turtle Secured</span>
            <span className="text-[9px] font-mono text-[#9FB0C5]">Objective Badge</span>
          </button>

          <button
            onClick={() => triggerTestSimulation('tower_destroyed', 'red')}
            className="p-2.5 bg-[#0B0F14] hover:bg-[#182231] border border-[#273244] rounded-xl text-center transition-all group"
          >
            <span className="text-base block mb-0.5">🏰</span>
            <span className="text-xs font-black text-[#F3F6FA] block uppercase">Turret Shatter</span>
            <span className="text-[9px] font-mono text-[#9FB0C5]">Fast Alert</span>
          </button>

          <button
            onClick={() => triggerTestSimulation('victory', 'blue')}
            className="p-2.5 bg-[#0B0F14] hover:bg-[#182231] border border-[#2D8CFF]/60 rounded-xl text-center transition-all group"
          >
            <Trophy size={16} className="text-[#F5B942] mx-auto mb-0.5" />
            <span className="text-xs font-black text-[#2D8CFF] block uppercase">Victory Banner</span>
            <span className="text-[9px] font-mono text-[#9FB0C5]">Decisive End</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. OVERLAYS DIRECTORY & OBS CONFIGURATION                      */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {overlayLinks.map(ov => (
          <div 
            key={ov.id}
            className="bg-[#121922] border border-[#273244] rounded-2xl p-5 shadow-xl space-y-4 hover:border-[#2D8CFF]/40 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-sm text-[#F3F6FA] flex items-center gap-2 uppercase tracking-wide">
                  <Layers size={16} className="text-[#00D1C7]" />
                  {ov.title}
                </h3>
                <p className="text-xs text-[#9FB0C5] mt-1 leading-relaxed">
                  {ov.description}
                </p>
              </div>

              {/* Show/Hide Live Toggle */}
              <button
                onClick={() => handleToggle(ov.toggleKey, ov.isActive)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black flex items-center gap-1.5 transition-all shadow-sm ${
                  ov.isActive 
                    ? 'bg-[#22C55E]/20 border border-[#22C55E]/50 text-[#22C55E]' 
                    : 'bg-[#182231] border border-[#273244] text-[#9FB0C5]'
                }`}
              >
                {ov.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                {ov.isActive ? 'ON-AIR' : 'MUTED'}
              </button>
            </div>

            {/* URL Box & 1-Click Copy */}
            <div className="bg-[#0B0F14] p-2 rounded-xl border border-[#273244] flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-[#F3F6FA] truncate select-all px-2">
                {ov.url}
              </span>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleCopy(ov.id, ov.url)}
                  className="px-3 py-1.5 bg-[#182231] hover:bg-[#273244] border border-[#273244] text-[#F3F6FA] text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedId === ov.id ? <Check size={13} className="text-[#22C55E]" /> : <Copy size={13} />}
                  {copiedId === ov.id ? 'Copied' : 'Copy'}
                </button>

                <a
                  href={ov.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-[#182231] hover:bg-[#273244] border border-[#273244] text-[#9FB0C5] hover:text-[#F3F6FA] rounded-lg transition-colors"
                  title="Open Preview in New Tab"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Live Interactive Scaled Preview Box */}
            <div className="bg-[#0B0F14] border border-[#273244] rounded-xl overflow-hidden relative group">
              <div className="aspect-[16/9] w-full relative overflow-hidden bg-gradient-to-b from-[#121922] to-[#0B0F14] flex items-center justify-center">
                <iframe 
                  src={ov.url}
                  title={ov.title}
                  className="w-[1920px] h-[1080px] pointer-events-none transform scale-[0.27] origin-top-left -mb-[788px] -mr-[1400px]"
                />
              </div>
              <div className="absolute top-2 right-2 bg-[#0B0F14]/90 border border-[#273244] px-2 py-0.5 rounded text-[9px] font-mono font-bold text-[#00D1C7]">
                LIVE PREVIEW
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================== */}
      {/* 4. OBS STUDIO INTEGRATION CHECKLIST                            */}
      {/* ============================================================== */}
      <div className="bg-[#121922] border border-[#273244] rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-black text-[#F3F6FA] flex items-center gap-2 uppercase tracking-wide">
          <Settings2 size={16} className="text-[#F5B942]" />
          OBS Studio & vMix Setup Guide
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3.5 bg-[#0B0F14] rounded-xl border border-[#273244] space-y-1">
            <span className="font-bold text-[#F5B942] block mb-1">1. Add Browser Source</span>
            <p className="text-[#9FB0C5]">In OBS, click [+] in Sources, select <b>Browser</b>, name it (e.g. <code>MARK47 HUD</code>), and paste the copied URL.</p>
          </div>

          <div className="p-3.5 bg-[#0B0F14] rounded-xl border border-[#273244] space-y-1">
            <span className="font-bold text-[#00D1C7] block mb-1">2. Canvas Dimensions</span>
            <p className="text-[#9FB0C5]">Set <b>Width</b> to <code>1920</code> and <b>Height</b> to <code>1080</code>. Custom CSS is already embedded in the transparent layer.</p>
          </div>

          <div className="p-3.5 bg-[#0B0F14] rounded-xl border border-[#273244] space-y-1">
            <span className="font-bold text-[#22C55E] block mb-1">3. Instant Reconnect</span>
            <p className="text-[#9FB0C5]">Keep <b>Shutdown source when not visible</b> unchecked so overlays maintain instant WebSocket sync without reloads.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

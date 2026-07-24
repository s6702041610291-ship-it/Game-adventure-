import React, { useState, useEffect } from 'react';
import { Maximize, Minimize, Volume2, VolumeX, Globe, Sparkles } from 'lucide-react';
import { GameSettings } from '../types';
import { audioEngine } from '../utils/audio';

interface HeaderBarProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  titleLogo?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ settings, onUpdateSettings, titleLogo }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request denied:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const toggleMute = () => {
    const newMuted = !settings.audio.muted;
    if (!newMuted) {
      audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, false);
      audioEngine.startAmbientMusic(settings.audio.masterVolume, settings.audio.musicVolume, false);
    } else {
      audioEngine.stopAmbientMusic();
    }
    onUpdateSettings({
      ...settings,
      audio: {
        ...settings.audio,
        muted: newMuted,
      },
    });
  };

  const toggleLanguage = () => {
    audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
    onUpdateSettings({
      ...settings,
      gameplay: {
        ...settings.gameplay,
        language: settings.gameplay.language === 'th' ? 'en' : 'th',
      },
    });
  };

  const isTh = settings.gameplay.language === 'th';

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-b from-[#050505]/95 to-transparent backdrop-blur-xs select-none">
      {/* Left side: Game Badge or Logo Thumbnail */}
      <div className="flex items-center gap-3">
        {titleLogo ? (
          <img
            src={titleLogo}
            alt="Game Logo"
            className="h-8 sm:h-10 object-contain drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]"
          />
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#111111] border border-[#d4af37]/30 text-[#d4af37] text-xs font-mono tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#d4af37]" />
            <span>CORE ENGINE v1.0.4</span>
          </div>
        )}
        <span className="hidden md:inline-block text-xs font-serif-title tracking-wider text-[#888888] border-l border-[#333333] pl-3">
          {isTh ? 'โหมดปรับแต่งปุ่มบังคับแบบเต็มจอ' : 'FULLSCREEN CONTROL CUSTOMIZER'}
        </span>
      </div>

      {/* Right side: Quick Control Toggles */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          onMouseEnter={() => audioEngine.playUiHover(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111]/90 hover:bg-[#1a1a1a] border border-[#333333] hover:border-[#d4af37]/40 text-[#f0f0f0] text-xs font-medium transition-all shadow-md active:scale-95 cursor-pointer"
          title={isTh ? 'สลับเป็นภาษาอังกฤษ' : 'Switch to Thai'}
        >
          <Globe className="w-3.5 h-3.5 text-[#d4af37]" />
          <span className="font-mono font-bold">{isTh ? 'TH 🇹🇭' : 'EN 🇬🇧'}</span>
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleMute}
          onMouseEnter={() => audioEngine.playUiHover(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted)}
          className={`p-2 rounded-lg border text-xs font-medium transition-all shadow-md active:scale-95 cursor-pointer ${
            settings.audio.muted
              ? 'bg-rose-950/60 border-rose-500/40 text-rose-400 hover:bg-rose-900/80'
              : 'bg-[#111111]/90 border border-[#333333] hover:border-[#d4af37]/40 text-[#f0f0f0] hover:bg-[#1a1a1a]'
          }`}
          title={settings.audio.muted ? (isTh ? 'เปิดเสียง' : 'Unmute') : (isTh ? 'ปิดเสียง' : 'Mute')}
        >
          {settings.audio.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#d4af37]" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          onMouseEnter={() => audioEngine.playUiHover(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] hover:bg-[#1a1a1a] border border-[#d4af37]/50 text-[#d4af37] text-xs font-medium transition-all gold-glow active:scale-95 cursor-pointer"
          title={isFullscreen ? (isTh ? 'ออกจากโหมดเต็มจอ' : 'Exit Fullscreen') : (isTh ? 'โหมดเต็มจอ' : 'Fullscreen')}
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline font-mono">{isFullscreen ? (isTh ? 'ย่อหน้าจอ' : 'WINDOW') : (isTh ? 'เต็มจอ' : 'FULLSCREEN')}</span>
        </button>
      </div>
    </header>
  );
};

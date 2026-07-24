import React from 'react';
import { motion } from 'motion/react';
import { GameSettings, CharacterHero } from '../types';
import { HEROES } from './CharacterSelectModal';
import { audioEngine } from '../utils/audio';
import { getKeyDisplayLabel } from '../utils/storage';
import { Play, Settings, User, HelpCircle, Info, Sparkles, ChevronRight, Keyboard, Shield } from 'lucide-react';

interface MainMenuProps {
  settings: GameSettings;
  selectedHeroId: 'blade' | 'ninja' | 'mage';
  logoUrl: string;
  onStartGame: () => void;
  onOpenOptions: () => void;
  onOpenCharacterSelect: () => void;
  onOpenGuide: () => void;
  onOpenCredits: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  settings,
  selectedHeroId,
  logoUrl,
  onStartGame,
  onOpenOptions,
  onOpenCharacterSelect,
  onOpenGuide,
  onOpenCredits,
}) => {
  const isTh = settings.gameplay.language === 'th';
  const hero = HEROES.find((h) => h.id === selectedHeroId) || HEROES[0];
  const bindings = settings.keybindings;

  const playClick = () =>
    audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
  const playHover = () =>
    audioEngine.playUiHover(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);

  return (
    <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-6 sm:p-12 overflow-y-auto select-none custom-scrollbar">
      {/* Top Header info */}
      <div className="w-full max-w-5xl flex justify-between items-center opacity-80 pt-12 sm:pt-4">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111]/90 border border-[#d4af37]/30 text-[11px] font-mono text-[#d4af37]">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
          <span className="tracking-widest uppercase">{isTh ? 'ระบบพร้อมใช้งาน' : 'ENGINE ACTIVE'}</span>
        </div>

        <div className="text-[11px] font-mono text-[#888888] tracking-widest">
          {isTh ? 'เวอร์ชัน 1.0.4' : 'VER 1.0.4'}
        </div>
      </div>

      {/* Main Center Area: Logo & Action Buttons */}
      <div className="flex flex-col items-center text-center my-auto py-6 max-w-2xl">
        {/* Logo display with sophisticated gold aura */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative group mb-6"
        >
          {/* Logo Radial Ambient Glow */}
          <div className="absolute -inset-6 bg-gradient-to-r from-[#d4af37]/20 via-[#f3e5ab]/15 to-[#d4af37]/20 rounded-full blur-3xl group-hover:opacity-100 transition-opacity duration-700 opacity-80" />

          <img
            src={logoUrl}
            alt="Game Logo"
            className="relative h-32 sm:h-44 md:h-52 object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.95)] filter brightness-105"
          />
        </motion.div>

        {/* Subtitle / Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs sm:text-sm font-serif-title tracking-widest text-[#d4af37]/90 uppercase mb-8 flex items-center justify-center gap-3"
        >
          <span className="inline-block w-10 h-[1px] bg-gradient-to-r from-transparent to-[#d4af37]/60" />
          {isTh ? 'ระบบควบคุมเกมและเมนูเข้าเล่นเต็มรูปแบบ' : 'FULLSCREEN CONTROL & OPTIONS ENGINE'}
          <span className="inline-block w-10 h-[1px] bg-gradient-to-l from-transparent to-[#d4af37]/60" />
        </motion.p>

        {/* Primary Action Buttons Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm space-y-3.5"
        >
          {/* START GAME Button - Sophisticated Gold Theme */}
          <button
            onClick={() => {
              playClick();
              onStartGame();
            }}
            onMouseEnter={playHover}
            className="group relative w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] bg-[length:200%_auto] hover:bg-right font-black text-sm sm:text-base text-[#050505] uppercase tracking-wider transition-all duration-300 gold-glow hover:gold-glow-lg active:scale-98 flex items-center justify-center gap-3 cursor-pointer overflow-hidden border border-[#f3e5ab]"
          >
            <Play className="w-5 h-5 fill-[#050505] transition-transform group-hover:scale-120" />
            <span className="font-bold tracking-widest">{isTh ? 'เข้าเล่นเกม (START GAME)' : 'START GAME'}</span>
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          {/* OPTIONS Button */}
          <button
            onClick={() => {
              playClick();
              onOpenOptions();
            }}
            onMouseEnter={playHover}
            className="group w-full py-3.5 rounded-xl bg-[#111111]/90 hover:bg-[#1a1a1a] border border-[#d4af37]/40 hover:border-[#d4af37] font-semibold text-xs sm:text-sm text-[#f0f0f0] tracking-wider transition-all duration-200 shadow-md active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-[#d4af37] group-hover:rotate-90 transition-transform" />
            <span>{isTh ? 'ตัวเลือก & ปรับแต่งปุ่ม (OPTIONS)' : 'OPTIONS & CONTROLS'}</span>
          </button>

          {/* Secondary Buttons Grid */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            {/* Character Select */}
            <button
              onClick={() => {
                playClick();
                onOpenCharacterSelect();
              }}
              onMouseEnter={playHover}
              className="py-3 px-2 rounded-xl bg-[#111111]/80 hover:bg-[#1a1a1a] border border-[#333333] hover:border-[#d4af37]/50 text-xs text-[#cccccc] hover:text-[#f0f0f0] transition-all flex flex-col items-center justify-center gap-1 cursor-pointer shadow-sm"
              title={isTh ? 'เลือกตัวละคร' : 'Select Hero'}
            >
              <User className="w-4 h-4 text-[#d4af37]" />
              <span className="text-[10px] font-medium tracking-wider">{isTh ? 'ตัวละคร' : 'HERO'}</span>
            </button>

            {/* Controls Guide */}
            <button
              onClick={() => {
                playClick();
                onOpenGuide();
              }}
              onMouseEnter={playHover}
              className="py-3 px-2 rounded-xl bg-[#111111]/80 hover:bg-[#1a1a1a] border border-[#333333] hover:border-[#d4af37]/50 text-xs text-[#cccccc] hover:text-[#f0f0f0] transition-all flex flex-col items-center justify-center gap-1 cursor-pointer shadow-sm"
              title={isTh ? 'คู่มือการบังคับ' : 'Controls Guide'}
            >
              <HelpCircle className="w-4 h-4 text-[#d4af37]" />
              <span className="text-[10px] font-medium tracking-wider">{isTh ? 'คู่มือ' : 'GUIDE'}</span>
            </button>

            {/* Credits */}
            <button
              onClick={() => {
                playClick();
                onOpenCredits();
              }}
              onMouseEnter={playHover}
              className="py-3 px-2 rounded-xl bg-[#111111]/80 hover:bg-[#1a1a1a] border border-[#333333] hover:border-[#d4af37]/50 text-xs text-[#cccccc] hover:text-[#f0f0f0] transition-all flex flex-col items-center justify-center gap-1 cursor-pointer shadow-sm"
              title={isTh ? 'เครดิตผู้สร้าง' : 'Credits'}
            >
              <Info className="w-4 h-4 text-[#d4af37]" />
              <span className="text-[10px] font-medium tracking-wider">{isTh ? 'เครดิต' : 'CREDITS'}</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Loadout Preview Card */}
      <div className="w-full max-w-4xl p-4 rounded-xl bg-[#0c0c0c]/85 border border-[#2a2a2a] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-lg">
        {/* Selected Hero summary */}
        <div className="flex items-center gap-3">
          <div className="text-xl p-2 rounded-lg bg-[#141414] border border-[#d4af37]/30 text-[#d4af37]">
            {hero.avatarIcon}
          </div>
          <div className="text-left">
            <span className="text-[10px] font-mono text-[#888888] block uppercase tracking-wider">
              {isTh ? 'ตัวละครที่เลือกใช้งาน' : 'CURRENT HERO'}
            </span>
            <span className="font-semibold text-[#f0f0f0]">{isTh ? hero.nameTh : hero.nameEn}</span>
          </div>
        </div>

        {/* Keybinding Summary */}
        <div className="flex items-center gap-2 text-[#888888] font-mono text-[11px] tracking-wide">
          <Keyboard className="w-4 h-4 text-[#d4af37]" />
          <span>
            {isTh ? 'โจมตี:' : 'ATK:'}{' '}
            <strong className="text-[#d4af37]">{getKeyDisplayLabel(bindings.attack)}</strong> |{' '}
            {isTh ? 'กระโดด:' : 'JUMP:'}{' '}
            <strong className="text-[#d4af37]">{getKeyDisplayLabel(bindings.jump)}</strong> |{' '}
            {isTh ? 'พุ่ง:' : 'DASH:'}{' '}
            <strong className="text-[#d4af37]">{getKeyDisplayLabel(bindings.dash)}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { GameSettings } from '../types';
import { getKeyDisplayLabel } from '../utils/storage';
import { audioEngine } from '../utils/audio';
import { X, Gamepad, Keyboard, Smartphone, HelpCircle } from 'lucide-react';

interface ControlsGuideModalProps {
  settings: GameSettings;
  onClose: () => void;
}

export const ControlsGuideModal: React.FC<ControlsGuideModalProps> = ({ settings, onClose }) => {
  const isTh = settings.gameplay.language === 'th';
  const bindings = settings.keybindings;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-[0_0_50px_rgba(15,23,42,0.9)] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950 border border-amber-500/40 text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                {isTh ? 'คู่มือการบังคับและการเล่น (CONTROLS GUIDE)' : 'CONTROLS GUIDE'}
              </h2>
              <p className="text-xs text-slate-400">
                {isTh ? 'ตารางสรุปปุ่มควบคุมตัวละครปัจจุบันของคุณ' : 'Summary diagram of your current control layout'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Keyboard Layout Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#d4af37] uppercase tracking-wider">
              <Keyboard className="w-4 h-4 text-[#d4af37]" />
              <span>{isTh ? 'คีย์บอร์ดบังคับเกม (Keyboard Controls)' : 'Keyboard Controls'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: isTh ? 'เดิน 8 ทิศทาง' : '8-Direction Walk', val: 'W A S D / Arrow Keys (↑ ↓ ← →)' },
                { label: isTh ? 'ต่อย / โจมตี (Row 3 Frame)' : 'Punch / Attack (Row 3)', val: 'P Key / Attack' },
                { label: isTh ? 'เต้นสร้าง Skill (Row 4 Frame)' : 'Dance Skill (Row 4)', val: 'O Key / Skill' },
                { label: isTh ? 'หยุดเกม' : 'Pause Menu', val: 'ESC Key' },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#050505] border border-[#222222] flex flex-col justify-between shadow-sm">
                  <span className="text-[11px] text-[#888888]">{item.label}</span>
                  <span className="text-xs font-mono font-bold text-[#d4af37] mt-1">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Touch Controls Section */}
          <div className="space-y-3 pt-4 border-t border-[#222222]">
            <div className="flex items-center gap-2 text-xs font-mono text-[#d4af37] uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-[#d4af37]" />
              <span>{isTh ? 'ปุ่มสัมผัสหน้าจอ (On-Screen Touch Controls)' : 'Touchscreen Controls'}</span>
            </div>

            <div className="p-4 rounded-xl bg-[#050505] border border-[#222222] text-xs text-[#cccccc] space-y-2">
              <p>
                {isTh
                  ? '• ฝั่งซ้าย: ใช้ Virtual Joystick เลื่อนนิ้วเพื่อบังคับตัวละครเดิน 8 ทิศทางในฉาก 3D'
                  : '• Left Side: Drag the virtual joystick to move your character in 8 directions across the 3D ground.'}
              </p>
              <p>
                {isTh
                  ? '• ฝั่งขวา: แตะปุ่ม ATK (P) เพื่อต่อย/โจมตี หรือปุ่ม DANCE (O) เพื่อเต้นสร้าง Skill'
                  : '• Right Side: Tap ATK (P) to punch/attack or DANCE (O) to perform the dance skill.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 bg-slate-950/90 border-t border-slate-800">
          <button
            onClick={() => {
              audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            {isTh ? 'ปิดหน้าต่าง' : 'CLOSE'}
          </button>
        </div>
      </div>
    </div>
  );
};

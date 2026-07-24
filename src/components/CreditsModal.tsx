import React from 'react';
import { GameSettings } from '../types';
import { audioEngine } from '../utils/audio';
import { X, Heart, Shield, Sparkles } from 'lucide-react';

interface CreditsModalProps {
  settings: GameSettings;
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ settings, onClose }) => {
  const isTh = settings.gameplay.language === 'th';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center">
        <button
          onClick={() => {
            audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            {isTh ? 'เกี่ยวกับเกมและระบบควบคุม' : 'CREDITS & ENGINE'}
          </h2>
          <p className="text-xs text-slate-400">
            {isTh ? 'สร้างขึ้นด้วย React, HTML5 Canvas และ Web Audio API' : 'Powered by React, HTML5 Canvas & Web Audio Synthesizer'}
          </p>
        </div>

        <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
          <p className="font-semibold text-cyan-300">
            {isTh ? '• โลโก้เกมอย่างเป็นทางการ' : '• Official Game Logo Asset'}
          </p>
          <p className="text-[11px] font-mono text-slate-400 break-all">
            https://res.cloudinary.com/dgkx0llhf/image/upload/v1783489386/logo_i8827v_k4lnkz.png
          </p>
          <p className="pt-2 text-slate-400">
            {isTh
              ? 'รองรับการปรับแต่งคีย์บอร์ดแบบโต้ตอบ การซ้อนปุ่มสัมผัสบนมือถือ เอฟเฟกต์เสียงสังเคราะห์ และฉากทดลองเล่นเต็มรูปแบบ'
              : 'Features responsive remapping, touchscreen overlay, synth sound effects, and full screen gameplay.'}
          </p>
        </div>

        <button
          onClick={() => {
            audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)]"
        >
          {isTh ? 'ปิด' : 'CLOSE'}
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ActionKey, Keybindings, GameSettings } from '../types';
import { getKeyDisplayLabel, DEFAULT_KEYBINDINGS_WASD, DEFAULT_KEYBINDINGS_ARROWS } from '../utils/storage';
import { audioEngine } from '../utils/audio';
import { Keyboard, AlertCircle, RotateCcw, Check, Sparkles } from 'lucide-react';

interface KeyRemapperProps {
  settings: GameSettings;
  onUpdateKeybindings: (newKeybindings: Keybindings) => void;
}

export const KeyRemapper: React.FC<KeyRemapperProps> = ({ settings, onUpdateKeybindings }) => {
  const [listeningAction, setListeningAction] = useState<ActionKey | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const isTh = settings.gameplay.language === 'th';
  const bindings = settings.keybindings;

  const actionLabels: Record<ActionKey, { th: string; en: string; icon: string }> = {
    moveLeft: { th: 'เดินซ้าย (Move Left)', en: 'Move Left', icon: '←' },
    moveRight: { th: 'เดินขวา (Move Right)', en: 'Move Right', icon: '→' },
    moveUp: { th: 'ปีน/ขึ้น (Move Up)', en: 'Move Up / Climb', icon: '↑' },
    moveDown: { th: 'ก้ม/ลง (Move Down)', en: 'Move Down / Crouch', icon: '↓' },
    jump: { th: 'กระโดด (Jump)', en: 'Jump', icon: '⬆' },
    dash: { th: 'พุ่งตัว/แดช (Dash)', en: 'Dash / Roll', icon: '⚡' },
    attack: { th: 'โจมตีปกติ (Basic Attack)', en: 'Basic Attack', icon: '⚔️' },
    skill1: { th: 'สกิล 1 (Skill 1)', en: 'Skill 1', icon: '🔥' },
    skill2: { th: 'สกิล 2 (Skill 2 / Ultimate)', en: 'Skill 2 / Ultimate', icon: '💥' },
    interact: { th: 'สำรวจ/โต้ตอบ (Interact)', en: 'Interact', icon: '🖐️' },
    pause: { th: 'หยุดเกม/เมนู (Pause Menu)', en: 'Pause Menu', icon: '⏸️' },
  };

  useEffect(() => {
    if (!listeningAction) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const pressedCode = e.code;

      // Check for duplicates
      const existingAction = (Object.keys(bindings) as ActionKey[]).find(
        (key) => key !== listeningAction && bindings[key] === pressedCode
      );

      if (existingAction) {
        const dupLabel = isTh ? actionLabels[existingAction].th : actionLabels[existingAction].en;
        setDuplicateWarning(
          isTh
            ? `ปุ่ม ${getKeyDisplayLabel(pressedCode)} ถูกใช้งานโดย "${dupLabel}" แล้ว`
            : `Key ${getKeyDisplayLabel(pressedCode)} is already mapped to "${dupLabel}"`
        );
      } else {
        setDuplicateWarning(null);
      }

      // Update keybinding
      const updated = {
        ...bindings,
        [listeningAction]: pressedCode,
      };

      onUpdateKeybindings(updated);
      audioEngine.playKeyRebind(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
      setListeningAction(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listeningAction, bindings, isTh, onUpdateKeybindings, settings.audio]);

  const applyPreset = (preset: Keybindings) => {
    audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
    onUpdateKeybindings(preset);
    setDuplicateWarning(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Presets */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              {isTh ? 'ตั้งค่าปุ่มคีย์บอร์ด (Keybindings)' : 'Keyboard Keybindings'}
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">
              {isTh ? 'คลิกที่ปุ่มที่ต้องการเปลี่ยน แล้วกดปุ่มบนคีย์บอร์ดเพื่อตั้งค่าใหม่' : 'Click a button to change, then press any key on your keyboard'}
            </p>
          </div>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => applyPreset(DEFAULT_KEYBINDINGS_WASD)}
            onMouseEnter={() => audioEngine.playUiHover(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-cyan-300 transition-all cursor-pointer"
          >
            WASD + J/K/L
          </button>
          <button
            onClick={() => applyPreset(DEFAULT_KEYBINDINGS_ARROWS)}
            onMouseEnter={() => audioEngine.playUiHover(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-amber-300 transition-all cursor-pointer"
          >
            ARROWS + Z/X/C
          </button>
        </div>
      </div>

      {/* Warning Bar if Duplicate */}
      {duplicateWarning && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-950/70 border border-amber-500/50 text-amber-300 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{duplicateWarning}</span>
        </div>
      )}

      {/* Keybinding Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
        {(Object.keys(actionLabels) as ActionKey[]).map((action) => {
          const info = actionLabels[action];
          const isListening = listeningAction === action;
          const currentCode = bindings[action];
          const displayLabel = getKeyDisplayLabel(currentCode);

          return (
            <div
              key={action}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isListening
                  ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-[1.01]'
                  : 'bg-slate-900/50 hover:bg-slate-800/60 border-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base select-none">{info.icon}</span>
                <span className="text-xs font-medium text-slate-200">{isTh ? info.th : info.en}</span>
              </div>

              <button
                onClick={() => {
                  audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
                  setListeningAction(isListening ? null : action);
                  setDuplicateWarning(null);
                }}
                onMouseEnter={() => audioEngine.playUiHover(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted)}
                className={`min-w-[100px] px-3 py-2 rounded-lg font-mono text-xs font-bold transition-all border cursor-pointer ${
                  isListening
                    ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-950 hover:bg-cyan-950/80 border-slate-700 text-cyan-300 hover:border-cyan-500/50'
                }`}
              >
                {isListening ? (isTh ? 'กดปุ่มใหม่...' : 'PRESS KEY...') : displayLabel}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

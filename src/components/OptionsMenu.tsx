import React, { useState } from 'react';
import { GameSettings, Keybindings, TouchSettings, AudioSettings, GraphicsSettings, GameplaySettings } from '../types';
import { KeyRemapper } from './KeyRemapper';
import { TouchControlsPreview } from './TouchControlsPreview';
import { DEFAULT_SETTINGS } from '../utils/storage';
import { audioEngine } from '../utils/audio';
import { Settings, Gamepad2, Volume2, Monitor, SlidersHorizontal, RotateCcw, X, Check, Play } from 'lucide-react';

interface OptionsMenuProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const OptionsMenu: React.FC<OptionsMenuProps> = ({ settings, onUpdateSettings, onClose }) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'audio' | 'graphics' | 'gameplay'>('controls');
  const isTh = settings.gameplay.language === 'th';

  const handleUpdateKeybindings = (newKeybindings: Keybindings) => {
    onUpdateSettings({
      ...settings,
      keybindings: newKeybindings,
    });
  };

  const handleUpdateTouch = (newTouch: TouchSettings) => {
    onUpdateSettings({
      ...settings,
      touch: newTouch,
    });
  };

  const handleUpdateAudio = (newAudio: AudioSettings) => {
    onUpdateSettings({
      ...settings,
      audio: newAudio,
    });
  };

  const handleUpdateGraphics = (newGraphics: GraphicsSettings) => {
    onUpdateSettings({
      ...settings,
      graphics: newGraphics,
    });
  };

  const handleUpdateGameplay = (newGameplay: GameplaySettings) => {
    onUpdateSettings({
      ...settings,
      gameplay: newGameplay,
    });
  };

  const handleResetAll = () => {
    audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
    if (window.confirm(isTh ? 'คุณต้องการรีเซ็ตการตั้งค่าทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?' : 'Reset all settings to default?')) {
      onUpdateSettings(DEFAULT_SETTINGS);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#030303]/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0c0c0c] border border-[#d4af37]/30 shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#050505] border-b border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#141414] border border-[#d4af37]/40 text-[#d4af37]">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif-title font-bold text-[#f0f0f0] flex items-center gap-2 tracking-wide">
                {isTh ? 'ตัวเลือกและการตั้งค่า (OPTIONS & CONTROLS)' : 'SETTINGS & OPTIONS'}
              </h2>
              <p className="text-xs text-[#888888]">
                {isTh ? 'ปรับแต่งปุ่มบังคับ เสียง กราฟิก และโหมดการเล่น' : 'Customize keybindings, audio, graphics, and controls'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
              onClose();
            }}
            onMouseEnter={() => audioEngine.playUiHover(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted)}
            className="p-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] text-[#888888] hover:text-[#f0f0f0] transition-all cursor-pointer border border-[#333333]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-[#222222] bg-[#080808] overflow-x-auto custom-scrollbar">
          <button
            onClick={() => {
              audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
              setActiveTab('controls');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'controls'
                ? 'bg-[#0c0c0c] border-[#d4af37] text-[#d4af37]'
                : 'border-transparent text-[#888888] hover:text-[#f0f0f0] hover:bg-[#111111]'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>{isTh ? 'การบังคับ (CONTROLS)' : 'CONTROLS'}</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
              setActiveTab('audio');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'audio'
                ? 'bg-[#0c0c0c] border-[#d4af37] text-[#d4af37]'
                : 'border-transparent text-[#888888] hover:text-[#f0f0f0] hover:bg-[#111111]'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isTh ? 'ระบบเสียง (AUDIO)' : 'AUDIO'}</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
              setActiveTab('graphics');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'graphics'
                ? 'bg-[#0c0c0c] border-[#d4af37] text-[#d4af37]'
                : 'border-transparent text-[#888888] hover:text-[#f0f0f0] hover:bg-[#111111]'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>{isTh ? 'กราฟิก (GRAPHICS)' : 'GRAPHICS'}</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
              setActiveTab('gameplay');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'gameplay'
                ? 'bg-[#0c0c0c] border-[#d4af37] text-[#d4af37]'
                : 'border-transparent text-[#888888] hover:text-[#f0f0f0] hover:bg-[#111111]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{isTh ? 'เกมเพลย์ (GAMEPLAY)' : 'GAMEPLAY'}</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Controls Tab */}
          {activeTab === 'controls' && (
            <div className="space-y-8">
              <KeyRemapper settings={settings} onUpdateKeybindings={handleUpdateKeybindings} />
              <TouchControlsPreview settings={settings} onUpdateTouchSettings={handleUpdateTouch} />
            </div>
          )}

          {/* Audio Tab */}
          {activeTab === 'audio' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Master Volume */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200 font-medium">{isTh ? 'ระดับเสียงรวม (Master Volume)' : 'Master Volume'}</span>
                    <span className="font-mono text-cyan-400 font-bold">{settings.audio.masterVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.audio.masterVolume}
                    onChange={(e) =>
                      handleUpdateAudio({ ...settings.audio, masterVolume: parseInt(e.target.value) })
                    }
                    className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Music Volume */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200 font-medium">{isTh ? 'เสียงดนตรีประกอบ (Music Volume)' : 'Music Volume'}</span>
                    <span className="font-mono text-emerald-400 font-bold">{settings.audio.musicVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.audio.musicVolume}
                    onChange={(e) => {
                      const newVol = parseInt(e.target.value);
                      handleUpdateAudio({ ...settings.audio, musicVolume: newVol });
                    }}
                    className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* SFX Volume */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200 font-medium">{isTh ? 'เสียงเอฟเฟกต์การต่อสู้ (SFX Volume)' : 'Sound Effects (SFX)'}</span>
                    <span className="font-mono text-amber-400 font-bold">{settings.audio.sfxVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.audio.sfxVolume}
                    onChange={(e) =>
                      handleUpdateAudio({ ...settings.audio, sfxVolume: parseInt(e.target.value) })
                    }
                    className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* UI Volume */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200 font-medium">{isTh ? 'เสียงอินเตอร์เฟส (UI Beep Volume)' : 'UI Sound Volume'}</span>
                    <span className="font-mono text-purple-400 font-bold">{settings.audio.uiVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.audio.uiVolume}
                    onChange={(e) =>
                      handleUpdateAudio({ ...settings.audio, uiVolume: parseInt(e.target.value) })
                    }
                    className="w-full accent-purple-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Test Audio Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() =>
                    audioEngine.playSkill(settings.audio.masterVolume, settings.audio.sfxVolume, settings.audio.muted)
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isTh ? 'ทดสอบเสียงเอฟเฟกต์ (Test SFX)' : 'Test Sound Effect'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Graphics Tab */}
          {activeTab === 'graphics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target FPS */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <span className="text-xs font-medium text-slate-200 block">
                    {isTh ? 'จำกัดเฟรมเรตสูงสุด (Target FPS)' : 'Target Frame Rate'}
                  </span>
                  <div className="flex gap-2">
                    {[30, 60, 120].map((fps) => (
                      <button
                        key={fps}
                        onClick={() =>
                          handleUpdateGraphics({ ...settings.graphics, targetFps: fps as 30 | 60 | 120 })
                        }
                        className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                          settings.graphics.targetFps === fps
                            ? 'bg-purple-950 border-purple-400 text-purple-300 shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {fps} FPS
                      </button>
                    ))}
                  </div>
                </div>

                {/* Particle Quality */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <span className="text-xs font-medium text-slate-200 block">
                    {isTh ? 'ความหนาแน่นพาร์ติเคิล (Particle Quality)' : 'Particle Quality'}
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['low', 'medium', 'high', 'ultra'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => handleUpdateGraphics({ ...settings.graphics, particles: level })}
                        className={`py-2 rounded-xl text-xs font-mono font-bold capitalize border transition-all cursor-pointer ${
                          settings.graphics.particles === level
                            ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Screen Shake Toggle */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-slate-200 block">
                      {isTh ? 'เอฟเฟกต์หน้าจอสั่น (Screen Shake)' : 'Screen Shake Effect'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isTh ? 'สั่นหน้าจอเมื่อโจมตีรุนแรง' : 'Shake camera during heavy strikes'}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleUpdateGraphics({ ...settings.graphics, screenShake: !settings.graphics.screenShake })
                    }
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                      settings.graphics.screenShake ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.graphics.screenShake ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Bloom Glow Toggle */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-slate-200 block">
                      {isTh ? 'เอฟเฟกต์เรืองแสง (Bloom Glow)' : 'Bloom Glow Lighting'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isTh ? 'แสงเรืองรอบอาวุธและพาร์ติเคิล' : 'Enable glow filters on energy strikes'}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleUpdateGraphics({ ...settings.graphics, bloomGlow: !settings.graphics.bloomGlow })
                    }
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                      settings.graphics.bloomGlow ? 'bg-purple-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.graphics.bloomGlow ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Gameplay Tab */}
          {activeTab === 'gameplay' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-200 block">
                    {isTh ? 'แสดงตัวเลขความเสียหาย (Damage Floating Numbers)' : 'Show Damage Numbers'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isTh ? 'แสดงตัวเลขความเสียหายลอยขณะโจมตีศัตรู' : 'Display damage floaters on hit'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleUpdateGameplay({
                      ...settings.gameplay,
                      showDamageNumbers: !settings.gameplay.showDamageNumbers,
                    })
                  }
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                    settings.gameplay.showDamageNumbers ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.gameplay.showDamageNumbers ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-200 block">
                    {isTh ? 'แสดงหลอดเลือดเป้าหมาย (Health Bars)' : 'Show Enemy Health Bars'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isTh ? 'แสดงหลอดพลังชีวิตบนหัวหุ่นซ้อม' : 'Display HP bars above targets'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleUpdateGameplay({
                      ...settings.gameplay,
                      showHealthBars: !settings.gameplay.showHealthBars,
                    })
                  }
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                    settings.gameplay.showHealthBars ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.gameplay.showHealthBars ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#050505] border-t border-[#222222]">
          <button
            onClick={handleResetAll}
            onMouseEnter={() => audioEngine.playUiHover(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted)}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isTh ? 'รีเซ็ตค่าทั้งหมด (Reset All)' : 'Reset All Defaults'}</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
              onClose();
            }}
            onMouseEnter={() => audioEngine.playUiHover(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#f3e5ab] text-[#050505] font-bold text-xs transition-all gold-glow hover:gold-glow-lg active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isTh ? 'บันทึกและเรียบร้อย (SAVE & CLOSE)' : 'SAVE & CLOSE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

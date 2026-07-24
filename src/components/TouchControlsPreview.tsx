import React from 'react';
import { GameSettings, TouchSettings } from '../types';
import { audioEngine } from '../utils/audio';
import { Smartphone, Sliders, Eye, Radio } from 'lucide-react';

interface TouchControlsPreviewProps {
  settings: GameSettings;
  onUpdateTouchSettings: (newTouch: TouchSettings) => void;
}

export const TouchControlsPreview: React.FC<TouchControlsPreviewProps> = ({ settings, onUpdateTouchSettings }) => {
  const isTh = settings.gameplay.language === 'th';
  const touch = settings.touch;

  const handleToggleEnable = () => {
    audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
    onUpdateTouchSettings({
      ...touch,
      enabled: !touch.enabled,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              {isTh ? 'ปุ่มสัมผัสบนหน้าจอ (Touch & Mobile Controls)' : 'On-Screen Touch Controls'}
            </h3>
            <p className="text-xs text-slate-400">
              {isTh ? 'เปิดการใช้งานและปรับขนาดปุ่มสำหรับหน้าจอสัมผัสหรือมือถือ' : 'Configure joystick and action buttons for touch devices'}
            </p>
          </div>
        </div>

        {/* Enable Toggle Button */}
        <button
          onClick={handleToggleEnable}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer ${
            touch.enabled
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${touch.enabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          <span>{touch.enabled ? (isTh ? 'เปิดใช้งาน (ENABLED)' : 'ENABLED') : (isTh ? 'ปิดใช้งาน (DISABLED)' : 'DISABLED')}</span>
        </button>
      </div>

      {touch.enabled && (
        <>
          {/* Settings Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opacity Slider */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  {isTh ? 'ความโปร่งใส (Opacity)' : 'Button Opacity'}
                </span>
                <span className="font-mono text-cyan-400 font-bold">{Math.round(touch.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={touch.opacity}
                onChange={(e) =>
                  onUpdateTouchSettings({ ...touch, opacity: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Joystick Scale */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  {isTh ? 'ขนาดจอยสติ๊ก (Joystick Scale)' : 'Joystick Size'}
                </span>
                <span className="font-mono text-purple-400 font-bold">{touch.joystickScale.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.1"
                value={touch.joystickScale}
                onChange={(e) =>
                  onUpdateTouchSettings({ ...touch, joystickScale: parseFloat(e.target.value) })
                }
                className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Action Buttons Scale */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-rose-400" />
                  {isTh ? 'ขนาดปุ่มแอคชั่น (Buttons Scale)' : 'Action Buttons Size'}
                </span>
                <span className="font-mono text-rose-400 font-bold">{touch.buttonScale.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.1"
                value={touch.buttonScale}
                onChange={(e) =>
                  onUpdateTouchSettings({ ...touch, buttonScale: parseFloat(e.target.value) })
                }
                className="w-full accent-rose-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Haptic Vibration Toggle */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-300 font-medium">
                  {isTh ? 'ระบบสั่นเมื่อกด (Haptic Feedback)' : 'Haptic Feedback'}
                </span>
              </div>
              <button
                onClick={() => onUpdateTouchSettings({ ...touch, vibration: !touch.vibration })}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  touch.vibration ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    touch.vibration ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Interactive Live Layout Simulator */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block text-center">
              {isTh ? '— ตัวอย่างเลย์เอาต์บนหน้าจอสด (LIVE UI PREVIEW) —' : '— LIVE UI PREVIEW —'}
            </span>

            <div
              className="relative w-full h-44 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 overflow-hidden flex items-end justify-between p-4"
              style={{ opacity: touch.opacity }}
            >
              {/* Virtual D-Pad / Joystick Preview */}
              <div
                className="relative rounded-full border-2 border-cyan-500/50 bg-cyan-950/30 flex items-center justify-center transition-all"
                style={{
                  width: `${80 * touch.joystickScale}px`,
                  height: `${80 * touch.joystickScale}px`,
                }}
              >
                <div className="w-8 h-8 rounded-full bg-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              </div>

              {/* Action Buttons Cluster Preview */}
              <div className="relative flex flex-col gap-2 items-end">
                <div className="flex gap-2">
                  <div
                    className="rounded-full bg-amber-500/30 border border-amber-400 flex items-center justify-center font-bold text-amber-300 text-xs shadow-md"
                    style={{
                      width: `${40 * touch.buttonScale}px`,
                      height: `${40 * touch.buttonScale}px`,
                    }}
                  >
                    SK1
                  </div>
                  <div
                    className="rounded-full bg-purple-500/30 border border-purple-400 flex items-center justify-center font-bold text-purple-300 text-xs shadow-md"
                    style={{
                      width: `${40 * touch.buttonScale}px`,
                      height: `${40 * touch.buttonScale}px`,
                    }}
                  >
                    SK2
                  </div>
                </div>

                <div className="flex gap-2">
                  <div
                    className="rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center font-bold text-emerald-300 text-xs shadow-md"
                    style={{
                      width: `${48 * touch.buttonScale}px`,
                      height: `${48 * touch.buttonScale}px`,
                    }}
                  >
                    ATK
                  </div>
                  <div
                    className="rounded-full bg-cyan-500/30 border border-cyan-400 flex items-center justify-center font-bold text-cyan-300 text-xs shadow-md"
                    style={{
                      width: `${44 * touch.buttonScale}px`,
                      height: `${44 * touch.buttonScale}px`,
                    }}
                  >
                    JUMP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

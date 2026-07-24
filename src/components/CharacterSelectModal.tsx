import React from 'react';
import { CharacterHero, GameSettings } from '../types';
import { audioEngine } from '../utils/audio';
import { X, Sword, Zap, Shield, Check, Sparkles } from 'lucide-react';

export const HEROES: CharacterHero[] = [
  {
    id: 'blade',
    nameTh: 'เบลด มาสเตอร์ (Blade Master)',
    nameEn: 'Blade Master',
    roleTh: 'นักดาบประจัญบาน (Melee Duelist)',
    roleEn: 'Melee Duelist',
    descriptionTh: 'ถนัดการฟันฟันดาบระยะประชิด ทำคอมโบฟันต่อเนื่องและแดชพุ่งเข้าหาศัตรูอย่างรวดเร็ว',
    descriptionEn: 'Specializes in rapid sword slashes, combos, and dashing thrusts.',
    color: '#06b6d4', // Cyan
    secondaryColor: '#3b82f6',
    avatarIcon: '⚔️',
    stats: { speed: 85, power: 80, range: 45 },
    skills: {
      attackName: 'ฟันฟันดาบคู่ (Twin Slash)',
      skill1Name: 'ดาบหมุนพายุ (Whirlwind)',
      skill2Name: 'ดาบทลายมิติ (Dimension Cut)',
    },
  },
  {
    id: 'ninja',
    nameTh: 'แชโดว์ นินจา (Shadow Ninja)',
    nameEn: 'Shadow Ninja',
    roleTh: 'นินจาความเร็วสูง (Agile Assassin)',
    roleEn: 'Agile Assassin',
    descriptionTh: 'เน้นความว่องไว ปาดาวกระจายจากระยะไกล และแดชวาร์ปผ่านศัตรูอย่างรวดเร็ว',
    descriptionEn: 'High speed mobility, throws shurikens, and shadow steps through targets.',
    color: '#a855f7', // Purple
    secondaryColor: '#ec4899',
    avatarIcon: '🥷',
    stats: { speed: 98, power: 70, range: 75 },
    skills: {
      attackName: 'ดาวกระจายแสง (Shuriken Toss)',
      skill1Name: 'วาร์ปเงาสังหาร (Shadow Step)',
      skill2Name: 'ระเบิดร่างเงา (Phantom Burst)',
    },
  },
  {
    id: 'mage',
    nameTh: 'ไซเบอร์ เมจ (Cyber Mage)',
    nameEn: 'Cyber Mage',
    roleTh: 'จอมเวทพลังงานไซเบอร์ (Energy Caster)',
    roleEn: 'Energy Caster',
    descriptionTh: 'ยิงกระสุนพลาสม่าพลังงานสูง กางบาเรีย และเรียกเลเซอร์ออร์บิทัลโจมตีวงกว้าง',
    descriptionEn: 'Fires high-energy plasma bolts, projects forcefields, and launches orbital lasers.',
    color: '#f59e0b', // Amber
    secondaryColor: '#ef4444',
    avatarIcon: '🔮',
    stats: { speed: 65, power: 95, range: 90 },
    skills: {
      attackName: 'พลาสม่าโบลต์ (Plasma Bolt)',
      skill1Name: 'บาเรียสะท้อน (Energy Shield)',
      skill2Name: 'ออร์บิทัลบีม (Orbital Laser)',
    },
  },
];

interface CharacterSelectModalProps {
  selectedHeroId: 'blade' | 'ninja' | 'mage';
  onSelectHero: (heroId: 'blade' | 'ninja' | 'mage') => void;
  settings: GameSettings;
  onClose: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  selectedHeroId,
  onSelectHero,
  settings,
  onClose,
}) => {
  const isTh = settings.gameplay.language === 'th';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-[0_0_50px_rgba(15,23,42,0.9)] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-500/40 text-purple-400">
              <Sword className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                {isTh ? 'เลือกตัวละครผู้กล้า (SELECT HERO)' : 'SELECT YOUR HERO'}
              </h2>
              <p className="text-xs text-slate-400">
                {isTh ? 'เลือกตัวละครเพื่อทดสอบปุ่มบังคับและคอมโบในฉากทดลองเล่น' : 'Choose a character to test controls and skill combos in action'}
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

        {/* Heroes Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-4 custom-scrollbar">
          {HEROES.map((hero) => {
            const isSelected = selectedHeroId === hero.id;

            return (
              <div
                key={hero.id}
                onClick={() => {
                  audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
                  onSelectHero(hero.id);
                }}
                onMouseEnter={() => audioEngine.playUiHover(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted)}
                className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] scale-[1.02]'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-950/80 hover:border-slate-700'
                }`}
              >
                {/* Hero Top Tag */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl select-none group-hover:scale-110 transition-transform">
                    {hero.avatarIcon}
                  </span>
                  {isSelected && (
                    <div className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{isTh ? 'เลือกแล้ว' : 'SELECTED'}</span>
                    </div>
                  )}
                </div>

                {/* Hero Info */}
                <div className="space-y-2 mb-4">
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {isTh ? hero.nameTh : hero.nameEn}
                  </h3>
                  <span className="text-[11px] font-mono text-cyan-400/90 block">
                    {isTh ? hero.roleTh : hero.roleEn}
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isTh ? hero.descriptionTh : hero.descriptionEn}
                  </p>
                </div>

                {/* Stat Bars */}
                <div className="space-y-2 pt-3 border-t border-slate-800/80 text-[11px]">
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>{isTh ? 'ความเร็ว (SPEED)' : 'SPEED'}</span>
                      <span className="font-mono text-slate-200">{hero.stats.speed}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${hero.stats.speed}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>{isTh ? 'พลังโจมตี (POWER)' : 'POWER'}</span>
                      <span className="font-mono text-slate-200">{hero.stats.power}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-rose-400 rounded-full" style={{ width: `${hero.stats.power}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>{isTh ? 'ระยะโจมตี (RANGE)' : 'RANGE'}</span>
                      <span className="font-mono text-slate-200">{hero.stats.range}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-purple-400 rounded-full" style={{ width: `${hero.stats.range}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-slate-950/90 border-t border-slate-800">
          <button
            onClick={() => {
              audioEngine.playUiClick(settings.audio.masterVolume, settings.audio.uiVolume, settings.audio.muted);
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            {isTh ? 'ยืนยันเลือกฮีโร่' : 'CONFIRM HERO'}
          </button>
        </div>
      </div>
    </div>
  );
};

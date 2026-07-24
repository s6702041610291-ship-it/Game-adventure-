import React, { useState, useEffect } from 'react';
import { GameSettings, MenuScreen } from './types';
import { loadSettings, saveSettings } from './utils/storage';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { HeaderBar } from './components/HeaderBar';
import { MainMenu } from './components/MainMenu';
import { OptionsMenu } from './components/OptionsMenu';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { ControlsGuideModal } from './components/ControlsGuideModal';
import { CreditsModal } from './components/CreditsModal';
import { GameCanvas } from './components/GameCanvas';

const LOGO_URL = 'https://res.cloudinary.com/dgkx0llhf/image/upload/v1783489386/logo_i8827v_k4lnkz.png';

export default function App() {
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [currentScreen, setCurrentScreen] = useState<MenuScreen>('main');
  const [selectedHeroId, setSelectedHeroId] = useState<'blade' | 'ninja' | 'mage'>('blade');

  // Save settings on update
  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none bg-slate-950 font-sans text-slate-100">
      {/* Animated Starfield / Particle Background (Active on Main Menu & Options) */}
      {currentScreen !== 'playing' && (
        <BackgroundCanvas particleDensity={settings.graphics.particles} />
      )}

      {/* Persistent Header Bar (Title, Fullscreen Toggle, Sound Mute, Language Switch) */}
      {currentScreen !== 'playing' && (
        <HeaderBar
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          titleLogo={LOGO_URL}
        />
      )}

      {/* Main Screen Layout */}
      {currentScreen === 'main' && (
        <MainMenu
          settings={settings}
          selectedHeroId={selectedHeroId}
          logoUrl={LOGO_URL}
          onStartGame={() => setCurrentScreen('playing')}
          onOpenOptions={() => setCurrentScreen('options')}
          onOpenCharacterSelect={() => setCurrentScreen('character_select')}
          onOpenGuide={() => setCurrentScreen('how_to_play')}
          onOpenCredits={() => setCurrentScreen('credits')}
        />
      )}

      {/* Interactive Gameplay Stage */}
      {currentScreen === 'playing' && (
        <GameCanvas
          settings={settings}
          selectedHeroId={selectedHeroId}
          onOpenOptions={() => setCurrentScreen('options')}
          onReturnToMenu={() => setCurrentScreen('main')}
        />
      )}

      {/* Options & Control Rebinding Modal */}
      {currentScreen === 'options' && (
        <OptionsMenu
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setCurrentScreen('main')}
        />
      )}

      {/* Character Selection Modal */}
      {currentScreen === 'character_select' && (
        <CharacterSelectModal
          selectedHeroId={selectedHeroId}
          onSelectHero={(id) => setSelectedHeroId(id)}
          settings={settings}
          onClose={() => setCurrentScreen('main')}
        />
      )}

      {/* How To Play & Controls Guide Modal */}
      {currentScreen === 'how_to_play' && (
        <ControlsGuideModal
          settings={settings}
          onClose={() => setCurrentScreen('main')}
        />
      )}

      {/* Credits Modal */}
      {currentScreen === 'credits' && (
        <CreditsModal
          settings={settings}
          onClose={() => setCurrentScreen('main')}
        />
      )}
    </main>
  );
}

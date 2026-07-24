import { GameSettings, Keybindings } from '../types';

export const DEFAULT_KEYBINDINGS_WASD: Keybindings = {
  moveLeft: 'KeyA',
  moveRight: 'KeyD',
  moveUp: 'KeyW',
  moveDown: 'KeyS',
  jump: 'Space',
  dash: 'ShiftLeft',
  attack: 'KeyJ',
  skill1: 'KeyK',
  skill2: 'KeyL',
  interact: 'KeyE',
  pause: 'Escape',
};

export const DEFAULT_KEYBINDINGS_ARROWS: Keybindings = {
  moveLeft: 'ArrowLeft',
  moveRight: 'ArrowRight',
  moveUp: 'ArrowUp',
  moveDown: 'ArrowDown',
  jump: 'KeyZ',
  dash: 'KeyX',
  attack: 'KeyC',
  skill1: 'KeyV',
  skill2: 'KeyB',
  interact: 'KeyF',
  pause: 'Escape',
};

export const DEFAULT_SETTINGS: GameSettings = {
  keybindings: DEFAULT_KEYBINDINGS_WASD,
  touch: {
    enabled: true,
    opacity: 0.8,
    joystickScale: 1.0,
    buttonScale: 1.0,
    vibration: true,
  },
  audio: {
    masterVolume: 80,
    musicVolume: 60,
    sfxVolume: 90,
    uiVolume: 70,
    muted: false,
  },
  graphics: {
    resolutionScale: '1080p',
    targetFps: 60,
    particles: 'high',
    screenShake: true,
    bloomGlow: true,
    fullscreen: false,
  },
  gameplay: {
    language: 'th',
    showDamageNumbers: true,
    showHealthBars: true,
    autoTarget: true,
  },
};

const STORAGE_KEY = 'GAME_SETTINGS_V1';

export function loadSettings(): GameSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        keybindings: { ...DEFAULT_SETTINGS.keybindings, ...(parsed.keybindings || {}) },
        touch: { ...DEFAULT_SETTINGS.touch, ...(parsed.touch || {}) },
        audio: { ...DEFAULT_SETTINGS.audio, ...(parsed.audio || {}) },
        graphics: { ...DEFAULT_SETTINGS.graphics, ...(parsed.graphics || {}) },
        gameplay: { ...DEFAULT_SETTINGS.gameplay, ...(parsed.gameplay || {}) },
      };
    }
  } catch (e) {
    console.warn('Failed to load saved game settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save game settings:', e);
  }
}

export function getKeyDisplayLabel(code: string): string {
  if (!code) return 'None';
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return 'Num ' + code.slice(6);
  
  const map: Record<string, string> = {
    Space: 'SPACE',
    ShiftLeft: 'L-SHIFT',
    ShiftRight: 'R-SHIFT',
    ControlLeft: 'L-CTRL',
    ControlRight: 'R-CTRL',
    AltLeft: 'L-ALT',
    AltRight: 'R-ALT',
    Escape: 'ESC',
    Tab: 'TAB',
    Enter: 'ENTER',
    Backspace: 'BACKSPACE',
    ArrowUp: '↑ UP',
    ArrowDown: '↓ DOWN',
    ArrowLeft: '← LEFT',
    ArrowRight: '→ RIGHT',
  };

  return map[code] || code.toUpperCase();
}

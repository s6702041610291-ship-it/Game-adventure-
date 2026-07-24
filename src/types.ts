export type ActionKey = 
  | 'moveLeft'
  | 'moveRight'
  | 'moveUp'
  | 'moveDown'
  | 'jump'
  | 'dash'
  | 'attack'
  | 'skill1'
  | 'skill2'
  | 'interact'
  | 'pause';

export interface Keybindings {
  moveLeft: string;
  moveRight: string;
  moveUp: string;
  moveDown: string;
  jump: string;
  dash: string;
  attack: string;
  skill1: string;
  skill2: string;
  interact: string;
  pause: string;
}

export interface TouchSettings {
  enabled: boolean;
  opacity: number; // 0.2 to 1.0
  joystickScale: number; // 0.8 to 1.5
  buttonScale: number; // 0.8 to 1.5
  vibration: boolean;
}

export interface AudioSettings {
  masterVolume: number; // 0 to 100
  musicVolume: number;
  sfxVolume: number;
  uiVolume: number;
  muted: boolean;
}

export interface GraphicsSettings {
  resolutionScale: '720p' | '1080p' | 'native';
  targetFps: 30 | 60 | 120;
  particles: 'low' | 'medium' | 'high' | 'ultra';
  screenShake: boolean;
  bloomGlow: boolean;
  fullscreen: boolean;
}

export interface GameplaySettings {
  language: 'th' | 'en';
  showDamageNumbers: boolean;
  showHealthBars: boolean;
  autoTarget: boolean;
}

export interface GameSettings {
  keybindings: Keybindings;
  touch: TouchSettings;
  audio: AudioSettings;
  graphics: GraphicsSettings;
  gameplay: GameplaySettings;
}

export interface CharacterHero {
  id: 'blade' | 'ninja' | 'mage';
  nameTh: string;
  nameEn: string;
  roleTh: string;
  roleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  color: string;
  secondaryColor: string;
  avatarIcon: string;
  stats: {
    speed: number;
    power: number;
    range: number;
  };
  skills: {
    attackName: string;
    skill1Name: string;
    skill2Name: string;
  };
}

export type MenuScreen = 'main' | 'options' | 'character_select' | 'how_to_play' | 'playing' | 'credits';

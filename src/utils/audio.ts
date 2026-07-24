// Web Audio API Synthesizer for Menu and Game SFX

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicOsc: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playUiClick(masterVol = 0.8, uiVol = 0.7, muted = false) {
    if (muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const vol = (masterVol / 100) * (uiVol / 100) * 0.15;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  playUiHover(masterVol = 0.8, uiVol = 0.7, muted = false) {
    if (muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const vol = (masterVol / 100) * (uiVol / 100) * 0.05;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.03);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  playKeyRebind(masterVol = 0.8, uiVol = 0.7, muted = false) {
    if (muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const vol = (masterVol / 100) * (uiVol / 100) * 0.2;

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc1.frequency.setValueAtTime(783.99, now + 0.16); // G5

    osc2.frequency.setValueAtTime(1046.5, now + 0.16); // C6

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.16);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  playJump(masterVol = 0.8, sfxVol = 0.9, muted = false) {
    if (muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const vol = (masterVol / 100) * (sfxVol / 100) * 0.25;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  playAttack(masterVol = 0.8, sfxVol = 0.9, muted = false) {
    if (muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // White noise slash + tone sweep
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.1);

    const gain = this.ctx.createGain();
    const vol = (masterVol / 100) * (sfxVol / 100) * 0.25;

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  playDash(masterVol = 0.8, sfxVol = 0.9, muted = false) {
    if (muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const vol = (masterVol / 100) * (sfxVol / 100) * 0.22;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.12);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playHit(masterVol = 0.8, sfxVol = 0.9, muted = false) {
    if (muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const vol = (masterVol / 100) * (sfxVol / 100) * 0.3;

    osc.type = 'square';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.1);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  playSkill(masterVol = 0.8, sfxVol = 0.9, muted = false) {
    if (muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const vol = (masterVol / 100) * (sfxVol / 100) * 0.3;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.25);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  startAmbientMusic(masterVol = 0.8, musicVol = 0.6, muted = false) {
    if (muted || this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      this.musicOsc = this.ctx.createOscillator();
      this.musicGain = this.ctx.createGain();

      const vol = (masterVol / 100) * (musicVol / 100) * 0.04;

      this.musicOsc.type = 'sine';
      this.musicOsc.frequency.setValueAtTime(110, now); // Low A

      this.musicGain.gain.setValueAtTime(0, now);
      this.musicGain.gain.linearRampToValueAtTime(vol, now + 2);

      this.musicOsc.connect(this.musicGain);
      this.musicGain.connect(this.ctx.destination);

      this.musicOsc.start(now);
      this.isMusicPlaying = true;
    } catch (e) {
      console.warn('Ambient music failed to start:', e);
    }
  }

  stopAmbientMusic() {
    if (this.musicOsc && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.musicGain?.gain.linearRampToValueAtTime(0.001, now + 0.5);
        setTimeout(() => {
          this.musicOsc?.stop();
          this.musicOsc?.disconnect();
          this.musicOsc = null;
          this.isMusicPlaying = false;
        }, 500);
      } catch {
        this.musicOsc = null;
        this.isMusicPlaying = false;
      }
    }
  }
}

export const audioEngine = new AudioEngine();

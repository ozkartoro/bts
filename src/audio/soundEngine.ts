class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private musicVolume: number = 0.4;
  private sfxVolume: number = 0.6;
  private isPlayingBgm: boolean = false;
  private bgmTimer: number | null = null;
  private stepCount: number = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.gain.value = this.musicVolume;
      this.sfxGain.gain.value = this.sfxVolume;

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public playClick() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playFootstep() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    osc.type = 'sine';
    const pitch = 90 + (this.stepCount++ % 2) * 20;
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.06);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(now + 0.06);
  }

  public playJump() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.18);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(now + 0.18);
  }

  public playPortalTravel() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(3000, now + 0.6);
    filter.frequency.exponentialRampToValueAtTime(400, now + 1.2);

    osc1.type = 'sawtooth';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(120, now);
    osc1.frequency.linearRampToValueAtTime(440, now + 0.6);
    osc1.frequency.linearRampToValueAtTime(80, now + 1.2);

    osc2.frequency.setValueAtTime(240, now);
    osc2.frequency.linearRampToValueAtTime(880, now + 0.6);
    osc2.frequency.linearRampToValueAtTime(160, now + 1.2);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.5);
    gain.gain.linearRampToValueAtTime(0.001, now + 1.2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.2);
    osc2.stop(now + 1.2);
  }

  public playCollect() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.25, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.35);
    });
  }

  public playSuccess() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const chord = [440, 554.37, 659.25, 880]; // A major
    chord.forEach((freq) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.8);
    });
  }

  public playStarFanfare() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const melody = [
      { f: 523.25, t: 0.0, d: 0.15 },
      { f: 659.25, t: 0.15, d: 0.15 },
      { f: 783.99, t: 0.3, d: 0.15 },
      { f: 1046.5, t: 0.45, d: 0.4 },
      { f: 880.0,  t: 0.85, d: 0.15 },
      { f: 1046.5, t: 1.0, d: 0.7 }
    ];
    melody.forEach((m) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(m.f, now + m.t);

      gain.gain.setValueAtTime(0.3, now + m.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + m.t + m.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + m.t);
      osc.stop(now + m.t + m.d);
    });
  }

  public playMusicalNote(freq: number, duration: number = 0.3) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + duration);
  }

  public playFirework() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Boom + sparkle
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.4);

    // Sparkles
    for (let i = 0; i < 4; i++) {
      const spOsc = this.ctx.createOscillator();
      const spGain = this.ctx.createGain();
      spOsc.type = 'triangle';
      spOsc.frequency.setValueAtTime(1000 + Math.random() * 1500, now + 0.15 + i * 0.07);
      spGain.gain.setValueAtTime(0.15, now + 0.15 + i * 0.07);
      spGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25 + i * 0.07);

      spOsc.connect(spGain);
      spGain.connect(this.sfxGain);
      spOsc.start(now + 0.15 + i * 0.07);
      spOsc.stop(now + 0.25 + i * 0.07);
    }
  }

  // Upbeat K-Pop inspired background music synth generator
  public startBGM() {
    if (this.isPlayingBgm) return;
    this.initContext();
    this.isPlayingBgm = true;

    // Upbeat pentatonic / major progression (F - G - Em - Am)
    const chords = [
      [349.23, 440.0, 523.25], // F
      [392.0, 493.88, 587.33], // G
      [329.63, 392.0, 493.88], // Em
      [440.0, 523.25, 659.25]  // Am
    ];
    const bassNotes = [174.61, 196.0, 164.81, 220.0];
    const leadNotes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

    let chordIdx = 0;
    let step = 0;

    const playLoopStep = () => {
      if (!this.isPlayingBgm || !this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;
      const currentChord = chords[chordIdx];

      // Bass beat on beat 0 and 2
      if (step % 4 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassNotes[chordIdx], now);
        bassGain.gain.setValueAtTime(0.12, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        bassOsc.connect(filter);
        filter.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start(now);
        bassOsc.stop(now + 0.35);
      }

      // Arpeggiated synth chord notes
      const arpNote = currentChord[step % 3];
      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();
      arpOsc.type = 'sine';
      arpOsc.frequency.setValueAtTime(arpNote, now);
      arpGain.gain.setValueAtTime(0.08, now);
      arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      arpOsc.connect(arpGain);
      arpGain.connect(this.musicGain);
      arpOsc.start(now);
      arpOsc.stop(now + 0.18);

      // Cheerful melody occasionally
      if (step % 2 === 1 && Math.random() > 0.35) {
        const lead = leadNotes[Math.floor(Math.random() * leadNotes.length)];
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'triangle';
        leadOsc.frequency.setValueAtTime(lead, now);
        leadGain.gain.setValueAtTime(0.09, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        leadOsc.connect(leadGain);
        leadGain.connect(this.musicGain);
        leadOsc.start(now);
        leadOsc.stop(now + 0.22);
      }

      step++;
      if (step >= 8) {
        step = 0;
        chordIdx = (chordIdx + 1) % chords.length;
      }

      this.bgmTimer = window.setTimeout(playLoopStep, 220); // ~136 BPM feel
    };

    playLoopStep();
  }

  public stopBGM() {
    this.isPlayingBgm = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const sound = new SoundEngine();

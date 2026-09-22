import { type ScaleName, type Section, type Song, sectionAt } from "./catalog";

const SCALES: Record<ScaleName, number[]> = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
};

const REST = -99;

function midiToFreq(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12);
}

function degreeMidi(tonic: number, scale: number[], degree: number, octave: number) {
  const n = scale.length;
  const wrapped = ((degree % n) + n) % n;
  const oct = octave + Math.floor(degree / n) - (degree < 0 && degree % n !== 0 ? 1 : 0);
  return tonic + scale[wrapped] + oct * 12;
}

function envGain(
  ctx: BaseAudioContext,
  t: number,
  dur: number,
  peak: number,
  a: number,
  d: number,
  s: number,
  r: number,
) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
  const decayAt = t + a + d;
  g.gain.exponentialRampToValueAtTime(Math.max(peak * s, 0.0002), decayAt);
  const relAt = Math.max(decayAt, t + dur);
  g.gain.setValueAtTime(Math.max(peak * s, 0.0002), relAt);
  g.gain.exponentialRampToValueAtTime(0.0001, relAt + r);
  return g;
}

type Listener = () => void;

class PopEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  analyser: AnalyserNode | null = null;
  compressor: DynamicsCompressorNode | null = null;
  reverb: ConvolverNode | null = null;
  reverbGain: GainNode | null = null;
  noise: AudioBuffer | null = null;
  song: Song | null = null;
  playing = false;
  startTime = 0;
  pauseOffset = 0;
  nextBar = 0;
  timer: number | null = null;
  volume = 0.85;
  onEnd: (() => void) | null = null;
  private listeners = new Set<Listener>();
  private vocalCache = new Map<string, AudioBuffer>();
  private vocalSrc: AudioBufferSourceNode | null = null;
  private hasVocal = false;

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  async ensure() {
    if (this.ctx) return this.ctx;
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.noise = this.makeNoise(ctx);

    const master = ctx.createGain();
    master.gain.value = this.volume;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 18;
    compressor.ratio.value = 4.5;
    compressor.attack.value = 0.006;
    compressor.release.value = 0.18;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.72;

    const reverb = ctx.createConvolver();
    reverb.buffer = this.makeImpulse(ctx, 1.6);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.22;
    reverb.connect(reverbGain);
    reverbGain.connect(compressor);

    master.connect(compressor);
    compressor.connect(analyser);
    analyser.connect(ctx.destination);

    this.master = master;
    this.compressor = compressor;
    this.analyser = analyser;
    this.reverb = reverb;
    this.reverbGain = reverbGain;
    return ctx;
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.04);
    }
  }

  currentTime() {
    if (!this.ctx || !this.playing || !this.song) return this.pauseOffset;
    return Math.max(0, this.ctx.currentTime - this.startTime);
  }

  duration() {
    if (!this.song) return 0;
    return (this.song.bars * 4 * 60) / this.song.bpm;
  }

  currentBar() {
    if (!this.song) return 0;
    const barDur = (4 * 60) / this.song.bpm;
    return Math.min(this.song.bars - 1, Math.max(0, Math.floor(this.currentTime() / barDur)));
  }

  currentSection(): Section | null {
    if (!this.song) return null;
    return sectionAt(this.currentBar(), this.song.bars);
  }

  async play(song: Song, from = 0) {
    const ctx = await this.ensure();
    if (ctx.state === "suspended") await ctx.resume();
    this.stopNodes();
    this.song = song;
    await this.loadVocal(song.id);
    this.pauseOffset = from;
    this.startTime = ctx.currentTime - from;
    const barDur = (4 * 60) / song.bpm;
    this.nextBar = Math.max(0, Math.floor(from / barDur));
    this.playing = true;
    this.startVocal(from, barDur);
    this.arm();
    this.emit();
  }

  pause() {
    if (!this.playing) return;
    this.pauseOffset = this.currentTime();
    this.playing = false;
    this.stopNodes();
    this.emit();
  }

  async toggle(song: Song) {
    if (this.playing && this.song?.id === song.id) {
      this.pause();
      return;
    }
    const from = this.song?.id === song.id ? this.pauseOffset : 0;
    await this.play(song, from);
  }

  async seek(seconds: number) {
    if (!this.song) return;
    const clamped = Math.max(0, Math.min(this.duration() - 0.05, seconds));
    if (this.playing) await this.play(this.song, clamped);
    else {
      this.pauseOffset = clamped;
      this.emit();
    }
  }

  stop() {
    this.playing = false;
    this.pauseOffset = 0;
    this.nextBar = 0;
    this.stopNodes();
    this.emit();
  }

  private stopNodes() {
    if (this.timer != null) {
      cancelAnimationFrame(this.timer);
      this.timer = null;
    }
    this.stopVocal();
  }

  private stopVocal() {
    if (this.vocalSrc) {
      try {
        this.vocalSrc.stop();
      } catch {
        /* already stopped */
      }
      this.vocalSrc.disconnect();
      this.vocalSrc = null;
    }
  }

  private async loadVocal(id: string) {
    this.hasVocal = false;
    if (!this.ctx) return;
    let buf = this.vocalCache.get(id);
    if (!buf) {
      try {
        const res = await fetch(`/vocals/${id}.mp3`);
        if (!res.ok) return;
        buf = await this.ctx.decodeAudioData(await res.arrayBuffer());
        this.vocalCache.set(id, buf);
      } catch {
        return;
      }
    }
    this.hasVocal = true;
  }

  private startVocal(from: number, barDur: number) {
    if (!this.ctx || !this.master || !this.song) return;
    const buf = this.vocalCache.get(this.song.id);
    if (!buf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.value = 1.35;
    src.connect(g);
    g.connect(this.master);
    if (this.reverb) g.connect(this.reverb);
    const vocalAt = barDur * 2;
    const when = this.startTime + vocalAt;
    const offset = Math.max(0, from - vocalAt);
    if (offset >= buf.duration) return;
    const startAt = Math.max(when, this.ctx.currentTime + 0.02);
    src.start(startAt, offset);
    this.vocalSrc = src;
  }

  private arm() {
    const loop = () => {
      if (!this.playing || !this.ctx || !this.song) return;
      this.scheduleAhead();
      if (this.currentTime() >= this.duration()) {
        this.playing = false;
        this.pauseOffset = 0;
        this.emit();
        this.onEnd?.();
        return;
      }
      this.timer = requestAnimationFrame(loop);
    };
    this.timer = requestAnimationFrame(loop);
  }

  private scheduleAhead() {
    const ctx = this.ctx;
    const song = this.song;
    if (!ctx || !song) return;
    const barDur = (4 * 60) / song.bpm;
    const now = ctx.currentTime;
    const lookahead = 0.28;
    while (this.nextBar < song.bars) {
      const t = this.startTime + this.nextBar * barDur;
      if (t > now + lookahead) break;
      if (t + barDur > now - 0.02) this.scheduleBar(this.nextBar, Math.max(t, now + 0.02));
      this.nextBar += 1;
    }
  }

  private scheduleBar(bar: number, t: number) {
    const song = this.song;
    const ctx = this.ctx;
    if (!song || !ctx || !this.master || !this.reverb) return;
    const beat = 60 / song.bpm;
    const section = sectionAt(bar, song.bars);
    const chorusLike = section === "chorus" || section === "pre";
    const chords = chorusLike ? song.chorusChords : song.verseChords;
    const chord = chords[bar % chords.length];
    const scale = SCALES[song.scale];
    const open = 0.35 + song.brightness * 0.35 + (chorusLike ? 0.22 : 0) + (section === "outro" ? -0.1 : 0);
    const duck = ctx.createGain();
    duck.gain.value = 1;
    duck.connect(this.master);
    duck.connect(this.reverb);

    this.drums(t, beat, song, section, duck);
    this.bass(t, beat, song, scale, chord, section);
    this.pad(t, beat, song, scale, chord, open, duck);
    if (song.energy > 0.45 && (chorusLike || section === "verse")) {
      this.arp(t, beat, song, scale, chord, open);
    }
    if (section !== "intro") {
      const hook = chorusLike ? song.chorusHook : song.verseHook;
      this.lead(t, beat, song, scale, hook, section, open);
    }
    if (section === "chorus") this.riserTail(t, beat * 0.15, song.energy * 0.04);
  }

  private drums(t: number, beat: number, song: Song, section: Section, duck: GainNode) {
    const e = song.energy;
    const four = e > 0.62 && section !== "intro" && section !== "outro";
    const sparse = e < 0.38 || section === "intro" || section === "outro";
    for (let i = 0; i < 4; i++) {
      const swing = i % 2 === 1 ? song.swing * beat : 0;
      const bt = t + i * beat + swing;
      const kickOn = four ? true : sparse ? i === 0 : i === 0 || i === 2;
      if (kickOn) {
        this.kick(bt, 0.18 + e * 0.08);
        duck.gain.setValueAtTime(1, bt);
        duck.gain.linearRampToValueAtTime(0.35 + (1 - e) * 0.3, bt + 0.04);
        duck.gain.exponentialRampToValueAtTime(1, bt + Math.min(0.28, beat * 0.7));
      }
      if (!sparse && (i === 1 || i === 3)) this.snare(bt, 0.1 + e * 0.08);
      const hats = e > 0.7 ? 4 : 2;
      for (let h = 0; h < hats; h++) {
        const ht = bt + (h * beat) / hats + (h % 2 === 1 ? song.swing * beat * 0.5 : 0);
        if (section === "intro" && h > 0) continue;
        this.hat(ht, h === 0 ? 0.03 : 0.018, e);
      }
    }
    if (e > 0.75 && (section === "chorus" || section === "pre")) {
      this.clap(t + 2 * beat, 0.08);
    }
  }

  private kick(t: number, gain: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(148, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.08);
    const g = envGain(ctx, t, 0.22, gain, 0.002, 0.06, 0.35, 0.12);
    const click = ctx.createOscillator();
    click.type = "triangle";
    click.frequency.value = 980;
    const cg = envGain(ctx, t, 0.025, gain * 0.18, 0.001, 0.01, 0.2, 0.02);
    osc.connect(g);
    click.connect(cg);
    g.connect(this.master!);
    cg.connect(this.master!);
    osc.start(t);
    osc.stop(t + 0.32);
    click.start(t);
    click.stop(t + 0.04);
  }

  private snare(t: number, gain: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1800;
    bp.Q.value = 0.9;
    const g = envGain(ctx, t, 0.14, gain, 0.002, 0.05, 0.2, 0.08);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.master!);
    const body = ctx.createOscillator();
    body.type = "triangle";
    body.frequency.value = 196;
    const bg = envGain(ctx, t, 0.1, gain * 0.45, 0.002, 0.04, 0.2, 0.06);
    body.connect(bg);
    bg.connect(this.master!);
    src.start(t);
    src.stop(t + 0.18);
    body.start(t);
    body.stop(t + 0.14);
  }

  private hat(t: number, gain: number, energy: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7000 + energy * 2500;
    const g = envGain(ctx, t, 0.04, gain, 0.001, 0.015, 0.15, 0.03);
    src.connect(hp);
    hp.connect(g);
    g.connect(this.master!);
    src.start(t);
    src.stop(t + 0.06);
  }

  private clap(t: number, gain: number) {
    for (let i = 0; i < 3; i++) this.snare(t + i * 0.012, gain * (1 - i * 0.25));
  }

  private bass(t: number, beat: number, song: Song, scale: number[], chord: number, section: Section) {
    const ctx = this.ctx!;
    const steps = section === "chorus" || song.energy > 0.7 ? [0, 0.5, 1.5, 2, 3] : [0, 2];
    const octave = 1;
    for (const step of steps) {
      const nt = t + step * beat;
      const midi = degreeMidi(song.tonic, scale, chord, octave);
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = midiToFreq(midi);
      const saw = ctx.createOscillator();
      saw.type = "sawtooth";
      saw.frequency.value = midiToFreq(midi);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 280 + song.energy * 420;
      const g = envGain(ctx, nt, beat * 0.7, 0.22 + song.energy * 0.08, 0.01, 0.08, 0.6, 0.08);
      osc.connect(g);
      saw.connect(lp);
      lp.connect(g);
      g.connect(this.master!);
      osc.start(nt);
      osc.stop(nt + beat * 0.85);
      saw.start(nt);
      saw.stop(nt + beat * 0.85);
    }
  }

  private pad(
    t: number,
    beat: number,
    song: Song,
    scale: number[],
    chord: number,
    open: number,
    duck: GainNode,
  ) {
    const ctx = this.ctx!;
    const degrees = [chord, chord + 2, chord + 4];
    const dur = beat * 4 * 0.96;
    for (const deg of degrees) {
      const midi = degreeMidi(song.tonic, scale, deg, 4);
      for (const detune of [-9, 0, 11]) {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = midiToFreq(midi);
        osc.detune.value = detune;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 480 + open * 2200;
        lp.Q.value = 0.4;
        const g = envGain(ctx, t, dur, 0.045, 0.08, 0.2, 0.7, 0.2);
        osc.connect(lp);
        lp.connect(g);
        g.connect(duck);
        osc.start(t);
        osc.stop(t + dur + 0.22);
      }
    }
  }

  private arp(t: number, beat: number, song: Song, scale: number[], chord: number, open: number) {
    const ctx = this.ctx!;
    const pattern = [0, 2, 4, 7, 4, 2, 0, 4];
    const step = beat / 2;
    for (let i = 0; i < 8; i++) {
      const nt = t + i * step;
      const midi = degreeMidi(song.tonic, scale, chord + pattern[i], 5);
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = midiToFreq(midi);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1200 + open * 1800;
      const g = envGain(ctx, nt, step * 0.85, 0.05, 0.005, 0.04, 0.2, 0.06);
      osc.connect(lp);
      lp.connect(g);
      g.connect(this.master!);
      if (this.reverb) g.connect(this.reverb);
      osc.start(nt);
      osc.stop(nt + step);
    }
  }

  private lead(
    t: number,
    beat: number,
    song: Song,
    scale: number[],
    hook: number[],
    section: Section,
    open: number,
  ) {
    const ctx = this.ctx!;
    const step = beat / 4;
    const peak = (section === "chorus" ? 0.16 : 0.1) * (this.hasVocal ? 0.28 : 1);
    const count = Math.min(16, hook.length || 16);
    for (let i = 0; i < count; i++) {
      const deg = hook[i % hook.length];
      if (deg === REST) continue;
      const nt = t + i * step;
      const midi = degreeMidi(song.tonic, scale, deg, section === "chorus" ? 5 : 4);
      const freq = midiToFreq(midi);
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      const body = ctx.createOscillator();
      body.type = "triangle";
      body.frequency.value = freq;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 5.8;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 9;
      lfo.connect(lfoG);
      lfoG.connect(osc.frequency);
      lfoG.connect(body.frequency);
      const f1 = ctx.createBiquadFilter();
      f1.type = "peaking";
      f1.frequency.value = 620;
      f1.Q.value = 5.2;
      f1.gain.value = 11;
      const f2 = ctx.createBiquadFilter();
      f2.type = "peaking";
      f2.frequency.value = 1180;
      f2.Q.value = 5.5;
      f2.gain.value = 9;
      const f3 = ctx.createBiquadFilter();
      f3.type = "peaking";
      f3.frequency.value = 2450;
      f3.Q.value = 3.2;
      f3.gain.value = 5;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1800 + open * 1200;
      const g = envGain(ctx, nt, step * 1.45, peak, 0.018, 0.05, 0.58, 0.09);
      osc.connect(f1);
      body.connect(f1);
      f1.connect(f2);
      f2.connect(f3);
      f3.connect(lp);
      lp.connect(g);
      g.connect(this.master!);
      if (this.reverb) g.connect(this.reverb);
      osc.start(nt);
      osc.stop(nt + step * 1.5);
      body.start(nt);
      body.stop(nt + step * 1.5);
      lfo.start(nt);
      lfo.stop(nt + step * 1.5);
    }
  }

  private riserTail(t: number, gain: number, extra: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(400, t);
    bp.frequency.exponentialRampToValueAtTime(2400, t + 0.4);
    const g = envGain(ctx, t, 0.4, gain + extra, 0.05, 0.1, 0.5, 0.2);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.master!);
    src.start(t);
    src.stop(t + 0.5);
  }

  private makeNoise(ctx: BaseAudioContext) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  private makeImpulse(ctx: BaseAudioContext, seconds: number) {
    const rate = ctx.sampleRate;
    const len = rate * seconds;
    const buf = ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.2;
      }
    }
    return buf;
  }

  async renderOffline(song: Song): Promise<Blob> {
    const duration = (song.bars * 4 * 60) / song.bpm + 0.7;
    const sr = 44100;
    const offline = new OfflineAudioContext(2, Math.ceil(duration * sr), sr);

    const snap = {
      ctx: this.ctx,
      master: this.master,
      analyser: this.analyser,
      compressor: this.compressor,
      reverb: this.reverb,
      reverbGain: this.reverbGain,
      noise: this.noise,
      song: this.song,
      playing: this.playing,
      startTime: this.startTime,
    };

    const resumeFrom = snap.playing && snap.song ? this.currentTime() : 0;
    if (this.playing) this.pause();

    let vocalArr: ArrayBuffer | null = null;
    try {
      const res = await fetch(`/vocals/${song.id}.mp3`);
      if (res.ok) vocalArr = await res.arrayBuffer();
    } catch {
      vocalArr = null;
    }
    const prevVocal = this.hasVocal;
    this.hasVocal = Boolean(vocalArr);

    try {
      this.ctx = offline as unknown as AudioContext;
      this.noise = this.makeNoise(offline);
      const master = offline.createGain();
      master.gain.value = 0.85;
      const compressor = offline.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 18;
      compressor.ratio.value = 4.5;
      compressor.attack.value = 0.006;
      compressor.release.value = 0.18;
      const reverb = offline.createConvolver();
      reverb.buffer = this.makeImpulse(offline, 1.6);
      const reverbGain = offline.createGain();
      reverbGain.gain.value = 0.22;
      reverb.connect(reverbGain);
      reverbGain.connect(compressor);
      master.connect(compressor);
      compressor.connect(offline.destination);
      this.master = master;
      this.compressor = compressor;
      this.reverb = reverb;
      this.reverbGain = reverbGain;
      this.song = song;
      this.startTime = 0;
      const barDur = (4 * 60) / song.bpm;
      if (vocalArr) {
        const vbuf = await offline.decodeAudioData(vocalArr.slice(0));
        const vsrc = offline.createBufferSource();
        vsrc.buffer = vbuf;
        const vg = offline.createGain();
        vg.gain.value = 1.35;
        vsrc.connect(vg);
        vg.connect(master);
        vg.connect(reverb);
        vsrc.start(barDur * 2);
      }
      for (let bar = 0; bar < song.bars; bar++) {
        this.scheduleBar(bar, bar * barDur);
      }
      const rendered = await offline.startRendering();
      return audioBufferToWav(rendered);
    } finally {
      this.hasVocal = prevVocal;
      this.ctx = snap.ctx;
      this.master = snap.master;
      this.analyser = snap.analyser;
      this.compressor = snap.compressor;
      this.reverb = snap.reverb;
      this.reverbGain = snap.reverbGain;
      this.noise = snap.noise;
      this.song = snap.song;
      this.startTime = snap.startTime;
      if (snap.playing && snap.song) {
        void this.play(snap.song, resumeFrom);
      }
    }
  }
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const channels = 2;
  const sr = buffer.sampleRate;
  const len = buffer.length;
  const dataSize = len * channels * 2;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);
  const left = buffer.getChannelData(0);
  const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
  let o = 44;
  for (let i = 0; i < len; i++) {
    const l = Math.max(-1, Math.min(1, left[i] ?? 0));
    const r = Math.max(-1, Math.min(1, right[i] ?? 0));
    view.setInt16(o, l < 0 ? l * 0x8000 : l * 0x7fff, true);
    view.setInt16(o + 2, r < 0 ? r * 0x8000 : r * 0x7fff, true);
    o += 4;
  }
  return new Blob([ab], { type: "audio/wav" });
}

export const engine = new PopEngine();

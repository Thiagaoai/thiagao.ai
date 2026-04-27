'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Radio } from 'lucide-react';

type Mood = {
  id: string;
  label: string;
  bpm: number;
  wave: OscillatorType;
  root: number;
  scale: number[];
  accent: string;
};

const moods: Mood[] = [
  {
    id: 'future',
    label: 'Future',
    bpm: 76,
    wave: 'sine',
    root: 196,
    scale: [0, 3, 7, 10, 12, 15],
    accent: 'from-cyan-300 to-blue-500',
  },
  {
    id: 'focus',
    label: 'Focus',
    bpm: 92,
    wave: 'triangle',
    root: 174.61,
    scale: [0, 5, 7, 10, 12, 17],
    accent: 'from-emerald-300 to-cyan-500',
  },
  {
    id: 'lofi',
    label: 'Lo-fi',
    bpm: 68,
    wave: 'sine',
    root: 220,
    scale: [0, 2, 5, 7, 9, 12],
    accent: 'from-amber-200 to-rose-400',
  },
  {
    id: 'cyber',
    label: 'Cyber',
    bpm: 118,
    wave: 'sawtooth',
    root: 130.81,
    scale: [0, 2, 7, 11, 14, 19],
    accent: 'from-fuchsia-300 to-cyan-400',
  },
];

function frequency(root: number, semitones: number) {
  return root * 2 ** (semitones / 12);
}

function makeNoiseBuffer(context: AudioContext) {
  const buffer = context.createBuffer(1, context.sampleRate * 0.18, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < data.length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
  }

  return buffer;
}

export default function AiRadioPlayer() {
  const [activeMood, setActiveMood] = useState(moods[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);

  function stop() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const context = audioRef.current;
    const master = masterRef.current;
    if (context && master) {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(0, context.currentTime, 0.08);
    }

    setIsPlaying(false);
  }

  function playNote(context: AudioContext, master: GainNode, mood: Mood, step: number) {
    const now = context.currentTime;
    const interval = 60 / mood.bpm;
    const note = mood.scale[step % mood.scale.length];
    const octave = step % 8 > 4 ? 12 : 0;
    const padFrequency = frequency(mood.root, note + octave);
    const bassFrequency = frequency(mood.root / 2, mood.scale[(step + 2) % mood.scale.length]);

    const pad = context.createOscillator();
    const padGain = context.createGain();
    pad.type = mood.wave;
    pad.frequency.setValueAtTime(padFrequency, now);
    pad.detune.setValueAtTime(step % 3 === 0 ? 5 : -6, now);
    padGain.gain.setValueAtTime(0, now);
    padGain.gain.linearRampToValueAtTime(0.12, now + 0.04);
    padGain.gain.exponentialRampToValueAtTime(0.001, now + interval * 1.6);
    pad.connect(padGain).connect(master);
    pad.start(now);
    pad.stop(now + interval * 1.7);

    if (step % 2 === 0) {
      const bass = context.createOscillator();
      const bassGain = context.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(bassFrequency, now);
      bassGain.gain.setValueAtTime(0, now);
      bassGain.gain.linearRampToValueAtTime(0.14, now + 0.03);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + interval * 0.9);
      bass.connect(bassGain).connect(master);
      bass.start(now);
      bass.stop(now + interval);
    }

    if (step % 4 === 2) {
      const noise = context.createBufferSource();
      const noiseGain = context.createGain();
      const filter = context.createBiquadFilter();
      noise.buffer = makeNoiseBuffer(context);
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2600, now);
      noiseGain.gain.setValueAtTime(0.035, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      noise.connect(filter).connect(noiseGain).connect(master);
      noise.start(now);
    }
  }

  async function start(mood = activeMood) {
    const context = audioRef.current ?? new AudioContext();
    audioRef.current = context;

    if (context.state === 'suspended') {
      await context.resume();
    }

    const master = masterRef.current ?? context.createGain();
    if (!masterRef.current) {
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 5200;
      master.gain.value = 0;
      master.connect(filter).connect(context.destination);
      masterRef.current = master;
    }

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }

    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setTargetAtTime(0.32, context.currentTime, 0.12);
    playNote(context, master, mood, stepRef.current);
    timerRef.current = window.setInterval(() => {
      stepRef.current += 1;
      playNote(context, master, mood, stepRef.current);
    }, (60 / mood.bpm) * 1000);
    setIsPlaying(true);
  }

  async function changeMood(mood: Mood) {
    setActiveMood(mood);
    stepRef.current = 0;

    if (isPlaying) {
      await start(mood);
    }
  }

  useEffect(() => {
    return () => {
      stop();
      audioRef.current?.close();
    };
  }, []);

  return (
    <div className="animate-fade-rise-delay-3 mt-10 w-full max-w-2xl rounded-[28px] border border-white/10 bg-black/25 p-3 text-left shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => (isPlaying ? stop() : start())}
          className="liquid-glass inline-flex items-center justify-center gap-3 rounded-full px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          AI Radio
        </button>

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-2">
          {moods.map((mood) => (
            <button
              key={mood.id}
              type="button"
              onClick={() => changeMood(mood)}
              className={`rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition-colors ${
                activeMood.id === mood.id
                  ? 'border-cyan-300/50 bg-cyan-300/15 text-cyan-100'
                  : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white'
              }`}
            >
              {mood.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-end gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <Radio className="mr-2 h-4 w-4 shrink-0 text-cyan-200" />
        {[22, 38, 28, 52, 34, 64, 30, 46, 26, 58, 36, 48].map((height, index) => (
          <span
            key={`${height}-${index}`}
            className={`w-full rounded-full bg-gradient-to-t ${activeMood.accent} opacity-80 ${
              isPlaying ? 'animate-pulse' : ''
            }`}
            style={{ height }}
          />
        ))}
      </div>

      <p className="mt-3 px-2 text-xs leading-relaxed text-zinc-500">
        Som gerado no navegador, sem sample externo e sem royalty.
      </p>
    </div>
  );
}

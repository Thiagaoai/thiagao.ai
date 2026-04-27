'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Pause, Play, Radio } from 'lucide-react';

type Mood = {
  id: string;
  label: string;
  root: number;
  chords: number[][];
  pulse: number;
  noise: number;
  accent: string;
};

type WebAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const moods: Mood[] = [
  {
    id: 'deep',
    label: 'Deep Focus',
    root: 130.81,
    chords: [
      [0, 7, 12, 19],
      [3, 10, 15, 22],
      [5, 12, 17, 24],
      [2, 9, 14, 21],
    ],
    pulse: 9.5,
    noise: 0.018,
    accent: 'from-cyan-300 to-blue-500',
  },
  {
    id: 'calm',
    label: 'Calm AI',
    root: 146.83,
    chords: [
      [0, 5, 12, 17],
      [-2, 5, 10, 17],
      [3, 7, 12, 19],
      [0, 7, 14, 19],
    ],
    pulse: 11,
    noise: 0.012,
    accent: 'from-emerald-300 to-cyan-500',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    root: 220,
    chords: [
      [0, 4, 11, 16],
      [-1, 3, 10, 15],
      [-5, 2, 7, 14],
      [-3, 4, 9, 16],
    ],
    pulse: 12,
    noise: 0.01,
    accent: 'from-amber-200 to-rose-400',
  },
  {
    id: 'rain',
    label: 'Soft Rain',
    root: 98,
    chords: [
      [0, 7, 12, 16],
      [2, 9, 14, 17],
      [-3, 4, 11, 16],
      [-5, 2, 9, 14],
    ],
    pulse: 13.5,
    noise: 0.026,
    accent: 'from-fuchsia-300 to-cyan-400',
  },
];

const playlistLinks = [
  {
    label: 'Jazz',
    href: 'https://open.spotify.com/search/jazz%20classics%20playlist',
  },
  {
    label: 'Pop',
    href: 'https://open.spotify.com/search/pop%20hits%20playlist',
  },
  {
    label: 'Instrumental',
    href: 'https://open.spotify.com/search/instrumental%20focus%20playlist',
  },
  {
    label: 'Christian',
    href: 'https://open.spotify.com/search/christian%20worship%20playlist',
  },
];

function frequency(root: number, semitones: number) {
  return root * 2 ** (semitones / 12);
}

function makeNoiseBuffer(context: AudioContext, seconds = 4) {
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < data.length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  return buffer;
}

function createAudioContext() {
  if (typeof window === 'undefined') {
    return null;
  }

  const AudioContextCtor = window.AudioContext ?? (window as WebAudioWindow).webkitAudioContext;
  return AudioContextCtor ? new AudioContextCtor() : null;
}

export default function AiRadioPlayer() {
  const [activeMood, setActiveMood] = useState(moods[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState('Som ambiente opcional. Para musica conhecida, use as playlists oficiais.');
  const audioRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const ambienceRef = useRef<AudioNode[]>([]);
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);

  function stop() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    ambienceRef.current.forEach((node) => {
      try {
        node.disconnect();
      } catch {
        // Already disconnected.
      }
    });
    ambienceRef.current = [];

    const context = audioRef.current;
    const master = masterRef.current;
    if (context && master) {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(0, context.currentTime, 0.08);
    }

    setIsPlaying(false);
    setStatus('Som ambiente pausado.');
  }

  function playPad(context: AudioContext, master: GainNode, mood: Mood, step: number) {
    const now = context.currentTime;
    const chord = mood.chords[step % mood.chords.length];
    const duration = mood.pulse + 1.5;

    chord.forEach((note, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();

      oscillator.type = index === 0 ? 'sine' : 'triangle';
      oscillator.frequency.setValueAtTime(frequency(mood.root, note), now);
      oscillator.detune.setValueAtTime((index - 1.5) * 3, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(index === 0 ? 620 : 1450, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(index === 0 ? 0.045 : 0.026, now + 1.4);
      gain.gain.setTargetAtTime(0.0001, now + mood.pulse - 1.6, 1.2);

      oscillator.connect(filter).connect(gain).connect(master);
      oscillator.start(now);
      oscillator.stop(now + duration);
    });
  }

  function startAmbience(context: AudioContext, master: GainNode, mood: Mood) {
    ambienceRef.current.forEach((node) => node.disconnect());
    ambienceRef.current = [];

    const noise = context.createBufferSource();
    const noiseGain = context.createGain();
    const highpass = context.createBiquadFilter();
    const lowpass = context.createBiquadFilter();

    noise.buffer = makeNoiseBuffer(context, 6);
    noise.loop = true;
    highpass.type = 'highpass';
    highpass.frequency.value = 850;
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 3600;
    noiseGain.gain.value = mood.noise;
    noise.connect(highpass).connect(lowpass).connect(noiseGain).connect(master);
    noise.start();
    ambienceRef.current = [noise, noiseGain, highpass, lowpass];
  }

  async function start(mood = activeMood) {
    try {
      const context = audioRef.current ?? createAudioContext();

      if (!context) {
        setIsPlaying(false);
        setStatus('Audio indisponivel neste navegador.');
        return;
      }

      audioRef.current = context;

      if (context.state === 'suspended') {
        await context.resume();
      }

      const master = masterRef.current ?? context.createGain();
      if (!masterRef.current) {
        const filter = context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 3800;
        master.gain.value = 0;
        master.connect(filter).connect(context.destination);
        masterRef.current = master;
      }

      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }

      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(0.62, context.currentTime, 0.8);
      startAmbience(context, master, mood);
      playPad(context, master, mood, stepRef.current);
      timerRef.current = window.setInterval(() => {
        stepRef.current += 1;
        playPad(context, master, mood, stepRef.current);
      }, mood.pulse * 1000);
      setIsPlaying(true);
      setStatus(`Ambiente ${mood.label} ativo.`);
    } catch {
      setIsPlaying(false);
      setStatus('O navegador bloqueou o audio. Toque novamente para liberar.');
    }
  }

  async function changeMood(mood: Mood) {
    setActiveMood(mood);
    stepRef.current = 0;

    if (isPlaying) {
      await start(mood);
    } else {
      setStatus(`Modo ${mood.label} pronto.`);
    }
  }

  useEffect(() => {
    return () => {
      stop();
      audioRef.current?.close();
    };
  }, []);

  return (
    <div className="animate-fade-rise-delay-3 mt-7 w-full max-w-[min(100%,42rem)] rounded-[24px] border border-white/10 bg-black/35 p-3 text-left shadow-2xl backdrop-blur-xl sm:mt-10 sm:rounded-[28px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => (isPlaying ? stop() : start())}
          className="liquid-glass inline-flex w-full items-center justify-center gap-3 rounded-full px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] sm:w-auto"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          Som Ambiente
        </button>

        <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center">
          {moods.map((mood) => (
            <button
              key={mood.id}
              type="button"
              onClick={() => changeMood(mood)}
              className={`rounded-full border px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition-colors sm:text-xs sm:tracking-[0.14em] ${
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

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {playlistLinks.map((playlist) => (
          <a
            key={playlist.label}
            href={playlist.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-black uppercase tracking-[0.1em] text-zinc-300 transition-colors hover:border-cyan-300/40 hover:text-white"
          >
            {playlist.label}
            <ExternalLink className="h-3 w-3" />
          </a>
        ))}
      </div>

      <div className="mt-4 flex items-end gap-1 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 sm:gap-1.5 sm:px-4">
        <Radio className="mr-2 h-4 w-4 shrink-0 text-cyan-200" />
        {[18, 26, 22, 30, 24, 34, 20, 28, 22, 32, 24, 30].map((height, index) => (
          <span
            key={`${height}-${index}`}
            className={`w-full rounded-full bg-gradient-to-t ${activeMood.accent} opacity-80 ${
              isPlaying ? 'animate-pulse' : ''
            }`}
            style={{ height: Math.max(14, Math.round(height * 0.78)) }}
          />
        ))}
      </div>

      <p className="mt-3 px-2 text-xs leading-relaxed text-zinc-500">
        {status} Playlists abrem no Spotify para manter tudo dentro das regras de copyright.
      </p>
    </div>
  );
}

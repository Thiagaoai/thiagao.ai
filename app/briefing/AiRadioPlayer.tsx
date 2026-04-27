'use client';

import { useState } from 'react';
import { ExternalLink, Music2 } from 'lucide-react';

type Playlist = {
  id: string;
  label: string;
  description: string;
  embedUrl: string;
  openUrl: string;
  accent: string;
};

const playlists: Playlist[] = [
  {
    id: 'jazz',
    label: 'Jazz',
    description: 'Jazz Classics, curada pelo Spotify.',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXbITWG1ZJKYt?utm_source=generator&theme=0',
    openUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXbITWG1ZJKYt',
    accent: 'from-cyan-300 to-blue-500',
  },
  {
    id: 'pop',
    label: 'Pop',
    description: "Today's Top Hits, pop global atualizado.",
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0',
    openUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    accent: 'from-fuchsia-300 to-cyan-400',
  },
  {
    id: 'instrumental',
    label: 'Instrumental',
    description: 'Peaceful Piano para foco e leitura.',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0',
    openUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
    accent: 'from-emerald-300 to-cyan-500',
  },
  {
    id: 'christian',
    label: 'Christian',
    description: 'Worship e praise em playlist real.',
    embedUrl: 'https://open.spotify.com/embed/playlist/3acZBx7chxYVbvB7kIy58U?utm_source=generator&theme=0',
    openUrl: 'https://open.spotify.com/playlist/3acZBx7chxYVbvB7kIy58U',
    accent: 'from-amber-200 to-rose-400',
  },
  {
    id: 'romantic-br',
    label: 'Romântico BR',
    description: 'Românticas nacionais em português do Brasil.',
    embedUrl:
      'https://open.spotify.com/embed/user/xkf88ohis2de80w7pucn0kv2n/playlist/2ZPtKxXHL8osAJeKvUsO8j?utm_source=generator&theme=0',
    openUrl: 'https://open.spotify.com/user/xkf88ohis2de80w7pucn0kv2n/playlist/2ZPtKxXHL8osAJeKvUsO8j',
    accent: 'from-rose-300 to-amber-300',
  },
  {
    id: 'romantic-en',
    label: 'Love Songs',
    description: 'Românticas em inglês para ouvir com calma.',
    embedUrl: 'https://open.spotify.com/embed/playlist/5KbTzqKBqxQRD8OBtJTZrS?utm_source=generator&theme=0',
    openUrl: 'https://open.spotify.com/playlist/5KbTzqKBqxQRD8OBtJTZrS',
    accent: 'from-violet-300 to-cyan-300',
  },
];

export default function AiRadioPlayer() {
  const [activePlaylist, setActivePlaylist] = useState(playlists[0]);

  return (
    <div className="w-full overflow-hidden rounded-[24px] border border-white/10 bg-zinc-950/70 p-3 text-left shadow-2xl backdrop-blur-xl sm:rounded-[28px]">
      <div className={`rounded-[22px] bg-gradient-to-r ${activePlaylist.accent} p-px`}>
        <div className="rounded-[21px] bg-black/90 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-cyan-100">
                <Music2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">
                  Playlist real
                </p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                  {activePlaylist.description}
                </p>
              </div>
            </div>

            <a
              href={activePlaylist.openUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-black transition-transform hover:scale-[1.03]"
            >
              Ouvir completo
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                type="button"
                onClick={() => setActivePlaylist(playlist)}
                className={`rounded-full border px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition-colors sm:text-xs ${
                  activePlaylist.id === playlist.id
                    ? 'border-cyan-300/50 bg-cyan-300/15 text-cyan-100'
                    : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white'
                }`}
              >
                {playlist.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <iframe
        key={activePlaylist.id}
        title={`Spotify playlist ${activePlaylist.label}`}
        src={activePlaylist.embedUrl}
        width="100%"
        height="380"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="mt-3 rounded-[18px] border-0 bg-zinc-950"
      />

      <p className="mt-3 px-2 text-xs leading-relaxed text-zinc-500">
        Player oficial do Spotify. O tempo completo depende da conta/log-in do visitante; o botao abre a playlist no app.
      </p>
    </div>
  );
}

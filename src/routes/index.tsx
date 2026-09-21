import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { TrackRow } from "@/components/TrackRow";
import { ARTIST, PLATFORMS, SONGS, albumDuration, songStill } from "@/lib/catalog";
import { usePlayer } from "@/lib/player-store";
import { formatTime } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const play = usePlayer((s) => s.play);
  const featured = SONGS[0]!;

  return (
    <main>
      <section className="relative min-h-[100dvh] overflow-hidden">
        <img
          src={ARTIST.hero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top opacity-80"
        />
        <div className="absolute inset-0 bg-bg/40" />
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/55 to-transparent" />
        <img
          src={ARTIST.portrait}
          alt=""
          className="pointer-events-none absolute top-1/2 right-8 hidden w-80 -translate-y-1/2 rounded-full border border-line object-cover shadow-soft md:block"
        />
        <div className="relative flex min-h-[100dvh] flex-col justify-end px-5 pb-32 pt-28 md:px-12 md:pb-36">
          <p className="rise text-xs font-medium tracking-[0.28em] text-muted uppercase">
            Debut album · {ARTIST.released}
          </p>
          <h1 className="rise rise-2 mt-4 font-display text-4xl text-fg">
            {ARTIST.name}
          </h1>
          <p className="rise rise-3 mt-2 font-display text-2xl italic text-accent md:text-3xl">
            {ARTIST.album}
          </p>
          <p className="rise rise-3 mt-4 max-w-md text-sm leading-relaxed text-muted">
            Twenty English pop songs. Your face. A machine-born voice. Midnight radio for the
            hours that refuse to end.
          </p>
          <div className="rise rise-4 mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void play(featured)}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-accent-fg transition-transform duration-150 active:scale-95"
            >
              <Play className="size-4 fill-current" />
              Play AFTERGLOW
            </button>
            <Link
              to="/watch/$id"
              params={{ id: featured.id }}
              className="inline-flex h-12 items-center rounded-full border border-line px-6 text-sm font-medium text-fg transition-colors hover:bg-raised"
            >
              Watch Afterglow
            </Link>
          </div>
          <p className="mt-5 text-xs tabular-nums text-faint">
            20 tracks · {formatTime(albumDuration())} · Pop
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[280px_1fr] md:px-8">
        <div>
          <img
            src={ARTIST.albumCover}
            alt="AFTERGLOW album cover"
            className="w-full rounded-lg border border-line object-cover shadow-soft"
          />
          <div className="mt-4">
            <h2 className="font-display text-3xl">{ARTIST.album}</h2>
            <p className="mt-1 text-sm text-muted">{ARTIST.name}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Title track out now in the official player. Full album of twenty originals —
              cinematic synth-pop, late-night confessionals, and chorus hooks built to live
              in the afterglow.
            </p>
          </div>
        </div>
        <div>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-2xl">Tracklist</h2>
            <Link to="/music" className="text-xs font-medium tracking-wide text-muted hover:text-fg">
              See all
            </Link>
          </div>
          <div className="divide-y divide-line">
            {SONGS.slice(0, 10).map((song) => (
              <TrackRow key={song.id} song={song} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line px-5 py-16 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-2xl">Music videos</h2>
            <Link to="/videos" className="text-xs font-medium tracking-wide text-muted hover:text-fg">
              All videos
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {SONGS.slice(0, 4).map((song) => (
              <Link
                key={song.id}
                to="/watch/$id"
                params={{ id: song.id }}
                className="group relative aspect-video overflow-hidden rounded-lg"
              >
                <img
                  src={songStill(song)}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <div className="text-xs text-muted">{song.no.toString().padStart(2, "0")}</div>
                  <div className="font-display text-lg text-fg">{song.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line px-5 py-16 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs tracking-[0.28em] text-muted uppercase">Artist</p>
            <h2 className="mt-2 font-display text-3xl">The face is real. The singer is new.</h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">
              LINNEIRO is an AI pop artist built from your portrait — dark-haired, unhurried,
              looking straight at the camera. The twenty songs on AFTERGLOW are original English
              pop: vocoder lead, analog-leaning synths, choruses written for 3 a.m. drives. This
              site is the official drop.
            </p>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">
              Nascido de um rosto real. Voz de máquina. Pop em inglês. O álbum toca aqui.
            </p>
          </div>
          <div>
            <p className="text-xs tracking-[0.28em] text-muted uppercase">Listen</p>
            <ul className="mt-4 divide-y divide-line">
              {PLATFORMS.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <span className="text-sm text-fg">{p.name}</span>
                  <span className="text-xs text-muted">{p.status}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-faint">
              Spotify, Apple Music and YouTube need DistroKid or TuneCore in your legal name — I
              cannot upload from here. Download each track as WAV from Music or the video page,
              then submit the album there. The complete album plays here now.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

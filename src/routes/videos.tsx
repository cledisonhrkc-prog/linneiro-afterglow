import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { SONGS, songStill } from "@/lib/catalog";
import { usePlayer } from "@/lib/player-store";

export const Route = createFileRoute("/videos")({ component: Videos });

function Videos() {
  const play = usePlayer((s) => s.play);

  return (
    <main className="mx-auto max-w-6xl px-5 pt-28 md:px-8">
      <p className="text-xs tracking-[0.28em] text-muted uppercase">Official videos</p>
      <h1 className="mt-2 font-display text-4xl">AFTERGLOW — the clips</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Twenty lyric films. Each track has its own visual world — your face, the song, a live
        picture that moves with the mix.
      </p>
      <div className="mt-10 grid grid-cols-1 gap-4 pb-8 sm:grid-cols-2 lg:grid-cols-4">
        {SONGS.map((song) => (
          <Link
            key={song.id}
            to="/watch/$id"
            params={{ id: song.id }}
            onClick={() => void play(song)}
            className="group overflow-hidden rounded-lg border border-line bg-surface"
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={songStill(song)}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-bg/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-fg">
                  <Play className="size-5 fill-current" />
                </span>
              </div>
            </div>
            <div className="px-3 py-3">
              <div className="text-xs tabular-nums text-faint">
                {song.no.toString().padStart(2, "0")}
              </div>
              <div className="font-display text-lg text-fg">{song.title}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

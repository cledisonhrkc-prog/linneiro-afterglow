import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Play } from "lucide-react";
import { ClipPlayer } from "@/components/ClipPlayer";
import { LyricNow, LyricPanel } from "@/components/LyricPanel";
import { SONGS, songById, songClip, songDuration, songStill } from "@/lib/catalog";
import { useEngineClock } from "@/hooks/use-engine-clock";
import { usePlayer } from "@/lib/player-store";
import { formatTime } from "@/lib/utils";

export const Route = createFileRoute("/watch/$id")({
  component: Watch,
});

function Watch() {
  const { id } = Route.useParams();
  const song = songById(id) ?? SONGS[0]!;
  const current = usePlayer((s) => s.song);
  const playing = usePlayer((s) => s.playing);
  const exporting = usePlayer((s) => s.exporting);
  const toggle = usePlayer((s) => s.toggle);
  const play = usePlayer((s) => s.play);
  const exportTrack = usePlayer((s) => s.exportTrack);
  const isThis = current.id === song.id;
  const on = isThis && playing;
  const { t, bar } = useEngineClock(playing, current.id);
  const dur = songDuration(song);
  const idx = SONGS.findIndex((s) => s.id === song.id);
  const next = SONGS[(idx + 1) % SONGS.length]!;

  return (
    <main className="pt-16">
      <section className="relative mx-auto max-w-6xl overflow-hidden rounded-none md:mt-6 md:rounded-xl md:border md:border-line">
        <div className="relative aspect-video bg-surface">
          <ClipPlayer src={songClip(song)} poster={songStill(song)} playing={on} />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-bg via-transparent to-bg/25" />
          <button
            type="button"
            onClick={() => void toggle(song)}
            className="absolute inset-0 z-10 flex items-center justify-center"
            aria-label={on ? "Pause" : "Play video"}
          >
            {!on ? (
              <span className="flex size-16 items-center justify-center rounded-full bg-accent text-accent-fg transition-transform duration-150 active:scale-95">
                <Play className="size-6 fill-current pl-0.5" />
              </span>
            ) : null}
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-5 pb-6 text-center">
            <LyricNow song={isThis ? song : song} bar={isThis ? bar : 0} />
            <div className="text-xs tabular-nums text-muted">
              {formatTime(isThis ? t : 0)} / {formatTime(dur)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1fr_280px] md:px-8">
        <div>
          <p className="text-xs tracking-[0.28em] text-muted uppercase">
            Official video · Track {song.no.toString().padStart(2, "0")}
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">{song.title}</h1>
          <p className="mt-2 text-sm text-muted">
            LINNEIRO · AFTERGLOW · {song.bpm} BPM · {song.scale}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void exportTrack(song)}
              disabled={exporting}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium text-fg transition-colors hover:bg-raised disabled:opacity-50"
            >
              <Download className="size-4" />
              {exporting ? "Gerando WAV…" : "Download WAV"}
            </button>
            <a
              href={songClip(song)}
              download={`LINNEIRO-${song.no.toString().padStart(2, "0")}-${song.title}.mp4`}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium text-fg transition-colors hover:bg-raised"
            >
              <Download className="size-4" />
              Download clipe
            </a>
          </div>
          <div className="mt-10 max-h-[50vh] overflow-y-auto">
            <LyricPanel song={song} bar={isThis ? bar : -1} />
          </div>
        </div>
        <aside>
          <p className="text-xs tracking-[0.28em] text-muted uppercase">Up next</p>
          <Link
            to="/watch/$id"
            params={{ id: next.id }}
            onClick={() => void play(next)}
            className="mt-4 block overflow-hidden rounded-lg border border-line"
          >
            <img src={songStill(next)} alt="" className="aspect-video w-full object-cover" />
            <div className="px-3 py-3">
              <div className="text-xs text-faint">{next.no.toString().padStart(2, "0")}</div>
              <div className="font-display text-lg">{next.title}</div>
            </div>
          </Link>
          <img src={song.cover} alt="" className="mt-4 hidden rounded-lg border border-line md:block" />
        </aside>
      </section>
    </main>
  );
}
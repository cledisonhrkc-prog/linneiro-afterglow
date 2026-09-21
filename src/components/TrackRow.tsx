import { Link } from "@tanstack/react-router";
import { Download, Pause, Play } from "lucide-react";
import { type Song, songDuration } from "@/lib/catalog";
import { usePlayer } from "@/lib/player-store";
import { cn, formatTime } from "@/lib/utils";

export function TrackRow({ song, showCover = true }: { song: Song; showCover?: boolean }) {
  const current = usePlayer((s) => s.song);
  const playing = usePlayer((s) => s.playing);
  const exporting = usePlayer((s) => s.exporting);
  const toggle = usePlayer((s) => s.toggle);
  const exportTrack = usePlayer((s) => s.exportTrack);
  const active = current.id === song.id;
  const on = active && playing;

  return (
    <div
      className={cn(
        "group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-150 md:grid-cols-[48px_56px_1fr_auto_auto_auto] md:gap-4 md:px-3",
        active ? "bg-raised" : "hover:bg-raised/70",
      )}
    >
      <button
        type="button"
        onClick={() => void toggle(song)}
        className="flex size-11 items-center justify-center text-sm tabular-nums text-muted transition-colors group-hover:text-fg"
        aria-label={on ? `Pause ${song.title}` : `Play ${song.title}`}
      >
        <span className={cn("group-hover:hidden", on && "hidden", active && "text-live")}>
          {song.no.toString().padStart(2, "0")}
        </span>
        <span className={cn("hidden group-hover:block", on && "block")}>
          {on ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
        </span>
      </button>
      {showCover ? (
        <img src={song.cover} alt="" className="hidden size-11 rounded-sm object-cover md:block" />
      ) : null}
      <div className="min-w-0">
        <Link
          to="/watch/$id"
          params={{ id: song.id }}
          className={cn("block truncate text-base font-medium", active ? "text-live" : "text-fg")}
        >
          {song.title}
        </Link>
        <div className="truncate text-xs text-muted">LINNEIRO</div>
      </div>
      <div className="hidden text-xs text-faint md:block">{song.bpm} BPM</div>
      <div className="text-xs tabular-nums text-faint">{formatTime(songDuration(song))}</div>
      <button
        type="button"
        onClick={() => void exportTrack(song)}
        disabled={exporting}
        className="hidden size-11 items-center justify-center rounded-full text-muted transition-colors hover:text-fg disabled:opacity-40 md:flex"
        aria-label={`Download ${song.title}`}
      >
        <Download className="size-4" />
      </button>
    </div>
  );
}
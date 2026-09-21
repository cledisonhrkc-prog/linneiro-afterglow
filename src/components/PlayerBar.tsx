import { Link } from "@tanstack/react-router";
import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEngineClock } from "@/hooks/use-engine-clock";
import { songDuration } from "@/lib/catalog";
import { usePlayer } from "@/lib/player-store";
import { cn, formatTime } from "@/lib/utils";

export function PlayerBar() {
  const song = usePlayer((s) => s.song);
  const playing = usePlayer((s) => s.playing);
  const shuffle = usePlayer((s) => s.shuffle);
  const repeat = usePlayer((s) => s.repeat);
  const volume = usePlayer((s) => s.volume);
  const muted = usePlayer((s) => s.muted);
  const toggle = usePlayer((s) => s.toggle);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);
  const seek = usePlayer((s) => s.seek);
  const setVolume = usePlayer((s) => s.setVolume);
  const toggleMute = usePlayer((s) => s.toggleMute);
  const toggleShuffle = usePlayer((s) => s.toggleShuffle);
  const cycleRepeat = usePlayer((s) => s.cycleRepeat);
  const { t } = useEngineClock(playing, song.id);
  const dur = songDuration(song);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-5">
      <div className="pointer-events-auto mx-auto flex max-w-6xl items-center gap-3 rounded-xl border border-line bg-surface/90 px-3 py-2.5 shadow-soft backdrop-blur-md md:gap-5 md:px-4">
        <Link to="/watch/$id" params={{ id: song.id }} className="flex min-w-0 flex-1 items-center gap-3">
          <img
            src={song.cover}
            alt=""
            className="size-12 shrink-0 rounded-sm object-cover md:size-14"
          />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-fg">{song.title}</div>
            <div className="truncate text-xs text-muted">LINNEIRO · AFTERGLOW</div>
          </div>
        </Link>

        <div className="flex flex-col items-center gap-1 md:w-[42%]">
          <div className="flex items-center gap-1 md:gap-2">
            <button
              type="button"
              onClick={toggleShuffle}
              className={cn(
                "hidden size-9 items-center justify-center rounded-full transition-colors md:flex",
                shuffle ? "text-live" : "text-muted hover:text-fg",
              )}
              aria-label="Shuffle"
            >
              <Shuffle className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => void prev()}
              className="flex size-9 items-center justify-center rounded-full text-fg transition-transform duration-150 active:scale-95"
              aria-label="Previous"
            >
              <SkipBack className="size-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={() => void toggle()}
              className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-fg transition-transform duration-150 active:scale-95"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current pl-0.5" />}
            </button>
            <button
              type="button"
              onClick={() => void next()}
              className="flex size-9 items-center justify-center rounded-full text-fg transition-transform duration-150 active:scale-95"
              aria-label="Next"
            >
              <SkipForward className="size-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={cycleRepeat}
              className={cn(
                "hidden size-9 items-center justify-center rounded-full transition-colors md:flex",
                repeat === "off" ? "text-muted hover:text-fg" : "text-live",
              )}
              aria-label="Repeat"
            >
              {repeat === "one" ? <Repeat1 className="size-4" /> : <Repeat className="size-4" />}
            </button>
          </div>
          <div className="hidden w-full items-center gap-2 md:flex">
            <span className="w-8 text-right text-xs tabular-nums text-faint">{formatTime(t)}</span>
            <input
              className="player-seek w-full"
              type="range"
              min={0}
              max={dur}
              step={0.1}
              value={Math.min(t, dur)}
              onChange={(e) => void seek(Number(e.target.value))}
              aria-label="Seek"
              suppressHydrationWarning
            />
            <span className="w-8 text-xs tabular-nums text-faint">{formatTime(dur)}</span>
          </div>
        </div>

        <div className="hidden w-36 items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={toggleMute}
            className="flex size-8 items-center justify-center text-muted hover:text-fg"
            aria-label="Mute"
          >
            {muted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
          <input
            className="player-seek w-full"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volume"
            suppressHydrationWarning
          />
        </div>
      </div>
    </div>
  );
}

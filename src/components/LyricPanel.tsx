import { lyricAt, type Song } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function LyricPanel({ song, bar }: { song: Song; bar: number }) {
  const current = lyricAt(song, bar);
  return (
    <div className="flex flex-col items-center gap-2 px-6 text-center">
      {song.lyrics.map((line) => {
        const active = current?.bar === line.bar;
        const past = line.bar < (current?.bar ?? 0);
        return (
          <p
            key={`${line.bar}-${line.text}`}
            className={cn(
              "max-w-xl font-display text-xl transition-colors duration-200 ease-out md:text-3xl",
              active
                ? "scale-100 text-fg opacity-100"
                : past
                  ? "text-muted opacity-40"
                  : "text-faint opacity-30",
            )}
          >
            {line.text}
          </p>
        );
      })}
    </div>
  );
}

export function LyricNow({ song, bar }: { song: Song; bar: number }) {
  const current = lyricAt(song, bar);
  return (
    <p className="font-display text-2xl text-fg italic md:text-4xl">
      {current?.text ?? "·"}
    </p>
  );
}

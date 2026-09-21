import { create } from "zustand";
import { SONGS, type Song, songById } from "./catalog";
import { engine } from "./engine";

type Repeat = "off" | "all" | "one";

type PlayerState = {
  song: Song;
  playing: boolean;
  shuffle: boolean;
  repeat: Repeat;
  volume: number;
  muted: boolean;
  exporting: boolean;
  play: (song?: Song) => Promise<void>;
  pause: () => void;
  toggle: (song?: Song) => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  seek: (t: number) => Promise<void>;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  exportTrack: (song?: Song) => Promise<void>;
  exportAlbum: () => Promise<void>;
};

function indexOf(song: Song) {
  return SONGS.findIndex((s) => s.id === song.id);
}

function shuffledNext(current: Song) {
  if (SONGS.length < 2) return current;
  let next = current;
  while (next.id === current.id) {
    next = SONGS[Math.floor(Math.random() * SONGS.length)]!;
  }
  return next;
}

export const usePlayer = create<PlayerState>((set, get) => {
  engine.onEnd = () => {
    const { repeat, song } = get();
    if (repeat === "one") {
      void get().play(song);
      return;
    }
    void get().next();
  };

  engine.subscribe(() => {
    set({
      playing: engine.playing,
      song: engine.song ?? get().song,
    });
  });

  return {
    song: SONGS[0]!,
    playing: false,
    shuffle: false,
    repeat: "all",
    volume: 0.85,
    muted: false,
    exporting: false,
    play: async (song) => {
      const target = song ?? get().song;
      await engine.play(target, engine.song?.id === target.id ? engine.pauseOffset : 0);
      set({ song: target, playing: true });
    },
    pause: () => {
      engine.pause();
      set({ playing: false });
    },
    toggle: async (song) => {
      const target = song ?? get().song;
      if (get().playing && get().song.id === target.id) {
        get().pause();
        return;
      }
      await get().play(target);
    },
    next: async () => {
      const { song, shuffle, repeat } = get();
      const i = indexOf(song);
      if (shuffle) {
        await get().play(shuffledNext(song));
        return;
      }
      if (i >= SONGS.length - 1) {
        if (repeat === "off") {
          engine.stop();
          set({ playing: false });
          return;
        }
        await get().play(SONGS[0]);
        return;
      }
      await get().play(SONGS[i + 1]);
    },
    prev: async () => {
      if (engine.currentTime() > 3) {
        await engine.seek(0);
        return;
      }
      const i = indexOf(get().song);
      const prev = SONGS[i <= 0 ? SONGS.length - 1 : i - 1]!;
      await get().play(prev);
    },
    seek: async (t) => {
      await engine.seek(t);
    },
    setVolume: (v) => {
      engine.setVolume(v);
      set({ volume: v, muted: v === 0 });
    },
    toggleMute: () => {
      const { muted, volume } = get();
      if (muted) {
        const restore = volume || 0.85;
        engine.setVolume(restore);
        set({ muted: false, volume: restore });
      } else {
        engine.setVolume(0);
        set({ muted: true });
      }
    },
    toggleShuffle: () => set({ shuffle: !get().shuffle }),
    cycleRepeat: () => {
      const order: Repeat[] = ["off", "all", "one"];
      const i = order.indexOf(get().repeat);
      set({ repeat: order[(i + 1) % order.length] });
    },
    exportTrack: async (song) => {
      if (get().exporting) return;
      const target = song ?? get().song;
      set({ exporting: true });
      try {
        const blob = await engine.renderOffline(target);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `LINNEIRO - ${target.no.toString().padStart(2, "0")} ${target.title}.wav`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } finally {
        set({ exporting: false });
      }
    },
    exportAlbum: async () => {
      if (get().exporting) return;
      set({ exporting: true });
      try {
        for (const target of SONGS) {
          const blob = await engine.renderOffline(target);
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `LINNEIRO - ${target.no.toString().padStart(2, "0")} ${target.title}.wav`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          await new Promise((r) => setTimeout(r, 400));
        }
      } finally {
        set({ exporting: false });
      }
    },
  };
});

export function useNowPlaying() {
  return usePlayer((s) => s);
}

export { songById };

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  poster: string;
  playing: boolean;
};

export function ClipPlayer({ src, poster, playing }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (playing) {
      const play = video.play();
      if (play) void play.catch(() => {});
    } else {
      video.pause();
    }
  }, [playing, src]);

  return (
    <video
      key={src}
      ref={ref}
      src={src}
      poster={poster}
      loop
      muted
      playsInline
      preload="metadata"
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
    />
  );
}

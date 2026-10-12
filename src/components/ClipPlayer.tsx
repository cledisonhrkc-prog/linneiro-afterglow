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
      playsInline
      preload="auto"
      controls
      className="absolute inset-0 z-20 h-full w-full object-cover"
    />
  );
}

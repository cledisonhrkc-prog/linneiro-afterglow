import { useEffect, useState } from "react";
import { engine } from "@/lib/engine";

export function useEngineClock(playing: boolean, songId: string) {
  const [t, setT] = useState(() => engine.currentTime());
  const [bar, setBar] = useState(() => engine.currentBar());

  useEffect(() => {
    let id = 0;
    const tick = () => {
      setT(engine.currentTime());
      setBar(engine.currentBar());
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing, songId]);

  return { t, bar, duration: engine.duration(), section: engine.currentSection() };
}

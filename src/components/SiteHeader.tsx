import { Link, useRouterState } from "@tanstack/react-router";
import { ARTIST } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/music", label: "Music" },
  { to: "/pack-1", label: "Pack 1" },
  { to: "/pack-2", label: "Pack 2" },
  { to: "/copy", label: "Copiar" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-5 md:px-8">
      <Link
        to="/"
        className="pointer-events-auto font-display text-xl tracking-[0.22em] text-fg md:text-2xl"
      >
        {ARTIST.name}
      </Link>
      <nav className="pointer-events-auto flex items-center gap-1 rounded-full border border-line bg-bg/70 px-1.5 py-1 backdrop-blur-md">
        {LINKS.map((l) => {
          const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
          return (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide transition-colors duration-150",
                active ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

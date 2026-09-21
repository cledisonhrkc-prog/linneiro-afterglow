import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ARTIST, SONGS, songStill } from "@/lib/catalog";

export const Route = createFileRoute("/copy")({ component: CopyPage });

function albumText() {
  const lines = [
    `Artist: ${ARTIST.name}`,
    `Album: ${ARTIST.album} (${ARTIST.year})`,
    "Genre: English pop. AI singer built from a real photograph of a man with dark hair, a mustache, looking at camera.",
    "20 original songs. Please analyze the artist, the lyrics, and the stills I attach.",
    "",
  ];
  for (const song of SONGS) {
    const n = song.no.toString().padStart(2, "0");
    lines.push(`${n}. ${song.title} — ${song.bpm} BPM`);
    for (const line of song.lyrics) lines.push(line.text);
    lines.push("");
  }
  return lines.join("\n");
}

const TEXT = albumText();

function CopyPage() {
  const [ok, setOk] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(TEXT);
    setOk(true);
    window.setTimeout(() => setOk(false), 2000);
  }

  return (
    <main className="mx-auto max-w-3xl px-5 pt-28 pb-10 md:px-8">
      <p className="text-xs tracking-[0.28em] text-muted uppercase">Mandar pro ChatGPT</p>
      <h1 className="mt-2 font-display text-4xl">Copia e cola</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        1. Clica Copiar. 2. Abre o ChatGPT. 3. Cola o texto. 4. Anexa as fotos — Pack 1 e Pack
        2, botão direito na imagem → salvar.
      </p>
      <button
        type="button"
        onClick={() => void copy()}
        className="mt-6 inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-medium text-accent-fg"
      >
        {ok ? "Copiado" : "Copiar tudo"}
      </button>
      <textarea
        readOnly
        value={TEXT}
        className="mt-6 h-72 w-full resize-y rounded-xl border border-line bg-surface p-4 font-mono text-xs leading-relaxed text-fg"
      />
      <p className="mt-10 text-xs tracking-[0.28em] text-muted uppercase">Fotos 01–20</p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SONGS.map((song) => (
          <a
            key={song.id}
            href={songStill(song)}
            download={`linneiro-${song.no.toString().padStart(2, "0")}.jpg`}
            className="overflow-hidden rounded-lg border border-line"
          >
            <img src={songStill(song)} alt={song.title} className="aspect-video w-full object-cover" />
            <p className="truncate px-2 py-1 text-[11px] text-muted">
              {song.no.toString().padStart(2, "0")} {song.title}
            </p>
          </a>
        ))}
      </div>
    </main>
  );
}

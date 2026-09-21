#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { ARTIST, PLATFORMS, SONGS, padNo, songClip, songDuration, songStill } from "../src/lib/catalog.ts";

function q(value) {
  if (value == null) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function numArr(arr) {
  return `ARRAY[${arr.join(", ")}]::int[]`;
}

const lines = [];
const push = (s = "") => lines.push(s);

push("-- LINNEIRO / AFTERGLOW");
push("-- 20 English pop songs, lyrics, covers, clips");
push("-- PostgreSQL 14+");
push("BEGIN;");
push("");
push("DROP TABLE IF EXISTS lyrics CASCADE;");
push("DROP TABLE IF EXISTS songs CASCADE;");
push("DROP TABLE IF EXISTS platforms CASCADE;");
push("DROP TABLE IF EXISTS albums CASCADE;");
push("DROP TABLE IF EXISTS artists CASCADE;");
push("");
push(`CREATE TABLE artists (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  origin      text,
  genre       text,
  portrait    text,
  hero        text,
  avatar      text
);`);
push("");
push(`CREATE TABLE albums (
  id          text PRIMARY KEY,
  artist_id   text NOT NULL REFERENCES artists(id),
  title       text NOT NULL,
  year        int,
  released    date,
  genre       text,
  cover       text
);`);
push("");
push(`CREATE TABLE songs (
  id                text PRIMARY KEY,
  album_id          text NOT NULL REFERENCES albums(id),
  track_no          int NOT NULL,
  title             text NOT NULL,
  bpm               int NOT NULL,
  bars              int NOT NULL,
  tonic             int NOT NULL,
  scale             text NOT NULL,
  energy            numeric(4,3) NOT NULL,
  brightness        numeric(4,3) NOT NULL,
  swing             numeric(4,3) NOT NULL,
  mood              text NOT NULL,
  theme             text NOT NULL,
  cover             text NOT NULL,
  clip              text NOT NULL,
  still             text NOT NULL,
  duration_seconds  numeric(8,3) NOT NULL,
  verse_chords      int[] NOT NULL,
  chorus_chords     int[] NOT NULL,
  verse_hook        int[] NOT NULL,
  chorus_hook       int[] NOT NULL
);`);
push("");
push(`CREATE TABLE lyrics (
  id        serial PRIMARY KEY,
  song_id   text NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  bar       int NOT NULL,
  line      text NOT NULL
);`);
push("");
push(`CREATE TABLE platforms (
  id      text PRIMARY KEY,
  name    text NOT NULL,
  status  text NOT NULL
);`);
push("");
push("INSERT INTO artists (id, name, origin, genre, portrait, hero, avatar) VALUES (");
push(
  `  ${q("linneiro")}, ${q(ARTIST.name)}, ${q(ARTIST.origin)}, ${q(ARTIST.genre)}, ${q(ARTIST.portrait)}, ${q(ARTIST.hero)}, ${q(ARTIST.avatar)}`,
);
push(");");
push("");
push("INSERT INTO albums (id, artist_id, title, year, released, genre, cover) VALUES (");
push(
  `  ${q("afterglow")}, ${q("linneiro")}, ${q(ARTIST.album)}, ${ARTIST.year}, ${q("2026-09-19")}, ${q(ARTIST.genre)}, ${q(ARTIST.albumCover)}`,
);
push(");");
push("");

for (const song of SONGS) {
  push("INSERT INTO songs (");
  push("  id, album_id, track_no, title, bpm, bars, tonic, scale,");
  push("  energy, brightness, swing, mood, theme, cover, clip, still,");
  push("  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook");
  push(") VALUES (");
  push(`  ${q(song.id)}, ${q("afterglow")}, ${song.no}, ${q(song.title)}, ${song.bpm}, ${song.bars}, ${song.tonic}, ${q(song.scale)},`);
  push(`  ${song.energy}, ${song.brightness}, ${song.swing}, ${q(song.mood)}, ${q(song.theme)},`);
  push(`  ${q(song.cover)}, ${q(songClip(song))}, ${q(songStill(song))},`);
  push(`  ${songDuration(song).toFixed(3)}, ${numArr(song.verseChords)}, ${numArr(song.chorusChords)},`);
  push(`  ${numArr(song.verseHook)}, ${numArr(song.chorusHook)}`);
  push(");");
  push("");
  if (song.lyrics.length) {
    push("INSERT INTO lyrics (song_id, bar, line) VALUES");
    const vals = song.lyrics.map((l, i) => {
      const comma = i === song.lyrics.length - 1 ? ";" : ",";
      return `  (${q(song.id)}, ${l.bar}, ${q(l.text)})${comma}`;
    });
    vals.forEach(push);
    push("");
  }
}

push("INSERT INTO platforms (id, name, status) VALUES");
PLATFORMS.forEach((p, i) => {
  const comma = i === PLATFORMS.length - 1 ? ";" : ",";
  push(`  (${q(p.id)}, ${q(p.name)}, ${q(p.status)})${comma}`);
});
push("");
push("COMMIT;");
push("");

const sql = lines.join("\n");
writeFileSync("/workspace/public/linneiro-afterglow.sql", sql);
writeFileSync("/workspace/artifacts/linneiro-afterglow.sql", sql);
console.log(`wrote ${sql.length} bytes, ${SONGS.length} songs`);

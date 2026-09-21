-- LINNEIRO / AFTERGLOW
-- 20 English pop songs, lyrics, covers, clips
-- PostgreSQL 14+
BEGIN;

DROP TABLE IF EXISTS lyrics CASCADE;
DROP TABLE IF EXISTS songs CASCADE;
DROP TABLE IF EXISTS platforms CASCADE;
DROP TABLE IF EXISTS albums CASCADE;
DROP TABLE IF EXISTS artists CASCADE;

CREATE TABLE artists (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  origin      text,
  genre       text,
  portrait    text,
  hero        text,
  avatar      text
);

CREATE TABLE albums (
  id          text PRIMARY KEY,
  artist_id   text NOT NULL REFERENCES artists(id),
  title       text NOT NULL,
  year        int,
  released    date,
  genre       text,
  cover       text
);

CREATE TABLE songs (
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
);

CREATE TABLE lyrics (
  id        serial PRIMARY KEY,
  song_id   text NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  bar       int NOT NULL,
  line      text NOT NULL
);

CREATE TABLE platforms (
  id      text PRIMARY KEY,
  name    text NOT NULL,
  status  text NOT NULL
);

INSERT INTO artists (id, name, origin, genre, portrait, hero, avatar) VALUES (
  'linneiro', 'LINNEIRO', 'AI-born from a real face', 'Pop', '/artist/source-square.jpg', '/artist/hero.jpg', '/artist/avatar.png'
);

INSERT INTO albums (id, artist_id, title, year, released, genre, cover) VALUES (
  'afterglow', 'linneiro', 'AFTERGLOW', 2026, '2026-09-19', 'Pop', '/artist/album.jpg'
);

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'afterglow', 'afterglow', 1, 'Afterglow', 118, 52, 48, 'minor',
  0.72, 0.55, 0.04, 'ember', 'bloom',
  '/covers/01.jpg', '/videos/01.mp4', '/stills/01.jpg',
  105.763, ARRAY[0, 5, 3, 4]::int[], ARRAY[5, 3, 0, 4]::int[],
  ARRAY[0, -99, 0, 2, 3, 3, 2, 0, 0, -99, 2, 3, 5, 3, 2, -99]::int[], ARRAY[4, 4, 5, 7, 7, -99, 5, 4, 2, 2, 0, 0, 4, 2, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('afterglow', 4, 'The city holds its breath tonight'),
  ('afterglow', 6, 'Streetlights humming through the glass'),
  ('afterglow', 8, 'I still see you in the leftover light'),
  ('afterglow', 10, 'A photograph that wouldn''t last'),
  ('afterglow', 12, 'Don''t ask me to forget the heat'),
  ('afterglow', 14, 'The way the evening learned our names'),
  ('afterglow', 16, 'We were brighter in the afterglow'),
  ('afterglow', 18, 'Burning quiet where the night don''t go'),
  ('afterglow', 20, 'If the morning tries to take us home'),
  ('afterglow', 22, 'I''ll keep you in the afterglow'),
  ('afterglow', 24, 'Your jacket on the hotel chair'),
  ('afterglow', 26, 'A song we never learned to sing'),
  ('afterglow', 28, 'I talk to shadows like you''re there'),
  ('afterglow', 30, 'And every silence has your name in it'),
  ('afterglow', 32, 'We were brighter in the afterglow'),
  ('afterglow', 34, 'Burning quiet where the night don''t go'),
  ('afterglow', 36, 'If the morning tries to take us home'),
  ('afterglow', 38, 'I''ll keep you in the afterglow'),
  ('afterglow', 40, 'Hold the dark a little longer'),
  ('afterglow', 42, 'Let the embers learn to stay'),
  ('afterglow', 44, 'We were brighter in the afterglow'),
  ('afterglow', 46, 'Don''t you let the morning know'),
  ('afterglow', 48, 'I''ll keep you in the afterglow'),
  ('afterglow', 50, 'I''ll keep you in the afterglow');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'midnight-frequency', 'afterglow', 2, 'Midnight Frequency', 102, 48, 45, 'minor',
  0.55, 0.35, 0.06, 'night', 'scan',
  '/covers/02.jpg', '/videos/02.mp4', '/stills/02.jpg',
  112.941, ARRAY[0, 6, 3, 4]::int[], ARRAY[0, 3, 5, 4]::int[],
  ARRAY[0, 0, -99, 2, 3, -99, 5, 3, 2, 2, -99, 0, 3, 2, 0, -99]::int[], ARRAY[7, 5, 4, 5, 7, -99, 4, 2, 0, 0, 2, 3, 5, 4, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('midnight-frequency', 4, 'Tuned the dial until it found you'),
  ('midnight-frequency', 6, 'Static kissing through the wire'),
  ('midnight-frequency', 8, 'Every late-night station sounds like'),
  ('midnight-frequency', 10, 'A room we never quite left behind'),
  ('midnight-frequency', 12, 'Say my name across the distance'),
  ('midnight-frequency', 14, 'I''ll be listening on the line'),
  ('midnight-frequency', 16, 'You''re a midnight frequency'),
  ('midnight-frequency', 18, 'Coming in when the world goes quiet'),
  ('midnight-frequency', 20, 'If the signal starts to leave me'),
  ('midnight-frequency', 22, 'I''ll keep turning through the night'),
  ('midnight-frequency', 24, 'Hotel radios and rain on glass'),
  ('midnight-frequency', 26, 'I collect the songs you used to play'),
  ('midnight-frequency', 28, 'There''s a ghost inside the broadcast'),
  ('midnight-frequency', 30, 'And it knows the words I never say'),
  ('midnight-frequency', 32, 'You''re a midnight frequency'),
  ('midnight-frequency', 34, 'Coming in when the world goes quiet'),
  ('midnight-frequency', 36, 'If the signal starts to leave me'),
  ('midnight-frequency', 38, 'I''ll keep turning through the night'),
  ('midnight-frequency', 40, 'Don''t you fade, don''t you fade'),
  ('midnight-frequency', 42, 'Stay between the stations'),
  ('midnight-frequency', 44, 'Midnight frequency'),
  ('midnight-frequency', 46, 'Stay with me');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'glass-heart', 'afterglow', 3, 'Glass Heart', 96, 48, 50, 'minor',
  0.4, 0.42, 0.02, 'haze', 'shatter',
  '/covers/03.jpg', '/videos/03.mp4', '/stills/03.jpg',
  120.000, ARRAY[0, 3, 5, 4]::int[], ARRAY[5, 0, 3, 4]::int[],
  ARRAY[4, -99, 2, 0, 0, -99, 2, 3, 4, 4, -99, 5, 3, 2, 0, -99]::int[], ARRAY[7, 7, 5, 4, 4, -99, 2, 0, 3, 3, 2, 0, 4, 2, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('glass-heart', 4, 'You held me like a secret'),
  ('glass-heart', 6, 'Too careful and too loud'),
  ('glass-heart', 8, 'I learned the sound of leaving'),
  ('glass-heart', 10, 'Before you said it out loud'),
  ('glass-heart', 12, 'Every promise has an edge'),
  ('glass-heart', 14, 'Every tenderness a crack'),
  ('glass-heart', 16, 'I gave you a glass heart'),
  ('glass-heart', 18, 'You looked surprised when it broke'),
  ('glass-heart', 20, 'Now the light comes through the pieces'),
  ('glass-heart', 22, 'That''s a kind of hope'),
  ('glass-heart', 24, 'I swept the floor at midnight'),
  ('glass-heart', 26, 'Kept a shard inside my coat'),
  ('glass-heart', 28, 'If I bleed a little later'),
  ('glass-heart', 30, 'At least I''ll know I felt it most'),
  ('glass-heart', 32, 'I gave you a glass heart'),
  ('glass-heart', 34, 'You looked surprised when it broke'),
  ('glass-heart', 36, 'Now the light comes through the pieces'),
  ('glass-heart', 38, 'That''s a kind of hope'),
  ('glass-heart', 40, 'Don''t you gather what you shattered'),
  ('glass-heart', 42, 'Let it glitter, let it go'),
  ('glass-heart', 44, 'Glass heart, glass heart'),
  ('glass-heart', 46, 'Still it shows');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'neon-saints', 'afterglow', 4, 'Neon Saints', 124, 48, 53, 'dorian',
  0.88, 0.6, 0, 'pulse', 'grid',
  '/covers/04.jpg', '/videos/04.mp4', '/stills/04.jpg',
  92.903, ARRAY[0, 6, 3, 4]::int[], ARRAY[0, 4, 6, 3]::int[],
  ARRAY[0, 0, 3, 5, 7, 7, 5, 3, 0, 0, 3, 5, 4, 4, 2, -99]::int[], ARRAY[7, 7, 7, 4, 4, -99, 6, 4, 0, 0, 2, 4, 7, 5, 4, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('neon-saints', 4, 'We don''t pray, we just keep dancing'),
  ('neon-saints', 6, 'Halos made of traffic light'),
  ('neon-saints', 8, 'Every sinner on this corner'),
  ('neon-saints', 10, 'Looks like heaven after midnight'),
  ('neon-saints', 12, 'Raise a glass to getting older'),
  ('neon-saints', 14, 'Raise a hand and miss the beat'),
  ('neon-saints', 16, 'Neon saints, neon saints'),
  ('neon-saints', 18, 'Bless the ones who stay too late'),
  ('neon-saints', 20, 'If the morning wants a martyr'),
  ('neon-saints', 22, 'We already burned the page'),
  ('neon-saints', 24, 'Your red dress is a cathedral'),
  ('neon-saints', 26, 'My bad luck is just a hymn'),
  ('neon-saints', 28, 'Kiss me like you mean the ending'),
  ('neon-saints', 30, 'Sing it like a last amen'),
  ('neon-saints', 32, 'Neon saints, neon saints'),
  ('neon-saints', 34, 'Bless the ones who stay too late'),
  ('neon-saints', 36, 'If the morning wants a martyr'),
  ('neon-saints', 38, 'We already burned the page'),
  ('neon-saints', 40, 'Hallelujah in the alley'),
  ('neon-saints', 42, 'Nothing holy, still we shine'),
  ('neon-saints', 44, 'Neon saints'),
  ('neon-saints', 46, 'Neon saints');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'dont-call-it-love', 'afterglow', 5, 'Don''t Call It Love', 110, 48, 52, 'minor',
  0.6, 0.48, 0.05, 'ember', 'orbit',
  '/covers/05.jpg', '/videos/05.mp4', '/stills/05.jpg',
  104.727, ARRAY[0, 4, 5, 3]::int[], ARRAY[5, 4, 0, 3]::int[],
  ARRAY[2, 2, 0, -99, 3, 3, 2, 0, 5, 4, 2, -99, 0, 0, -99, -99]::int[], ARRAY[4, 5, 7, 7, 5, 4, 2, 0, 4, 4, 2, 0, 5, 3, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('dont-call-it-love', 4, 'You say forever like a rumor'),
  ('dont-call-it-love', 6, 'Soft enough to pass for true'),
  ('dont-call-it-love', 8, 'I keep my coat on in your kitchen'),
  ('dont-call-it-love', 10, 'I already know the move'),
  ('dont-call-it-love', 12, 'Call it weather, call it timing'),
  ('dont-call-it-love', 14, 'Call it anything but this'),
  ('dont-call-it-love', 16, 'Don''t call it love, don''t call it love'),
  ('dont-call-it-love', 18, 'If you''re leaving in the morning'),
  ('dont-call-it-love', 20, 'Don''t call it love, don''t call it love'),
  ('dont-call-it-love', 22, 'Just because it felt like falling'),
  ('dont-call-it-love', 24, 'We were good at almost meaning it'),
  ('dont-call-it-love', 26, 'Good at burning through a night'),
  ('dont-call-it-love', 28, 'I don''t need another sermon'),
  ('dont-call-it-love', 30, 'I just need you not to lie'),
  ('dont-call-it-love', 32, 'Don''t call it love, don''t call it love'),
  ('dont-call-it-love', 34, 'If you''re leaving in the morning'),
  ('dont-call-it-love', 36, 'Don''t call it love, don''t call it love'),
  ('dont-call-it-love', 38, 'Just because it felt like falling'),
  ('dont-call-it-love', 40, 'Keep the heat, keep the hush'),
  ('dont-call-it-love', 42, 'Leave the word out of your mouth'),
  ('dont-call-it-love', 44, 'Don''t call it love'),
  ('dont-call-it-love', 46, 'Let it burn without a name');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'runaway-lights', 'afterglow', 6, 'Runaway Lights', 126, 48, 55, 'minor',
  0.85, 0.58, 0, 'cold', 'rain',
  '/covers/06.jpg', '/videos/06.mp4', '/stills/06.jpg',
  91.429, ARRAY[0, 6, 4, 5]::int[], ARRAY[0, 3, 6, 4]::int[],
  ARRAY[0, 0, 4, 5, 7, -99, 5, 4, 0, 0, 2, 4, 5, 4, 0, -99]::int[], ARRAY[7, 7, 5, 4, 7, 7, 4, 2, 0, 0, 2, 4, 7, 5, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('runaway-lights', 4, 'Packed the night into the backseat'),
  ('runaway-lights', 6, 'Left the city like a bruise'),
  ('runaway-lights', 8, 'Every exit said your name in'),
  ('runaway-lights', 10, 'Red and white I couldn''t use'),
  ('runaway-lights', 12, 'Tell the dark we''re only passing'),
  ('runaway-lights', 14, 'Tell the map to look away'),
  ('runaway-lights', 16, 'Runaway lights, runaway lights'),
  ('runaway-lights', 18, 'Chase me out of my old life'),
  ('runaway-lights', 20, 'If the highway wants a reason'),
  ('runaway-lights', 22, 'I was never good at goodbye'),
  ('runaway-lights', 24, 'Coffee cooling on the dashboard'),
  ('runaway-lights', 26, 'Your song dying in the tape'),
  ('runaway-lights', 28, 'I don''t know the town we''re headed'),
  ('runaway-lights', 30, 'I just know I can''t stay late'),
  ('runaway-lights', 32, 'Runaway lights, runaway lights'),
  ('runaway-lights', 34, 'Chase me out of my old life'),
  ('runaway-lights', 36, 'If the highway wants a reason'),
  ('runaway-lights', 38, 'I was never good at goodbye'),
  ('runaway-lights', 40, 'Don''t look back, the glass is burning'),
  ('runaway-lights', 42, 'Every mile undoes a lie'),
  ('runaway-lights', 44, 'Runaway lights'),
  ('runaway-lights', 46, 'Keep me flying');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'slow-burn', 'afterglow', 7, 'Slow Burn', 84, 44, 48, 'major',
  0.28, 0.62, 0.08, 'ember', 'haze',
  '/covers/07.jpg', '/videos/07.mp4', '/stills/07.jpg',
  125.714, ARRAY[0, 4, 5, 3]::int[], ARRAY[5, 3, 0, 4]::int[],
  ARRAY[4, -99, 2, 0, -99, 4, 5, 4, 2, -99, 0, 2, 4, 2, 0, -99]::int[], ARRAY[4, 4, 5, 7, 4, -99, 2, 0, 5, 5, 4, 2, 0, 2, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('slow-burn', 4, 'No fireworks, no sirens'),
  ('slow-burn', 6, 'Just a match against the dark'),
  ('slow-burn', 8, 'You don''t rush a thing worth keeping'),
  ('slow-burn', 10, 'You just stay and leave a mark'),
  ('slow-burn', 12, 'Take the long way through the evening'),
  ('slow-burn', 14, 'Let the quiet do the work'),
  ('slow-burn', 16, 'This is a slow burn, baby'),
  ('slow-burn', 18, 'Not a blaze to survive'),
  ('slow-burn', 20, 'If it takes the whole night'),
  ('slow-burn', 22, 'That''s alright, that''s alright'),
  ('slow-burn', 24, 'Your hand finds mine like a rumor'),
  ('slow-burn', 26, 'That the world already knew'),
  ('slow-burn', 28, 'I don''t need a grand confession'),
  ('slow-burn', 30, 'I just need the morning with you'),
  ('slow-burn', 32, 'This is a slow burn, baby'),
  ('slow-burn', 34, 'Not a blaze to survive'),
  ('slow-burn', 36, 'If it takes the whole night'),
  ('slow-burn', 38, 'That''s alright, that''s alright'),
  ('slow-burn', 40, 'Stay, stay, let it smolder'),
  ('slow-burn', 42, 'Slow burn, hold me closer');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'city-of-ghosts', 'afterglow', 8, 'City of Ghosts', 90, 48, 51, 'minor',
  0.35, 0.3, 0.03, 'night', 'rain',
  '/covers/08.jpg', '/videos/08.mp4', '/stills/08.jpg',
  128.000, ARRAY[0, 5, 6, 4]::int[], ARRAY[0, 3, 5, 6]::int[],
  ARRAY[0, -99, 2, 3, -99, 5, 3, 2, 0, -99, 3, 5, 7, 5, 3, -99]::int[], ARRAY[5, 5, 3, 0, 7, 5, 3, 0, 4, 4, 2, 0, 5, 3, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('city-of-ghosts', 4, 'Empty cafés keep our table'),
  ('city-of-ghosts', 6, 'Windows breathing on the street'),
  ('city-of-ghosts', 8, 'I walk the blocks we used to waste'),
  ('city-of-ghosts', 10, 'And every doorway wears your heat'),
  ('city-of-ghosts', 12, 'The city learned to speak in echoes'),
  ('city-of-ghosts', 14, 'I answer like you''re still around'),
  ('city-of-ghosts', 16, 'This is a city of ghosts'),
  ('city-of-ghosts', 18, 'And I''m the last one going home'),
  ('city-of-ghosts', 20, 'If I turn the corner slowly'),
  ('city-of-ghosts', 22, 'Maybe you''ll be there in gold'),
  ('city-of-ghosts', 24, 'Rain redraws the map of almost'),
  ('city-of-ghosts', 26, 'Neon spelling what we lost'),
  ('city-of-ghosts', 28, 'I keep your key out of a habit'),
  ('city-of-ghosts', 30, 'Not a hope, not anymore, just cost'),
  ('city-of-ghosts', 32, 'This is a city of ghosts'),
  ('city-of-ghosts', 34, 'And I''m the last one going home'),
  ('city-of-ghosts', 36, 'If I turn the corner slowly'),
  ('city-of-ghosts', 38, 'Maybe you''ll be there in gold'),
  ('city-of-ghosts', 40, 'Don''t you haunt me kindly'),
  ('city-of-ghosts', 42, 'Haunt me true'),
  ('city-of-ghosts', 44, 'City of ghosts'),
  ('city-of-ghosts', 46, 'I''m still walking you');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'one-last-dance', 'afterglow', 9, 'One Last Dance', 118, 48, 53, 'major',
  0.7, 0.72, 0.1, 'pulse', 'orbit',
  '/covers/09.jpg', '/videos/09.mp4', '/stills/09.jpg',
  97.627, ARRAY[0, 4, 5, 3]::int[], ARRAY[0, 5, 3, 4]::int[],
  ARRAY[4, 4, 2, 0, 5, 5, 4, 2, 0, -99, 2, 4, 5, 4, 0, -99]::int[], ARRAY[4, 5, 7, 7, 4, 2, 0, -99, 5, 5, 4, 2, 4, 2, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('one-last-dance', 4, 'Put your troubles on the coat rack'),
  ('one-last-dance', 6, 'Let the band play something slow'),
  ('one-last-dance', 8, 'If the night is almost over'),
  ('one-last-dance', 10, 'We can still refuse to go'),
  ('one-last-dance', 12, 'One more turn around the room'),
  ('one-last-dance', 14, 'One more lie that feels like luck'),
  ('one-last-dance', 16, 'Give me one last dance'),
  ('one-last-dance', 18, 'Before the lights come up'),
  ('one-last-dance', 20, 'If the morning wants the story'),
  ('one-last-dance', 22, 'We can tell it as a rush'),
  ('one-last-dance', 24, 'Your hand is a little reckless'),
  ('one-last-dance', 26, 'My timing''s a little late'),
  ('one-last-dance', 28, 'Still the floor remembers both of us'),
  ('one-last-dance', 30, 'Like the song could change our fate'),
  ('one-last-dance', 32, 'Give me one last dance'),
  ('one-last-dance', 34, 'Before the lights come up'),
  ('one-last-dance', 36, 'If the morning wants the story'),
  ('one-last-dance', 38, 'We can tell it as a rush'),
  ('one-last-dance', 40, 'Don''t let go, don''t let go'),
  ('one-last-dance', 42, 'Count to four and spin me slow'),
  ('one-last-dance', 44, 'One last dance'),
  ('one-last-dance', 46, 'Then we go');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'electric-silence', 'afterglow', 10, 'Electric Silence', 108, 48, 47, 'minor',
  0.5, 0.38, 0, 'cold', 'scan',
  '/covers/10.jpg', '/videos/10.mp4', '/stills/10.jpg',
  106.667, ARRAY[0, 6, 3, 5]::int[], ARRAY[0, 4, 6, 3]::int[],
  ARRAY[0, -99, -99, 3, 5, -99, 3, 0, 2, -99, 3, 5, 7, 5, 3, -99]::int[], ARRAY[7, -99, 5, 4, 7, -99, 4, 0, 3, 3, 2, 0, 5, 4, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('electric-silence', 4, 'The room is full of unsaid voltage'),
  ('electric-silence', 6, 'Your phone face-down like a blade'),
  ('electric-silence', 8, 'I can hear the almost-sorry'),
  ('electric-silence', 10, 'In the way you look away'),
  ('electric-silence', 12, 'We could talk, we could break it'),
  ('electric-silence', 14, 'We just let the quiet hum'),
  ('electric-silence', 16, 'Electric silence'),
  ('electric-silence', 18, 'Louder than a fight'),
  ('electric-silence', 20, 'If you want me, say it'),
  ('electric-silence', 22, 'Don''t just fill the night'),
  ('electric-silence', 24, 'Sparks along the kitchen counter'),
  ('electric-silence', 26, 'Nothing moving but the clock'),
  ('electric-silence', 28, 'I would take a broken sentence'),
  ('electric-silence', 30, 'Over living in the static'),
  ('electric-silence', 32, 'Electric silence'),
  ('electric-silence', 34, 'Louder than a fight'),
  ('electric-silence', 36, 'If you want me, say it'),
  ('electric-silence', 38, 'Don''t just fill the night'),
  ('electric-silence', 40, 'Speak, or let me go'),
  ('electric-silence', 42, 'I can''t hold a ghost that won''t'),
  ('electric-silence', 44, 'Electric silence'),
  ('electric-silence', 46, 'Cut the wire');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'paper-crown', 'afterglow', 11, 'Paper Crown', 100, 48, 45, 'minor',
  0.45, 0.5, 0.04, 'haze', 'shatter',
  '/covers/11.jpg', '/videos/11.mp4', '/stills/11.jpg',
  115.200, ARRAY[0, 3, 4, 5]::int[], ARRAY[5, 0, 3, 4]::int[],
  ARRAY[3, 2, 0, -99, 4, 3, 2, 0, 5, 4, 2, -99, 0, 2, 0, -99]::int[], ARRAY[7, 5, 4, 0, 7, 5, 3, 0, 4, 4, 2, 0, 5, 3, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('paper-crown', 4, 'They dressed me up in borrowed glory'),
  ('paper-crown', 6, 'Told me I was made of more'),
  ('paper-crown', 8, 'But a kingdom built of paper'),
  ('paper-crown', 10, 'Folds the second it gets warm'),
  ('paper-crown', 12, 'I smile like I was chosen'),
  ('paper-crown', 14, 'I shake like I was found'),
  ('paper-crown', 16, 'I wear a paper crown'),
  ('paper-crown', 18, 'Don''t you look too close'),
  ('paper-crown', 20, 'If the rain comes down'),
  ('paper-crown', 22, 'I''ll be nobody you know'),
  ('paper-crown', 24, 'Applause is just a weather'),
  ('paper-crown', 26, 'It moves, it never stays'),
  ('paper-crown', 28, 'I keep a spare identity'),
  ('paper-crown', 30, 'In the lining of my name'),
  ('paper-crown', 32, 'I wear a paper crown'),
  ('paper-crown', 34, 'Don''t you look too close'),
  ('paper-crown', 36, 'If the rain comes down'),
  ('paper-crown', 38, 'I''ll be nobody you know'),
  ('paper-crown', 40, 'Let it wrinkle, let it tear'),
  ('paper-crown', 42, 'I was never the heir'),
  ('paper-crown', 44, 'Paper crown'),
  ('paper-crown', 46, 'I''m still here');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'until-morning', 'afterglow', 12, 'Until Morning', 92, 48, 52, 'dorian',
  0.38, 0.44, 0.07, 'night', 'haze',
  '/covers/12.jpg', '/videos/12.mp4', '/stills/12.jpg',
  125.217, ARRAY[0, 4, 3, 5]::int[], ARRAY[0, 5, 3, 4]::int[],
  ARRAY[4, -99, 2, 0, 5, -99, 4, 2, 0, -99, 2, 4, 5, 4, 2, -99]::int[], ARRAY[5, 5, 4, 2, 0, -99, 4, 5, 7, 5, 4, 2, 0, 2, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('until-morning', 4, 'Don''t you start the car yet'),
  ('until-morning', 6, 'The sky is still deciding'),
  ('until-morning', 8, 'We can steal another hour'),
  ('until-morning', 10, 'From the thing called daylight'),
  ('until-morning', 12, 'Talk in almost-whispers'),
  ('until-morning', 14, 'Like the walls are on our side'),
  ('until-morning', 16, 'Stay until morning'),
  ('until-morning', 18, 'Let the dark do what it does'),
  ('until-morning', 20, 'If the sun wants a confession'),
  ('until-morning', 22, 'We''ll be gone before it comes'),
  ('until-morning', 24, 'Your pulse against my shoulder'),
  ('until-morning', 26, 'A clock that lost the will'),
  ('until-morning', 28, 'I would trade a hundred daytimes'),
  ('until-morning', 30, 'For a night that wants us still'),
  ('until-morning', 32, 'Stay until morning'),
  ('until-morning', 34, 'Let the dark do what it does'),
  ('until-morning', 36, 'If the sun wants a confession'),
  ('until-morning', 38, 'We''ll be gone before it comes'),
  ('until-morning', 40, 'One more song, one more window'),
  ('until-morning', 42, 'Hold the blue hour down'),
  ('until-morning', 44, 'Until morning'),
  ('until-morning', 46, 'Stay somehow');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'hurt-like-heaven', 'afterglow', 13, 'Hurt Like Heaven', 122, 52, 48, 'minor',
  0.8, 0.52, 0, 'ember', 'bloom',
  '/covers/13.jpg', '/videos/13.mp4', '/stills/13.jpg',
  102.295, ARRAY[0, 6, 3, 4]::int[], ARRAY[5, 3, 0, 4]::int[],
  ARRAY[0, 0, 3, 5, 7, -99, 5, 3, 0, 2, 3, 5, 4, 4, 2, -99]::int[], ARRAY[7, 7, 5, 4, 7, 7, 4, 0, 5, 5, 3, 0, 4, 2, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('hurt-like-heaven', 4, 'You loved me like a landslide'),
  ('hurt-like-heaven', 6, 'Beautiful and much too fast'),
  ('hurt-like-heaven', 8, 'I still taste the almost-holy'),
  ('hurt-like-heaven', 10, 'In a wound that learned to last'),
  ('hurt-like-heaven', 12, 'If this is what the fall is'),
  ('hurt-like-heaven', 14, 'I would take it all again'),
  ('hurt-like-heaven', 16, 'You hurt like heaven'),
  ('hurt-like-heaven', 18, 'You leave like light'),
  ('hurt-like-heaven', 20, 'I keep the bruise because it'),
  ('hurt-like-heaven', 22, 'Proves I was alive'),
  ('hurt-like-heaven', 24, 'Choir of the 3 a.m. traffic'),
  ('hurt-like-heaven', 26, 'Stained glass in a liquor sign'),
  ('hurt-like-heaven', 28, 'I got down on nothing''s altar'),
  ('hurt-like-heaven', 30, 'And I swore you were divine'),
  ('hurt-like-heaven', 32, 'You hurt like heaven'),
  ('hurt-like-heaven', 34, 'You leave like light'),
  ('hurt-like-heaven', 36, 'I keep the bruise because it'),
  ('hurt-like-heaven', 38, 'Proves I was alive'),
  ('hurt-like-heaven', 40, 'Amen, amen, I still want it'),
  ('hurt-like-heaven', 42, 'Even when it splits the sky'),
  ('hurt-like-heaven', 44, 'You hurt like heaven'),
  ('hurt-like-heaven', 46, 'Don''t you dare be kind'),
  ('hurt-like-heaven', 48, 'Hurt like heaven'),
  ('hurt-like-heaven', 50, 'Stay in my mind');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'static-kiss', 'afterglow', 14, 'Static Kiss', 98, 48, 54, 'minor',
  0.42, 0.4, 0.05, 'cold', 'scan',
  '/covers/14.jpg', '/videos/14.mp4', '/stills/14.jpg',
  117.551, ARRAY[0, 5, 3, 4]::int[], ARRAY[3, 0, 5, 4]::int[],
  ARRAY[2, -99, 0, 2, 3, -99, 5, 3, 2, -99, 0, 2, 4, 2, 0, -99]::int[], ARRAY[5, 5, 4, 2, 0, -99, 3, 5, 7, 5, 3, 0, 4, 2, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('static-kiss', 4, 'A thousand miles of bad connection'),
  ('static-kiss', 6, 'Your laugh arrives in broken lace'),
  ('static-kiss', 8, 'I close my eyes and try to kiss you'),
  ('static-kiss', 10, 'Through a glitch across your face'),
  ('static-kiss', 12, 'Love in low resolution'),
  ('static-kiss', 14, 'Still I lean into the hiss'),
  ('static-kiss', 16, 'Give me a static kiss'),
  ('static-kiss', 18, 'Even if it doesn''t land'),
  ('static-kiss', 20, 'I''d rather have the interference'),
  ('static-kiss', 22, 'Than an empty quiet hand'),
  ('static-kiss', 24, 'We hang up just to call back'),
  ('static-kiss', 26, 'Like the night might change its mind'),
  ('static-kiss', 28, 'I wear your voice like a jacket'),
  ('static-kiss', 30, 'Two sizes too unkind'),
  ('static-kiss', 32, 'Give me a static kiss'),
  ('static-kiss', 34, 'Even if it doesn''t land'),
  ('static-kiss', 36, 'I''d rather have the interference'),
  ('static-kiss', 38, 'Than an empty quiet hand'),
  ('static-kiss', 40, 'Stay on the line, stay on the line'),
  ('static-kiss', 42, 'Pixel mouth, still mine'),
  ('static-kiss', 44, 'Static kiss'),
  ('static-kiss', 46, 'One more time');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'no-angels', 'afterglow', 15, 'No Angels', 128, 48, 55, 'minor',
  0.92, 0.55, 0, 'pulse', 'grid',
  '/covers/15.jpg', '/videos/15.mp4', '/stills/15.jpg',
  90.000, ARRAY[0, 6, 4, 5]::int[], ARRAY[0, 3, 6, 4]::int[],
  ARRAY[0, 0, 3, 5, 7, 7, 5, 0, 4, 4, 2, 0, 5, 4, 0, -99]::int[], ARRAY[7, 7, 7, 4, 0, 0, 4, 5, 7, 5, 4, 0, 7, 4, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('no-angels', 4, 'Don''t send a rescue, I didn''t ask'),
  ('no-angels', 6, 'I like the trouble I can name'),
  ('no-angels', 8, 'Halo''s just a cheap accessory'),
  ('no-angels', 10, 'On a face that wants the flame'),
  ('no-angels', 12, 'We don''t need a higher power'),
  ('no-angels', 14, 'We need a darker song'),
  ('no-angels', 16, 'No angels here'),
  ('no-angels', 18, 'No one coming down'),
  ('no-angels', 20, 'We save ourselves'),
  ('no-angels', 22, 'Or we burn the town'),
  ('no-angels', 24, 'Kiss me like a warning'),
  ('no-angels', 26, 'Dance me like a crime'),
  ('no-angels', 28, 'If heaven had a guest list'),
  ('no-angels', 30, 'We were never the right kind'),
  ('no-angels', 32, 'No angels here'),
  ('no-angels', 34, 'No one coming down'),
  ('no-angels', 36, 'We save ourselves'),
  ('no-angels', 38, 'Or we burn the town'),
  ('no-angels', 40, 'Let the choir take a night off'),
  ('no-angels', 42, 'We''ll be loud enough'),
  ('no-angels', 44, 'No angels'),
  ('no-angels', 46, 'That''s the stuff');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'fade-with-me', 'afterglow', 16, 'Fade With Me', 88, 44, 50, 'minor',
  0.3, 0.36, 0.06, 'haze', 'haze',
  '/covers/16.jpg', '/videos/16.mp4', '/stills/16.jpg',
  120.000, ARRAY[0, 5, 3, 4]::int[], ARRAY[5, 4, 0, 3]::int[],
  ARRAY[4, -99, 2, 0, -99, -99, 2, 3, 4, -99, 5, 3, 2, 0, -99, -99]::int[], ARRAY[7, -99, 5, 4, 2, -99, 0, 2, 4, 4, 2, 0, 5, 3, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('fade-with-me', 4, 'Colors leaving at the edges'),
  ('fade-with-me', 6, 'Your outline going soft'),
  ('fade-with-me', 8, 'I don''t want a brighter future'),
  ('fade-with-me', 10, 'I want the dim we started from'),
  ('fade-with-me', 12, 'If the world is going quiet'),
  ('fade-with-me', 14, 'Let it take us as a pair'),
  ('fade-with-me', 16, 'Fade with me'),
  ('fade-with-me', 18, 'Don''t you stay in focus'),
  ('fade-with-me', 20, 'If we blur, we still belong'),
  ('fade-with-me', 22, 'To the almost, to the hush'),
  ('fade-with-me', 24, 'Photographs forget their faces'),
  ('fade-with-me', 26, 'Songs forget the key'),
  ('fade-with-me', 28, 'I will not be left in high-def'),
  ('fade-with-me', 30, 'While you dissolve from me'),
  ('fade-with-me', 32, 'Fade with me'),
  ('fade-with-me', 34, 'Don''t you stay in focus'),
  ('fade-with-me', 36, 'If we blur, we still belong'),
  ('fade-with-me', 38, 'To the almost, to the hush'),
  ('fade-with-me', 40, 'Slow, slow, let it go'),
  ('fade-with-me', 42, 'Fade with me, I know');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'wildfire-eyes', 'afterglow', 17, 'Wildfire Eyes', 120, 48, 45, 'dorian',
  0.78, 0.64, 0.02, 'ember', 'bloom',
  '/covers/17.jpg', '/videos/17.mp4', '/stills/17.jpg',
  96.000, ARRAY[0, 4, 6, 3]::int[], ARRAY[0, 3, 5, 4]::int[],
  ARRAY[0, 2, 4, 5, 7, -99, 5, 4, 0, 0, 2, 4, 5, 4, 2, -99]::int[], ARRAY[7, 5, 4, 2, 7, 5, 4, 0, 4, 4, 2, 0, 5, 4, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('wildfire-eyes', 4, 'You walked in like July in winter'),
  ('wildfire-eyes', 6, 'Every head forgot the cold'),
  ('wildfire-eyes', 8, 'I should''ve looked a little lower'),
  ('wildfire-eyes', 10, 'But your gaze was taking hold'),
  ('wildfire-eyes', 12, 'Warning signs in every language'),
  ('wildfire-eyes', 14, 'I was never good at those'),
  ('wildfire-eyes', 16, 'Wildfire eyes'),
  ('wildfire-eyes', 18, 'You can have the room'),
  ('wildfire-eyes', 20, 'If I burn a little later'),
  ('wildfire-eyes', 22, 'At least I saw the truth'),
  ('wildfire-eyes', 24, 'Spark along the collarbone'),
  ('wildfire-eyes', 26, 'Smoke behind a smile'),
  ('wildfire-eyes', 28, 'I would rather lose the evening'),
  ('wildfire-eyes', 30, 'Than be careful for a while'),
  ('wildfire-eyes', 32, 'Wildfire eyes'),
  ('wildfire-eyes', 34, 'You can have the room'),
  ('wildfire-eyes', 36, 'If I burn a little later'),
  ('wildfire-eyes', 38, 'At least I saw the truth'),
  ('wildfire-eyes', 40, 'Don''t you blink, don''t you cool it'),
  ('wildfire-eyes', 42, 'Let the whole night catch'),
  ('wildfire-eyes', 44, 'Wildfire eyes'),
  ('wildfire-eyes', 46, 'That''s a match');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'last-goodbye', 'afterglow', 18, 'Last Goodbye', 86, 44, 48, 'minor',
  0.32, 0.4, 0.04, 'haze', 'orbit',
  '/covers/18.jpg', '/videos/18.mp4', '/stills/18.jpg',
  122.791, ARRAY[0, 5, 3, 4]::int[], ARRAY[5, 3, 0, 4]::int[],
  ARRAY[4, -99, 2, 0, -99, 3, 2, 0, 5, -99, 4, 2, 0, 2, 0, -99]::int[], ARRAY[7, 5, 4, 0, 4, -99, 2, 0, 5, 5, 3, 0, 4, 2, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('last-goodbye', 4, 'We said it in the doorway'),
  ('last-goodbye', 6, 'Like a prayer we didn''t mean'),
  ('last-goodbye', 8, 'Bags already by the elevator'),
  ('last-goodbye', 10, 'A life packed in between'),
  ('last-goodbye', 12, 'I wanted one more ordinary'),
  ('last-goodbye', 14, 'You wanted out of the scene'),
  ('last-goodbye', 16, 'This is the last goodbye'),
  ('last-goodbye', 18, 'I won''t dress it up as later'),
  ('last-goodbye', 20, 'If I see you in another life'),
  ('last-goodbye', 22, 'We''ll be kinder, maybe braver'),
  ('last-goodbye', 24, 'Leave the key, leave the record'),
  ('last-goodbye', 26, 'Leave the plant I never named'),
  ('last-goodbye', 28, 'I will water what you planted'),
  ('last-goodbye', 30, 'Till the leaving feels like rain'),
  ('last-goodbye', 32, 'This is the last goodbye'),
  ('last-goodbye', 34, 'I won''t dress it up as later'),
  ('last-goodbye', 36, 'If I see you in another life'),
  ('last-goodbye', 38, 'We''ll be kinder, maybe braver'),
  ('last-goodbye', 40, 'Go on, I''ll be still'),
  ('last-goodbye', 42, 'Last goodbye, I will');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'forever-tonight', 'afterglow', 19, 'Forever Tonight', 114, 48, 53, 'minor',
  0.65, 0.56, 0.03, 'ember', 'pulse',
  '/covers/19.jpg', '/videos/19.mp4', '/stills/19.jpg',
  101.053, ARRAY[0, 4, 5, 3]::int[], ARRAY[5, 0, 3, 4]::int[],
  ARRAY[0, 2, 4, -99, 5, 4, 2, 0, 3, 3, 2, -99, 0, 2, 0, -99]::int[], ARRAY[4, 5, 7, 7, 4, 2, 0, -99, 5, 5, 3, 0, 4, 2, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('forever-tonight', 4, 'We don''t get a hundred summers'),
  ('forever-tonight', 6, 'We get a room and a cheap wine'),
  ('forever-tonight', 8, 'So I make a vow in present tense'),
  ('forever-tonight', 10, 'And I mean it for the night'),
  ('forever-tonight', 12, 'Tomorrow can go begging'),
  ('forever-tonight', 14, 'The future can wait outside'),
  ('forever-tonight', 16, 'Forever tonight'),
  ('forever-tonight', 18, 'That''s the only time I trust'),
  ('forever-tonight', 20, 'If the clock tries to divide us'),
  ('forever-tonight', 22, 'We can teach it not to rush'),
  ('forever-tonight', 24, 'Your laugh is a small cathedral'),
  ('forever-tonight', 26, 'I get religion when you stay'),
  ('forever-tonight', 28, 'I don''t need a marble promise'),
  ('forever-tonight', 30, 'I need you not to look away'),
  ('forever-tonight', 32, 'Forever tonight'),
  ('forever-tonight', 34, 'That''s the only time I trust'),
  ('forever-tonight', 36, 'If the clock tries to divide us'),
  ('forever-tonight', 38, 'We can teach it not to rush'),
  ('forever-tonight', 40, 'Say it now, say it now'),
  ('forever-tonight', 42, 'While the dark allows'),
  ('forever-tonight', 44, 'Forever tonight'),
  ('forever-tonight', 46, 'That''s enough');

INSERT INTO songs (
  id, album_id, track_no, title, bpm, bars, tonic, scale,
  energy, brightness, swing, mood, theme, cover, clip, still,
  duration_seconds, verse_chords, chorus_chords, verse_hook, chorus_hook
) VALUES (
  'gold-in-the-dark', 'afterglow', 20, 'Gold in the Dark', 108, 52, 52, 'major',
  0.6, 0.68, 0.04, 'pulse', 'bloom',
  '/covers/20.jpg', '/videos/20.mp4', '/stills/20.jpg',
  115.556, ARRAY[0, 4, 5, 3]::int[], ARRAY[5, 3, 0, 4]::int[],
  ARRAY[0, -99, 2, 4, 5, -99, 4, 2, 0, -99, 4, 5, 7, 5, 4, -99]::int[], ARRAY[4, 4, 5, 7, 4, 2, 0, -99, 5, 5, 4, 2, 0, 2, 0, -99]::int[]
);

INSERT INTO lyrics (song_id, bar, line) VALUES
  ('gold-in-the-dark', 4, 'After all the neon and the leaving'),
  ('gold-in-the-dark', 6, 'After all the almost-love'),
  ('gold-in-the-dark', 8, 'There''s a quiet in the wreckage'),
  ('gold-in-the-dark', 10, 'That still knows what I was made of'),
  ('gold-in-the-dark', 12, 'I don''t need the sky to open'),
  ('gold-in-the-dark', 14, 'I just need a little spark'),
  ('gold-in-the-dark', 16, 'There''s gold in the dark'),
  ('gold-in-the-dark', 18, 'If you look without the fear'),
  ('gold-in-the-dark', 20, 'Every night I thought would end me'),
  ('gold-in-the-dark', 22, 'Left a vein of something here'),
  ('gold-in-the-dark', 24, 'I pick the light out of the ashes'),
  ('gold-in-the-dark', 26, 'I wear it like a thread'),
  ('gold-in-the-dark', 28, 'Not a triumph, not a sermon'),
  ('gold-in-the-dark', 30, 'Just a reason I''m not dead'),
  ('gold-in-the-dark', 32, 'There''s gold in the dark'),
  ('gold-in-the-dark', 34, 'If you look without the fear'),
  ('gold-in-the-dark', 36, 'Every night I thought would end me'),
  ('gold-in-the-dark', 38, 'Left a vein of something here'),
  ('gold-in-the-dark', 40, 'Afterglow, after all'),
  ('gold-in-the-dark', 42, 'I am still a song'),
  ('gold-in-the-dark', 44, 'Gold in the dark'),
  ('gold-in-the-dark', 46, 'Carry on'),
  ('gold-in-the-dark', 48, 'Gold in the dark'),
  ('gold-in-the-dark', 50, 'Carry on');

INSERT INTO platforms (id, name, status) VALUES
  ('official', 'LINNEIRO Official', 'Playing now'),
  ('spotify', 'Spotify', 'Needs DistroKid'),
  ('apple', 'Apple Music', 'Needs DistroKid'),
  ('youtube', 'YouTube Music', 'Needs DistroKid'),
  ('amazon', 'Amazon Music', 'Needs DistroKid'),
  ('deezer', 'Deezer', 'Needs DistroKid');

COMMIT;

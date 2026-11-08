# Changelog

## 1.2.0 — 2026-11-08

Everything below is new since the first published release; the npm version jumps
from 1.0.0 straight to 1.2.0 because 1.0.1 was never published.

### Watch mode

- The idle screen now has two entries: **let Da Feiyu play (watch)** and **play
  yourself**. Watch mode hands the controls to an in-panel autopilot that kites,
  dodges bullets, chases health and restarts the run about 2.5 s after dying.
- The player sprite becomes the desk-pet fish, with a name tag, a live state
  label (hunt / kite / dodge / dash / heal / cruise) and five unlockable skins.
- The header gained a pilot switch to take the controls back or hand them over,
  and **big screen** mode fills the viewport (`Esc` exits).

### Pet commentary

- Watch-mode events are posted to a local **dsh-pet** installation through
  `/dsh-pet-7340/broadcast`, so the pet comments in its bubble. Every event has
  several line variants that never repeat back to back; events include first
  blood, kill streaks, low health, health pickups, boss arrivals and kills,
  every other wave, score milestones, personal records, every death and the
  autopilot restart.
- Each line is also voiced: the same text is sent to dsh-pet's Edge TTS
  (`/dsh-pet-7340/voice/speak`) and the returned MP3 is played by the page, so
  the pet's own "read aloud" switch does not have to be on. Everything degrades
  silently when dsh-pet, the network or a user gesture is missing.

### Gameplay and progress

- Combo multiplier: the third quick kill within three seconds scores ×2, the
  sixth ×3; it expires after three seconds without a kill.
- In-run upgrades: every second cleared wave offers three of ten stacked
  upgrades (damage, fire rate, twin shots, piercing, move speed, dash cooldown,
  longer combo window, pickup magnet, regenerating shield, max health). The card
  overlay freezes the run and accepts click or `1` / `2` / `3`; in watch mode the
  autopilot picks by weight (heals first at low health) after a short pause.
- Watch controls: playback speed 0.25× / 0.5× / 1× / 2× and autopilot skill
  (rookie / normal / master, affecting reaction, aim lead and dodge) are chips
  next to the start buttons and in the bottom-right corner during a run; both
  are remembered in `localStorage`. Enabling calm mode drops a still-1× run to
  0.5×.
- Enemy pressure: runners sometimes arrive in packs, gunners keep switching
  flanks, and every fourth (non-boss) wave is a charge wave that lines up a
  squad from one side with a warning banner.
- Audio robustness: sound is unlocked on the same click that starts a run, a
  silent buffer primes the audio context, commentary lines queue instead of
  cutting each other off, and the speaker button is highlighted while muted.
- Boss waves every fifth wave: an armoured elite that charges, fires radial
  bursts, has a health bar across the field, and drops two health packs.
- Local leaderboard (top five runs), eight achievements and five fish skins,
  all stored in `localStorage`.
- Fixed 1/60 s simulation step, so high-refresh displays no longer run the game
  at double speed.
- WebAudio sound effects for firing, hits, kills, damage, dash, pickups, waves
  and death, with a mute button that also mutes the pet voice and is remembered.
- Pause and resume from the header or `Esc` (the simulation freezes and the
  field stays visible), and **Exit run** to drop the current score and go back
  to the start screen without touching any saved progress.
- Pet the fish: while the autopilot plays, clicking Da Feiyu makes it squirm and
  pop hearts; every third pet cheers it up for five seconds and grants a real
  +25% fire-rate buff, with the pet counter shown in the HUD.
- Mini window: the panel can shrink into a draggable 300x236 floating card so
  the fish keeps playing in the corner while you work (`Esc` expands it back).
- Background play: switching to another sidebar panel no longer unmounts the
  run. The engine and its canvas are moved out of the panel and shrink into a
  desk-pet-like **little fish in the bottom-right corner** that keeps playing.
  Click to pet it, double-click to open a small card with the battlefield and
  HUD; drag the fish or the card to move it (position remembered), and the
  widget only grabs the mouse over the fish/buttons so it never blocks the page
  underneath. **Back to panel** docks the same run back into the panel; the
  plugin now declares the `layout` service for that switch.
- Work-friendly widget: clicking it never steals focus from the page (the fish
  and its buttons are unfocusable and cancel the focus-on-mousedown), sound
  effects go quiet while it is collapsed (the pet commentary keeps talking), and
  the canvas stops drawing entirely until the card is opened again. The fish's
  face reflects the run (hurt, combo, Boss, snack, cheer), short bubbles call
  out deaths, Boss arrivals and new records, and over-petting makes it dizzy.
  Petted times and watch time are saved in `dsh-shooter:petstats` and shown as
  today's record on the start screen.
- Living widget: the corner fish is now the actual sprite (not an emoji) drawn
  on a 96 px canvas at about 12 fps — it breathes, swishes its tail, follows the
  chosen skin, dozes off with drifting z's when the run is paused or over, goes
  cross-eyed from over-petting and sparkles while cheered up. Right-click the
  fish for a quick menu (pause/resume, playback speed, AI skill, size, mute, calm
  mode, water sound, feed, back to panel, stop). Three size tiers (64/96/128 px),
  gentle auto-fade to 55% opacity after 30 s without interaction, an occasional
  line after 45 s, edge snapping while dragging, and a slight tilt while carried.
- Calm mode (安静摸鱼): one switch, on the start screen and in the fish menu,
  lowers the master volume to about a third, turns firing/damage/death into soft
  taps and a sigh, swaps commentary for a gentler set of lines, replaces the
  score/wave/combo HUD with a single quiet caption, halves screen shake, slows the
  fish's tail and breathing about three times, adds a faint breathing halo and a
  slow-breath prompt when idle, and suggests a stretch every 40 minutes. An
  optional, very quiet synthesised water ambience (brown-noise ocean plus
  occasional bubbles) can run with it. Saved in `dsh-shooter:calm` and
  `dsh-shooter:ambient`.
- Petting with feedback: pat the fish's head in the arena and it narrows its eyes
  happily for a moment; press and hold the desk fish to flip it belly-up for a
  tummy rub, drag it to trail bubbles, and feed it a snack from the menu.
- Start screen redesigned for the narrow sidebar: compact hero with a best-score
  badge, one full-width primary CTA with a sub-label plus a quieter secondary
  action, `1` / `2` shortcuts to start either way, a three-row watch-settings card
  (speed / AI skill / calm), three progress tiles, tabbed local records
  (leaderboard / achievements / skins) with arrow-key switching, and a collapsible
  controls-and-tips sheet. Every control has hover lift, press feedback and a
  visible focus ring, and the screen scrolls when the sidebar is short.

### Installability

- Zero dependencies, no build step, no install scripts; `files` keeps the
  published tarball to the game, its locale files and its icon.
- `prepublishOnly` runs the offline test suite before anything is published.
- README now documents three install paths (market, one command, release
  tarball), the exact profile names, and a troubleshooting table.

## 1.0.0 — 2026-11-07

First published release: waves, four enemy types, dash with invulnerability
frames, health drops, bilingual strings.

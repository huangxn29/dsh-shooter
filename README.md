# dsh-shooter

A top-down arena shooter that opens as a full panel in [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), reached from a crosshair entry in the left sidebar.

[中文说明](#中文说明)

## What it does

The sidebar entry opens a self-contained arena shooter rendered on a canvas: survive ever-larger waves of enemies, keep your health bar above zero, and restart when the run ends. The panel chrome (header, buttons, overlays) is drawn with the harness theme tokens, so it follows the active light or dark theme; the playfield keeps its own dark palette.

- **Waves.** Each wave queues more enemies than the last; a new wave starts once the field is clear. Every fifth wave adds a boss: a big armoured elite that charges and fires radial bursts, with its own health bar across the top of the field and a guaranteed pair of health drops when it dies. Runs also throw in **charge waves** (a line of runners pushing in from one side) and gunners that keep switching flanks, so the arena does not settle into a shooting gallery.
- **Combo multiplier.** Kills chained within three seconds are worth more: the third quick kill doubles the score, the sixth triples it. The multiplier shows as ×2 / ×3 beside the score and drops back to ×1 after three seconds without a kill.
- **In-run upgrades.** Clearing every second wave offers a pick of three upgrades — damage, fire rate, twin shots, piercing rounds, move speed, dash cooldown, longer combo window, pickup magnet, a regenerating shield, or extra max health. Click a card or press `1` / `2` / `3`; the run freezes until one is chosen. Picks are stacked and shown as small badges in the bottom-left corner.
- **Watch controls.** A speed chip cycles playback between 0.25×, 0.5×, 1× and 2×, and a skill chip cycles the autopilot through rookie / normal / master (reaction time, aim lead, dodge weight). Both live in the bottom-right corner during a run and next to the start buttons on the idle screen, and both are remembered across reloads. Turning calm mode on drops a still-1× run to 0.5× automatically.
- **Four enemy types.** Grunts chase you, runners are fast and fragile, tanks are slow and armoured, gunners keep their distance and shoot back.
- **Dash.** A short burst with a few invulnerable frames — the way out of a corner.
- **Health pickups.** A small chance to drop from a defeated enemy.
- **Watch mode.** Press *let Da Feiyu play* and an autopilot takes over: it kites, dodges bullets, chases health and starts the next run by itself after each death, while the player sprite becomes the desk-pet fish. If [dsh-pet](https://www.npmjs.com/package/dsh-pet) is installed and enabled, the pet narrates the run out loud in its bubble — the game only posts to the local harness, never to the network.
- **Bilingual.** English and 简体中文 strings come from the harness client locale service, so the panel follows the language you pick in the harness.
- **Offline.** Nothing leaves your machine: the game itself makes no network calls, and the optional pet commentary only posts to the local harness server. The only browser storage it touches is a few small `localStorage` keys: best score, mute switch, local leaderboard, achievements, games played, chosen skin, playback speed and AI skill.

## Controls

| Input | Action |
| --- | --- |
| `W` `A` `S` `D` | Move |
| Mouse | Aim |
| Hold left button | Fire |
| `Shift` | Dash |
| `1` `2` `3` | Pick an upgrade card |
| `Esc` | Pause / resume (or leave big screen) |

Keys only steer the game while its panel is the visible one, so typing in the chat composer never moves the player.

## Watch mode (大肥鱼 autopilot)

The idle screen offers two ways in: **Let Da Feiyu play (watch)** starts a run with the AI pilot in control, while **Play myself** starts a normal run. In watch mode the player sprite becomes Da Feiyu — a round blue fish with a gun — wearing a name tag and a live state label (hunting / kiting / dodging / dashing / healing / cruising). The header keeps a pilot switch so you can hand the controls back at any time, and when the fish goes down it redeems itself automatically after a couple of seconds instead of making you click retry.

The pilot reads the same game state a human does (enemies, incoming bullets, pickups, walls), then writes a movement vector and a fire/dash decision into the normal input channel, so both modes share the same physics. It dodges bullets by sliding perpendicular to the shot line, keeps range against melee enemies while orbiting gunners, backs off to heal below 78 HP, and leads its shots by the bullet travel time. Player keyboard and pointer input are ignored while the pilot is on.

## Pet commentary (optional)

Watch mode also narrates itself. One-way and best-effort, it POSTs lines to the local **dsh-pet** plugin's third-party feed endpoint (`/dsh-pet-7340/broadcast?pet=main&surface=any`) and the desktop pet says them in its speech bubble. Every event has several phrasings (`game.report.*` in `client.js`), which are picked at random and never repeat back-to-back, so the commentary stops sounding like a loop: first blood, five-kill streaks (at most once per 20 seconds), one low-health callout per run, health packs, boss arrivals and boss kills, every other wave, every 1000 points, a new personal record, and every death — plus a "back again" line when the autopilot restarts. Regular lines are throttled to one every ~7 seconds; a death always plays. The game never waits on the pet: if dsh-pet is missing, asleep, muted, or owned by another plugin, the messages are simply skipped.

The pet id is the `pet=main` part of `PET_BROADCAST_URL` in `client.js` — change it if your pet is configured under another id. The spoken lines live in the `game.report.*` dictionary keys and are easy to rewrite.

Each line is also **voiced**: the same text is sent to the pet's TTS endpoint (`/dsh-pet-7340/voice/speak`) and the returned MP3 is played in the page, so you hear the commentary without flipping the pet's own speech master switch in its settings. Synthesis failures (offline, no provider) only cost the sound — the bubble still appears. Since the bubble is posted with `surface=any` (no `voiceTo`), enabling the pet's own speech later does not double-play these lines.

## Quality of life

- **Fixed timestep.** The simulation always advances in 1/60 s steps, so a 144 Hz display no longer makes the game run at double speed; frames that arrive late are caught up in at most five steps, and a tab returning from the background does not fast-forward.
- **Persistent best score.** The best score is saved to `localStorage` (`dsh-shooter:best`) and shown on the idle screen and the game-over screen.
- **Big screen.** The header's **Big screen** button promotes the panel to a full-viewport overlay so you can watch from across the room; `Esc` or the same button takes you back. The canvas resizes with it.
- **Pause and exit.** While a run is going, the header has a pause button (and `Esc` toggles it): the simulation freezes, the field stays on screen, and the overlay offers **Resume** and **Exit run**. Exit drops the current score and returns to the start screen; best score, leaderboard, achievements and skins are untouched.
- **Pet the fish.** While the autopilot plays, the mouse does not fight for control — instead, clicking Da Feiyu makes it squirm and pop hearts (and a soft purr). Every third pet cheers it up for five seconds, which is a real +25% fire-rate buff shown as a gold chip, so you can play along with the run without taking over. The counter resets per run.
- **Mini window.** The header's **Mini window** button shrinks the panel into a small floating card (300×236) you can drag by its title bar, while the run keeps going. Useful when you are waiting on the agent and want the fish playing in the corner; **Expand panel** (or `Esc`) restores the sidebar view.
- **Background play.** Switching to another panel mid-run no longer restarts the game: it shrinks into a **little fish in the bottom-right corner** and keeps playing, like a desk pet you can keep an eye on while you work. Click the fish to pet it (hearts pop, every third pet still grants the fire-rate cheer), **double-click** to open a small card with the real battlefield, the live HUD, pause and mute; drag the fish or the card's title bar to move it, and the position is remembered. The widget ignores the mouse everywhere except on the fish and its buttons, so it never blocks clicks on the page underneath. **Back to panel** — or clicking the shooter icon in the sidebar — docks the very same run back into the panel; **✕** stops it.
- **Work-friendly widget.** While it is folded into the fish it stays out of your way: clicking it never steals keyboard focus from whatever you are typing in, sound effects are muted (the pet commentary keeps talking), and the canvas stops drawing entirely while the battle continues off-screen — so a fish in the corner does not spin up your fans. The fish's face reads the run for you (hurt, combo, Boss, health-pack snack, cheer), short bubbles call out deaths, Boss arrivals and new records, and petting it too fast makes it dizzy. Everything you petted and watched is counted in `dsh-shooter:petstats` and shown as today's petting record on the start screen.
- **A fish that is actually alive.** The corner fish is the same sprite as the one in the arena, rendered on a 96 px canvas at ~12 fps: it breathes, swishes its tail, takes the colour of your skin, dozes off (drifting `z`s) when the run is paused or over, goes `@_@` when you over-pet it and sparkles while cheered up. Right-click it for a quick menu — pause/resume, playback speed, AI skill, size (small / medium / large), mute, calm mode, water sound, feed, back to panel, stop — without opening the card. It snaps to the nearest screen edge when dragged, tilts a little while carried, fades to 55% opacity after 30 s of no interaction and occasionally says hello after 45 s.
- **Calm mode (安静摸鱼).** One switch on the start screen and in the fish's right-click menu turns the whole thing down: master volume drops to about a third and firing/hurt/death become soft taps and a sigh, the commentary switches to gentle lines ("wave 3… no rush, I have it"), the score/wave/combo HUD is replaced by a single quiet caption, screen shake on damage is halved, the fish breathes and swishes its tail about three times slower, and a faint breathing halo eases in and out. Idle for a while and it walks you through one slow breath; every 40 minutes it gently suggests a stretch. With calm mode on, a very quiet water ambience starts on the desk widget (brown-noise ocean plus occasional bubbles, synthesised live) — toggle it from the same menu. Calm and ambient preferences live in `dsh-shooter:calm` / `dsh-shooter:ambient`.

## Start screen

The home view is built for a narrow sidebar: a compact hero (kicker, title, one-line promise, best-score badge), a single full-width primary CTA — **Let the pet play** with a sub-label (*pet piloting · auto-restart · you just relax*) — and a quieter **Play myself** action underneath, plus a "press `1` / `2`" hint for keyboard users. Below that:

- **Watch settings** as a three-row card (playback speed, AI skill, calm mode) with pill controls that cycle in place and remember the choice;
- **Progress** as three stat tiles (best score, runs, achievements unlocked);
- **Local records** as tabs — leaderboard / achievements / skins — so the panel does not grow into an endless column; each tab scrolls inside a fixed-height area, arrow keys move between tabs and `Tab` / `Enter` work as usual;
- a collapsible **Controls & tips** row holding the key map, the scoring hint and the pet / keep-running notes, so hints never push the CTAs off-screen.

Every control has hover-lift, press-scale and a visible focus ring; the whole screen scrolls when the sidebar is short.
- **Petting with feedback.** Pat the fish's head inside the arena and it narrows its eyes happily for a moment; on the desk widget, press and hold the little fish to flip it belly-up for a tummy rub, drag it around to trail a string of bubbles, and feed it a snack from the right-click menu.
- **Sound effects.** Gunfire, hits, kills, damage, dashes, pickups, waves and the final blow are synthesized at runtime with WebAudio — no audio files are shipped. The speaker button in the header mutes both the effects and the pet commentary, and the choice is remembered (`dsh-shooter:muted`).

## Local progress (leaderboard, achievements, skins)

Everything here lives in `localStorage` on this machine — no account, no network.

- **Leaderboard.** The best five runs are kept (`dsh-shooter:leaderboard`) with score, wave and date; the idle screen lists them, and the game-over screen tells you which local place this run took.
- **Achievements.** Eight milestones (`dsh-shooter:achievements`): first kill, wave 5, wave 10, 1000 and 2500 points in a single run, five kills within three seconds, watching the pet play, and finishing ten runs. Each unlocks once and stays unlocked.
- **Skins.** Five looks for Da Feiyu (`dsh-shooter:skin`): the default blue fish plus golden (wave 5), sakura (wave 10), shark (2500 points) and shadow (five-kill streak). Locked skins show 🔒 and their requirement in the tooltip; pick one on the idle screen and the fish is redrawn in that palette.
- The games-played counter lives in `dsh-shooter:runs`.

## Offline tests

The game logic has no DOM or network dependency, so it can be exercised in Node with a stubbed React renderer and a fake canvas:

```bash
node scripts/sim-ai.mjs 20000        # drives the real AI for N frames; prints waves/score/deaths/combos/bosses/upgrades, also runs a 2× scenario
node scripts/sim-ui.mjs              # renders ShooterPanel(), clicks the buttons (upgrade cards, speed/skill chips, petting, mini window), asserts the HUD and overlays
node scripts/sim-pet.mjs             # asserts the pet commentary fires only in watch mode, at a legal pace, and is voiced
node scripts/sim-features.mjs        # fixed timestep, best score storage, combo curve, upgrade stats, speed multiplier, WebAudio effects, big-screen/mute buttons, pause/exit, petting buff, quiet-mode sfx and daily pet stats
node scripts/sim-meta.mjs            # leaderboard, achievement unlocks, skin gating and palette, in-game settlement
```

`scripts/sim-ai.mjs` fails if the pilot cannot clear a wave, never triggers a combo, never lets the combo expire, never meets a boss, or never kills one; `scripts/sim-ui.mjs` fails if any panel text, button, or state transition regresses (including the mini-window toggle and petting); `scripts/sim-pet.mjs` fails if the feed URL or payload shape changes; `scripts/sim-features.mjs` fails if high-refresh timing drifts, the best score stops persisting, the combo curve changes, the sound/big-screen controls regress, pause/exit stops freezing the run, or petting stops granting the buff; `scripts/sim-meta.mjs` fails if the leaderboard stops sorting or capping, an achievement unlocks twice, or a locked skin becomes selectable. All load the real `client.js` through `scripts/harness.mjs` — no copy of the game logic is kept in the tests.

## Install

**Requirements.** DeepSeek Harness 0.2.0 or newer with the Web client (developed and tested on 0.2.2-rc.1, desktop app and `dsh web`). Nothing else is needed: no dependencies, no build step, no install scripts — the package is plain ES modules plus one canvas game.

**Option 1 — plugin market.** With the [dshmarket](https://github.com/dsh-market/dsh-market) plugin, or the harness's own **Discover** page (add `https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json` as an index source), search for **dsh-shooter** / **枪战精英** and install in one click. The market enables the plugin for you and the entry is there after one reload.

**Option 2 — one command.**

```bash
# desktop app
dsh plugin --profile desktop add dsh-shooter
# plain dsh web
dsh plugin --profile web add dsh-shooter
```

Then open **Settings → Plugins**, enable **Shooter elite**, and reload the page once. The crosshair entry sits at the bottom of the left sidebar panel list.

**Option 3 — release tarball** (no npm registry access needed):

```bash
dsh plugin --profile desktop add https://github.com/huangxn29/dsh-shooter/releases/download/v1.2.0/dsh-shooter-1.2.0.tgz
```

**Troubleshooting**

| Symptom | Fix |
| --- | --- |
| No crosshair entry in the sidebar | Settings → Plugins: make sure Shooter elite is enabled for this profile; reload the page; restart the harness if it still does not appear |
| Panel opens but stays black | Update to a build for DSH ≥ 0.2.0 — the panel needs the harness theme tokens |
| No sound | Effects are synthesized in the browser, but the pet voice uses Edge TTS and needs internet; also click once inside the page, browsers block audio before a user gesture |
| Pet says nothing | The commentary needs [dsh-pet](https://www.npmjs.com/package/dsh-pet) installed *and* enabled with a pet whose id is `main`; without it everything else still works |
| Progress looks empty | Best score, leaderboard, achievements and skin live in this browser's `localStorage` — another browser or profile starts fresh |

## Uninstall

```bash
dsh plugin --profile desktop remove dsh-shooter
```

Or disable/remove **Shooter elite** on the Plugins page. Nothing is written outside the package; the only leftovers are the browser's `localStorage` keys (best score, mute, leaderboard, achievements, games played, chosen skin, playback speed, AI skill), removed with the site data.

## License

MIT. See [LICENSE](LICENSE).

---

## 中文说明

一个俯视角竞技场射击游戏，作为完整面板运行在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 里，入口是左侧栏面板列表里的准星图标。

- **波次**：每一波敌人更多，清空场地即进入下一波。每第 5 波会出现一只 Boss：皮厚的大块头，会蓄力冲锋、朝四周打一圈子弹，屏幕上沿有它的专属血条，打掉后必掉两个血包。另有**冲锋波**（一整排疾行者从同一侧压上来）和会不断换边包抄的枪手，不是站着排队送分的靶子。
- **连杀倍率**：3 秒内连续击杀，从第 3 个起得分 ×2、第 6 个起 ×3；得分旁边会显示 ×2 / ×3，停手 3 秒后回到 ×1。
- **局内强化**：每清掉偶数波会弹出三选一——伤害、射速、双管、穿透、移速、冲刺冷却、连杀窗口、血包磁力、护盾、生命上限。点卡片或按 `1` / `2` / `3` 选一张，选完才继续；拿到的强化叠层记录在左下角。
- **观战控制**：右下角可以切播放速度（0.25× / 0.5× / 1× / 2×）和 AI 档位（菜鸟 / 正常 / 宗师，影响反应、预瞄和躲弹），开始界面按钮下方也能调，选择会被记住；打开安静摸鱼时，还在 1× 的会自动降到 0.5×。
- **四种敌人**：小兵追击、疾行者快速而脆弱、重装者迟缓但皮厚、枪手保持距离并远程射击。
- **冲刺**：短距离突进，带几帧无敌，用来脱身。
- **回血包**：击败敌人有小概率掉落。
- **双语**：中英文案取自 harness 的客户端语言服务，跟随你选择的界面语言。
- **不出机器**：游戏本身不联网；可选的桌宠解说只请求本机的 harness 服务。只在本机 `localStorage` 存几个小键：最高分、静音开关、本机排行榜、成就、局数、皮肤、播放速度和 AI 档位。

**操作**：`WASD` 移动，鼠标瞄准，按住左键射击，`Shift` 冲刺，选卡时按 `1` / `2` / `3`，`Esc` 暂停/继续（大屏时先退出大屏）。只有在游戏面板可见时按键才会生效，不会干扰在聊天框里的输入。

**观战模式**：开始界面有两个入口——「让大肥鱼玩（观战）」由 AI 托管开一局，「自己玩」是普通开局。托管时玩家变成圆滚滚的蓝胖子大肥鱼（拿枪、头顶名字牌和实时状态：追猎/拉枪线/躲弹/冲刺/吃血/游弋），顶栏有托管开关可随时收回控制权；大肥鱼阵亡后约两秒自动重开一局，不需要你点「再来一局」。托管清掉偶数波后会自己挑强化（按缺什么补什么、低血优先保命），右下角还能给它换档位（菜鸟/正常/宗师）和播放速度。**托管时鼠标不再是战斗输入，改成摸鱼**：点鱼身会冒爱心、鱼会扭一下，连摸三下它会开心 5 秒（真实生效的射速 +25%，HUD 有金色「加油中」标记），本局摸鱼次数显示在右下角。

**桌宠解说（可选）**：观战时游戏会把战报单向投喂给本机的 **dsh-pet** 插件（`POST /dsh-pet-7340/broadcast?pet=main&surface=any`），桌宠就在自己的气泡里说一句。每个事件都准备了几种说法（`client.js` 里的 `game.report.*`），随机挑一句且不会连着重复，所以不像复读机：首杀、五连杀（20 秒最多夸一次）、每局一次的残血提醒、吃血包、Boss 登场和击杀、隔一波报一次波次、每 1000 分、破纪录、每次阵亡——托管自动续局时还会补一句「我又回来了」。常规台词约 7 秒最多一句，阵亡那句一定会念。它不等待桌宠的回应，桌宠没装、在睡觉、被静音或被别的插件占着时，这些消息直接跳过。宠物 id 就是 `PET_BROADCAST_URL` 里的 `pet=main`，换成你的宠物 id 即可；想改口吻直接改 `game.report.*` 的文案就行。

每一句还会**念出来**：同一段文字再请 dsh-pet 的 TTS 合成（`POST /dsh-pet-7340/voice/speak`），拿回的 MP3 由本页播放，所以不用去宠物设置里开「播报总开关」也能听见。合成失败（断网、没有可用音色）只是没声音，气泡照旧显示。气泡是用 `surface=any` 投喂的（不带 `voiceTo`），以后开了宠物自己的自动播报也不会重复念这两份。

**体验优化**：模拟固定按 1/60 秒推进，144Hz 屏幕不会变成双倍速，卡顿或切回标签页也不会快进；最高分存在本机（`dsh-shooter:best`），开始界面和结算界面都会显示；顶栏「大屏观战」把面板铺满整个视口，按 `Esc` 或再点一次退出，画布会跟着变大；**「小窗摸鱼」把面板缩成右下角 300×236 的小窗（按住标题栏可拖动），对局照常进行，适合等 AI 干活时把鱼放在角落自己打，点「展开面板」或 `Esc` 还原**；**切到别的面板（比如去聊天干活）时对局也不会中断**——它会缩成右下角的一条**小鱼挂件**继续打，像桌宠一样常驻在页面角落：点一下小鱼就摸摸它（冒爱心，连摸三下照样给 5 秒加油），双击展开成带画面/HUD/暂停/静音的小卡片，小鱼和卡片标题栏都能拖动、位置会记住，挂件除了小鱼和按钮之外不吃鼠标，不挡你点底下的页面；点「回到面板」或侧栏的枪战精英图标就把这一局原样接回面板，点 ✕ 收工；对局中顶栏有暂停键（`Esc` 也能切换），暂停后战场停在原地，遮罩上给「继续」和「退出游戏」，退出会放弃本局分数回到开始界面，最高分、排行榜、成就和皮肤都不受影响；开火、命中、击杀、受伤、冲刺、吃血包、进波、阵亡都用 WebAudio 现场合成音效（不打包任何音频文件），顶栏喇叭按钮一键静音，并且连解说一起静音，选择会被记住（`dsh-shooter:muted`）。

**挂件不打扰干活**：缩成小鱼时它不会抢焦点——点来点去，聊天框里的字和光标都还在；音效自动安静（桌宠解说照常念），战场画布停止绘制（模拟照常跑），所以角落里挂一只鱼不会让风扇转起来。小鱼的脸会直接告诉你局势：受伤委屈、连杀得意、吃血包满足、Boss 波紧张、加油时更有劲；阵亡、Boss 登场、破纪录时会抖一下冒句话，摸太频繁它会晕两秒。今天摸了几下、看了多久记在 `dsh-shooter:petstats`，开始界面显示「今日摸鱼战绩」。

**角落里那只是真的鱼**：不再用 emoji，而是用战场里同一套鱼精灵在 96px 小画布上以约 12fps 待机渲染——会呼吸、摆尾、跟着当前皮肤换色，暂停或结算时打盹冒 zzz，被摸晕时眼睛变成 `@_@`，加油时冒 ✦。右键弹出快捷菜单（暂停/继续、播放速度、AI 档位、大小、静音、安静摸鱼、水声、喂食、回到面板、收工），不用展开卡片；小鱼有 小/中/大 三档尺寸，拖到屏幕边缘会自动吸附，拖动时还会歪一下、甩出一串气泡，30 秒没互动会自动淡到半透明，45 秒左右自己冒一句招呼。

**安静摸鱼**：开始界面和右键菜单里各有一个开关，一键把刺激压下来——总音量降到三成多，开火/受伤/阵亡变成轻声的「噗、嗒」和一声叹气；解说换成温柔版（「第 3 波了，不急，我盯着呢」）；分数/波次/连杀的数字 HUD 收成一行「安静摸鱼中 · 慢慢看」；受伤震屏减半；鱼摆尾和呼吸放慢约三倍，身边多一圈很淡的呼吸光圈；闲置久了会带你做一次慢呼吸，每 40 分钟轻轻提醒你起来伸个懒腰。安静模式下，桌面小鱼还会垫一层很轻的水族箱底噪（棕噪「海声」+ 偶尔的气泡，全部现场合成），可单独开关；两个偏好分别记在 `dsh-shooter:calm` / `dsh-shooter:ambient`。

**摸出回应**：在战场里摸鱼头顶，它会眯起眼睛开心一会儿；在桌面小鱼上按住不放，它会翻过身让你摸肚皮（松手翻回来），拖着走会留下一串气泡，右键菜单里还能喂一条小鱼干。

**开始界面（主页）**：按窄侧栏重做——顶部英雄区（小字定位 + 标题 + 一句承诺 + 最高分徽章），中间一张通栏主按钮「让大肥鱼玩（观战）」（带副标题「AI 托管 · 自动续局 · 你只管摸鱼」），下面是更轻的「自己玩」，并提示键盘按 `1` / `2` 直接开局；再往下依次是「观战设置」三行卡（播放速度 / AI 档位 / 安静摸鱼，点胶囊原地循环、选择会记住）、「战绩」三格数字卡（最高分 / 局数 / 成就）和用标签切换的「本机档案」（排行榜 / 成就 / 皮肤，内容区固定高度滚动，左右方向键可切标签）；操作说明、得分提示与挂件说明收进可折叠的「操作与提示」，不再把首页撑成一条长瀑布。所有可点元素都有悬停上浮、按下回弹和清晰的键盘聚焦框，侧栏太矮时整页可以滚动。

**本机进度（排行榜 / 成就 / 皮肤）**：全部只写本机 `localStorage`，不需要账号也不联网。排行榜保留最高 5 局（`dsh-shooter:leaderboard`，含分数、波次、日期），开始界面列出来，结算界面告诉你这局排本机第几；成就共 8 个（`dsh-shooter:achievements`）：首杀、第 5 波、第 10 波、单局 1000 分、单局 2500 分、3 秒内五连杀、看大肥鱼打一局、累计打完 10 局，解锁后永久保留；皮肤共 5 款（`dsh-shooter:skin`）：默认蓝胖鱼，外加金鳞鱼（第 5 波解锁）、樱花鱼（第 10 波）、鲨鱼酱（单局 2500 分）、暗影鱼（五连杀）。没解锁的皮肤显示 🔒 和条件提示，在开始界面点一下就能换，大肥鱼立刻换颜色；累计局数存在 `dsh-shooter:runs`。

**离线测试**：`node scripts/sim-ai.mjs` 跑 AI 仿真（帧数可传参，默认 30000，还会验证自动选卡和 2 倍速模式），`node scripts/sim-ui.mjs` 渲染面板并点按钮回归 UI（含三选一弹卡、点卡、速度与档位控件、点鱼摸鱼、小窗开关），`node scripts/sim-pet.mjs` 验证解说只在观战模式触发、节奏合法，`node scripts/sim-features.mjs` 验证固定步长、最高分存档、连杀倍率曲线、音效、大屏和静音按钮、暂停/继续/退出、强化数值、速度倍率、摸鱼 buff、安静摸鱼与今日摸鱼统计，`node scripts/sim-meta.mjs` 验证排行榜排序与截断、成就只解锁一次、未解锁皮肤不可选、结算信息进 HUD；五者都直接加载真实的 `client.js`。

**安装**：需要 DeepSeek Harness 0.2.0 及以上的 Web 版本（开发与测试用的是 0.2.2-rc.1，桌面版和 `dsh web` 都行）。除此之外不需要任何东西：没有依赖、没有构建步骤、没有安装脚本，装好就是能跑的纯 ES 模块。

- **方式一：插件市场。** 装了 [dshmarket](https://github.com/dsh-market/dsh-market)，或在宿主自带的「发现」页把 `https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json` 加为索引源，然后搜 **dsh-shooter** / **枪战精英**，一键安装；市场会顺手启用插件，刷新一次页面就能看到入口。
- **方式二：一条命令。**

```bash
# 桌面版
dsh plugin --profile desktop add dsh-shooter
# 普通 dsh web
dsh plugin --profile web add dsh-shooter
```

装完到**设置 → 插件**里启用「枪战精英」，再刷新一次页面，左侧栏面板列表底部就有准星入口。

- **方式三：发布包直链**（npm 不通时可用）：

```bash
dsh plugin --profile desktop add https://github.com/huangxn29/dsh-shooter/releases/download/v1.2.0/dsh-shooter-1.2.0.tgz
```

**装不上 / 看不到入口怎么办**：先看**设置 → 插件**里「枪战精英」是不是启用的、启用的是不是当前 profile；刷新页面（客户端包在启动时加载）；还没有就重启宿主。面板能打开但是黑屏，多半是 DSH 版本低于 0.2.0。没声音先点一下页面（浏览器要一次用户手势才允许放音频），桌宠语音还需要联网（Edge TTS）。桌宠不说话，确认装了并启用了 **dsh-pet**、宠物 id 是 `main`；没装也不影响游戏本身。

**卸载**：`dsh plugin --profile desktop remove dsh-shooter`，或在插件页禁用/移除「枪战精英」。插件不会在自身目录之外留下文件，只有浏览器 `localStorage` 里的存档（最高分、静音、排行榜、成就、局数、皮肤、播放速度、AI 档位），清站点数据即可移除。

**许可**：MIT，见 [LICENSE](LICENSE)。

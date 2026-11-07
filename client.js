/*
 * Client half of dsh-shooter.
 *
 * Registers two things:
 *  - `sidebar.panellist` entry `shooter` (the crosshair icon on the left rail)
 *  - `main` panel keyed `shooter` (the page the sidebar entry opens)
 *
 * The panel hosts the arena shooter from the request inside a plain <canvas>.
 * All drawing is canvas artwork; the surrounding chrome uses `--dsw-alias-*`
 * theme tokens so it follows the Harness light/dark theme.
 */
window.__ModuleLoader__.load({
  id: 'dsh-shooter',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'dsh-shooter';
    const PANEL_ID = 'shooter';
    const PANEL_ORDER = 30;
    const FONT = '"Segoe UI", "Microsoft YaHei", system-ui, sans-serif';

    const DICTS = {
      en: {
        'meta.title': 'Shooter elite',
        'meta.description': 'A top-down arena shooter panel opened from a left sidebar entry.',
        'panel.title': 'Shooter elite',
        'panel.tagline': 'Top-down arena shooter',
        'game.titleMain': 'Shooter',
        'game.titleAccent': 'elite',
        'game.move': 'Move',
        'game.aim': 'Aim & fire',
        'game.dash': 'Dash',
        'game.hint': 'Clear wave after wave — the longer you survive, the higher your score.',
        'game.start': 'Start battle',
        'game.over': 'You are down',
        'game.finalScore': 'Final score',
        'game.overWave': 'Reached wave {n}',
        'game.retry': 'Play again',
        'game.restart': 'Restart',
        'game.waveBanner': 'Wave {n}!',
        'game.readout': 'Move with WASD, aim with the mouse, hold the left button to fire, Shift to dash.',
        'hud.score': 'Score',
        'hud.hp': 'HP',
        'hud.wave': 'Wave'
      },
      zh: {
        'meta.title': '枪战精英',
        'meta.description': '从左侧栏入口打开的俯视角枪战面板。',
        'panel.title': '枪战精英',
        'panel.tagline': '俯视角枪战',
        'game.titleMain': '枪战',
        'game.titleAccent': '精英',
        'game.move': '移动',
        'game.aim': '瞄准射击',
        'game.dash': '冲刺',
        'game.hint': '消灭一波波敌人，坚持得越久，得分越高！',
        'game.start': '开始战斗',
        'game.over': '你阵亡了',
        'game.finalScore': '最终得分',
        'game.overWave': '存活到第 {n} 波',
        'game.retry': '再来一局',
        'game.restart': '重新开始',
        'game.waveBanner': '第{n} 波！',
        'game.readout': 'WASD 移动，鼠标瞄准，按住左键射击，Shift 冲刺。',
        'hud.score': '得分',
        'hud.hp': '生命',
        'hud.wave': '波次'
      }
    };

    // ---------- artwork palette (identical in light and dark themes) ----------
    const C = {
      bg: '#0d0f1a',
      grid: 'rgba(255, 255, 255, 0.045)',
      gold: '#ffd257',
      goldSoft: 'rgba(255, 210, 87, 0.25)',
      orange: '#ff9d3c',
      red: '#ff5f57',
      redSoft: '#ff8a80',
      green: '#3ddc84',
      lime: '#b8ff5c',
      cyan: '#4fc3f7',
      ice: '#6fd3ff',
      purple: '#b06cff',
      gun: '#2a2f42',
      ink: '#e8ecf5',
      muted: '#8f99b0'
    };

    const TYPES = {
      grunt: { r: 14, hp: 3, speed: 1.7, color: C.red, dmg: 10, score: 10 },
      runner: { r: 11, hp: 2, speed: 3.1, color: C.orange, dmg: 8, score: 15 },
      tank: { r: 24, hp: 12, speed: 0.9, color: C.purple, dmg: 20, score: 40 },
      gunner: { r: 15, hp: 5, speed: 1.2, color: C.green, dmg: 12, score: 25, ranged: true }
    };

    let translate = (key) => key;
    let localeService = null;

    function t(key, params) {
      let text = translate(key);
      if (typeof text !== 'string') text = key;
      if (params !== undefined) {
        for (const name of Object.keys(params)) text = text.split('{' + name + '}').join(String(params[name]));
      }
      return text;
    }

    function clamp(value, lo, hi) {
      if (value < lo) return lo;
      if (value > hi) return hi;
      return value;
    }

    function isTypingTarget(node) {
      if (node === null || typeof node !== 'object') return false;
      const el = node.nodeType === 1 ? node : (node.parentElement || null);
      if (el === null || typeof el.closest !== 'function') return false;
      return el.closest('input, textarea, select, [contenteditable="true"]') !== null;
    }

    // ------------------------------------------------------------------
    // Game engine: a self-contained arena shooter bound to one canvas.
    // Returns handles the React component drives from its effects.
    // ------------------------------------------------------------------
    function mountGame(canvas, onHud) {
      const g = canvas.getContext('2d');
      const view = { W: 1, H: 1, dpr: 1 };
      let raf = 0;
      let disposed = false;
      let lastHudKey = '';

      const S = {
        phase: 'idle', // idle | playing | over
        score: 0,
        wave: 1,
        waveTimer: 0,
        spawnQueue: 0,
        spawnCD: 0,
        time: 0,
        shake: 0,
        keys: Object.create(null),
        mouse: { x: 0, y: 0, down: false },
        player: {
          x: 0, y: 0, r: 16, hp: 100, maxHp: 100, speed: 4.2,
          dir: 0, fireCD: 0, dashCD: 0, dashT: 0, flash: 0
        },
        bullets: [],
        enemies: [],
        eBullets: [],
        particles: [],
        pickups: [],
        floatTexts: []
      };

      function resize() {
        const host = canvas.parentElement || canvas;
        const rect = host.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width || host.clientWidth || 1));
        const ht = Math.max(1, Math.floor(rect.height || host.clientHeight || 1));
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        view.W = w;
        view.H = ht;
        view.dpr = dpr;
        const pxW = Math.round(w * dpr);
        const pxH = Math.round(ht * dpr);
        if (canvas.width !== pxW || canvas.height !== pxH) {
          canvas.width = pxW;
          canvas.height = pxH;
        }
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        const p = S.player;
        if (p.x === 0 && p.y === 0) {
          p.x = w / 2;
          p.y = ht / 2;
        }
        p.x = clamp(p.x, p.r, Math.max(p.r, w - p.r));
        p.y = clamp(p.y, p.r, Math.max(p.r, ht - p.r));
        if (S.mouse.x === 0 && S.mouse.y === 0) {
          S.mouse.x = w / 2;
          S.mouse.y = ht / 2;
        }
        S.mouse.x = clamp(S.mouse.x, 0, w);
        S.mouse.y = clamp(S.mouse.y, 0, ht);
      }

      function syncHud(force) {
        const p = S.player;
        const key = S.phase + '|' + S.score + '|' + S.wave + '|' + Math.round(p.hp) + '|' + Math.round(p.maxHp);
        if (!force && key === lastHudKey) return;
        lastHudKey = key;
        if (disposed) return;
        onHud({
          phase: S.phase,
          score: S.score,
          wave: S.wave,
          hp: Math.max(0, Math.round(p.hp)),
          maxHp: p.maxHp
        });
      }

      function beginWave() {
        S.spawnQueue = 3 + S.wave * 2;
        S.spawnCD = 0;
        S.waveTimer = 0;
      }

      function start() {
        const p = S.player;
        S.phase = 'playing';
        S.score = 0;
        S.wave = 1;
        S.waveTimer = 0;
        S.time = 0;
        S.shake = 0;
        S.bullets = [];
        S.enemies = [];
        S.eBullets = [];
        S.particles = [];
        S.pickups = [];
        S.floatTexts = [];
        p.x = view.W / 2;
        p.y = view.H / 2;
        p.hp = p.maxHp;
        p.dir = 0;
        p.fireCD = 0;
        p.dashCD = 0;
        p.dashT = 0;
        p.flash = 0;
        S.mouse.down = false;
        beginWave();
        syncHud(true);
      }

      function spawnEnemy() {
        const roll = Math.random();
        let type = 'grunt';
        if (S.wave >= 2 && roll < 0.28) type = 'runner';
        if (S.wave >= 3 && roll > 0.78) type = 'gunner';
        if (S.wave >= 4 && roll > 0.93) type = 'tank';
        const spec = TYPES[type];
        const W = view.W;
        const H = view.H;
        const side = Math.floor(Math.random() * 4);
        let x;
        let y;
        if (side === 0) { x = Math.random() * W; y = -40; }
        else if (side === 1) { x = W + 40; y = Math.random() * H; }
        else if (side === 2) { x = Math.random() * W; y = H + 40; }
        else { x = -40; y = Math.random() * H; }
        const hp = spec.hp + Math.floor(S.wave / 3);
        S.enemies.push({
          type: type,
          x: x,
          y: y,
          r: spec.r,
          hp: hp,
          maxHp: hp,
          speed: spec.speed,
          flash: 0,
          fireCD: Math.random() * 120
        });
      }

      function dash() {
        const p = S.player;
        if (S.phase !== 'playing' || p.dashCD > 0) return;
        p.dashT = 10;
        p.dashCD = 90;
      }

      function addFloat(x, y, text, color, size) {
        S.floatTexts.push({ x: x, y: y, text: text, color: color, size: size, life: 50 });
      }

      function hurtPlayer(dmg) {
        const p = S.player;
        if (S.phase !== 'playing') return;
        if (p.dashT > 0) return; // dash invulnerability frames
        p.hp -= dmg;
        p.flash = 10;
        S.shake = Math.max(S.shake, 8);
        if (p.hp <= 0) {
          p.hp = 0;
          S.phase = 'over';
          S.mouse.down = false;
          syncHud(true);
        }
      }

      function update() {
        const p = S.player;
        const W = view.W;
        const H = view.H;
        S.time++;
        if (p.dashCD > 0) p.dashCD--;
        if (p.flash > 0) p.flash--;
        if (S.shake > 0) S.shake *= 0.85;

        let dx = 0;
        let dy = 0;
        if (S.keys.w || S.keys.W) dy -= 1;
        if (S.keys.s || S.keys.S) dy += 1;
        if (S.keys.a || S.keys.A) dx -= 1;
        if (S.keys.d || S.keys.D) dx += 1;
        if (dx !== 0 || dy !== 0) {
          const len = Math.hypot(dx, dy);
          dx /= len;
          dy /= len;
          const speed = p.speed * (p.dashT > 0 ? 3 : 1);
          p.x = clamp(p.x + dx * speed, p.r, Math.max(p.r, W - p.r));
          p.y = clamp(p.y + dy * speed, p.r, Math.max(p.r, H - p.r));
        }
        if (p.dashT > 0) {
          p.dashT--;
          S.particles.push({ x: p.x, y: p.y, r: 10, life: 15, max: 15, color: C.ice, vx: 0, vy: 0 });
        }
        p.dir = Math.atan2(S.mouse.y - p.y, S.mouse.x - p.x);

        // fire
        if (p.fireCD > 0) p.fireCD--;
        if (S.mouse.down && p.fireCD <= 0) {
          p.fireCD = 9;
          const spread = (Math.random() - 0.5) * 0.12;
          const a = p.dir + spread;
          S.bullets.push({
            x: p.x + Math.cos(a) * 20,
            y: p.y + Math.sin(a) * 20,
            vx: Math.cos(a) * 14,
            vy: Math.sin(a) * 14,
            life: 70
          });
          for (let i = 0; i < 3; i++) {
            S.particles.push({
              x: p.x + Math.cos(a) * 24,
              y: p.y + Math.sin(a) * 24,
              r: 4, life: 8, max: 8, color: C.gold,
              vx: Math.cos(a) * 3 + (Math.random() - 0.5) * 2,
              vy: Math.sin(a) * 3 + (Math.random() - 0.5) * 2
            });
          }
          S.shake = Math.max(S.shake, 3);
        }

        // spawn / wave progression
        S.waveTimer++;
        if (S.spawnQueue > 0) {
          S.spawnCD--;
          if (S.spawnCD <= 0) {
            spawnEnemy();
            S.spawnQueue--;
            S.spawnCD = Math.max(20, 70 - S.wave * 4);
          }
        } else if (S.enemies.length === 0 && S.eBullets.length === 0 && S.waveTimer > 90) {
          S.wave++;
          S.waveTimer = 0;
          beginWave();
          addFloat(W / 2, H / 2 - 60, t('game.waveBanner', { n: S.wave }), C.gold, 26);
        }

        // player bullets
        for (const b of S.bullets) {
          b.x += b.vx;
          b.y += b.vy;
          b.life--;
          if (b.x < 0 || b.x > W || b.y < 0 || b.y > H) b.life = 0;
        }
        S.bullets = S.bullets.filter((b) => b.life > 0);

        // enemies
        for (const e of S.enemies) {
          const spec = TYPES[e.type];
          const ang = Math.atan2(p.y - e.y, p.x - e.x);
          const dist = Math.hypot(p.x - e.x, p.y - e.y);
          if (e.flash > 0) e.flash--;

          if (spec.ranged) {
            const keep = 260;
            const move = dist > keep + 40 ? 1 : dist < keep - 40 ? -0.6 : 0;
            e.x += Math.cos(ang) * e.speed * move;
            e.y += Math.sin(ang) * e.speed * move;
            e.fireCD--;
            if (e.fireCD <= 0 && dist < 520) {
              e.fireCD = Math.max(50, 110 - S.wave * 5);
              S.eBullets.push({ x: e.x, y: e.y, vx: Math.cos(ang) * 6, vy: Math.sin(ang) * 6, life: 120 });
            }
          } else {
            e.x += Math.cos(ang) * e.speed;
            e.y += Math.sin(ang) * e.speed;
            if (dist < e.r + p.r) {
              hurtPlayer(spec.dmg);
              const push = Math.atan2(e.y - p.y, e.x - p.x);
              e.x += Math.cos(push) * 26;
              e.y += Math.sin(push) * 26;
            }
          }

          // simple separation so enemies do not stack
          for (const other of S.enemies) {
            if (other === e) continue;
            const d = Math.hypot(other.x - e.x, other.y - e.y);
            const min = other.r + e.r;
            if (d < min && d > 0) {
              const push = (min - d) / 2;
              const a2 = Math.atan2(e.y - other.y, e.x - other.x);
              e.x += Math.cos(a2) * push;
              e.y += Math.sin(a2) * push;
              other.x -= Math.cos(a2) * push;
              other.y -= Math.sin(a2) * push;
            }
          }
        }

        // bullet hits
        for (const b of S.bullets) {
          for (const e of S.enemies) {
            if (Math.hypot(b.x - e.x, b.y - e.y) < e.r + 4) {
              e.hp--;
              e.flash = 6;
              b.life = 0;
              for (let i = 0; i < 5; i++) {
                S.particles.push({
                  x: b.x, y: b.y, r: 3, life: 14, max: 14, color: C.redSoft,
                  vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5
                });
              }
              if (e.hp <= 0) {
                const spec = TYPES[e.type];
                S.score += spec.score;
                addFloat(e.x, e.y - e.r, '+' + spec.score, C.gold, 16);
                for (let i = 0; i < 14; i++) {
                  S.particles.push({
                    x: e.x, y: e.y, r: 4 + Math.random() * 3, life: 22, max: 22, color: spec.color,
                    vx: (Math.random() - 0.5) * 7, vy: (Math.random() - 0.5) * 7
                  });
                }
                if (Math.random() < 0.12) S.pickups.push({ x: e.x, y: e.y, r: 10, life: 480 });
                S.enemies.splice(S.enemies.indexOf(e), 1);
              }
              break;
            }
          }
        }
        S.bullets = S.bullets.filter((b) => b.life > 0);
        S.enemies = S.enemies.filter((e) => e.hp > 0);

        // enemy bullets
        for (const b of S.eBullets) {
          b.x += b.vx;
          b.y += b.vy;
          b.life--;
          if (Math.hypot(b.x - p.x, b.y - p.y) < p.r + 3) {
            hurtPlayer(8);
            b.life = 0;
          }
          if (b.x < 0 || b.x > W || b.y < 0 || b.y > H) b.life = 0;
        }
        S.eBullets = S.eBullets.filter((b) => b.life > 0);

        // health drops
        for (const pickup of S.pickups) {
          pickup.life--;
          if (Math.hypot(pickup.x - p.x, pickup.y - p.y) < pickup.r + p.r) {
            p.hp = Math.min(p.maxHp, p.hp + 30);
            addFloat(pickup.x, pickup.y - 16, '+30 HP', C.green, 16);
            pickup.life = 0;
          }
        }
        S.pickups = S.pickups.filter((pickup) => pickup.life > 0);

        // particles and floating text
        for (const p2 of S.particles) {
          p2.x += p2.vx;
          p2.y += p2.vy;
          p2.vx *= 0.93;
          p2.vy *= 0.93;
          p2.life--;
        }
        S.particles = S.particles.filter((p2) => p2.life > 0);

        for (const f of S.floatTexts) {
          f.y -= 0.8;
          f.life--;
        }
        S.floatTexts = S.floatTexts.filter((f) => f.life > 0);
      }

      function draw() {
        const W = view.W;
        const H = view.H;
        const p = S.player;
        const live = S.phase === 'playing';

        g.fillStyle = C.bg;
        g.fillRect(0, 0, W, H);

        g.save();
        if (S.shake > 0.5) g.translate((Math.random() - 0.5) * S.shake, (Math.random() - 0.5) * S.shake);

        // grid background, parallaxed against the player
        g.strokeStyle = C.grid;
        g.lineWidth = 1;
        const step = 60;
        const ox = -(p.x * 0.15) % step;
        const oy = -(p.y * 0.15) % step;
        g.beginPath();
        for (let x = ox; x < W; x += step) { g.moveTo(x, 0); g.lineTo(x, H); }
        for (let y = oy; y < H; y += step) { g.moveTo(0, y); g.lineTo(W, y); }
        g.stroke();

        if (live || S.enemies.length > 0 || S.particles.length > 0) {
          // health drops
          for (const pickup of S.pickups) {
            g.save();
            g.translate(pickup.x, pickup.y);
            g.rotate(S.time * 0.03);
            g.fillStyle = C.green;
            g.shadowColor = C.green;
            g.shadowBlur = 14;
            g.fillRect(-8, -3, 16, 6);
            g.fillRect(-3, -8, 6, 16);
            g.restore();
          }

          // player bullets
          g.fillStyle = '#ffe08a';
          g.shadowColor = C.gold;
          g.shadowBlur = 10;
          for (const b of S.bullets) {
            g.beginPath();
            g.ellipse(b.x, b.y, 8, 3, Math.atan2(b.vy, b.vx), 0, Math.PI * 2);
            g.fill();
          }
          g.shadowBlur = 0;

          // enemy bullets
          g.fillStyle = '#ff7a70';
          g.shadowColor = C.red;
          g.shadowBlur = 10;
          for (const b of S.eBullets) {
            g.beginPath();
            g.arc(b.x, b.y, 4, 0, Math.PI * 2);
            g.fill();
          }
          g.shadowBlur = 0;

          // enemies
          for (const e of S.enemies) {
            const spec = TYPES[e.type];
            const ang = Math.atan2(p.y - e.y, p.x - e.x);
            g.save();
            g.translate(e.x, e.y);
            g.fillStyle = e.flash > 0 ? '#ffffff' : spec.color;
            g.shadowColor = spec.color;
            g.shadowBlur = 12;
            g.beginPath();
            g.arc(0, 0, e.r, 0, Math.PI * 2);
            g.fill();
            g.shadowBlur = 0;
            g.strokeStyle = e.flash > 0 ? '#ffffff' : C.gun;
            g.lineWidth = Math.max(4, e.r * 0.3);
            g.beginPath();
            g.moveTo(0, 0);
            g.lineTo(Math.cos(ang) * (e.r + 8), Math.sin(ang) * (e.r + 8));
            g.stroke();
            g.restore();
            if (e.hp < e.maxHp) {
              g.fillStyle = 'rgba(0,0,0,0.5)';
              g.fillRect(e.x - e.r, e.y - e.r - 10, e.r * 2, 4);
              g.fillStyle = C.red;
              g.fillRect(e.x - e.r, e.y - e.r - 10, e.r * 2 * (e.hp / e.maxHp), 4);
            }
          }

          // player
          if (live) {
            g.save();
            g.translate(p.x, p.y);
            g.rotate(p.dir);
            g.fillStyle = C.gun;
            g.fillRect(6, -3.5, 26, 7);
            g.fillStyle = p.flash > 0 ? '#ffffff' : C.cyan;
            g.shadowColor = C.cyan;
            g.shadowBlur = 16;
            g.beginPath();
            g.arc(0, 0, p.r, 0, Math.PI * 2);
            g.fill();
            g.shadowBlur = 0;
            g.fillStyle = '#dff3ff';
            g.beginPath();
            g.arc(0, 0, p.r * 0.45, 0, Math.PI * 2);
            g.fill();
            g.restore();

            // aim guide
            g.strokeStyle = C.goldSoft;
            g.lineWidth = 1;
            g.setLineDash([6, 8]);
            g.beginPath();
            g.moveTo(p.x, p.y);
            g.lineTo(S.mouse.x, S.mouse.y);
            g.stroke();
            g.setLineDash([]);
          }
        }

        // particles
        for (const p2 of S.particles) {
          g.globalAlpha = p2.life / p2.max;
          g.fillStyle = p2.color;
          g.beginPath();
          g.arc(p2.x, p2.y, p2.r, 0, Math.PI * 2);
          g.fill();
        }
        g.globalAlpha = 1;

        // floating text
        for (const f of S.floatTexts) {
          g.globalAlpha = Math.min(1, f.life / 25);
          g.fillStyle = f.color;
          g.font = 'bold ' + f.size + 'px ' + FONT;
          g.textAlign = 'center';
          g.fillText(f.text, f.x, f.y);
        }
        g.globalAlpha = 1;
        g.restore();

        // crosshair
        if (live) {
          const mx = S.mouse.x;
          const my = S.mouse.y;
          g.strokeStyle = C.gold;
          g.lineWidth = 2;
          g.beginPath();
          g.arc(mx, my, 12, 0, Math.PI * 2);
          g.stroke();
          g.beginPath();
          g.moveTo(mx - 18, my); g.lineTo(mx - 6, my);
          g.moveTo(mx + 6, my); g.lineTo(mx + 18, my);
          g.moveTo(mx, my - 18); g.lineTo(mx, my - 6);
          g.moveTo(mx, my + 6); g.lineTo(mx, my + 18);
          g.stroke();
        }

        // hurt flash
        if (p.flash > 0 && live) {
          g.fillStyle = 'rgba(255, 60, 50, ' + ((p.flash / 10) * 0.25) + ')';
          g.fillRect(0, 0, W, H);
        }
      }

      function frame() {
        raf = window.requestAnimationFrame(frame);
        if (S.phase === 'playing') update();
        draw();
        syncHud(false);
      }

      function startLoop() {
        if (raf !== 0 || disposed) return;
        raf = window.requestAnimationFrame(frame);
      }

      function destroy() {
        disposed = true;
        if (raf !== 0) window.cancelAnimationFrame(raf);
        raf = 0;
      }

      function keyDown(event) {
        if (event.key === 'Shift') {
          dash();
          return;
        }
        const key = event.key.toLowerCase();
        if (key === 'w' || key === 'a' || key === 's' || key === 'd') S.keys[key] = true;
      }

      function keyUp(event) {
        S.keys[event.key.toLowerCase()] = false;
      }

      function releaseAll() {
        S.keys = Object.create(null);
        S.mouse.down = false;
      }

      function pointerMove(event) {
        const rect = canvas.getBoundingClientRect();
        S.mouse.x = event.clientX - rect.left;
        S.mouse.y = event.clientY - rect.top;
      }

      function pointerDown(event) {
        pointerMove(event);
        if (event.button === 0 || event.button === undefined) S.mouse.down = true;
      }

      function pointerUp() {
        S.mouse.down = false;
      }

      return {
        resize: resize,
        start: start,
        startLoop: startLoop,
        destroy: destroy,
        keyDown: keyDown,
        keyUp: keyUp,
        releaseAll: releaseAll,
        pointerMove: pointerMove,
        pointerDown: pointerDown,
        pointerUp: pointerUp
      };
    }

    // ------------------------------------------------------------------
    // Styles
    // ------------------------------------------------------------------
    const panelStyle = {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      minHeight: '480px',
      background: 'var(--dsw-alias-bg-base)',
      color: 'var(--dsw-alias-label-primary)',
      overflow: 'hidden'
    };

    const headerStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '10px 16px',
      borderBottom: '1px solid var(--dsw-alias-border-l1)',
      background: 'var(--dsw-alias-bg-layer-1)',
      flex: '0 0 auto'
    };

    const stageStyle = {
      position: 'relative',
      flex: '1 1 auto',
      minWidth: 0,
      minHeight: 0,
      overflow: 'hidden',
      background: C.bg
    };

    const canvasStyle = {
      display: 'block',
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      cursor: 'crosshair',
      touchAction: 'none'
    };

    const overlayStyle = {
      position: 'absolute',
      inset: '0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '14px',
      padding: '24px',
      textAlign: 'center',
      background: 'rgba(9, 11, 22, 0.86)',
      color: C.ink,
      fontFamily: FONT
    };

    const titleStyle = {
      margin: 0,
      fontSize: 'clamp(30px, 5vw, 52px)',
      fontWeight: 700,
      letterSpacing: '6px',
      color: C.gold,
      textShadow: '0 0 24px rgba(255, 210, 87, 0.45)'
    };

    const subtitleStyle = {
      fontSize: '14px',
      lineHeight: 1.9,
      color: '#9aa3b8',
      maxWidth: '560px'
    };

    const keyCapStyle = {
      display: 'inline-block',
      margin: '0 3px',
      padding: '2px 9px',
      border: '1px solid #5a6478',
      borderRadius: '5px',
      background: '#1a2032',
      color: '#dfe6f3',
      fontSize: '13px',
      lineHeight: 1.5
    };

    const primaryButtonStyle = {
      marginTop: '6px',
      padding: '12px 44px',
      border: 'none',
      borderRadius: '28px',
      background: 'linear-gradient(135deg, ' + C.gold + ', ' + C.orange + ')',
      color: '#10131f',
      fontSize: '17px',
      fontWeight: 700,
      letterSpacing: '4px',
      cursor: 'pointer',
      boxShadow: '0 6px 22px rgba(255, 160, 60, 0.35)'
    };

    const ghostButtonStyle = {
      padding: '5px 14px',
      border: '1px solid var(--dsw-alias-border-l2)',
      borderRadius: '999px',
      background: 'transparent',
      color: 'var(--dsw-alias-label-secondary)',
      fontSize: '12px',
      cursor: 'pointer'
    };

    const hudStyle = {
      position: 'absolute',
      top: '12px',
      left: '12px',
      right: '12px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '12px',
      pointerEvents: 'none',
      color: C.ink,
      fontFamily: FONT
    };

    const hudBoxStyle = {
      minWidth: '130px',
      padding: '8px 14px',
      borderRadius: '10px',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      background: 'rgba(16, 19, 31, 0.55)'
    };

    const hudLabelStyle = {
      fontSize: '11px',
      letterSpacing: '2px',
      color: C.muted,
      textTransform: 'uppercase'
    };

    const hudValueStyle = {
      fontSize: '22px',
      fontWeight: 700,
      color: C.gold
    };

    // ------------------------------------------------------------------
    // Sidebar rail icon
    // ------------------------------------------------------------------
    function PanelIcon(props) {
      const size = typeof props.size === 'number' ? props.size : 20;
      const stroke = props.active ? 'var(--dsw-alias-brand-primary)' : 'currentColor';
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': 'true',
          focusable: 'false'
        },
        h('circle', { cx: 12, cy: 12, r: 7.2, stroke: stroke, strokeWidth: 1.6 }),
        h('circle', { cx: 12, cy: 12, r: 2.1, fill: stroke }),
        h('path', {
          d: 'M12 1.6v3.8M12 18.6v3.8M1.6 12h3.8M18.6 12h3.8',
          stroke: stroke,
          strokeWidth: 1.6,
          strokeLinecap: 'round'
        })
      );
    }

    // ------------------------------------------------------------------
    // Panel
    // ------------------------------------------------------------------
    function useLocaleRevision() {
      const [, bump] = React.useReducer((n) => n + 1, 0);
      React.useEffect(() => {
        if (localeService === null || typeof localeService.subscribe !== 'function') return undefined;
        return localeService.subscribe(bump);
      }, []);
    }

    function ShooterPanel() {
      useLocaleRevision();
      const canvasRef = React.useRef(null);
      const gameRef = React.useRef(null);
      const [hud, setHud] = React.useState({ phase: 'idle', score: 0, wave: 1, hp: 100, maxHp: 100 });

      React.useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas === null) return undefined;
        const game = mountGame(canvas, setHud);
        gameRef.current = game;
        game.resize();
        game.startLoop();

        const onKeyDown = (event) => {
          const el = canvasRef.current;
          if (el === null || !el.isConnected) return;
          // The shell may keep a panel mounted while another one is shown; only
          // steer the game while its canvas is actually laid out and visible.
          if (el.getBoundingClientRect().width <= 0) return;
          if (isTypingTarget(event.target)) return;
          game.keyDown(event);
        };
        const onKeyUp = (event) => game.keyUp(event);
        const onPointerUp = () => game.pointerUp();
        const onBlur = () => game.releaseAll();

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('blur', onBlur);

        let observer = null;
        if (typeof ResizeObserver === 'function' && canvas.parentElement !== null) {
          observer = new ResizeObserver(() => game.resize());
          observer.observe(canvas.parentElement);
        }

        return () => {
          window.removeEventListener('keydown', onKeyDown);
          window.removeEventListener('keyup', onKeyUp);
          window.removeEventListener('pointerup', onPointerUp);
          window.removeEventListener('blur', onBlur);
          if (observer !== null) observer.disconnect();
          game.destroy();
          gameRef.current = null;
        };
      }, []);

      const startGame = () => {
        if (gameRef.current !== null) gameRef.current.start();
      };

      const playing = hud.phase === 'playing';
      const hpPct = Math.max(0, Math.min(1, hud.hp / (hud.maxHp || 100)));
      const hpFill = hpPct > 0.5 ? C.green + ' 0%, ' + C.lime : hpPct > 0.25 ? C.gold + ' 0%, ' + C.orange : C.red + ' 0%, ' + C.redSoft;

      const children = [
        h(
          'div',
          { key: 'stage', style: stageStyle },
          h('canvas', {
            ref: canvasRef,
            style: canvasStyle,
            onPointerMove: (event) => { if (gameRef.current !== null) gameRef.current.pointerMove(event); },
            onPointerDown: (event) => { if (gameRef.current !== null) gameRef.current.pointerDown(event); }
          })
        )
      ];

      if (playing) {
        children.push(
          h(
            'div',
            { key: 'hud', style: hudStyle },
            h('div', { style: hudBoxStyle },
              h('div', { style: hudLabelStyle }, t('hud.score')),
              h('div', { style: hudValueStyle }, String(hud.score))
            ),
            h('div', { style: hudBoxStyle },
              h('div', { style: hudLabelStyle }, t('hud.hp') + ' ' + Math.round(hud.hp)),
              h('div', {
                style: {
                  width: '160px',
                  height: '10px',
                  marginTop: '8px',
                  borderRadius: '5px',
                  overflow: 'hidden',
                  background: '#232a3d'
                }
              }, h('div', {
                style: {
                  width: Math.round(hpPct * 100) + '%',
                  height: '100%',
                  background: 'linear-gradient(90deg, ' + hpFill + ')',
                  transition: 'width 0.2s ease'
                }
              }))
            ),
            h('div', { style: hudBoxStyle },
              h('div', { style: hudLabelStyle }, t('hud.wave')),
              h('div', { style: hudValueStyle }, String(hud.wave))
            )
          )
        );
      }

      if (hud.phase === 'idle') {
        children.push(
          h(
            'div',
            { key: 'start', style: overlayStyle },
            h('div', { style: titleStyle }, t('game.titleMain'), h('span', { style: { color: C.red } }, t('game.titleAccent'))),
            h(
              'div',
              { style: subtitleStyle },
              h('span', { style: keyCapStyle }, 'W'),
              h('span', { style: keyCapStyle }, 'A'),
              h('span', { style: keyCapStyle }, 'S'),
              h('span', { style: keyCapStyle }, 'D'),
              h('span', { style: { margin: '0 8px' } }, t('game.move')),
              h('span', { style: { opacity: 0.5 } }, '·'),
              h('span', { style: keyCapStyle }, '🖱'),
              h('span', { style: { margin: '0 8px' } }, t('game.aim')),
              h('span', { style: { opacity: 0.5 } }, '·'),
              h('span', { style: keyCapStyle }, 'Shift'),
              h('span', { style: { margin: '0 8px' } }, t('game.dash')),
              h('div', { style: { marginTop: '10px' } }, t('game.hint'))
            ),
            h('button', { type: 'button', style: primaryButtonStyle, onClick: startGame }, t('game.start')),
            h('div', { style: { fontSize: '12px', color: '#6f7a90', maxWidth: '520px' } }, t('game.readout'))
          )
        );
      }

      if (hud.phase === 'over') {
        children.push(
          h(
            'div',
            { key: 'over', style: overlayStyle },
            h('div', { style: Object.assign({}, titleStyle, { color: C.red, textShadow: '0 0 24px rgba(255, 95, 87, 0.4)' }) }, t('game.over')),
            h('div', { style: subtitleStyle }, t('game.finalScore')),
            h('div', { style: { fontSize: '40px', fontWeight: 700, color: C.gold } }, String(hud.score)),
            h('div', { style: subtitleStyle }, t('game.overWave', { n: hud.wave })),
            h('button', { type: 'button', style: primaryButtonStyle, onClick: startGame }, t('game.retry'))
          )
        );
      }

      return h(
        'div',
        { style: panelStyle },
        h(
          'div',
          { style: headerStyle },
          h(
            'div',
            { style: { display: 'flex', alignItems: 'baseline', gap: '10px', minWidth: 0 } },
            h('span', { style: { fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' } }, t('panel.title')),
            h('span', {
              style: {
                fontSize: '12px',
                color: 'var(--dsw-alias-label-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }
            }, t('panel.tagline'))
          ),
          playing
            ? h('button', {
              type: 'button',
              style: ghostButtonStyle,
              onClick: () => { if (gameRef.current !== null) gameRef.current.start(); }
            }, t('game.restart'))
            : null
        ),
        h('div', { style: { position: 'relative', display: 'flex', flex: '1 1 auto', minHeight: 0 } }, children)
      );
    }

    function apply(ctx) {
      localeService = ctx.locale;
      translate = ctx.locale.bind(NS);

      ctx.effect(() => ctx.locale.register(NS, DICTS), 'dsh-shooter: dictionaries');

      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: PANEL_ORDER,
            locale: NS,
            label: () => t('panel.title')
          },
          PanelIcon
        )
      );

      ctx.slots.inject('main', () =>
        ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS }, ShooterPanel)
      );
    }

    return {
      name: NS,
      inject: ['slots', 'locale'],
      apply: apply
    };
  }
});

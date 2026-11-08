/*
 * Offline simulation for the dsh-shooter AI pilot (大肥鱼托管).
 *
 * Loads the real client.js with stubbed host interfaces, drives the animation
 * loop by hand and reads the HUD callback exactly like the panel does.
 *
 * Usage: node scripts/sim-ai.mjs [frames]
 */
import { createEnv, createReactStub, createHookStore, loadClient } from './harness.mjs';

function simulate({ label, ai, frames, press, speed }) {
  const env = createEnv();
  const mod = loadClient(env, createReactStub(createHookStore()));
  const { mountGame } = mod.__test;

  const stats = {
    label,
    frames: 0,
    lives: 0,
    deaths: [],
    maxWave: 1,
    maxScore: 0,
    maxCombo: 1,
    comboSettled: false,
    bossSeen: false,
    bossFrames: 0,
    bossKills: 0,
    prevBoss: false,
    upgradeKinds: 0,
    shieldMax: 0,
    states: Object.create(null),
    errors: []
  };

  let hud = { phase: 'idle', score: 0, wave: 1, hp: 100, maxHp: 100, ai: false, aiState: 'cruise' };
  const game = mountGame(env.canvas, (next) => {
    hud = next;
  });
  game.resize();
  game.setAI(ai);
  game.start();
  game.startLoop();
  if (speed !== undefined) game.setSpeed(speed);

  if (press !== undefined) {
    game.keyDown({ key: press });
    game.keyUp({ key: press });
  }

  let prevPhase = hud.phase;
  let lifeFrames = 0;

  for (let i = 0; i < frames; i++) {
    try {
      env.step(1);
    } catch (err) {
      stats.errors.push(String((err && err.stack) || err));
      break;
    }
    stats.frames++;
    // Boss 只在每 5 波出现：记录是否真的刷出来、有没有被打掉
    const dbg = game.debugState();
    const hasBoss = dbg.boss !== null && dbg.boss !== undefined;
    if (hasBoss) {
      stats.bossSeen = true;
      stats.bossFrames++;
    }
    if (stats.prevBoss && !hasBoss && hud.phase === 'playing') stats.bossKills++;
    stats.prevBoss = hasBoss;
    // 局内强化：托管会在清偶数波后自己选卡，记下攒了几种
    if (dbg.mods && dbg.mods.counts) {
      const kinds = Object.keys(dbg.mods.counts).length;
      if (kinds > stats.upgradeKinds) stats.upgradeKinds = kinds;
      if (dbg.mods.shieldMax > stats.shieldMax) stats.shieldMax = dbg.mods.shieldMax;
    }
    if (hud.phase === 'playing') {
      lifeFrames++;
      stats.states[hud.aiState || 'manual'] = (stats.states[hud.aiState || 'manual'] || 0) + 1;
      if (hud.wave > stats.maxWave) stats.maxWave = hud.wave;
      if (hud.score > stats.maxScore) stats.maxScore = hud.score;
      // 连杀倍率：记录本局最高倍率，并确认窗口过期后会回落
      const combo = typeof hud.combo === 'number' ? hud.combo : 1;
      if (combo > stats.maxCombo) stats.maxCombo = combo;
      if (combo > 1) stats.comboSeen = true;
      else if (stats.comboSeen) stats.comboSettled = true;
      if (!Number.isFinite(hud.hp) || !Number.isFinite(hud.score) || !Number.isFinite(hud.wave)) {
        stats.errors.push('non-finite HUD value: ' + JSON.stringify(hud));
        break;
      }
    } else if (hud.phase === 'over' && prevPhase === 'playing') {
      stats.deaths.push({ wave: hud.wave, score: hud.score, lifeFrames });
      if (lifeFrames > 0) stats.lives++;
      lifeFrames = 0;
    }
    prevPhase = hud.phase;
  }

  stats.avgWave = stats.deaths.length === 0
    ? stats.maxWave
    : Math.round((stats.deaths.reduce((sum, d) => sum + d.wave, 0) / stats.deaths.length) * 10) / 10;
  stats.avgLifeFrames = stats.deaths.length === 0
    ? lifeFrames
    : Math.round(stats.deaths.reduce((sum, d) => sum + d.lifeFrames, 0) / stats.deaths.length);
  return stats;
}

const frameArg = Number.parseInt(process.argv[2] || '', 10);
const FRAMES = Number.isFinite(frameArg) && frameArg > 0 ? frameArg : 30000;

const scenarios = [
  simulate({ label: '大肥鱼托管（观战）', ai: true, frames: FRAMES }),
  simulate({ label: '托管 2 倍速（观战）', ai: true, frames: Math.min(FRAMES, 8000), speed: 2 }),
  simulate({ label: '托管关闭（纯挂机不操作）', ai: false, frames: 600 }),
  simulate({ label: '手玩模式（按一下 D）', ai: false, frames: 600, press: 'd' })
];

let failed = false;
for (const stats of scenarios) {
  const states = Object.entries(stats.states)
    .map(([name, count]) => name + ':' + count)
    .join(' ');
  console.log('--- ' + stats.label + ' ---');
  console.log('  frames=' + stats.frames + '  lives=' + stats.lives + '  maxWave=' + stats.maxWave +
    '  maxScore=' + stats.maxScore + '  maxCombo=' + stats.maxCombo +
    '  bossFrames=' + stats.bossFrames + '  bossKills=' + stats.bossKills +
    '  upgrades=' + stats.upgradeKinds + '  shield=' + stats.shieldMax +
    '  avgWave=' + stats.avgWave + '  avgLifeFrames=' + stats.avgLifeFrames);
  if (states !== '') console.log('  aiState: ' + states);
  for (const d of stats.deaths) {
    console.log('  death: wave=' + d.wave + ' score=' + d.score + ' lifeFrames=' + d.lifeFrames);
  }
  if (stats.errors.length > 0) {
    failed = true;
    console.log('  ERRORS:');
    for (const e of stats.errors) console.log('  ' + e.split('\n').join('\n  '));
  }
  console.log('');
}

const ai = scenarios[0];
if (ai.errors.length === 0 && ai.maxWave < 2) {
  failed = true;
  console.log('FAIL: AI 托管没能撑过 1 波（maxWave=' + ai.maxWave + '）');
}
if (ai.errors.length === 0 && ai.maxCombo < 2) {
  failed = true;
  console.log('FAIL: 2 万帧里一次连杀倍率都没触发（maxCombo=' + ai.maxCombo + '）');
}
if (ai.errors.length === 0 && !ai.comboSettled) {
  failed = true;
  console.log('FAIL: 连杀倍率从没回落过（窗口过期逻辑可能坏了）');
}
if (ai.errors.length === 0 && !ai.bossSeen) {
  failed = true;
  console.log('FAIL: 2 万帧里没有遇到任何 Boss 波（每 5 波一只）');
}
if (ai.errors.length === 0 && ai.bossKills < 1) {
  failed = true;
  console.log('FAIL: Boss 刷出来了但一次都没被打掉（bossKills=' + ai.bossKills + '）');
}
// 局内强化：托管清偶数波后会自己选卡，2 万帧理应攒到好几种强化
if (ai.errors.length === 0 && ai.upgradeKinds < 1) {
  failed = true;
  console.log('FAIL: 托管全程没有选过任何局内强化（三选一可能没弹出/自动选卡坏了）');
}
// 2 倍速：模拟相同帧数应推进约两倍游戏时间，且不崩
const fast = scenarios[1];
if (fast.errors.length === 0 && fast.maxWave < 2) {
  failed = true;
  console.log('FAIL: 2 倍速托管 8000 帧只到第 ' + fast.maxWave + ' 波');
}
console.log(failed ? 'RESULT: FAIL' : 'RESULT: PASS');
process.exit(failed ? 1 : 0);

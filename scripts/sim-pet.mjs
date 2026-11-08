/*
 * 桌宠解说（dsh-pet /broadcast 投喂 + /voice/speak 出声）的离线测试。
 *
 * 复用 harness 里的假 canvas / rAF 环境，额外补上 window.location、捕获式
 * fetch、URL 与 Audio 桩 —— 断言「观战模式会说话、手玩不说话、说话不漏帧、
 * body 合法、同一句会送去合成并由本页播放」。真正的 HTTP 投喂与合成成败不在
 * 离线范围内：桌宠不在线/没网时线上会自动跳过。
 */
import { createEnv, createHookStore, createReactStub, loadClient, applyLocale } from './harness.mjs';

const PET_URL = '/dsh-pet-7340/broadcast?pet=main&surface=any';
const VOICE_URL = '/dsh-pet-7340/voice/speak';
const PET_TALK_FLOOR = 60; // 与 client.js 保持一致：任何两次播报之间至少 60 帧

let failures = 0;
function check(name, ok, detail) {
  if (ok) {
    console.log('  PASS  ' + name);
  } else {
    failures++;
    console.log('  FAIL  ' + name + (detail ? ' — ' + detail : ''));
  }
}

/** 让页面看起来「在 DSH 里」：有 location，fetch 收集请求，Audio/URL 桩记录播放。 */
function enablePet(env) {
  const calls = [];
  const audios = [];
  let objectUrls = 0;
  env.windowStub.location = { origin: 'http://127.0.0.1:55346', href: 'http://127.0.0.1:55346/' };
  env.windowStub.URL = {
    createObjectURL: () => 'blob:sim-' + ++objectUrls,
    revokeObjectURL: () => {}
  };
  env.windowStub.Audio = function Audio(url) {
    this.url = url;
    this.volume = 1;
    this.played = 0;
    this.paused = 0;
    audios.push(this);
  };
  env.windowStub.Audio.prototype.play = function () {
    this.played++;
    return Promise.resolve();
  };
  env.windowStub.Audio.prototype.pause = function () {
    this.paused++;
  };
  env.windowStub.fetch = (url, options) => {
    calls.push({ url, options });
    if (url === VOICE_URL) {
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'audio/mpeg' },
        blob: async () => ({ size: 1024 })
      });
    }
    return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
  };
  return { calls, audios };
}

function mount(env) {
  const mod = loadClient(env, createReactStub(createHookStore()));
  applyLocale(mod, 'zh');
  let hud = {};
  const game = mod.__test.mountGame(env.canvas, (next) => { hud = next; });
  game.resize();
  return { mod, game, hud: () => hud };
}

/** 逐帧驱动；onFrame 收到（帧号, hud）。 */
function run(env, hud, frames, onFrame) {
  for (let i = 0; i < frames; i++) {
    env.step(1);
    onFrame(i, hud());
  }
}

function bodyOf(call) {
  try {
    return JSON.parse(call.options.body);
  } catch (err) {
    return null;
  }
}

/** 等一轮宏任务：fetch 的 .then 链是微任务，整段同步驱动结束后才会跑完。 */
function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// ---------------------------------------------------------------------------
// 场景 1：观战模式 —— 该说话，格式正确，间隔合法，包含波次/阵亡台词，且出声
// ---------------------------------------------------------------------------
console.log('[watch mode] 大肥鱼托管 20000 帧');
{
  const env = createEnv();
  const { calls, audios } = enablePet(env);
  const { game, hud } = mount(env);
  game.setAI(true);
  game.start();
  game.startLoop();

  const frames = [];
  const deaths = [];
  let prevPhase = 'playing';
  run(env, hud, 20000, (frame, state) => {
    const broadcastsNow = calls.filter((c) => c.url === PET_URL).length;
    while (frames.length < broadcastsNow) frames.push(frame);
    // 只数「进入 over」的那一帧，自动续局期间不重复计数
    if (state.phase === 'over' && prevPhase !== 'over') deaths.push(frame);
    prevPhase = state.phase;
  });
  await flush();

  const broadcasts = calls.filter((c) => c.url === PET_URL);
  const speaks = calls.filter((c) => c.url === VOICE_URL);
  const texts = broadcasts.map((c) => (bodyOf(c) || {}).text || '');

  check('托管模式会播报', broadcasts.length > 0, 'calls=' + broadcasts.length);
  check('URL 指向 dsh-pet 投喂端点', broadcasts.every((c) => c.url === PET_URL), broadcasts[0] && broadcasts[0].url);
  check('全部是 POST + JSON', broadcasts.every((c) => c.options.method === 'POST' &&
    c.options.headers && c.options.headers['content-type'] === 'application/json'));
  check('body 含 text / duration / anim', broadcasts.every((c) => {
    const b = bodyOf(c);
    return b && typeof b.text === 'string' && b.text.trim() !== '' &&
      b.duration === 6000 && b.anim === true;
  }));
  // 阵亡台词是强制播报（不受节流限制），其余相邻播报必须间隔 ≥ 60 帧
  const deathLine = /被围住|被偷了一枪|收场|翻车|倒下的姿势|躺一下/;
  check('相邻播报间隔 ≥ 60 帧（阵亡台词除外）',
    frames.every((f, i) => i === 0 || f - frames[i - 1] >= PET_TALK_FLOOR || deathLine.test(texts[i])),
    JSON.stringify(frames.slice(0, 12)));
  check('播报里有波次台词', texts.some((t) => /\d+ ?波/.test(t)), texts.slice(0, 6).join(' | '));
  check('播报里有中文正文', texts.every((t) => /[\u4e00-\u9fa5]/.test(t)));
  check('一次死亡会得到阵亡/破纪录台词',
    deaths.length === 0 || texts.some((t) => /被围住|被偷了一枪|收场|翻车|倒下的姿势|躺一下/.test(t)),
    'deaths=' + deaths.length);
  check('多版本台词：同一事件不总是同一句',
    new Set(texts).size >= 8, 'unique=' + new Set(texts).size);
  check('同一句也送去 TTS 合成', speaks.length === broadcasts.length &&
    speaks.every((s) => typeof (bodyOf(s) || {}).text === 'string' && (bodyOf(s) || {}).text.trim() !== ''),
    'speaks=' + speaks.length + ' broadcasts=' + broadcasts.length);
  check('合成文本与气泡文本一致',
    speaks.length === broadcasts.length && speaks.every((s, i) => (bodyOf(s) || {}).text === texts[i]));
  check('本页创建并播放了音频', audios.length === speaks.length && audios.length > 0 &&
    audios.every((a) => a.volume === 0.9) && audios[0].played === 1,
    'audios=' + audios.length);
  // 上一句没念完时新句子排队等它结束，而不是把半句话掐掉
  check('上一句还在念时新句子排队',
    audios.length > 0 && audios[0].paused === 0 && audios.slice(1).every((a) => a.played === 0));
  console.log('  info  播报 ' + broadcasts.length + ' 条 / 合成 ' + speaks.length + ' 条 / 死亡 ' +
    deaths.length + ' 次 / 不同台词 ' + new Set(texts).size + ' 句');
  const counts = new Map();
  for (const line of texts) counts.set(line, (counts.get(line) || 0) + 1);
  for (const [line, n] of counts) console.log('         · ' + line + '  ×' + n);
}

// ---------------------------------------------------------------------------
// 场景 2：自己玩 —— 一条都不该发，也不该出声
// ---------------------------------------------------------------------------
console.log('[manual mode] 自己玩 3000 帧');
{
  const env = createEnv();
  const { calls, audios } = enablePet(env);
  const { game, hud } = mount(env);
  game.setAI(false);
  game.start();
  game.startLoop();
  run(env, hud, 3000, () => {});
  await flush();
  check('手玩模式不播报', calls.length === 0, 'calls=' + calls.length);
  check('手玩模式不出声', audios.length === 0, 'audios=' + audios.length);
}

// ---------------------------------------------------------------------------
// 场景 3：桌宠离线（没有 location / fetch / Audio）—— 不能崩，也不能发
// ---------------------------------------------------------------------------
console.log('[no pet] 无 location/fetch 2000 帧');
{
  const env = createEnv();
  const { game, hud } = mount(env);
  game.setAI(true);
  game.start();
  game.startLoop();
  let threw = null;
  try {
    run(env, hud, 2000, () => {});
  } catch (err) {
    threw = err;
  }
  check('桌宠离线时不抛错', threw === null, threw && threw.message);
}

if (failures > 0) {
  console.log('\nRESULT: FAIL (' + failures + ')');
  process.exit(1);
}
console.log('\nRESULT: PASS');

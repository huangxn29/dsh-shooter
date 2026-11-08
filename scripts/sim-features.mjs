/*
 * Feature tests for the quality-of-life batch:
 *   - fixed timestep (high refresh rate must not speed the game up)
 *   - best score persistence (localStorage)
 *   - WebAudio sound effects (synthesized, mute switch)
 *   - big-screen toggle + mute button in the panel header
 *   - pause / resume / exit run
 *
 * Usage: node scripts/sim-features.mjs
 */
import {
  applyLocale,
  createEnv,
  createHookStore,
  createReactStub,
  createStorage,
  findElements,
  loadClient,
  textOf
} from './harness.mjs';

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok: !!ok, detail });
}

// ---------------------------------------------------------------------------
// Fake WebAudio: enough surface for sfxPlay(), counts oscillators.
// ---------------------------------------------------------------------------
function fakeNode() {
  return {
    type: '',
    connect(target) { return target; },
    gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} },
    frequency: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} },
    start() {},
    stop() {}
  };
}

class FakeAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.sampleRate = 44100;
    this.destination = fakeNode();
    this.oscCount = 0;
    FakeAudioContext.last = this;
  }
  resume() {}
  createGain() { return fakeNode(); }
  createOscillator() { this.oscCount++; return fakeNode(); }
  createBufferSource() { return fakeNode(); }
  createBiquadFilter() { return fakeNode(); }
  createBuffer(_channels, frames) { return { getChannelData: () => new Float32Array(frames) }; }
}

const storage = createStorage();
const hookStore = createHookStore();
const env = createEnv();
env.windowStub.localStorage = storage;
env.windowStub.AudioContext = FakeAudioContext;

const React = createReactStub(hookStore);
const mod = loadClient(env, React);
applyLocale(mod, 'zh');

const {
  mountGame, ShooterPanel, sfxPlay, setMuted, readBest, writeBest, comboMultiplier, comboWindow,
  UPGRADES, defaultMods, applyUpgrade, upgradeWeight, SPEEDS, LEVELS, AI_LEVELS, speedLabel,
  readSpeed, writeSpeed, readLevel, writeLevel
} = mod.__test;

// ---------------------------------------------------------------------------
// 1) fixed timestep: 120Hz rAF must advance roughly the same game time as 60Hz
// ---------------------------------------------------------------------------
{
  const game = mountGame(env.canvas, () => {});
  game.resize();
  game.startLoop();
  game.start();
  env.step(240, 1000 / 120); // 240 frames ≈ 2s of wall clock at 120Hz
  const at120 = game.debugState().time;
  game.destroy();

  const env2 = createEnv();
  env2.windowStub.localStorage = storage;
  env2.windowStub.AudioContext = FakeAudioContext;
  const game2 = mountGame(env2.canvas, () => {});
  game2.resize();
  game2.startLoop();
  game2.start();
  env2.step(120, 1000 / 60); // 120 frames ≈ 2s of wall clock at 60Hz
  const at60 = game2.debugState().time;
  game2.destroy();
  // createEnv() swaps the global window stub; put the shared one back so the
  // later blocks keep driving this env's rAF queue.
  globalThis.window = env.windowStub;

  check('120Hz 下 2 秒只推进约 120 步（不是 240 步）', at120 > 100 && at120 < 140, 'time=' + at120);
  check('60Hz 与 120Hz 推进的游戏时间接近', Math.abs(at120 - at60) <= 3, at60 + ' vs ' + at120);
}

// ---------------------------------------------------------------------------
// 2) kill-streak multiplier: ×1 for one or two quick kills, ×2 at three,
//    ×3 at six; bad input falls back to ×1 and the window is three seconds
// ---------------------------------------------------------------------------
{
  const curve = [1, 2, 3, 4, 5, 6, 7, 12].map((n) => comboMultiplier(n));
  check('连杀 1-2 杀是 ×1', comboMultiplier(1) === 1 && comboMultiplier(2) === 1);
  check('连杀 3 杀变 ×2', comboMultiplier(3) === 2 && comboMultiplier(5) === 2);
  check('连杀 6 杀变 ×3', comboMultiplier(6) === 3 && comboMultiplier(9) === 3);
  check('非法连杀数回退 ×1', comboMultiplier(0) === 1 && comboMultiplier(-3) === 1 && comboMultiplier(NaN) === 1);
  check('连杀窗口是 3 秒（180 帧）', comboWindow === 180, 'window=' + comboWindow);
  check('倍率曲线单调不降', curve.every((value, index) => index === 0 || value >= curve[index - 1]));
}

// ---------------------------------------------------------------------------
// 3) best score persistence
// ---------------------------------------------------------------------------
{
  check('初始没有存档 → 最高分 0', readBest() === 0);
  writeBest(777);
  check('写入最高分 777', readBest() === 777);
  check('存档键名写入 localStorage', storage.getItem('dsh-shooter:best') === '777');
  writeBest(50);
  check('低分不会覆盖高分', readBest() === 777);

  const game = mountGame(env.canvas, () => {});
  check('新开一局沿用存档最高分', game.debugState().best === 777, String(game.debugState().best));
  game.destroy();
}

// ---------------------------------------------------------------------------
// 4) sound effects
// ---------------------------------------------------------------------------
{
  setMuted(false);
  sfxPlay('shoot');
  const first = FakeAudioContext.last.oscCount;
  check('开火合成一个振荡器', first === 1, 'osc=' + first);
  sfxPlay('shoot');
  check('连射节流：55ms 内第二次开火不叠加', FakeAudioContext.last.oscCount === first, 'osc=' + FakeAudioContext.last.oscCount);

  sfxPlay('wave');
  check('波次音效是三个音', FakeAudioContext.last.oscCount === first + 3, 'osc=' + FakeAudioContext.last.oscCount);

  sfxPlay('hit'); // 走 noise 分支，不该抛错
  check('命中音效（噪声分支）不抛错', true);

  setMuted(true);
  const beforeMute = FakeAudioContext.last.oscCount;
  sfxPlay('kill');
  check('静音后不再合成', FakeAudioContext.last.oscCount === beforeMute);
  check('静音状态持久化到 localStorage', storage.getItem('dsh-shooter:muted') === '1');
  setMuted(false);
  sfxPlay('dash');
  check('取消静音后恢复合成', FakeAudioContext.last.oscCount > beforeMute);
}

// ---------------------------------------------------------------------------
// 5) panel header: big screen + mute button
// ---------------------------------------------------------------------------
{
  const game = mountGame(env.canvas, () => {});
  game.resize();
  game.startLoop();
  hookStore.refs[0] = { current: env.canvas };
  hookStore.refs[1] = { current: game };
  hookStore.states[0] = { value: { phase: 'idle', score: 0, wave: 1, hp: 100, maxHp: 100, ai: false, aiState: 'cruise', best: 777 } };

  const render = () => {
    hookStore.reset();
    return ShooterPanel();
  };
  const buttonByText = (tree, text) => findElements(tree, (node) => node.type === 'button').find((node) => textOf(node).includes(text));

  const idle = render();
  check('idle 显示存档最高分', textOf(idle).includes('最高分 777'));
  check('idle 顶栏有「大屏观战」按钮', idle.props.children && textOf(idle).includes('大屏观战'));

  const expandBtn = buttonByText(idle, '大屏观战');
  check('找到大屏按钮', expandBtn !== undefined);
  expandBtn.props.onClick();
  const expandedTree = render();
  check('点大屏后面板浮到视口（position:fixed）', expandedTree.props.style.position === 'fixed');
  const collapseBtn = buttonByText(expandedTree, '退出大屏');
  check('大屏时按钮变成「退出大屏」', collapseBtn !== undefined);
  collapseBtn.props.onClick();
  const collapsedTree = render();
  check('退出大屏后面板恢复（position:relative）', collapsedTree.props.style.position === 'relative');

  const muteBtn = buttonByText(collapsedTree, '🔊');
  check('顶栏有喇叭按钮', muteBtn !== undefined);
  muteBtn.props.onClick();
  const mutedTree = render();
  check('点喇叭后按钮变成 🔇', textOf(mutedTree).includes('🔇'));
  check('点喇叭后已静音生效', storage.getItem('dsh-shooter:muted') === '1');
  buttonByText(mutedTree, '🔇').props.onClick();
  check('再点一次取消静音', storage.getItem('dsh-shooter:muted') === null);
  game.destroy();
}

// ---------------------------------------------------------------------------
// 6) pause / resume / exit run
// ---------------------------------------------------------------------------
{
  const game = mountGame(env.canvas, () => {});
  game.resize();
  game.startLoop();
  game.start();
  env.step(60);
  const timeBefore = game.debugState().time;
  check('开跑后处于 playing', game.debugState().phase === 'playing');
  game.pause();
  check('暂停后 paused=true', game.debugState().paused === true);
  env.step(240);
  check('暂停期间模拟时间冻结', game.debugState().time === timeBefore, 'time=' + game.debugState().time);
  check('暂停期间仍是 playing（不判死、不结算）', game.debugState().phase === 'playing');
  game.pause(); // 重复暂停是空操作
  check('重复暂停不改变状态', game.debugState().paused === true);
  game.resume();
  check('继续后 paused=false', game.debugState().paused === false);
  env.step(60);
  check('继续后模拟时间继续前进', game.debugState().time > timeBefore, 'time=' + game.debugState().time);
  game.pause();
  game.exitGame();
  check('暂停中退出也回到 idle', game.debugState().phase === 'idle');
  check('退出后分数归零', game.debugState().score === 0);
  check('退出后 paused=false', game.debugState().paused === false);
  check('退出后计时归零', game.debugState().time === 0);
  env.step(30);
  check('退出后循环继续跑且不报错', game.debugState().time === 0);
  game.destroy();
}

// ---------------------------------------------------------------------------
// 7) in-run upgrades: table shape, stat deltas, weighted picking
// ---------------------------------------------------------------------------
{
  check('强化表 10 条且 id 唯一', UPGRADES.length === 10 && new Set(UPGRADES.map((u) => u.id)).size === 10, 'n=' + UPGRADES.length);
  check('每条强化都有层数上限', UPGRADES.every((u) => Number.isInteger(u.max) && u.max >= 1));

  const base = defaultMods();
  check('初始数值：伤害 1 / 冷却 9 / 单发 / 不穿透', base.dmg === 1 && base.fireCD === 9 && base.shots === 1 && base.pierce === 0);

  const player = { hp: 100, maxHp: 100, speed: 4.2, dashCD: 90, maxHp: 100 };
  const mods = defaultMods();
  applyUpgrade(mods, player, 'damage');
  check('火力强化 +1 伤害并计数', mods.dmg === 2 && mods.counts.damage === 1);
  applyUpgrade(mods, player, 'rapid');
  check('快速射击缩短冷却 2 帧', mods.fireCD === 7, 'fireCD=' + mods.fireCD);
  applyUpgrade(mods, player, 'double');
  check('双管齐射多一发并散开', mods.shots === 2 && mods.spread > 0.06);
  applyUpgrade(mods, player, 'pierce');
  check('穿透弹 +1 层', mods.pierce === 1);
  applyUpgrade(mods, player, 'speed');
  check('轻装上阵 +0.5 移速', Math.abs(mods.speed - 4.7) < 1e-9 && player.speed === mods.speed);
  applyUpgrade(mods, player, 'dash');
  check('灵巧冲刺 -20 帧冷却', mods.dashCD === 70 && player.dashCD === 70, 'dashCD=' + mods.dashCD);
  applyUpgrade(mods, player, 'combo');
  check('连杀延长 +30 帧', mods.comboBonus === 30);
  applyUpgrade(mods, player, 'magnet');
  check('磁力血包 +70 半径', mods.magnet === 70);
  applyUpgrade(mods, player, 'shield');
  check('鱼鳞护盾 +1 层并充满', mods.shieldMax === 1 && mods.shieldCharges === 1);
  applyUpgrade(mods, player, 'vitality');
  check('体质强化 +20 生命上限', player.maxHp === 120, 'maxHp=' + player.maxHp);

  const weights = UPGRADES.map((u) => upgradeWeight(u.id, 'normal', 1, 1));
  check('每条强化权重都是正数', weights.every((w) => typeof w === 'number' && isFinite(w) && w > 0));
  check('低血量时保命强化权重更高', upgradeWeight('vitality', 'normal', 0.2, 1) > upgradeWeight('damage', 'normal', 0.2, 1));

  check('速度标签 0.25× / 0.5× / 1× / 2×',
    speedLabel(0.25) === '0.25×' && speedLabel(0.5) === '0.5×' && speedLabel(1) === '1×' && speedLabel(2) === '2×');
  check('速度档位表是 [0.25, 0.5, 1, 2]', SPEEDS.join(',') === '0.25,0.5,1,2');
  check('AI 档位表是 菜鸟/正常/宗师', LEVELS.join(',') === 'rookie,normal,master' && AI_LEVELS.master.dodge > AI_LEVELS.rookie.dodge);
  const speedDefault = readSpeed();
  writeSpeed(2);
  check('速度默认 1× 且写存档', speedDefault === 1 && storage.getItem('dsh-shooter:speed') === '2' && readSpeed() === 2, 'default=' + speedDefault);
  const levelDefault = readLevel();
  writeLevel('master');
  check('档位默认 normal 且写存档', levelDefault === 'normal' && storage.getItem('dsh-shooter:level') === 'master' && readLevel() === 'master', 'default=' + levelDefault);
}

// ---------------------------------------------------------------------------
// 8) playback speed actually scales the simulation
// ---------------------------------------------------------------------------
{
  const game = mountGame(env.canvas, () => {});
  game.resize();
  game.startLoop();
  game.setSpeed(1);
  game.start();
  env.step(60, 1000 / 60);
  const at1 = game.debugState().time;
  game.exitGame();
  game.setSpeed(2);
  game.start();
  env.step(60, 1000 / 60);
  const at2 = game.debugState().time;
  game.exitGame();
  game.setSpeed(0.5);
  game.start();
  env.step(60, 1000 / 60);
  const atHalf = game.debugState().time;
  game.exitGame();
  game.setSpeed(0.25);
  game.start();
  env.step(60, 1000 / 60);
  const atQuarter = game.debugState().time;
  game.destroy();
  check('1× 速度 1 秒推进约 60 步', at1 > 55 && at1 < 65, 'time=' + at1);
  check('2× 速度 1 秒推进约 120 步', at2 > 112 && at2 < 128, 'time=' + at2);
  check('0.5× 速度 1 秒推进约 30 步', atHalf > 26 && atHalf < 34, 'time=' + atHalf);
  check('0.25× 速度 1 秒推进约 15 步', atQuarter > 12 && atQuarter < 18, 'time=' + atQuarter);
}

// ---------------------------------------------------------------------------
// 9) petting the fish while the pet pilots the game
// ---------------------------------------------------------------------------
{
  globalThis.window = env.windowStub;
  const game = mountGame(env.canvas, () => {});
  game.resize();
  game.startLoop();
  game.setSpeed(1);
  game.setAI(true);
  game.start();
  env.step(2);
  // 玩家出生在画布中心
  const hit = { clientX: 480, clientY: 300, button: 0 };
  game.pointerDown(hit);
  const afterOne = game.debugState().pet;
  check('托管时点中鱼身算摸鱼', afterOne.count === 1, JSON.stringify(afterOne));
  game.pointerDown({ clientX: 4, clientY: 4, button: 0 });
  check('点空地不算摸鱼', game.debugState().pet.count === 1);
  game.pointerDown(hit);
  game.pointerDown(hit);
  const afterThree = game.debugState().pet;
  check('连摸三下触发加油 buff', afterThree.count === 3 && afterThree.buff === true, JSON.stringify(afterThree));
  env.step(120);
  check('加油 buff 会持续（120 帧后仍在）', game.debugState().pet.buff === true);
  env.step(240);
  check('加油 buff 约 5 秒后结束', game.debugState().pet.buff === false, JSON.stringify(game.debugState()));
  game.pause();
  const pausedCount = game.debugState().pet.count;
  game.pointerDown(hit);
  check('暂停时点鱼不计数', game.debugState().pet.count === pausedCount);
  game.exitGame();
  game.setAI(false);
  game.start();
  env.step(1);
  game.pointerDown(hit);
  check('手动模式点鱼身不算摸鱼', game.debugState().pet.count === 0);
  game.destroy();
  globalThis.window = env.windowStub;
}

// ---------------------------------------------------------------------------
// 10) background float support: HUD sink can be swapped, and the plugin asks
//     for the layout service so the floating window can come back to the panel
// ---------------------------------------------------------------------------
{
  check('插件声明 layout 服务（浮窗「回到面板」要用）', Array.isArray(mod.inject) && mod.inject.includes('layout'),
    String(mod.inject));
  const seen = [];
  const game = mountGame(env.canvas, (next) => seen.push(next));
  game.resize();
  game.startLoop();
  game.start();
  env.step(2);
  const beforeSwap = seen.length;
  check('在面板里 HUD 写给 React', beforeSwap > 0, 'hud=' + beforeSwap);
  const floated = [];
  game.setHudSink((next) => floated.push(next));
  game.syncHud(true);
  check('浮窗可以换 HUD 去处（不再写 React）', floated.length === 1 && seen.length === beforeSwap,
    'float=' + floated.length + ' react=' + seen.length);
  check('浮窗 HUD 带了渲染需要的字段',
    typeof floated[0].score === 'number' && typeof floated[0].wave === 'number' && typeof floated[0].hp === 'number',
    JSON.stringify(floated[0] && { score: floated[0].score, wave: floated[0].wave, hp: floated[0].hp }));
  check('引擎句柄暴露画布，收回面板时能搬回去', game.canvas === env.canvas);
  // 桌面挂件里点小鱼走的 pet()：不需要鼠标坐标，对局中直接摸
  check('引擎暴露挂件用的 pet()', typeof game.pet === 'function');
  const petBefore = game.debugState().pet.count;
  const petOk = game.pet();
  check('pet() 能直接摸一下鱼', petOk === true && game.debugState().pet.count === petBefore + 1,
    JSON.stringify(game.debugState().pet));
  game.pause();
  check('暂停时 pet() 返回 false', game.pet() === false && game.debugState().pet.count === petBefore + 1);
  game.resume();
  check('继续后 pet() 又能摸', game.pet() === true && game.debugState().pet.count === petBefore + 2);
  game.setHudSink((next) => seen.push(next));
  game.syncHud(true);
  check('收回面板后 HUD 又写回 React', seen.length === beforeSwap + 1);
  game.destroy();
}

// ---------------------------------------------------------------------------
// 11) quiet desk mode: silence sfx (commentary keeps talking), and the daily
//     pet stats record how much you petted / watched
// ---------------------------------------------------------------------------
{
  const { setSfxSilence, readPetStats } = mod.__test;
  const game = mountGame(env.canvas, () => {});
  game.resize();
  game.startLoop();
  game.start();
  env.step(3);
  check('引擎暴露 setRender / setSfxSilence',
    typeof game.setRender === 'function' && typeof game.setSfxSilence === 'function');

  setSfxSilence(true);
  const quietBefore = FakeAudioContext.last !== null ? FakeAudioContext.last.oscCount : 0;
  mod.__test.sfxPlay('over');
  check('安静摸鱼模式不合成音效', FakeAudioContext.last.oscCount === quietBefore,
    'osc=' + FakeAudioContext.last.oscCount);
  setSfxSilence(false);
  mod.__test.sfxPlay('over');
  check('展开挂件后音效恢复', FakeAudioContext.last.oscCount > quietBefore);

  const seen = [];
  game.setHudSink((next) => seen.push(next));
  game.syncHud(true);
  check('HUD payload 带挂件表情字段',
    typeof seen[0].boss === 'boolean' && typeof seen[0].newRecord === 'boolean');

  const statsBefore = readPetStats().todayPets;
  game.setAI(true);
  game.start();
  env.step(1);
  game.pet();
  game.pet();
  game.pet();
  game.debugDamage(9999);
  const statsAfter = readPetStats();
  check('摸鱼次数记进今日统计', statsAfter.todayPets >= statsBefore + 3,
    'before=' + statsBefore + ' after=' + statsAfter.todayPets);
  game.destroy();
  globalThis.window = env.windowStub;
}

// ---------------------------------------------------------------------------
// 12) desk widget: the idle fish is the real sprite rendered on a small canvas,
//     and the widget remembers its size tier (small / medium / large)
// ---------------------------------------------------------------------------
{
  globalThis.window = env.windowStub;
  const { readDesk, FISH_SIZES, deskFishSize } = mod.__test;
  const game = mountGame(env.canvas, () => {});
  game.resize();
  game.startLoop();
  game.start();
  env.step(2);
  check('引擎暴露待机小鱼缩略渲染 drawPetThumb', typeof game.drawPetThumb === 'function');
  const thumb = { width: 0, height: 0, getContext: () => env.ctx };
  let thumbOk = true;
  try {
    game.drawPetThumb(thumb, null);
    game.drawPetThumb(thumb, 'sleep');
    game.drawPetThumb(thumb, 'dizzy');
    game.drawPetThumb(thumb, 'buff');
    game.drawPetThumb(null, 'sleep'); // 没有画布也不该抛错
  } catch (err) {
    thumbOk = false;
  }
  check('缩略小鱼画在 96×96×DPR 的独立画布上', thumbOk && thumb.width === 96 && thumb.height === 96,
    thumb.width + 'x' + thumb.height);
  check('小鱼三档尺寸是 64 / 96 / 128',
    FISH_SIZES.sm === 64 && FISH_SIZES.md === 96 && FISH_SIZES.lg === 128, JSON.stringify(FISH_SIZES));
  check('挂件默认中号', readDesk().size === 'md', JSON.stringify(readDesk()));
  env.windowStub.localStorage.setItem('dsh-shooter:desk',
    JSON.stringify({ right: 40, bottom: 60, mode: 'fish', size: 'lg' }));
  const big = readDesk();
  check('挂件记住上次的大小和位置',
    big.size === 'lg' && big.right === 40 && big.bottom === 60 && deskFishSize(big) === 128, JSON.stringify(big));
  env.windowStub.localStorage.setItem('dsh-shooter:desk',
    JSON.stringify({ right: 40, bottom: 60, mode: 'fish', size: 'huge' }));
  check('非法尺寸回退中号', readDesk().size === 'md');
  game.destroy();
}

// ---------------------------------------------------------------------------
// 13) calm mode: low-stimulation profile (soft sound, gentle lines, no numbers),
//     plus the petting poses (head pat / belly) and the ambient toggle
// ---------------------------------------------------------------------------
{
  globalThis.window = env.windowStub;
  const { readCalm, setCalmMode, readAmbient } = mod.__test;
  check('安静摸鱼默认关闭', readCalm() === false, String(readCalm()));
  setCalmMode(true);
  check('打开安静摸鱼并写进存档',
    readCalm() === true && env.windowStub.localStorage.getItem('dsh-shooter:calm') === '1');
  check('打开安静摸鱼会启用默认水声', readAmbient() === true);

  const game = mountGame(env.canvas, () => {});
  game.resize();
  game.startLoop();
  game.start();
  env.step(2);
  const seen = [];
  game.setHudSink((next) => seen.push(next));
  game.syncHud(true);
  check('HUD payload 带 calm / ambient 标记', seen[0].calm === true && seen[0].ambient === true,
    JSON.stringify({ calm: seen[0].calm, ambient: seen[0].ambient }));

  // 安静下来顺手放慢：还是 1× 时切到 0.5×
  game.setSpeed(1);
  game.setCalm(true);
  check('打开安静摸鱼会把 1× 自动放慢到 0.5×', game.debugState().speed === 0.5,
    'speed=' + game.debugState().speed);
  game.setSpeed(1); // 后面用 1× 推进，表情计时才有参照

  game.petHead();
  check('摸头顶让鱼眯眼开心', game.debugState().pet.happy === true, JSON.stringify(game.debugState().pet));
  env.step(120);
  check('开心表情会自己收回去', game.debugState().pet.happy === false);

  const thumb = { width: 0, height: 0, getContext: () => env.ctx };
  let poseOk = true;
  try {
    game.drawPetThumb(thumb, 'belly', 0.5);
    game.drawPetThumb(thumb, 'happy', -2);
  } catch (err) {
    poseOk = false;
  }
  check('露肚皮 / 开心的缩略画面不抛错', poseOk);

  check('安静摸鱼/水声可以从引擎句柄切换',
    typeof game.setCalm === 'function' && typeof game.setAmbient === 'function');
  check('关闭安静摸鱼清掉存档', game.setCalm(false) === false &&
    env.windowStub.localStorage.getItem('dsh-shooter:calm') === null);
  check('关闭水声写入偏好', game.setAmbient(false) === false &&
    env.windowStub.localStorage.getItem('dsh-shooter:ambient') === '0');
  game.destroy();
}

// ---------------------------------------------------------------------------
let failed = false;
for (const r of results) {
  if (!r.ok) failed = true;
  console.log((r.ok ? 'PASS  ' : 'FAIL  ') + r.name + (r.ok || r.detail === undefined ? '' : '  [' + r.detail + ']'));
}
console.log(failed ? 'RESULT: FAIL' : 'RESULT: PASS');
process.exit(failed ? 1 : 0);

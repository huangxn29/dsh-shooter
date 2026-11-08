/*
 * UI smoke test: renders the real ShooterPanel() render function with a hook
 * stub, then drives the buttons the way a viewer would.
 *
 * Usage: node scripts/sim-ui.mjs
 */
import {
  applyLocale,
  createEnv,
  createHookStore,
  createReactStub,
  findElements,
  loadClient,
  textOf
} from './harness.mjs';

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok: !!ok, detail });
}

const hookStore = createHookStore();
const env = createEnv();
const React = createReactStub(hookStore);
const mod = loadClient(env, React);
applyLocale(mod, 'zh');

const { mountGame, ShooterPanel } = mod.__test;

// The component's effect would create the game; do the same by hand and wire
// the HUD setter to the same hook slot the component reads.
let hud = {
  phase: 'idle', score: 0, wave: 1, hp: 100, maxHp: 100, ai: false, aiState: 'cruise',
  paused: false, speed: 1, level: 'normal', shield: 0, shieldMax: 0, upgrades: [], pick: null
};
hookStore.states[0] = { value: hud };
const game = mountGame(env.canvas, (next) => {
  hud = next;
  hookStore.states[0] = { value: next };
});
game.resize();
// The component's effect also calls startLoop(); mirror it so the fake rAF
// queue has a frame callback to drive.
game.startLoop();
hookStore.refs[0] = { current: env.canvas };
hookStore.refs[1] = { current: game };

function render() {
  hookStore.reset();
  return ShooterPanel();
}

const buttons = (tree) => findElements(tree, (node) => node.type === 'button');
const buttonByText = (tree, text) => buttons(tree).find((node) => textOf(node).includes(text));

// ---- idle view ----
const idle = render();
const idleText = textOf(idle);
check('idle 显示「让大肥鱼玩（观战）」主按钮', idleText.includes('让大肥鱼玩（观战）'), idleText.label);
check('idle 显示「自己玩」次按钮', idleText.includes('自己玩'));
check('idle 显示观战提示', idleText.includes('你只管看'));
check('idle 顶栏有「让大肥鱼接管」', idleText.includes('让大肥鱼接管'));
check('idle 有画布', findElements(idle, (n) => n.type === 'canvas').length === 1);
check('idle 有观战设置行（速度 + AI 档位）',
  idleText.includes('播放速度') && idleText.includes('AI 档位') && idleText.includes('1×') && idleText.includes('正常'),
  idleText.slice(0, 80));

// ---- 主页信息层级（重做后的开始界面）----
check('主页有玩法定位小字', idleText.includes('俯视角'));
check('主 CTA 带副说明', idleText.includes('AI 托管'));
check('观战设置卡里有安静摸鱼', idleText.includes('安静摸鱼'));
check('战绩卡显示最高分/局数/成就',
  idleText.includes('最高分') && idleText.includes('局数') && idleText.includes('成就'));
check('档案有三个分区标签', ['本机排行榜', '成就', '皮肤'].every((label) => buttonByText(idle, label) !== undefined));
const lbTab = buttonByText(idle, '本机排行榜');
check('默认选中排行榜分区', lbTab !== undefined && lbTab.props['aria-selected'] === true);
// 点「成就」分区：内容区换成成就列表
buttonByText(idle, '成就').props.onClick();
hookStore.reset();
const achTree = render();
check('点成就分区后显示成就列表',
  textOf(achTree).includes('初血') || textOf(achTree).includes('五连乱杀'), textOf(achTree).slice(0, 120));
// 点「皮肤」分区：内容区换成皮肤按钮
buttonByText(achTree, '皮肤').props.onClick();
hookStore.reset();
const skinsTree = render();
check('点皮肤分区后显示皮肤', textOf(skinsTree).includes('蓝胖鱼'));
// 提示折叠：默认收起，点开后出现操作说明
const helpBtn = buttonByText(skinsTree, '操作与提示');
check('有提示折叠按钮', helpBtn !== undefined);
helpBtn.props.onClick();
hookStore.reset();
const helpTree = render();
check('展开后显示操作说明', textOf(helpTree).includes('WASD 移动'));
// 悬停反馈：按钮自己改内联样式（没有 CSS 类也要有手感）
const cta = buttonByText(helpTree, '让大肥鱼玩');
const fakeEl = { style: {} };
cta.props.onMouseEnter({ currentTarget: fakeEl });
check('按钮悬停有位移反馈', fakeEl.style.transform === 'translateY(-1px)', fakeEl.style.transform);
// 回到排行榜分区，别影响后面的渲染
buttonByText(helpTree, '本机排行榜').props.onClick();
hookStore.reset();
render();

// ---- 点「让大肥鱼玩（观战）」 ----
const watch = buttonByText(idle, '让大肥鱼玩');
check('找到观战按钮', watch !== undefined);
watch.props.onClick();
check('观战后 hud.ai=true', hud.ai === true);
check('观战后 phase=playing', hud.phase === 'playing');

// 跑 1 秒，确认动画循环 + HUD 回调正常
env.step(60);
check('观战 60 帧后仍在 playing', hud.phase === 'playing');
check('观战 60 帧后 HUD 数值有效', Number.isFinite(hud.score) && hud.wave >= 1);

// ---- 摸摸大肥鱼：托管时点鱼身 ----
const liveTree = render();
const canvas = findElements(liveTree, (n) => n.type === 'canvas')[0];
check('托管时画布光标是手型（提示能摸鱼）', canvas !== undefined && canvas.props.style.cursor === 'pointer',
  canvas === undefined ? 'no canvas' : String(canvas.props.style.cursor));
{
  const at = game.debugState().player;
  const point = { clientX: at.x, clientY: at.y, button: 0 };
  canvas.props.onPointerDown(point);
  canvas.props.onPointerDown(point);
  canvas.props.onPointerDown(point);
  check('点鱼身三次后 HUD 记录摸鱼次数', hud.pets === 3, 'pets=' + hud.pets);
  check('连摸三下 HUD 显示加油中', textOf(render()).includes('加油中！'));
  check('加油 buff 在引擎里生效', game.debugState().pet.buff === true);
}

// ---- 连杀倍率：等大肥鱼连着杀几个，HUD 得分旁边应该出现 ×2/×3 徽章 ----
let maxCombo = typeof hud.combo === 'number' ? hud.combo : 1;
for (let i = 0; i < 4000 && maxCombo <= 1; i++) {
  env.step(1);
  if (typeof hud.combo === 'number' && hud.combo > maxCombo) maxCombo = hud.combo;
}
check('观战能打出连杀倍率', maxCombo >= 2, 'maxCombo=' + maxCombo);
let badgeTries = 0;
while (badgeTries < 4000 && !(hud.phase === 'playing' && hud.combo > 1)) {
  env.step(1);
  badgeTries++;
}
if (hud.phase === 'playing' && hud.combo > 1) {
  check('HUD 得分旁显示连杀徽章', textOf(render()).includes('连杀 ×' + hud.combo), 'combo=' + hud.combo);
} else {
  check('HUD 得分旁显示连杀徽章', false, '没抓到连杀进行中的画面');
}

// ---- playing 视图 ----
const playingTree = render();
const playingText = textOf(playingTree);
check('playing 顶栏显示「大肥鱼托管中」', playingText.includes('大肥鱼托管中'));
check('playing 显示得分/生命/波次 HUD', playingText.includes('得分') && playingText.includes('生命') && playingText.includes('波次'));
check('playing 不显示 idle 遮罩', !playingText.includes('自己玩'));

// ---- 关闭托管（玩家接管） ----
const pilotChip = buttonByText(playingTree, '大肥鱼托管中');
check('找到顶栏托管开关', pilotChip !== undefined);
pilotChip.props.onClick();
check('关闭托管后 hud.ai=false', hud.ai === false);
check('关闭托管后仍在 playing', hud.phase === 'playing');
const afterOff = render();
check('关闭后顶栏变成「让大肥鱼接管」', textOf(afterOff).includes('让大肥鱼接管'));

// 关闭托管后键盘输入不应抛错
game.keyDown({ key: 'd' });
env.step(30);
game.keyUp({ key: 'd' });
check('手玩按键后仍在 playing', hud.phase === 'playing');

// ---- 暂停 / 继续 / 退出 ----
// 暂停：冻结模拟，遮罩上给「继续」和「退出游戏」
const runTree = render();
const pauseBtn = buttons(runTree).find((node) => node.props.title === '暂停' || textOf(node).includes('暂停'));
check('顶栏有暂停按钮', pauseBtn !== undefined);
pauseBtn.props.onClick();
check('暂停后 hud.paused=true', hud.paused === true);
const pausedTree = render();
check('暂停遮罩显示「已暂停」', textOf(pausedTree).includes('已暂停'));
check('暂停遮罩有「继续」和「退出游戏」',
  buttonByText(pausedTree, '继续') !== undefined && buttonByText(pausedTree, '退出游戏') !== undefined);
const frozenTime = game.debugState().time;
const frozenScore = game.debugState().score;
env.step(180);
check('暂停时模拟时间不前进', game.debugState().time === frozenTime, 'time=' + game.debugState().time);
check('暂停时分数不变', game.debugState().score === frozenScore);
// 继续：从暂停处接着跑
buttonByText(pausedTree, '继续').props.onClick();
check('继续后 hud.paused=false', hud.paused === false);
env.step(30);
check('继续后模拟时间前进', game.debugState().time > frozenTime);
// 退出：回到开始界面，本局分数归零
const exitBtn = buttons(render()).find((node) => node.props.title === '退出游戏');
check('顶栏有退出按钮', exitBtn !== undefined);
exitBtn.props.onClick();
check('退出后 phase=idle', hud.phase === 'idle');
check('退出后本局分数归零', game.debugState().score === 0);
const afterExit = render();
check('退出后回到开始界面', textOf(afterExit).includes('让大肥鱼玩（观战）') && textOf(afterExit).includes('自己玩'));

// ---- 死亡遮罩（AI 托管时显示自动重开文案） ----
game.setAI(true);
env.step(1);
hookStore.states[0] = { value: { phase: 'over', score: 321, wave: 5, hp: 0, maxHp: 100, ai: true, aiState: 'cruise' } };
const overTree = render();
const overText = textOf(overTree);
check('死亡遮罩显示最终得分', overText.includes('321'));
check('死亡遮罩显示波次', overText.includes('第5 波') || overText.includes('存活到第 5 波') || overText.includes('5'));
check('托管时死亡显示「大肥鱼正在爬回来…」', overText.includes('大肥鱼正在爬回来'));
check('托管时死亡不显示「再来一局」按钮', buttonByText(overTree, '再来一局') === undefined);

// ---- 「自己玩」路径 ----
hookStore.states[0] = { value: { phase: 'idle', score: 0, wave: 1, hp: 100, maxHp: 100, ai: false, aiState: 'cruise' } };
const idle2 = render();
const playBtn = buttonByText(idle2, '自己玩');
check('找到「自己玩」按钮', playBtn !== undefined);
playBtn.props.onClick();
check('「自己玩」后 hud.ai=false', hud.ai === false);
check('「自己玩」后 phase=playing', hud.phase === 'playing');

// ---- 观战控件：播放速度 / AI 档位 点一下循环 ----
const watchTree = render();
check('playing 右下角有速度控件', buttonByText(watchTree, '1×') !== undefined);
buttonByText(watchTree, '1×').props.onClick();
check('点速度控件循环到 2×', game.debugState().speed === 2, 'speed=' + game.debugState().speed);
const levelChip = buttons(render()).find((node) => textOf(node).includes('正常'));
check('playing 有 AI 档位控件', levelChip !== undefined);
levelChip.props.onClick();
check('点档位控件循环到宗师', game.debugState().level === 'master', 'level=' + game.debugState().level);
game.setSpeed(1);

// ---- 三选一：托管清掉第 1 波后弹卡，点第一张即选中 ----
game.exitGame();
game.setAI(true);
game.start();
let pickTries = 0;
while (pickTries < 8000 && !(hud.phase === 'playing' && hud.pick != null)) {
  env.step(1);
  pickTries++;
}
check('清波后弹出三选一', hud.phase === 'playing' && hud.pick != null, 'tries=' + pickTries);
if (hud.pick != null) {
  const pickTree = render();
  const pickText = textOf(pickTree);
  check('三选一面板有标题和说明', pickText.includes('选一个强化') && (pickText.includes('按 1 / 2 / 3') || pickText.includes('大肥鱼正在挑')));
  const options = (hud.pick && hud.pick.options) || [];
  check('三选一给出 3 张卡', options.length === 3, 'n=' + options.length);
  // 卡片是「序号 / 名称 / 描述」三段的按钮，按序号段精确定位（避免匹配到速度芯片的 1×）
  const cardByKey = (tree, key) => buttons(tree).find((node) => {
    const kids = node.props.children;
    return Array.isArray(kids) && kids.length === 3 && textOf(kids[0]) === key;
  });
  const firstCard = cardByKey(pickTree, '1');
  check('找到第一张强化卡', firstCard !== undefined);
  const secondCard = cardByKey(pickTree, '2');
  check('找到第二张强化卡', secondCard !== undefined);
  firstCard.props.onClick();
  check('点卡后三选一面板关闭', hud.pick == null);
  const counts = game.debugState().mods.counts;
  check('点卡后强化记入本局', Object.keys(counts).length >= 1, JSON.stringify(counts));
}

// ---- 托管时大肥鱼自己挑卡 ----
game.exitGame();
game.setAI(true);
game.start();
let autoTries = 0;
while (autoTries < 8000 && !(hud.phase === 'playing' && hud.pick != null)) {
  env.step(1);
  autoTries++;
}
check('托管时也会弹出三选一', hud.pick != null, 'tries=' + autoTries);
if (hud.pick != null) {
  const before = Object.keys(game.debugState().mods.counts).length;
  env.step(60);
  const after = Object.keys(game.debugState().mods.counts).length;
  check('托管 40 帧后自动选卡', hud.pick == null && after >= before, 'before=' + before + ' after=' + after);
}

// ---- 摸鱼小窗：缩成角落小窗，再展开回来 ----
game.exitGame();
const miniIdle = render();
const miniBtn = buttons(miniIdle).find((node) => textOf(node).includes('小窗摸鱼'));
check('顶栏有「小窗摸鱼」按钮', miniBtn !== undefined);
miniBtn.props.onClick();
const miniTree = render();
check('点小窗后面板变成 fixed 小窗',
  miniTree.props.style.position === 'fixed' && miniTree.props.style.width === '300px',
  JSON.stringify({ position: miniTree.props.style.position, width: miniTree.props.style.width }));
check('小窗打开时自动开一局观战', hud.phase === 'playing' && hud.ai === true);
const expandBtn = buttons(render()).find((node) => textOf(node).includes('展开面板'));
check('小窗里有「展开面板」按钮', expandBtn !== undefined);
expandBtn.props.onClick();
check('展开后面板回到侧栏', render().props.style.position === 'relative');
check('展开后对局不中断', hud.phase === 'playing');
game.exitGame();

// ---- 结束 ----
let failed = false;
for (const r of results) {
  if (!r.ok) failed = true;
  console.log((r.ok ? 'PASS  ' : 'FAIL  ') + r.name + (r.ok || r.detail === undefined ? '' : '  [' + r.detail + ']'));
}
console.log(failed ? 'RESULT: FAIL' : 'RESULT: PASS');
process.exit(failed ? 1 : 0);

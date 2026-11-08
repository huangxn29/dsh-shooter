/*
 * 本机排行榜 / 成就 / 皮肤的离线测试。
 *
 * 断言这些数据只写 localStorage、按分数降序、只留前 5 条，成就按战况
 * 解锁一次不重复，皮肤没解锁不能选，观战跑一局后结算信息进 HUD，以及
 * idle 界面真的把排行榜/成就/皮肤渲染出来。
 */
import {
  createEnv,
  createStorage,
  createReactStub,
  createHookStore,
  loadClient,
  applyLocale,
  findElements,
  textOf
} from './harness.mjs';

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (ok ? '' : '  <- ' + (detail === undefined ? '' : detail)));
}

function freshEnv(storage) {
  const env = createEnv();
  if (storage !== undefined) env.windowStub.localStorage = storage;
  return env;
}

function freshMod(env) {
  const hooks = createHookStore();
  const mod = loadClient(env, createReactStub(hooks));
  applyLocale(mod, 'zh');
  // 暴露 hook 存储，方便在同一个组件实例上模拟「点标签再渲染一次」
  mod.__hooks = hooks;
  return mod;
}

// ---------------------------------------------------------------- 初始状态
{
  const storage = createStorage();
  const mod = freshMod(freshEnv(storage));
  const meta = mod.__test.readMeta();
  check('初始没有排行榜记录', meta.leaderboard.length === 0);
  check('初始 8 个成就全锁', meta.achievementList.length === 8 && meta.achievementList.every((item) => !item.unlocked));
  check('初始皮肤是蓝胖鱼', meta.skin === 'blue' && meta.skins.length === 5);
  check('初始局数为 0', meta.runs === 0);
}

// ------------------------------------------------------------ 排行榜行为
{
  const storage = createStorage();
  const mod = freshMod(freshEnv(storage));
  const record = mod.__test.recordLeaderboard;
  check('0 分不进排行榜', record(0, 1) === -1);
  const first = record(1500, 7);
  check('第一局就是本机第一', first === 0, 'rank=' + first);
  const second = record(800, 4);
  check('低分排在后面', second === 1, 'rank=' + second);
  const top = record(2200, 9);
  check('高分顶到本机第一', top === 0, 'rank=' + top);
  const list = mod.__test.readLeaderboard();
  check('排行榜按分数降序', list[0].score === 2200 && list[1].score === 1500 && list[2].score === 800, JSON.stringify(list));
  check('排行榜条目带波次', list[0].wave === 9 && list[1].wave === 7);
  check('排行榜写入 localStorage', storage.getItem('dsh-shooter:leaderboard') !== null);
  for (let i = 0; i < 7; i++) record(1000 + i * 100, 3);
  const capped = mod.__test.readLeaderboard();
  check('排行榜最多保留 5 条', capped.length === 5, 'len=' + capped.length);
  check('裁剪后仍然降序', capped.every((entry, index) => index === 0 || capped[index - 1].score >= entry.score));
  check('裁剪后最高分还在', capped[0].score === 2200);
}

// --------------------------------------------------------------- 成就解锁
{
  const storage = createStorage();
  const mod = freshMod(freshEnv(storage));
  const run = { score: 1200, wave: 6, kills: 10, maxStreak: 5, ai: true, runs: 10 };
  const unlocked = mod.__test.unlockAchievements(run);
  check('一次解锁六个成就', unlocked.length === 6, unlocked.join(','));
  check('解锁的是该解锁的那些', ['firstBlood', 'wave5', 'score1000', 'streak5', 'watcher', 'veteran']
    .every((id) => unlocked.indexOf(id) >= 0) && unlocked.indexOf('wave10') < 0 && unlocked.indexOf('score2500') < 0);
  check('成就写入 localStorage', storage.getItem('dsh-shooter:achievements') !== null);
  check('重复结算不会重复解锁', mod.__test.unlockAchievements(run).length === 0);
  check('成就读回带时间戳', isFinite(mod.__test.readAchievements().firstBlood));
}

// ------------------------------------------------------------- 皮肤与配色
{
  const storage = createStorage();
  const mod = freshMod(freshEnv(storage));
  check('没解锁的皮肤选不了', mod.__test.setSkin('pink') === false && mod.__test.readMeta().skin === 'blue');
  check('非法皮肤名被拒绝', mod.__test.setSkin('rainbow') === false);
  mod.__test.unlockAchievements({ score: 0, wave: 5, kills: 0, maxStreak: 0, ai: false, runs: 1 });
  check('解锁成就后能选金鳞鱼', mod.__test.setSkin('gold') === true && mod.__test.readMeta().skin === 'gold');
  check('皮肤写入 localStorage', storage.getItem('dsh-shooter:skin') === '"gold"');

  const fills = [];
  // 只关心配色：所有绘图方法做空实现，记录每次赋给 fillStyle 的颜色
  const ctx = new Proxy({}, {
    get(target, prop) {
      if (prop === 'fillStyle') return target.fillStyle;
      return () => {};
    },
    set(target, prop, value) {
      if (prop === 'fillStyle') fills.push(value);
      target[prop] = value;
      return true;
    }
  });
  mod.__test.drawPetFish(ctx, 100, 100, 0, 0, 0);
  check('金鳞鱼用金色身体绘制', fills.indexOf('#ffd257') >= 0, fills.join('|'));
}

// --------------------------------------------------- 观战一局后的结算联动
{
  const storage = createStorage();
  const env = freshEnv(storage);
  const mod = freshMod(env);
  let hud = null;
  const game = mod.__test.mountGame(env.canvas, (next) => { hud = next; });
  game.resize();
  game.startLoop();
  game.setAI(true);
  game.start();
  // 先跑一小段攒点分数（0 分不入榜），然后确定性地把这一局打死
  env.step(600, 1000 / 60);
  let frames = 0;
  while (frames < 64 && game.debugState().phase !== 'over') {
    game.debugDamage(9999);
    env.step(1, 1000 / 60);
    frames++;
  }
  const state = game.debugState();
  check('观战能跑出一局结算', state.phase === 'over', 'frames=' + frames);
  check('结算带本机名次', state.result !== null && typeof state.result.rank === 'number', JSON.stringify(state.result));
  check('结算计入局数', mod.__test.readRuns() >= 1);
  check('结算写入排行榜', mod.__test.readLeaderboard().length >= 1);
  check('观战解锁「见习观众」', mod.__test.readAchievements().watcher !== undefined);
  check('HUD 结算信息与游戏一致', hud !== null && hud.result !== null && hud.result.rank === state.result.rank);
  check('HUD 带最高分', hud !== null && isFinite(hud.best));
}

// ------------------------------------------------------- idle 界面渲染检查
{
  const storage = createStorage();
  storage.setItem('dsh-shooter:leaderboard', JSON.stringify([{ score: 999, wave: 5, at: Date.now() }]));
  storage.setItem('dsh-shooter:achievements', JSON.stringify({ firstBlood: Date.now(), wave5: Date.now() }));
  const mod = freshMod(freshEnv(storage));
  const tree = mod.__test.ShooterPanel();
  const text = textOf(tree);
  check('idle 显示排行榜标题', text.indexOf('本机排行榜') >= 0);
  check('idle 显示榜上分数', text.indexOf('999') >= 0);
  check('idle 显示成就进度 2/8', text.indexOf('2/8') >= 0, text.slice(0, 400));
  check('idle 显示皮肤标题', text.indexOf('皮肤') >= 0);
  // 档案改成了标签页：点「皮肤」标签后再渲染一次，才看得到皮肤列表
  const skinTab = findElements(tree, (el) => el.type === 'button' && el.props && textOf(el).trim() === '皮肤')[0];
  check('idle 有可点的分区标签', skinTab !== undefined);
  if (skinTab !== undefined) skinTab.props.onClick();
  mod.__hooks.reset();
  const skinTree = mod.__test.ShooterPanel();
  const skinText = textOf(skinTree);
  check('idle 显示已解锁皮肤', skinText.indexOf('金鳞鱼') >= 0);
  check('idle 给未解锁皮肤加锁', skinText.indexOf('🔒 樱花鱼') >= 0);
  const skinButtons = findElements(skinTree, (el) => el.type === 'button' && el.props && el.props.title === '金鳞鱼');
  check('皮肤是可点击按钮', skinButtons.length === 1);
  const lockedButtons = findElements(skinTree, (el) => el.type === 'button' && el.props && typeof el.props.title === 'string' && el.props.title.indexOf('未解锁') === 0);
  check('未解锁皮肤按钮带未解锁提示', lockedButtons.length === 3, 'locked=' + lockedButtons.length);
}

// ---------------------------------------------------------------- 汇总
const failed = results.filter((item) => !item.ok);
console.log('');
console.log('RESULT: ' + (failed.length === 0 ? 'PASS' : 'FAIL') + '  (' + (results.length - failed.length) + '/' + results.length + ')');
if (failed.length > 0) {
  for (const item of failed) console.log('  FAILED: ' + item.name + (item.detail === undefined ? '' : '  ' + item.detail));
  process.exitCode = 1;
}

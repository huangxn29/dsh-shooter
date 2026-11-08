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
        'hud.wave': 'Wave',
        'game.petName': 'Da Feiyu',
        'game.watch': 'Let the pet play',
        'game.play': 'I play myself',
        'game.watchHint': 'Da Feiyu aims, strafes, dodges bullets and reloads the run by itself — just sit back and watch.',
        'game.home.kicker': 'Top-down · survival',
        'game.home.watchSub': 'Pet piloting · auto-restart · you just relax',
        'game.home.playSub': 'WASD to move · mouse to aim · hold to fire',
        'game.home.quick': 'Watch settings',
        'game.home.stats': 'Progress',
        'game.home.statBest': 'Best',
        'game.home.statRuns': 'Runs',
        'game.home.statAch': 'Achievements',
        'game.home.library': 'Local records',
        'game.home.calm': 'Calm mode',
        'game.home.on': 'On',
        'game.home.off': 'Off',
        'game.home.help': 'Controls & tips',
        'game.home.helpHide': 'Hide tips',
        'game.home.shortcut': 'Press 1 to watch · 2 to play yourself',
        'game.aiOn': 'Pet piloting',
        'game.aiOff': 'Let the pet take over',
        'game.aiResume': 'Da Feiyu is crawling back…',
        'game.state.hunt': 'hunting',
        'game.state.retreat': 'kiting',
        'game.state.dodge': 'dodging',
        'game.state.dash': 'dashing',
        'game.state.heal': 'healing',
        'game.state.cruise': 'cruising',
        'game.best': 'Best {score}',
        'game.expand': 'Big screen',
        'game.collapse': 'Exit big screen',
        'game.sfxOn': 'Sound on',
        'game.sfxOff': 'Muted',
        'game.pause': 'Pause',
        'game.paused': 'Paused',
        'game.pauseHint': 'Press Esc or "Resume" to jump back in',
        'game.resume': 'Resume',
        'game.exit': 'Exit run',
        'game.combo': 'Combo ×{n}',
        'game.bestCombo': 'Best combo ×{n}',
        'game.bossBanner': 'Wave {n} · BOSS',
        'game.bossLabel': 'BOSS',
        'game.bossDown': 'Boss down!',
        'game.pick.title': 'Choose an upgrade',
        'game.pick.hint': 'Press 1 / 2 / 3 or click a card',
        'game.pick.aiHint': 'Da Feiyu is picking…',
        'game.speed': 'Playback speed',
        'game.aiLevel': 'AI skill',
        'game.shieldBlock': 'Shield block!',
        'game.shieldBack': 'Shield recharged',
        'game.chargeBanner': 'Wave {n} · CHARGE',
        'game.petCheer': 'Yay!',
        'game.pets': 'Pets ×{n}',
        'game.petBuff': 'Cheered up!',
        'game.petHint': 'While Da Feiyu plays, tap the fish to pet it',
        'game.mini': 'Mini window',
        'game.unmini': 'Expand panel',
        'game.floatTitle': 'Da Feiyu · wave {wave} · {score} pts',
        'game.floatIdle': 'Da Feiyu is resting',
        'game.floatHud': 'Score {score} · wave {wave} · HP {hp}',
        'game.floatPaused': 'Paused — hit ▶ to resume',
        'game.floatBack': 'Back to panel',
        'game.floatStop': 'Stop',
        'game.floatCollapse': 'Shrink to fish',
        'game.floatExpand': 'Click to pet — double-click to open the window',
        'game.keepHint': 'Switch to another panel and it shrinks into a little fish in the bottom-right corner and keeps playing — click it to pet, double-click to open the window, or press "Back to panel" to return.',
        'game.report.pet': [
          'Hehe, that tickles~',
          'Keep petting, master, I am all in~',
          'Da Feiyu cheered up! Go go go!'
        ],
        'game.desk.pet': [
          'Hehe~',
          'That tickles!',
          'Slacking off together, master?',
          'Shh, I am busy shooting~'
        ],
        'game.desk.dizzy': [
          'Dizzy… too much petting!',
          'Master… let me breathe…'
        ],
        'game.desk.boss': [
          'BOSS incoming!',
          'Careful, this one is big!'
        ],
        'game.desk.dead': [
          'Oops… I went down again',
          'Getting back up soon…'
        ],
        'game.desk.record': [
          'New record!',
          'Yes! Beat my best!'
        ],
        'game.desk.idle': [
          'Still slacking off, master?',
          'I am working hard in here, you rest~',
          'Want to pet me again?'
        ],
        'game.desk.size': 'Size',
        'game.desk.size.sm': 'Small',
        'game.desk.size.md': 'Medium',
        'game.desk.size.lg': 'Large',
        'game.petStats': 'Petted {pets} times today · watched {minutes} min',
        'game.calmHint': 'Calm watch · take it easy',
        'game.calm.breathe': [
          'Breathe with me… in… out…',
          'Slowly now, in through the nose… out'
        ],
        'game.calm.wave': [
          'Wave {wave}… no rush, I have it',
          'Still going, wave {wave}~',
          'Just wave {wave}, keep resting'
        ],
        'game.calm.death': [
          'I will rest a moment, then come back',
          'Took a little break… I am okay',
          'Down for a second — I will be right back'
        ],
        'game.calm.deathBest': [
          'Best run yet — I will be right back~',
          'New best, and I am okay'
        ],
        'game.calm.boss': [
          'A big one is coming… I will take it slow',
          'Careful, big guy ahead — no rush'
        ],
        'game.calm.record': [
          'New best, quietly~',
          'A little better than last time'
        ],
        'game.calm.charge': [
          'They are coming from one side… easy now',
          'A squad ahead — I will keep my distance'
        ],
        'game.desk.calmOn': 'Calm mode: on',
        'game.desk.calmOff': 'Calm mode: off',
        'game.desk.ambientOn': 'Water sound: on',
        'game.desk.ambientOff': 'Water sound: off',
        'game.desk.feed': 'Feed it a snack',
        'game.desk.feedLine': [
          'Yum!',
          'Another one, please~',
          'Eating while shooting, impressive'
        ],
        'game.desk.break': [
          'Been sitting a while — stretch?',
          'Let your eyes rest for a moment~'
        ],
        'game.level.rookie': 'Rookie',
        'game.level.normal': 'Normal',
        'game.level.master': 'Master',
        'game.up.damage.name': 'Power up',
        'game.up.damage.desc': 'Bullet damage +1',
        'game.up.rapid.name': 'Rapid fire',
        'game.up.rapid.desc': 'Shorter fire interval',
        'game.up.double.name': 'Twin shot',
        'game.up.double.desc': 'One extra bullet per shot',
        'game.up.pierce.name': 'Piercing rounds',
        'game.up.pierce.desc': 'Bullets pierce one more enemy',
        'game.up.speed.name': 'Light feet',
        'game.up.speed.desc': 'Move speed +0.5',
        'game.up.dash.name': 'Nimble dash',
        'game.up.dash.desc': 'Dash cooldown -20 frames',
        'game.up.combo.name': 'Longer combo',
        'game.up.combo.desc': 'Combo window +0.5s',
        'game.up.magnet.name': 'Magnet pickups',
        'game.up.magnet.desc': 'Pickup radius +70',
        'game.up.shield.name': 'Scale shield',
        'game.up.shield.desc': 'Blocks one hit every 10s',
        'game.up.vitality.name': 'Vitality',
        'game.up.vitality.desc': 'Max HP +20',
        'game.report.boss': [
          'Careful, master — the elite is out, and it is big…',
          'This wave means business, the fat one charges!',
          'Elite on the field — I will dodge its bullets first!'
        ],
        'game.report.bossDown': [
          'Elite down — did you see that, master?',
          'Big one cleared, it even dropped health packs, grabbing them now!',
          'Elite flattened! On to the next wave.'
        ],
        'game.lbRow': 'wave {wave} · {date}',
        'game.listSep': ', ',
        'game.leaderboard': 'Local leaderboard',
        'game.leaderboardEmpty': 'No runs yet — finish one to claim first place',
        'game.ach': 'Achievements',
        'game.skin': 'Skins',
        'game.rank': 'Local #{n}',
        'game.newAch': 'Achievement unlocked: {names}',
        'game.skinLocked': 'Locked: {req}',
        'game.ach.firstBlood.name': 'First blood',
        'game.ach.firstBlood.desc': 'Score your first kill',
        'game.ach.wave5.name': 'Warmed up',
        'game.ach.wave5.desc': 'Reach wave 5',
        'game.ach.wave10.name': 'Wave ten',
        'game.ach.wave10.desc': 'Reach wave 10',
        'game.ach.score1000.name': 'Kilo fish',
        'game.ach.score1000.desc': 'Score 1000 in a single run',
        'game.ach.score2500.name': 'High roller',
        'game.ach.score2500.desc': 'Score 2500 in a single run',
        'game.ach.streak5.name': 'Five in a row',
        'game.ach.streak5.desc': 'Kill 5 enemies within 3 seconds',
        'game.ach.watcher.name': 'Understudy',
        'game.ach.watcher.desc': 'Watch the pet play a run',
        'game.ach.veteran.name': 'Regular',
        'game.ach.veteran.desc': 'Finish 10 runs',
        'game.skin.blue': 'Blue blobfish',
        'game.skin.gold': 'Golden fish',
        'game.skin.pink': 'Sakura fish',
        'game.skin.shark': 'Shark',
        'game.skin.ninja': 'Shadow fish',
        // 观战模式下的桌宠解说（投喂给 dsh-pet 的气泡）
        'game.report.start': [
          'All set, master — watch me go!',
          'Da Feiyu online. Going for wave fifteen!',
          'I will clear the path, keep your eyes on me!'
        ],
        'game.report.wave': [
          'Master, wave {wave} — still going strong!',
          'Wave {wave}? Send them all, I am eating well!',
          'Wave {wave} down, staying steady.',
          'Master, wave {wave} cleared already!',
          'Picking up pace — wave {wave} incoming!'
        ],
        'game.report.firstBlood': [
          'First blood, master — did you see that?',
          'Opening kill, nice and clean!',
          'Here, take one on the house!'
        ],
        'game.report.streak': [
          'Five in a row — praise me, master!',
          'See that? I am on a roll.',
          'Five kills straight, feeling good!'
        ],
        'game.report.lowHp': [
          'Ouch… running low on health, let me circle around.',
          'That stings — I am hurt, cheer for me, master!',
          'Hold on, I am not going down yet!'
        ],
        'game.report.heal': [
          'Health pack secured — back in business!',
          'Topped up, let us keep going!',
          'Health pickup, good as new!'
        ],
        'game.report.charge': [
          'Charge wave incoming, master — hold on!',
          'They are coming in a line, let me circle around!',
          'A whole row of them? Easy points, watch this!'
        ],
        'game.report.upgrade': [
          'Taking "{name}" — nice fit.',
          'Got "{name}", this run is looking good.',
          '"{name}" it is. Let us keep going!'
        ],
        'game.report.milestone': [
          '{score} points — put that on my record!',
          'Master, {score} points already, steady as a rock.',
          '{score} points! Watch me a while longer.'
        ],
        'game.report.record': [
          'Master, look! {score} points, a new record!',
          'New high score: {score}! Pretty good, right?',
          'Record broken — {score} points, this round is mine!'
        ],
        'game.report.death': [
          'Eek… swarmed on wave {wave} at {score} points. Getting back up!',
          'My mistake — took a stray shot. Wave {wave} done, {score} points.',
          'Wiped out on wave {wave} at {score} points… give me a moment!'
        ],
        'game.report.deathBest': [
          'Ugly landing, but {score} points is a new record! Wave {wave}, I will be back.',
          'New high score: {score} points — worth a short nap!'
        ],
        'game.report.revive': [
          'I am back — new round, here we go!',
          'Up and running again, let us continue!',
          'That one did not count. Round two!'
        ]
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
        'hud.wave': '波次',
        'game.petName': '大肥鱼',
        'game.watch': '让大肥鱼玩（观战）',
        'game.play': '自己玩',
        'game.watchHint': '大肥鱼会自己瞄准、拉枪线、躲子弹，倒下后自动再来一局 —— 你只管看。',
        'game.home.kicker': '俯视角 · 生存射击',
        'game.home.watchSub': 'AI 托管 · 自动续局 · 你只管摸鱼',
        'game.home.playSub': 'WASD 移动 · 鼠标瞄准 · 左键开火',
        'game.home.quick': '观战设置',
        'game.home.stats': '战绩',
        'game.home.statBest': '最高分',
        'game.home.statRuns': '局数',
        'game.home.statAch': '成就',
        'game.home.library': '本机档案',
        'game.home.calm': '安静摸鱼',
        'game.home.on': '开',
        'game.home.off': '关',
        'game.home.help': '操作与提示',
        'game.home.helpHide': '收起提示',
        'game.home.shortcut': '按 1 观战 · 按 2 自己玩',
        'game.aiOn': '大肥鱼托管中',
        'game.aiOff': '让大肥鱼接管',
        'game.aiResume': '大肥鱼正在爬回来…',
        'game.state.hunt': '追猎',
        'game.state.retreat': '拉枪线',
        'game.state.dodge': '躲弹',
        'game.state.dash': '冲刺',
        'game.state.heal': '吃血',
        'game.state.cruise': '游弋',
        'game.best': '最高分 {score}',
        'game.expand': '大屏观战',
        'game.collapse': '退出大屏',
        'game.sfxOn': '声音开',
        'game.sfxOff': '已静音',
        'game.pause': '暂停',
        'game.paused': '已暂停',
        'game.pauseHint': '按 Esc 或「继续」回到战斗',
        'game.resume': '继续',
        'game.exit': '退出游戏',
        'game.combo': '连杀 ×{n}',
        'game.bestCombo': '本局最高连杀 ×{n}',
        'game.bossBanner': '第 {n} 波 · BOSS 来袭',
        'game.bossLabel': '精英',
        'game.bossDown': '精英倒下！',
        'game.pick.title': '选一个强化',
        'game.pick.hint': '按 1 / 2 / 3 或点卡片，选完继续',
        'game.pick.aiHint': '大肥鱼正在挑…',
        'game.speed': '播放速度',
        'game.aiLevel': 'AI 档位',
        'game.shieldBlock': '护盾挡下！',
        'game.shieldBack': '护盾充能完毕',
        'game.chargeBanner': '第 {n} 波 · 冲锋波！',
        'game.petCheer': '加油！',
        'game.pets': '摸鱼 ×{n}',
        'game.petBuff': '加油中！',
        'game.petHint': '托管时点一点鱼身，可以摸摸它',
        'game.mini': '小窗摸鱼',
        'game.unmini': '展开面板',
        'game.floatTitle': '大肥鱼 · 第 {wave} 波 · {score} 分',
        'game.floatIdle': '大肥鱼在打盹',
        'game.floatHud': '得分 {score} · 第 {wave} 波 · 生命 {hp}',
        'game.floatPaused': '已暂停 — 点 ▶ 继续',
        'game.floatBack': '回到面板',
        'game.floatStop': '收工',
        'game.floatCollapse': '收成小鱼',
        'game.floatExpand': '点一下摸摸，双击展开画面',
        'game.keepHint': '切到别的面板，它会缩成右下角的一条小鱼继续打——点一下能摸摸它，双击展开画面，点「回到面板」就回来。',
        'game.report.pet': [
          '嘿嘿，有点痒～',
          '主人再摸摸，我这就给你打穿它！',
          '大肥鱼开心了，冲呀！'
        ],
        'game.desk.pet': [
          '嘿嘿～',
          '好痒！',
          '主人也在摸鱼吗？',
          '嘘，我在打枪呢～'
        ],
        'game.desk.dizzy': [
          '晕啦晕啦…摸太多了！',
          '主人…让我缓缓…'
        ],
        'game.desk.boss': [
          'BOSS 来了！',
          '小心，这家伙好大只！'
        ],
        'game.desk.dead': [
          '呜…又躺了',
          '马上爬起来…'
        ],
        'game.desk.record': [
          '破纪录啦！',
          '好耶！超过上次了！'
        ],
        'game.desk.idle': [
          '主人今天也在摸鱼吗？',
          '我在里面努力打，你歇着就好～',
          '要不要再摸摸我？'
        ],
        'game.desk.size': '大小',
        'game.desk.size.sm': '小',
        'game.desk.size.md': '中',
        'game.desk.size.lg': '大',
        'game.petStats': '今日摸鱼 {pets} 下 · 观战 {minutes} 分钟',
        'game.calmHint': '安静摸鱼中 · 慢慢看',
        'game.calm.breathe': [
          '跟着我，吸气……呼气……',
          '慢慢来，吸满，再轻轻呼出去'
        ],
        'game.calm.wave': [
          '第 {wave} 波了，不急，我盯着呢',
          '还在打哦，第 {wave} 波～',
          '第 {wave} 波，你歇你的'
        ],
        'game.calm.death': [
          '我歇一下下，马上回来',
          '呜…躺一小会儿，没事的',
          '先倒下歇口气，很快回来'
        ],
        'game.calm.deathBest': [
          '这次是最好的一局，我马上回来～',
          '悄悄破纪录了，我没事'
        ],
        'game.calm.boss': [
          '来了个大家伙…我慢慢来',
          '小心大块头，不急'
        ],
        'game.calm.record': [
          '悄悄破纪录啦～',
          '比上次好一点点'
        ],
        'game.calm.charge': [
          '那边一起冲过来了…我拉开点距离',
          '有一队人，我稳着打'
        ],
        'game.desk.calmOn': '安静摸鱼：开',
        'game.desk.calmOff': '安静摸鱼：关',
        'game.desk.ambientOn': '水声：开',
        'game.desk.ambientOff': '水声：关',
        'game.desk.feed': '喂它一条小鱼干',
        'game.desk.feedLine': [
          '好吃！',
          '再来一条嘛～',
          '一边打一边吃，可还行'
        ],
        'game.desk.break': [
          '坐久啦，起来伸个懒腰？',
          '眼睛也歇一会儿吧～'
        ],
        'game.level.rookie': '菜鸟',
        'game.level.normal': '正常',
        'game.level.master': '宗师',
        'game.up.damage.name': '火力强化',
        'game.up.damage.desc': '子弹伤害 +1',
        'game.up.rapid.name': '快速射击',
        'game.up.rapid.desc': '开火间隔 -2 帧',
        'game.up.double.name': '双管齐射',
        'game.up.double.desc': '每次多打一发子弹',
        'game.up.pierce.name': '穿透弹',
        'game.up.pierce.desc': '子弹多穿一个敌人',
        'game.up.speed.name': '轻装上阵',
        'game.up.speed.desc': '移动速度 +0.5',
        'game.up.dash.name': '灵巧冲刺',
        'game.up.dash.desc': '冲刺冷却 -20 帧',
        'game.up.combo.name': '连杀延长',
        'game.up.combo.desc': '连杀窗口 +0.5 秒',
        'game.up.magnet.name': '磁力血包',
        'game.up.magnet.desc': '血包拾取范围 +70',
        'game.up.shield.name': '鱼鳞护盾',
        'game.up.shield.desc': '每 10 秒挡一次伤害',
        'game.up.vitality.name': '体质强化',
        'game.up.vitality.desc': '生命上限 +20',
        'game.report.boss': [
          '主人小心，精英出来了，个头有点大……',
          '这波来硬的，那只胖家伙会冲锋！',
          '精英登场了，我先把它的子弹躲开～'
        ],
        'game.report.bossDown': [
          '精英倒下啦，主人看到那一下没有！',
          '大的搞定，还掉血包了，我这就去捡～',
          '精英被打趴了！下一波继续。'
        ],
        'game.lbRow': '第 {wave} 波 · {date}',
        'game.listSep': '、',
        'game.leaderboard': '本机排行榜',
        'game.leaderboardEmpty': '还没有记录，打一局就是第一名',
        'game.ach': '成就',
        'game.skin': '皮肤',
        'game.rank': '本机第 {n} 名',
        'game.newAch': '新成就：{names}',
        'game.skinLocked': '未解锁：{req}',
        'game.ach.firstBlood.name': '初血',
        'game.ach.firstBlood.desc': '拿到第一个击杀',
        'game.ach.wave5.name': '初露锋芒',
        'game.ach.wave5.desc': '打到第 5 波',
        'game.ach.wave10.name': '十波不倒',
        'game.ach.wave10.desc': '打到第 10 波',
        'game.ach.score1000.name': '千分鱼',
        'game.ach.score1000.desc': '单局拿到 1000 分',
        'game.ach.score2500.name': '两千五',
        'game.ach.score2500.desc': '单局拿到 2500 分',
        'game.ach.streak5.name': '五连乱杀',
        'game.ach.streak5.desc': '3 秒内连杀 5 个敌人',
        'game.ach.watcher.name': '见习观众',
        'game.ach.watcher.desc': '看大肥鱼打一局',
        'game.ach.veteran.name': '老观众',
        'game.ach.veteran.desc': '累计打完 10 局',
        'game.skin.blue': '蓝胖鱼',
        'game.skin.gold': '金鳞鱼',
        'game.skin.pink': '樱花鱼',
        'game.skin.shark': '鲨鱼酱',
        'game.skin.ninja': '暗影鱼',
        'game.report.start': [
          '主人坐好，看我的！',
          '大肥鱼上场，这次直接冲十五波～',
          '我先去前面开路了，主人别眨眼！'
        ],
        'game.report.wave': [
          '主人，第 {wave} 波了，我还精神得很～',
          '第 {wave} 波，来多少我吃多少！',
          '第 {wave} 波而已，稳住～',
          '主人快看，第 {wave} 波又被我清掉了！',
          '节奏起来了，{wave} 波走起！'
        ],
        'game.report.firstBlood': [
          '第一滴血拿下，主人你看见没？',
          '开张！手感不错～',
          '先送你一个，别客气～'
        ],
        'game.report.streak': [
          '五连！主人快夸我！',
          '看见没，这波我打得很顺～',
          '连杀五个，状态正好！'
        ],
        'game.report.lowHp': [
          '唔……血有点少了，我先溜一圈回血。',
          '疼疼疼，残血了，主人给我加油！',
          '撑住撑住，我还不想倒！'
        ],
        'game.report.heal': [
          '血包到手，续命成功～',
          '嗝，补上了，继续！',
          '捡到血包，瞬间满血复活的感觉！'
        ],
        'game.report.charge': [
          '冲锋波来啦，主人坐稳！',
          '它们整排压上来了，我先绕一圈！',
          '这一波是排队送分，看我操作！'
        ],
        'game.report.upgrade': [
          '就选「{name}」，顺手！',
          '拿到「{name}」，这局稳了。',
          '强化「{name}」，继续冲！'
        ],
        'game.report.milestone': [
          '{score} 分到手，记我一个！',
          '主人，{score} 分了，稳得住～',
          '{score} 分！再看我多打一会～'
        ],
        'game.report.record': [
          '主人快看！{score} 分，破纪录啦！',
          '新高！{score} 分，我厉害吧～',
          '破纪录啦，{score} 分——这局归我！'
        ],
        'game.report.death': [
          '呜哇，被围住了……第 {wave} 波，{score} 分，我马上爬起来！',
          '大意了，被偷了一枪……第 {wave} 波收场，{score} 分。',
          '翻车……第 {wave} 波没撑住，{score} 分，等我回来！'
        ],
        'game.report.deathBest': [
          '倒下的姿势虽然难看，但 {score} 分是新高！第 {wave} 波，我马上回来。',
          '这局 {score} 分，破纪录了——躺一下也是值得的！'
        ],
        'game.report.revive': [
          '我又回来啦，重新开一局！',
          '爬起来了爬起来了，接着打！',
          '刚才那下不算，重来～'
        ]
      }
    };

    // 解说词在源码里按「一种事件几种说法」写成数组，但语言包只保证字符串值：
    // 注册前用 LINE_SEP 把数组拼成一个长串，取用时再拆开（见 tLines）。
    const LINE_SEP = '\u0001';

    function flattenDict(dict) {
      const out = {};
      for (const localeName of Object.keys(dict)) {
        const flat = {};
        for (const key of Object.keys(dict[localeName])) {
          const value = dict[localeName][key];
          flat[key] = Array.isArray(value) ? value.join(LINE_SEP) : value;
        }
        out[localeName] = flat;
      }
      return out;
    }

    // ------------------------------------------------------------------
    // 桌宠解说（可选）：把战报单向投喂给 dsh-pet —— 气泡走 /broadcast，
    // 同一句再请它的 TTS 合成、由本页播放（/voice/speak），所以不用改宠物
    // 的播报总开关就能听见。页面与桌宠路由同源，相对路径 fetch 即可；
    // 宠物 id 取 ~/.dsh/dsh-pet/<id>-config.jsonc 的前缀，surface=any 表示
    // 不挑显示端。桌宠没装、在睡觉、被占用或 TTS 没网都只是少一句解说，
    // 绝不影响本局。
    // ------------------------------------------------------------------
    const PET_BROADCAST_URL = '/dsh-pet-7340/broadcast?pet=main&surface=any';
    const PET_VOICE_URL = '/dsh-pet-7340/voice/speak';
    const PET_TALK_GAP = 420; // 常规播报的最小间隔（帧，约 7 秒）
    const PET_TALK_FLOOR = 60; // 紧急播报（阵亡）的最小间隔（帧，约 1 秒）
    const PET_BUBBLE_MS = 6000; // 气泡停留时长
    const PET_SPEAK_MAX = 200; // 送 TTS 的正文上限（防超长句合成几分钟）

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
      gunner: { r: 15, hp: 5, speed: 1.2, color: C.green, dmg: 12, score: 25, ranged: true },
      // 每 5 波来一只：血厚、会蓄力冲锋、隔一阵朝四周打一圈子弹
      boss: { r: 38, hp: 40, speed: 0.55, color: C.redSoft, dmg: 28, score: 300, boss: true }
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

    // 解说词按「同一事件几种说法」组织成数组；注册时被拼成 LINE_SEP 分隔的长串。
    function tLines(key) {
      const value = translate(key);
      if (typeof value !== 'string' || value === key) return [];
      return value.split(LINE_SEP).filter((line) => line.trim() !== '');
    }

    function clamp(value, lo, hi) {
      if (value < lo) return lo;
      if (value > hi) return hi;
      return value;
    }

    // ------------------------------------------------------------------
    // 最高分：存 localStorage，刷新页面、切面板都还在；隐私模式或没有
    // localStorage 时只是记不住，不影响玩。
    // ------------------------------------------------------------------
    const BEST_KEY = 'dsh-shooter:best';

    function readBest() {
      try {
        if (typeof window !== 'object' || window === null || !window.localStorage) return 0;
        const value = Number(window.localStorage.getItem(BEST_KEY));
        return isFinite(value) && value > 0 ? Math.floor(value) : 0;
      } catch (err) {
        return 0;
      }
    }

    function writeBest(score) {
      try {
        if (typeof window !== 'object' || window === null || !window.localStorage) return;
        if (!(score > readBest())) return;
        window.localStorage.setItem(BEST_KEY, String(Math.floor(score)));
      } catch (err) {
        /* 隐私模式或配额满：忽略 */
      }
    }

    // ------------------------------------------------------------------
    // 连杀倍率：3 秒内接着杀，得分按 ×1 / ×2 / ×3 递增（3 连 ×2，6 连 ×3）。
    // ------------------------------------------------------------------
    const COMBO_WINDOW = 180; // 3 秒，按 60fps 的帧数算

    function comboMultiplier(count) {
      if (!isFinite(count) || count < 0) return 1;
      if (count >= 6) return 3;
      if (count >= 3) return 2;
      return 1;
    }

    // ------------------------------------------------------------------
    // 本机排行榜 / 成就 / 皮肤：只写 localStorage，不联网、没有账号。
    // 排行榜留前 5 名；成就一旦解锁永久保留；皮肤靠成就解锁。
    // 没有 localStorage（隐私模式、离线测试桩）时全部静默降级。
    // ------------------------------------------------------------------
    const LB_KEY = 'dsh-shooter:leaderboard';
    const ACH_KEY = 'dsh-shooter:achievements';
    const RUNS_KEY = 'dsh-shooter:runs';
    const SKIN_KEY = 'dsh-shooter:skin';
    const LB_MAX = 5;

    function hasStorage() {
      try {
        return typeof window === 'object' && window !== null && !!window.localStorage;
      } catch (err) {
        return false;
      }
    }

    function readStored(key) {
      try {
        if (!hasStorage()) return null;
        const raw = window.localStorage.getItem(key);
        if (typeof raw !== 'string' || raw === '') return null;
        return JSON.parse(raw);
      } catch (err) {
        return null;
      }
    }

    function writeStored(key, value) {
      try {
        if (!hasStorage()) return;
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        /* 隐私模式/配额满：记不住也不能影响游戏 */
      }
    }

    function readRuns() {
      try {
        if (!hasStorage()) return 0;
        const value = Number(window.localStorage.getItem(RUNS_KEY));
        return isFinite(value) && value > 0 ? Math.floor(value) : 0;
      } catch (err) {
        return 0;
      }
    }

    function writeRuns(count) {
      try {
        if (!hasStorage()) return;
        window.localStorage.setItem(RUNS_KEY, String(Math.floor(count)));
      } catch (err) {
        /* 同上 */
      }
    }

    function readLeaderboard() {
      const value = readStored(LB_KEY);
      if (!Array.isArray(value)) return [];
      return value
        .filter((entry) => entry !== null && typeof entry === 'object' && isFinite(entry.score) && entry.score > 0)
        .map((entry) => ({
          score: Math.floor(entry.score),
          wave: Math.max(1, Math.floor(entry.wave || 1)),
          at: isFinite(entry.at) ? entry.at : 0
        }))
        .sort((a, b) => b.score - a.score || a.at - b.at)
        .slice(0, LB_MAX);
    }

    // 记录一局，返回本机名次（0 起）；没挤进前五返回 -1。
    function recordLeaderboard(score, wave) {
      if (!(score > 0)) return -1;
      const list = readLeaderboard();
      const entry = { score: Math.floor(score), wave: Math.max(1, Math.floor(wave || 1)), at: Date.now() };
      list.push(entry);
      list.sort((a, b) => b.score - a.score || a.at - b.at);
      const kept = list.slice(0, LB_MAX);
      writeStored(LB_KEY, kept);
      return kept.indexOf(entry);
    }

    // 成就在一局结束时判定一次；解锁写时间戳，永久保留。
    // 判定依据是本局战况（run: score/wave/kills/maxStreak/ai/runs）。
    const ACHIEVEMENTS = [
      { id: 'firstBlood', test: (run) => run.kills >= 1 },
      { id: 'wave5', test: (run) => run.wave >= 5 },
      { id: 'wave10', test: (run) => run.wave >= 10 },
      { id: 'score1000', test: (run) => run.score >= 1000 },
      { id: 'score2500', test: (run) => run.score >= 2500 },
      { id: 'streak5', test: (run) => run.maxStreak >= 5 },
      { id: 'watcher', test: (run) => run.ai === true },
      { id: 'veteran', test: (run) => run.runs >= 10 }
    ];

    function readAchievements() {
      const value = readStored(ACH_KEY);
      if (value === null || typeof value !== 'object' || Array.isArray(value)) return {};
      const map = {};
      for (const meta of ACHIEVEMENTS) {
        const at = value[meta.id];
        if (isFinite(at) && at > 0) map[meta.id] = at;
      }
      return map;
    }

    // 解锁并返回本次新拿到的成就 id 列表。
    function unlockAchievements(run) {
      const map = readAchievements();
      const unlocked = [];
      for (const meta of ACHIEVEMENTS) {
        if (map[meta.id] !== undefined) continue;
        if (!meta.test(run)) continue;
        map[meta.id] = Date.now();
        unlocked.push(meta.id);
      }
      if (unlocked.length > 0) writeStored(ACH_KEY, map);
      return unlocked;
    }

    // 皮肤：默认蓝胖鱼，其余靠成就解锁；没解锁的选择会被拒绝。
    const SKINS = [
      { id: 'blue', req: null, body: '#5fb6ff', fin: '#6cc0ff', tail: '#3d8fd6', belly: 'rgba(226, 246, 255, 0.7)', glow: '#6fd3ff' },
      { id: 'gold', req: 'wave5', body: '#ffd257', fin: '#ffe08a', tail: '#d9a422', belly: 'rgba(255, 249, 219, 0.72)', glow: '#ffd257' },
      { id: 'pink', req: 'wave10', body: '#ff9ecb', fin: '#ffc3de', tail: '#d96fa0', belly: 'rgba(255, 235, 246, 0.78)', glow: '#ff9ecb' },
      { id: 'shark', req: 'score2500', body: '#7f93b5', fin: '#a3b5d0', tail: '#55647f', belly: 'rgba(226, 234, 244, 0.6)', glow: '#a3b5d0' },
      { id: 'ninja', req: 'streak5', body: '#3a3f52', fin: '#525a72', tail: '#252938', belly: 'rgba(160, 170, 190, 0.35)', glow: '#8f99b0' }
    ];
    const SKIN_IDS = SKINS.map((skin) => skin.id);

    let activeSkinId = null;

    function skinById(id) {
      for (const skin of SKINS) if (skin.id === id) return skin;
      return SKINS[0];
    }

    function skinUnlocked(id) {
      const skin = skinById(id);
      if (skin.req === null) return true;
      return readAchievements()[skin.req] !== undefined;
    }

    function readSkin() {
      if (activeSkinId !== null) return activeSkinId;
      let stored = null;
      try {
        if (hasStorage()) stored = window.localStorage.getItem(SKIN_KEY);
      } catch (err) {
        stored = null;
      }
      activeSkinId = typeof stored === 'string' && SKIN_IDS.indexOf(stored) >= 0 && skinUnlocked(stored)
        ? stored
        : 'blue';
      return activeSkinId;
    }

    // 选皮肤：没解锁的拒绝（返回 false），不弹窗也不改存档。
    function setSkin(id) {
      if (SKIN_IDS.indexOf(id) < 0 || !skinUnlocked(id)) return false;
      activeSkinId = id;
      writeStored(SKIN_KEY, id);
      return true;
    }

    // 一次读出界面要用的全部本机数据（排行榜/成就/皮肤/局数）。
    function readMeta() {
      const achievements = readAchievements();
      const skin = readSkin();
      return {
        leaderboard: readLeaderboard(),
        achievementList: ACHIEVEMENTS.map((meta) => ({ id: meta.id, unlocked: achievements[meta.id] !== undefined })),
        skins: SKINS.map((item) => ({
          id: item.id,
          unlocked: skinUnlocked(item.id),
          req: item.req,
          active: item.id === skin
        })),
        skin: skin,
        runs: readRuns()
      };
    }

    // ------------------------------------------------------------------
    // 局内强化：每清两波弹三张卡，点一张；大肥鱼托管时按权重自己挑。
    // 数值全挂在 S.mods 上，只影响当前这一局，开新局清空。
    // ------------------------------------------------------------------
    const UPGRADES = [
      { id: 'damage', max: 3 },
      { id: 'rapid', max: 3 },
      { id: 'double', max: 2 },
      { id: 'pierce', max: 2 },
      { id: 'speed', max: 2 },
      { id: 'dash', max: 2 },
      { id: 'combo', max: 2 },
      { id: 'magnet', max: 2 },
      { id: 'shield', max: 2 },
      { id: 'vitality', max: 3 }
    ];
    const UPGRADE_IDS = UPGRADES.map((item) => item.id);
    const UPGRADE_SHIELD_COOLDOWN = 600; // 10 秒回一格护盾
    const PICK_DELAY_AI = 40; // 托管时看牌约 0.7 秒再选，别像抢答

    function upgradeById(id) {
      for (const item of UPGRADES) if (item.id === id) return item;
      return null;
    }

    function defaultMods() {
      return {
        dmg: 1,
        fireCD: 9,
        shots: 1,
        spread: 0.06,
        pierce: 0,
        speed: 4.2,
        dashCD: 90,
        comboBonus: 0,
        magnet: 0,
        shieldMax: 0,
        shieldCharges: 0,
        shieldT: 0,
        counts: {}
      };
    }

    // 应用一张强化：数值挂在 mods 上，开火/移速/护盾等逻辑直接读 mods。
    function applyUpgrade(mods, player, id) {
      switch (id) {
        case 'damage': mods.dmg += 1; break;
        case 'rapid': mods.fireCD = Math.max(4, mods.fireCD - 2); break;
        case 'double': mods.shots += 1; mods.spread += 0.05; break;
        case 'pierce': mods.pierce += 1; break;
        case 'speed': mods.speed += 0.5; if (player !== undefined) player.speed = mods.speed; break;
        case 'dash': mods.dashCD = Math.max(40, mods.dashCD - 20); if (player !== undefined) player.dashCD = mods.dashCD; break;
        case 'combo': mods.comboBonus += 30; break;
        case 'magnet': mods.magnet += 70; break;
        case 'shield':
          mods.shieldMax += 1;
          mods.shieldCharges = mods.shieldMax;
          mods.shieldT = UPGRADE_SHIELD_COOLDOWN;
          break;
        case 'vitality':
          player.maxHp += 20;
          player.hp = Math.min(player.maxHp, player.hp + 20);
          break;
        default: break;
      }
      mods.counts[id] = (mods.counts[id] || 0) + 1;
      return mods;
    }

    // 大肥鱼挑卡权重：缺什么补什么；菜鸟偏保命，宗师偏输出。
    function upgradeWeight(id, level, hpRatio, wave) {
      const base = {
        damage: 1.25, rapid: 1.1, double: 1.35, pierce: 1.15, speed: 0.95,
        dash: 0.9, combo: 0.9, magnet: 0.65, shield: 1.0, vitality: 0.85
      };
      let weight = base[id] !== undefined ? base[id] : 1;
      if (hpRatio < 0.6 && (id === 'vitality' || id === 'shield')) weight += 0.5;
      if (wave >= 5 && (id === 'damage' || id === 'double' || id === 'pierce')) weight += 0.15;
      if (level === 'rookie' && (id === 'vitality' || id === 'shield' || id === 'magnet')) weight += 0.3;
      if (level === 'master' && (id === 'damage' || id === 'double' || id === 'rapid')) weight += 0.3;
      return weight;
    }

    // 观战设置：播放速度、AI 档位。存 localStorage，刷新后记得上次的选择。
    const SPEED_KEY = 'dsh-shooter:speed';
    const LEVEL_KEY = 'dsh-shooter:level';
    const SPEEDS = [0.25, 0.5, 1, 2];
    const LEVELS = ['rookie', 'normal', 'master'];
    const AI_LEVELS = {
      rookie: { aimJitter: 0.16, lead: 0, dodge: 0.55, dashHp: 0.3, nearest: true },
      normal: { aimJitter: 0.05, lead: 0.9, dodge: 1, dashHp: 0.45, nearest: false },
      master: { aimJitter: 0.012, lead: 1.05, dodge: 1.25, dashHp: 0.6, nearest: false }
    };

    function readSpeed() {
      try {
        if (!hasStorage()) return 1;
        const value = Number(window.localStorage.getItem(SPEED_KEY));
        return SPEEDS.indexOf(value) >= 0 ? value : 1;
      } catch (err) {
        return 1;
      }
    }

    function writeSpeed(value) {
      try {
        if (hasStorage()) window.localStorage.setItem(SPEED_KEY, String(value));
      } catch (err) {
        /* 隐私模式：记不住就算了 */
      }
    }

    function readLevel() {
      try {
        if (!hasStorage()) return 'normal';
        const value = window.localStorage.getItem(LEVEL_KEY);
        return LEVELS.indexOf(value) >= 0 ? value : 'normal';
      } catch (err) {
        return 'normal';
      }
    }

    function writeLevel(value) {
      try {
        if (hasStorage()) window.localStorage.setItem(LEVEL_KEY, value);
      } catch (err) {
        /* 隐私模式：记不住就算了 */
      }
    }

    function speedLabel(speed) {
      if (speed === 0.25) return '0.25×';
      if (speed === 0.5) return '0.5×';
      if (speed === 2) return '2×';
      return '1×';
    }

    // ------------------------------------------------------------------
    // 音效：全部用 WebAudio 现场合成，不加载任何音频文件。没有
    // AudioContext、被自动播放策略拦下或用户静音时静默降级。
    // ------------------------------------------------------------------
    const SFX_KEY = 'dsh-shooter:muted';
    const SFX_MIN_MS = { shoot: 55, hit: 40, kill: 30, hurt: 90, dash: 90, pickup: 80, wave: 200, over: 400, pet: 120, cheer: 300, feed: 200 };
    let sfxCtx = null;
    let sfxMuted = null;
    // 缩成小鱼挂件时的「安静摸鱼」：只压音效，桌宠解说照常念
    let sfxSilenced = false;
    const sfxLast = Object.create(null);

    function setSfxSilence(next) {
      sfxSilenced = next === true;
    }

    // ------------------------------------------------------------------
    // 安静摸鱼：把整体刺激压低——音效更轻、阵亡不吓人、解说换温柔语气、
    // HUD 不显示分数；再叠一层很轻的水族箱底噪，适合一边干活一边摸。
    // ------------------------------------------------------------------
    const CALM_KEY = 'dsh-shooter:calm';
    const AMBIENT_KEY = 'dsh-shooter:ambient';
    let calmMode = false;
    let calmLoaded = false;
    let ambientWanted = true;
    let ambientLoaded = false;

    function readCalm() {
      if (!calmLoaded) {
        calmLoaded = true;
        try {
          calmMode = typeof window === 'object' && window !== null && !!window.localStorage
            && window.localStorage.getItem(CALM_KEY) === '1';
        } catch (err) {
          calmMode = false;
        }
      }
      return calmMode;
    }

    function writeCalm(on) {
      try {
        if (typeof window === 'object' && window !== null && window.localStorage) {
          if (on) window.localStorage.setItem(CALM_KEY, '1');
          else window.localStorage.removeItem(CALM_KEY);
        }
      } catch (err) {
        /* 隐私模式：记不住就本次生效 */
      }
    }

    function readAmbient() {
      if (!ambientLoaded) {
        ambientLoaded = true;
        try {
          const raw = typeof window === 'object' && window !== null && window.localStorage
            ? window.localStorage.getItem(AMBIENT_KEY) : null;
          ambientWanted = raw !== '0';
        } catch (err) {
          ambientWanted = true;
        }
      }
      return ambientWanted;
    }

    function writeAmbient(on) {
      try {
        if (typeof window === 'object' && window !== null && window.localStorage) {
          if (on) window.localStorage.removeItem(AMBIENT_KEY);
          else window.localStorage.setItem(AMBIENT_KEY, '0');
        }
      } catch (err) {
        /* 记不住就本次生效 */
      }
    }

    function setCalmMode(next) {
      calmMode = next === true;
      calmLoaded = true;
      writeCalm(calmMode);
      // 水声只在「角落小鱼真的露着」的时候垫，面板里安静摸鱼不要突然有海浪声
      const widgetUp = liveFloat !== null && liveFloat.host.style.display !== 'none';
      setAmbient(calmMode && readAmbient() && widgetUp);
      return calmMode;
    }

    // 水族箱底噪：抖动的棕噪 + 低通，音量低到只剩「海的感觉」，偶尔冒个泡
    let ambientCtx = null;
    let ambientNodes = null;
    let ambientTimer = 0;

    function ambientStart() {
      if (ambientNodes !== null || readMuted()) return;
      if (typeof window !== 'object' || window === null) return;
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (typeof Ctor !== 'function') return;
      try {
        if (ambientCtx === null) ambientCtx = new Ctor();
        if (ambientCtx.state === 'suspended' && typeof ambientCtx.resume === 'function') ambientCtx.resume();
        const frames = Math.floor((ambientCtx.sampleRate || 44100) * 3);
        const buffer = ambientCtx.createBuffer(1, frames, ambientCtx.sampleRate || 44100);
        const data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < frames; i++) {
          last = (last + (Math.random() * 2 - 1) * 0.02) * 0.995;
          data[i] = last * 6;
        }
        const src = ambientCtx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        const filter = ambientCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 520;
        const gain = ambientCtx.createGain();
        gain.gain.value = 0.05;
        src.connect(filter);
        filter.connect(gain);
        gain.connect(ambientCtx.destination);
        src.start(0);
        ambientNodes = { src: src, gain: gain };
        if (typeof window.setInterval === 'function') {
          ambientTimer = window.setInterval(function () {
            if (ambientCtx === null || ambientNodes === null || readMuted()) return;
            try {
              const t = ambientCtx.currentTime + 0.02;
              const osc = ambientCtx.createOscillator();
              const g = ambientCtx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(320 + Math.random() * 260, t);
              osc.frequency.exponentialRampToValueAtTime(760 + Math.random() * 320, t + 0.12);
              g.gain.setValueAtTime(0.0001, t);
              g.gain.exponentialRampToValueAtTime(0.05, t + 0.03);
              g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
              osc.connect(g);
              g.connect(ambientCtx.destination);
              osc.start(t);
              osc.stop(t + 0.2);
            } catch (err) {
              /* 单个气泡失败无所谓 */
            }
          }, 4200);
        }
      } catch (err) {
        /* 没有声卡就算了 */
      }
    }

    function ambientStop() {
      if (ambientTimer !== 0 && typeof window.clearInterval === 'function') window.clearInterval(ambientTimer);
      ambientTimer = 0;
      if (ambientNodes !== null) {
        try { ambientNodes.src.stop(); } catch (err) { /* 已经停了 */ }
        try { ambientNodes.gain.disconnect(); } catch (err) { /* ignore */ }
      }
      ambientNodes = null;
    }

    function setAmbient(on) {
      if (on === true) ambientStart();
      else ambientStop();
      return on === true;
    }

    function readMuted() {
      if (sfxMuted !== null) return sfxMuted;
      let muted = false;
      try {
        muted = typeof window === 'object' && window !== null && !!window.localStorage && window.localStorage.getItem(SFX_KEY) === '1';
      } catch (err) {
        muted = false;
      }
      sfxMuted = muted;
      return muted;
    }

    function setMuted(next) {
      sfxMuted = next === true;
      try {
        if (typeof window === 'object' && window !== null && window.localStorage) {
          if (sfxMuted) window.localStorage.setItem(SFX_KEY, '1');
          else window.localStorage.removeItem(SFX_KEY);
        }
      } catch (err) {
        /* 记不住就只在本次生效 */
      }
      // 静音要连水族箱底噪一起停；取消静音时如果安静摸鱼和水声都开着，再把它请回来
      if (sfxMuted) {
        ambientStop();
      } else if (calmMode && readAmbient() && liveFloat !== null && liveFloat.host.style.display !== 'none') {
        ambientStart();
      }
    }

    function nowMs() {
      if (typeof performance === 'object' && performance !== null && typeof performance.now === 'function') return performance.now();
      return Date.now();
    }

    let audioUnlocked = false;
    let sfxWarned = false;
    // 在用户点击的同一拍里调用，能把 AudioContext 从 suspended 里拉起来
    function unlockSfx() {
      if (typeof window !== 'object' || window === null) return;
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (typeof Ctor !== 'function') return;
      try {
        if (sfxCtx === null) sfxCtx = new Ctor();
        if (sfxCtx.state === 'suspended' && typeof sfxCtx.resume === 'function') sfxCtx.resume();
        if (!audioUnlocked) {
          audioUnlocked = true;
          // 播一段静音 buffer，部分浏览器要这样才算真正解锁
          const buffer = sfxCtx.createBuffer(1, 1, sfxCtx.sampleRate || 44100);
          const src = sfxCtx.createBufferSource();
          src.buffer = buffer;
          src.connect(sfxCtx.destination);
          src.start(0);
        }
      } catch (err) {
        if (!sfxWarned && typeof console === 'object' && console !== null && typeof console.warn === 'function') {
          sfxWarned = true;
          console.warn('[dsh-shooter] audio is unavailable:', (err && err.message) || err);
        }
      }
    }

    function sfxPlay(name) {
      if (readMuted() || sfxSilenced) return;
      if (typeof window !== 'object' || window === null) return;
      if (typeof (window.AudioContext || window.webkitAudioContext) !== 'function') return;
      const stamp = nowMs();
      const lastPlay = sfxLast[name];
      if (lastPlay !== undefined && stamp - lastPlay < (SFX_MIN_MS[name] || 30)) return;
      sfxLast[name] = stamp;
      try {
        unlockSfx();
        if (sfxCtx === null) return;
        const t0 = sfxCtx.currentTime + 0.005;
        const out = sfxCtx.createGain();
        // 安静摸鱼时整体音量压到三成多，枪声不扎耳朵
        out.gain.value = calmMode ? 0.35 : 0.8;
        out.connect(sfxCtx.destination);

        const tone = (f0, f1, dur, type, vol, delay) => {
          const start = t0 + (delay || 0);
          const osc = sfxCtx.createOscillator();
          const gain = sfxCtx.createGain();
          osc.type = type || 'square';
          osc.frequency.setValueAtTime(f0, start);
          if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), start + dur);
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), start + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
          osc.connect(gain);
          gain.connect(out);
          osc.start(start);
          osc.stop(start + dur + 0.02);
        };

        const noise = (dur, vol, cutoff, delay) => {
          const start = t0 + (delay || 0);
          const frames = Math.max(1, Math.floor(sfxCtx.sampleRate * dur));
          const buffer = sfxCtx.createBuffer(1, frames, sfxCtx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
          const src = sfxCtx.createBufferSource();
          src.buffer = buffer;
          const filter = sfxCtx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = cutoff || 2000;
          const gain = sfxCtx.createGain();
          gain.gain.value = vol;
          src.connect(filter);
          filter.connect(gain);
          gain.connect(out);
          src.start(start);
        };

        if (name === 'shoot') tone(820, 300, 0.05, 'square', 0.10);
        else if (name === 'hit') { noise(0.04, 0.16, 4200); tone(1500, 900, 0.035, 'triangle', 0.06); }
        else if (name === 'kill') { tone(440, 120, 0.14, 'sawtooth', 0.10); noise(0.12, 0.14, 1400); }
        else if (name === 'hurt') {
          // 安静模式下受伤不是「哎哟」，而是一声轻轻的闷响
          if (calmMode) tone(240, 170, 0.22, 'sine', 0.05);
          else { tone(190, 55, 0.2, 'sine', 0.16); noise(0.09, 0.12, 900); }
        }
        else if (name === 'dash') { noise(0.2, 0.14, 1100); tone(260, 820, 0.14, 'sine', 0.07); }
        else if (name === 'pickup') { tone(660, 660, 0.09, 'sine', 0.10); tone(990, 990, 0.12, 'sine', 0.10, 0.07); }
        else if (name === 'wave') { tone(392, 392, 0.1, 'triangle', 0.10); tone(523, 523, 0.1, 'triangle', 0.10, 0.09); tone(784, 784, 0.18, 'triangle', 0.10, 0.18); }
        else if (name === 'over') {
          // 安静模式下阵亡不吓人：一声叹气式的下滑音
          if (calmMode) tone(330, 220, 0.55, 'sine', 0.05);
          else { tone(330, 110, 0.5, 'sawtooth', 0.10); tone(220, 70, 0.6, 'sine', 0.09, 0.1); }
        }
        else if (name === 'pet') { tone(520, 760, 0.12, 'sine', 0.09); tone(760, 980, 0.1, 'sine', 0.06, 0.1); }
        else if (name === 'cheer') { tone(660, 990, 0.12, 'triangle', 0.09); tone(880, 1320, 0.14, 'triangle', 0.08, 0.1); }
        else if (name === 'feed') { tone(560, 700, 0.1, 'sine', 0.08); tone(700, 940, 0.12, 'sine', 0.07, 0.12); }
      } catch (err) {
        /* 没有声卡/被策略拦截：静音即可 */
      }
    }

    // 大肥鱼本体：俯视角、头朝 +x 的圆滚滚胖鱼，尾巴和鳍会随 time 摆动。
    // 颜色取自当前皮肤（见 SKINS），默认是蓝胖鱼。
    // pose：'happy' 眯眼开心（被摸）、'belly' 翻过来露肚皮（长按摸摸）
    function drawPetFish(g, x, y, dir, time, flash, wiggle, pose) {
      const skin = skinById(readSkin());
      const squirm = wiggle > 0 ? Math.sin(wiggle * 1.9) * 0.16 : 0;
      // 安静摸鱼时尾巴摆得更慢，整体更「慢下来」
      const wagSpeed = readCalm() ? 0.1 : 0.22;
      const wag = Math.sin(time * wagSpeed) * 3.4 + (wiggle > 0 ? Math.sin(wiggle * 1.4) * 5 : 0);
      g.save();
      g.translate(x, y);
      g.rotate(dir + squirm);
      // 被长按摸摸时翻个身，肚皮朝上
      if (pose === 'belly') g.scale(1, -1);

      // 尾巴
      g.fillStyle = skin.tail;
      g.beginPath();
      g.moveTo(-12, 0);
      g.quadraticCurveTo(-22, -11 + wag, -32, -6 + wag * 1.4);
      g.quadraticCurveTo(-28, 0, -32, 6 + wag * 1.4);
      g.quadraticCurveTo(-22, 11 + wag, -12, 0);
      g.fill();

      // 背鳍 / 腹鳍
      g.fillStyle = skin.fin;
      g.beginPath();
      g.moveTo(0, -12);
      g.quadraticCurveTo(-10, -22, -14, -12);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(0, 12);
      g.quadraticCurveTo(-10, 22, -14, 12);
      g.closePath();
      g.fill();

      // 枪（大肥鱼也是拿枪的）
      g.fillStyle = C.gun;
      g.fillRect(12, -3.5, 20, 7);
      g.fillStyle = '#4a5470';
      g.fillRect(26, -2, 8, 4);

      // 身体
      g.fillStyle = flash > 0 ? '#ffffff' : skin.body;
      g.shadowColor = skin.glow;
      g.shadowBlur = 16;
      g.beginPath();
      g.ellipse(0, 0, 18, 13, 0, 0, Math.PI * 2);
      g.fill();
      g.shadowBlur = 0;

      // 肚皮高光
      g.fillStyle = skin.belly;
      g.beginPath();
      g.ellipse(2, 0, 11, 7, 0, 0, Math.PI * 2);
      g.fill();

      // 眼睛（俯视，两侧各一只）：被摸的时候眯成开心的弧线
      if (pose === 'happy' || pose === 'belly') {
        g.strokeStyle = '#10263a';
        g.lineWidth = 2;
        g.beginPath();
        g.arc(9, -7.5, 2.8, Math.PI * 0.15, Math.PI * 0.85);
        g.stroke();
        g.beginPath();
        g.arc(9, 7.5, 2.8, Math.PI * 0.15, Math.PI * 0.85);
        g.stroke();
      } else {
        g.fillStyle = '#10263a';
        g.beginPath();
        g.arc(9, -7.5, 2.6, 0, Math.PI * 2);
        g.fill();
        g.beginPath();
        g.arc(9, 7.5, 2.6, 0, Math.PI * 2);
        g.fill();
      }

      // 嘴
      g.strokeStyle = '#2b6fb8';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(15, 0, 4, -0.9, 0.9);
      g.stroke();

      g.restore();
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
      // HUD 的去处可以中途换人：在面板里写给 React，挪到浮窗后直接写 DOM。
      let hudSink = typeof onHud === 'function' ? onHud : function () {};
      let raf = 0;
      let disposed = false;
      let lastHudKey = '';
      let petAudio = null; // 正在播放的解说音频
      let pendingSpeech = null; // 上一句还没念完时，最多排一句新的，不半路掐断
      // 固定步长：不管屏幕是 60Hz 还是 144Hz，逻辑都按 60Hz 推进
      const STEP_MS = 1000 / 60;
      let lastTs = 0;
      let acc = 0;
      // 缩成小鱼后画布看不见：跳过绘制省 CPU，模拟与 HUD 照常推进
      let renderOn = true;

      function setRender(next) {
        const on = next !== false;
        if (on === renderOn) return;
        renderOn = on;
        if (on) draw();
      }

      // 挂件里的待机小鱼：把同一只鱼画在 96px 小画布上（12fps 定时调，几乎不耗 CPU）
      // mood: 'sleep' 打盹冒 z、'dizzy' 被摸晕、'buff' 加油时冒星芒、'belly' 露肚皮
      // lookDir：鼠标在屏幕上的方向（挂件会传进来，让鱼转头看你）
      function drawPetThumb(target, mood, lookDir) {
        if (target === null || typeof target !== 'object' || typeof target.getContext !== 'function') return;
        const ctx = target.getContext('2d');
        if (ctx === null || typeof ctx !== 'object') return;
        const dpr = typeof window === 'object' && window !== null && isFinite(window.devicePixelRatio)
          ? Math.min(3, Math.max(1, window.devicePixelRatio))
          : 1;
        const size = 96;
        if (target.width !== Math.round(size * dpr) || target.height !== Math.round(size * dpr)) {
          target.width = Math.round(size * dpr);
          target.height = Math.round(size * dpr);
        }
        if (typeof ctx.setTransform === 'function') ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, size, size);
        // 安静摸鱼时呼吸更慢更深（约 6 秒一次），像在陪你慢慢喘气
        const calm = readCalm();
        const rate = calm ? 0.017 : 0.07;
        const amp = calm ? 0.05 : 0.03;
        const breathe = 1 + Math.sin(S.time * rate) * amp;
        ctx.save();
        ctx.translate(size / 2, size / 2 + 2);
        if (calm) {
          // 一圈很淡的呼吸光晕
          ctx.fillStyle = 'rgba(120, 200, 255, 0.10)';
          ctx.beginPath();
          ctx.arc(0, 0, 40 * breathe, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.scale(1.28 * breathe, 1.28 * breathe);
        const dir = typeof lookDir === 'number' && isFinite(lookDir) ? lookDir : (S.player.dir || 0);
        const pose = mood === 'belly' ? 'belly' : mood === 'happy' ? 'happy' : null;
        drawPetFish(ctx, 0, 0, dir, S.time, S.player.flash, S.pet.wiggle, pose);
        ctx.restore();
        if (mood === 'sleep') {
          const drift = (S.time * 0.02) % 1;
          ctx.fillStyle = 'rgba(178, 200, 240, 0.85)';
          ctx.font = '600 13px ' + FONT;
          ctx.fillText('z', 58 + drift * 10, 30 - drift * 14);
          ctx.fillText('z', 70, 22);
        } else if (mood === 'dizzy') {
          ctx.fillStyle = '#ffe08a';
          ctx.font = '600 12px ' + FONT;
          ctx.fillText('@_@', 50, 20);
        } else if (mood === 'buff') {
          ctx.fillStyle = '#ffd257';
          ctx.font = '600 13px ' + FONT;
          ctx.fillText('✦', 68, 26);
        }
      }

      // 解说音频的播放/清理：新音频直接覆盖旧的，旧的 URL 由各自的 onended 释放
      function releaseSpeech(entry) {
        if (!entry) return;
        try { if (entry.audio) entry.audio.pause(); } catch (err) { /* 已释放 */ }
        try { window.URL.revokeObjectURL(entry.url); } catch (err) { /* 已释放 */ }
      }

      function playSpeech(entry) {
        if (!entry) return;
        petAudio = entry.audio;
        const playing = entry.audio.play();
        if (playing && typeof playing.catch === 'function') {
          playing.catch((err) => {
            if (petAudio === entry.audio) petAudio = null;
            // 被自动播放策略拦下的句子留着，等下一次用户点按再补念
            if (pendingSpeech === null) pendingSpeech = entry;
            else releaseSpeech(entry);
            if (typeof console === 'object' && console !== null && typeof console.warn === 'function') {
              console.warn('[dsh-shooter] voice was blocked:', (err && err.message) || err);
            }
          });
        }
      }

      // 浏览器要求「先有用户手势」才允许出声；在这里顺手把两块都解锁
      function unlockAudio() {
        unlockSfx();
        if (typeof window !== 'object' || window === null || typeof window.Audio !== 'function') return;
        if (typeof document !== 'object' || document === null || typeof document.createElement !== 'function') return;
        try {
          const silent = new window.Audio();
          silent.muted = true;
          const p = silent.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } catch (err) { /* 解锁失败：交给下一次点击 */ }
        if (pendingSpeech !== null) {
          const next = pendingSpeech;
          pendingSpeech = null;
          playSpeech(next);
        }
      }

      const S = {
        phase: 'idle', // idle | playing | over
        paused: false, // playing 时按暂停会冻结模拟，画面和 HUD 留在原地
        // 播放速度倍率：观战时 0.5× / 1× / 2×，手动玩也生效
        speedMul: readSpeed(),
        score: 0,
        wave: 1,
        waveTimer: 0,
        spawnQueue: 0,
        spawnCD: 0,
        bossPending: false, // 本波开头是否要放 Boss（每 5 波）
        chargeWave: false, // 本波是不是「冲锋波」（每 4 波，Boss 波除外）
        chargeSide: 0, // 冲锋波从哪一侧压上（0 上 / 1 右 / 2 下 / 3 左）
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
        floatTexts: [],
        // 大肥鱼托管：on 时每帧由 aiThink 接管输入（keys / mouse 不再生效）
        // level 决定瞄准误差/提前量/躲弹力度；aimErr 是每 8 帧刷新一次的瞄准抖动
        ai: { on: false, overT: 0, state: 'cruise', level: readLevel(), aimErr: 0 },
        // 本局强化数值（开局重置）
        mods: defaultMods(),
        // 三选一进行中：{ options: [id,id,id], t: 已等待帧数 }
        pick: null,
        // 桌宠解说：上次开口时的 S.time、历史最高分、本局是否已报过破纪录、是否已打过招呼
        petTalk: {
          last: -9999,
          bestScore: readBest(),
          recordTold: false,
          greeted: false,
          lastLine: '',
          kills: 0,
          killT: -9999,
          streak: 0,
          streakT: -9999,
          maxStreak: 0,
          lowHpTold: false,
          milestone: 0
        },
        // 本局结算结果（本机名次、新解锁成就），over 遮罩用它显示
        lastResult: null,
        // 连杀倍率：count 是 3 秒窗口内的连杀数，t 是上次击杀的 S.time，best 是本局最高倍率
        combo: { count: 0, mult: 1, t: -9999, best: 1 },
        // 摸摸大肥鱼：托管时点鱼身会冒爱心；每 3 下给 5 秒「加油」（射速 +25%）
        pet: { count: 0, last: -9999, wiggle: 0, buffT: 0, sinceCheer: 0, happyT: 0 }
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

      // HUD 用：本局已选强化，按 UPGRADE_IDS 顺序给出 [{id,count}]
      function upgradeSummary() {
        const list = [];
        for (const id of UPGRADE_IDS) {
          const count = S.mods.counts[id] || 0;
          if (count > 0) list.push({ id: id, count: count });
        }
        return list;
      }

      function syncHud(force) {
        const p = S.player;
        const key = S.phase + '|' + (S.paused ? 'paused' : 'run') + '|' + S.score + '|' + S.wave + '|' + Math.round(p.hp) + '|' + Math.round(p.maxHp) +
          '|' + (S.ai.on ? 'ai:' + S.ai.state : 'manual') + '|' + S.ai.level + '|' + S.speedMul + '|' + S.petTalk.bestScore +
          '|' + S.combo.count + ':' + S.combo.mult + '|' + S.mods.shieldCharges + ':' + S.mods.shieldMax +
          '|' + (S.pick ? S.pick.options.join(',') : '') +
          '|' + S.pet.count + ':' + (S.pet.buffT > 0 ? 'cheer' : '') +
          '|' + (readCalm() ? 'calm' : 'loud');
        if (!force && key === lastHudKey) return;
        lastHudKey = key;
        if (disposed) return;
        hudSink({
          phase: S.phase,
          paused: S.paused,
          score: S.score,
          wave: S.wave,
          hp: Math.max(0, Math.round(p.hp)),
          maxHp: p.maxHp,
          ai: S.ai.on,
          aiState: S.ai.state,
          best: Math.max(S.petTalk.bestScore, S.score),
          combo: S.combo.mult,
          comboCount: S.combo.count,
          comboBest: S.combo.best,
          // 观战设置：播放速度、AI 档位（持久化在 localStorage）
          speed: S.speedMul,
          level: S.ai.level,
          // 本局强化：护盾层数 + 已选强化（HUD 左下角小徽章）
          shield: S.mods.shieldCharges,
          shieldMax: S.mods.shieldMax,
          upgrades: upgradeSummary(),
          // 三选一：非空时组件弹选卡遮罩
          pick: S.pick ? { options: S.pick.options.slice() } : null,
          // 摸摸大肥鱼：本局被摸次数 / 「加油」buff 剩余（HUD 小徽章）
          pets: S.pet.count,
          petBuff: S.pet.buffT > 0,
          // 挂件表情与轻提示用：Boss 是否在场、本局是否刚破纪录
          boss: S.enemies.some(function (e) { return e.type === 'boss'; }),
          newRecord: S.petTalk.recordTold === true,
          // 安静摸鱼：组件据此把数字 HUD 换成一行小字
          calm: readCalm(),
          ambient: readAmbient(),
          // 结算信息：本机名次与新解锁成就（只在 over 时给）
          result: S.phase === 'over' ? S.lastResult : null
        });
      }

      function beginWave() {
        S.spawnQueue = 3 + S.wave * 2;
        S.spawnCD = 0;
        S.waveTimer = 0;
        S.bossPending = S.wave % 5 === 0; // 每 5 波来一只精英
        // 冲锋波：每 4 波（Boss 波除外）敌人从同一侧成排压上，提前给个警报
        S.chargeWave = S.wave % 4 === 0 && S.wave % 5 !== 0;
        if (S.chargeWave) S.chargeSide = Math.floor(Math.random() * 4);
      }

      // ------------------------------------------------------------------
      // 桌宠解说：单向、尽力而为地把战报说给 dsh-pet（大肥鱼）听。
      // 只在观战模式说话；桌宠不在、在睡觉、被占用或被静音时静默跳过。
      // ------------------------------------------------------------------
      function canPetTalk() {
        return typeof window === 'object' && window !== null &&
          typeof window.fetch === 'function' &&
          typeof window.location === 'object' && window.location !== null;
      }

      function petBroadcast(text) {
        if (!canPetTalk()) return;
        try {
          const pending = window.fetch(PET_BROADCAST_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ text: text, duration: PET_BUBBLE_MS, anim: true })
          });
          // 解说掉线不该在控制台里留一串未处理的 Promise 拒绝
          if (pending && typeof pending.catch === 'function') pending.catch(() => {});
        } catch (err) {
          // 请求被拦、fetch 被撤掉：都只是少一句解说
        }
      }

      // 把同一句战报念出来：请 dsh-pet 的 TTS 合成 mp3，再由本页播放。
      // 这一步绕开宠物自己的「播报总开关」（voiceEnabled，要用户手动开），
      // 用的是 dsh-pet 内置的 edge 音色；没网/合成失败只是没声音，气泡照旧。
      function petSpeak(text) {
        if (!text) return;
        if (readMuted()) return; // 点了静音就只留气泡文字
        if (!canPetTalk() || typeof window.Audio !== 'function' || !window.URL ||
          typeof window.URL.createObjectURL !== 'function') return;
        // 页面切到后台时不念：没人看，只白花一次合成
        if (typeof document === 'object' && document !== null && document.hidden) return;
        try {
          const pending = window.fetch(PET_VOICE_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ text: String(text).slice(0, PET_SPEAK_MAX) })
          });
          if (!pending || typeof pending.then !== 'function') return;
          pending.then((response) => {
            if (!response || !response.ok) return null;
            const type = response.headers && typeof response.headers.get === 'function'
              ? String(response.headers.get('content-type') || '')
              : '';
            if (type.indexOf('audio') < 0) return null;
            return typeof response.blob === 'function' ? response.blob() : null;
          }).then((blob) => {
            if (!blob) return;
            const url = window.URL.createObjectURL(blob);
            const audio = new window.Audio(url);
            audio.volume = 0.9;
            const entry = { audio: audio, url: url };
            audio.onended = () => {
              try { window.URL.revokeObjectURL(url); } catch (err) { /* 已释放 */ }
              if (petAudio === audio) petAudio = null;
              if (pendingSpeech !== null) {
                const next = pendingSpeech;
                pendingSpeech = null;
                playSpeech(next);
              }
            };
            audio.onerror = () => {
              try { window.URL.revokeObjectURL(url); } catch (err) { /* 已释放 */ }
              if (petAudio === audio) petAudio = null;
            };
            if (petAudio !== null && !petAudio.paused && !petAudio.ended) {
              // 上一句还在念：排队等它念完，别把半句话掐掉
              releaseSpeech(pendingSpeech);
              pendingSpeech = entry;
              return;
            }
            playSpeech(entry);
          }).catch(() => {});
        } catch (err) {
          // 请求被拦、Audio 不可用：都只是没声音
        }
      }

      // 安静摸鱼时换成温柔版台词：同样的战况，语气轻一点
      const CALM_LINES = {
        'game.report.wave': 'game.calm.wave',
        'game.report.death': 'game.calm.death',
        'game.report.deathBest': 'game.calm.deathBest',
        'game.report.boss': 'game.calm.boss',
        'game.report.record': 'game.calm.record',
        'game.report.charge': 'game.calm.charge'
      };

      // floor=0 表示无论如何都要说（阵亡这类关键时刻）
      function petTalk(key, params, floor) {
        if (!S.ai.on) return;
        if (S.time - S.petTalk.last < floor) return;
        const calmKey = calmMode ? CALM_LINES[key] : null;
        const lines = calmKey !== null && tLines(calmKey).length > 0 ? tLines(calmKey) : tLines(key);
        if (lines.length === 0) return;
        // 同一事件准备了几种说法：随机挑一句，并尽量避开上一句，免得连听两遍
        let text = lines[Math.floor(Math.random() * lines.length)];
        if (lines.length > 1 && text === S.petTalk.lastLine) {
          text = lines[(lines.indexOf(text) + 1) % lines.length];
        }
        if (params !== undefined) {
          for (const name of Object.keys(params)) text = text.split('{' + name + '}').join(String(params[name]));
        }
        S.petTalk.last = S.time;
        S.petTalk.lastLine = text;
        petBroadcast(text);
        petSpeak(text);
      }

      function petSay(key, params, urgent) {
        petTalk(key, params, urgent ? PET_TALK_FLOOR : PET_TALK_GAP);
      }

      // 阵亡解说：不参与间隔节流，玩家一定要听到这一句
      function petSayNow(key, params) {
        petTalk(key, params, 0);
      }

      // 本局第一次超过历史最高分时提前喊一声，别等到倒下才说
      function petCheckRecord() {
        if (S.petTalk.recordTold || S.petTalk.bestScore <= 0) return;
        if (S.score <= S.petTalk.bestScore) return;
        S.petTalk.recordTold = true;
        petSay('game.report.record', { score: S.score }, false);
      }

      function start() {
        unlockAudio(); // 开局这一拍通常是点击触发的，顺手把声音解锁
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
        p.maxHp = 100;
        p.hp = p.maxHp;
        p.dir = 0;
        // 局内强化每局清空，回到初始数值
        S.mods = defaultMods();
        p.speed = S.mods.speed;
        S.pick = null;
        S.chargeWave = false;
        p.fireCD = 0;
        p.dashCD = 0;
        p.dashT = 0;
        p.flash = 0;
        S.mouse.down = false;
        S.ai.overT = 0;
        S.ai.state = 'cruise';
        S.paused = false;
        S.petTalk.last = -9999;
        S.petTalk.recordTold = false;
        S.petTalk.kills = 0;
        S.petTalk.killT = -9999;
        S.petTalk.streak = 0;
        S.petTalk.streakT = -9999;
        S.petTalk.maxStreak = 0;
        S.petTalk.lowHpTold = false;
        S.petTalk.milestone = 0;
        S.combo.count = 0;
        S.combo.mult = 1;
        S.combo.t = -9999;
        S.combo.best = 1;
        S.pet.count = 0;
        S.pet.wiggle = 0;
        S.pet.buffT = 0;
        S.pet.sinceCheer = 0;
        S.pet.happyT = 0;
        S.lastResult = null;
        beginWave();
        syncHud(true);
        // 观战开新局时说一声；自动续局换成「我又回来了」
        if (S.ai.on) {
          if (!S.petTalk.greeted) {
            S.petTalk.greeted = true;
            petSay('game.report.start', undefined, true);
          } else {
            petSay('game.report.revive', undefined, true);
          }
        }
      }

      // 造一只敌人（血量随波次长；远程兵带包抄计时器）
      function makeEnemy(type, x, y) {
        const spec = TYPES[type];
        const hp = spec.hp + Math.floor(S.wave / 3);
        return {
          type: type,
          x: x,
          y: y,
          r: spec.r,
          hp: hp,
          maxHp: hp,
          speed: spec.speed,
          flash: 0,
          fireCD: Math.random() * 120,
          flankT: 160 + Math.random() * 140,
          flankDir: Math.random() < 0.5 ? 1 : -1
        };
      }

      // 从画面某一侧外面进场；冲锋波里同侧成排出现
      function sideSpawnPoint(side) {
        const W = view.W;
        const H = view.H;
        if (side === 0) return { x: Math.random() * W, y: -40 };
        if (side === 1) return { x: W + 40, y: Math.random() * H };
        if (side === 2) return { x: Math.random() * W, y: H + 40 };
        return { x: -40, y: Math.random() * H };
      }

      function spawnEnemy() {
        const roll = Math.random();
        let type = 'grunt';
        if (S.wave >= 2 && roll < 0.28) type = 'runner';
        if (S.wave >= 3 && roll > 0.78) type = 'gunner';
        if (S.wave >= 4 && roll > 0.93) type = 'tank';
        // 冲锋波固定从一侧压上，平时随机边
        const side = S.chargeWave ? S.chargeSide : Math.floor(Math.random() * 4);
        const point = sideSpawnPoint(side);
        S.enemies.push(makeEnemy(type, point.x, point.y));
        // 成组：冲锋波整排上；平时的 runner 也有三成概率结伴
        if (S.chargeWave || (type === 'runner' && Math.random() < 0.3)) {
          const packType = S.chargeWave ? 'runner' : type;
          const vertical = side === 1 || side === 3;
          for (let i = 0; i < 2; i++) {
            const off = (i + 1) * 46 * (i === 0 ? 1 : -1);
            const spawnX = vertical ? point.x : clamp(point.x + off, 24, Math.max(24, view.W - 24));
            const spawnY = vertical ? clamp(point.y + off, 24, Math.max(24, view.H - 24)) : point.y;
            S.enemies.push(makeEnemy(packType, spawnX, spawnY));
          }
        }
      }

      // Boss：从上方压场，血量随波次长；会蓄力冲锋 + 环形弹幕。
      function spawnBoss() {
        const spec = TYPES.boss;
        const W = view.W;
        const hp = spec.hp + Math.floor(S.wave / 2) * 6;
        S.enemies.push({
          type: 'boss',
          x: W / 2,
          y: -spec.r - 20,
          r: spec.r,
          hp: hp,
          maxHp: hp,
          speed: spec.speed,
          flash: 0,
          fireCD: 100,
          chargeCD: 170,
          chargeT: 0
        });
        S.shake = Math.max(S.shake, 10);
        addFloat(W / 2, view.H / 2 - 20, t('game.bossBanner', { n: S.wave }), C.red, 30);
        sfxPlay('wave');
        if (S.ai.on) petSay('game.report.boss', { wave: S.wave }, true);
      }

      function dash() {
        const p = S.player;
        if (S.phase !== 'playing' || p.dashCD > 0) return;
        p.dashT = 10;
        p.dashCD = S.mods.dashCD;
        sfxPlay('dash');
      }

      // 波次清空后弹三选一；池子里排除已经点满的强化
      function offerUpgrades() {
        if (S.pick !== null || S.phase !== 'playing') return;
        const pool = [];
        for (const item of UPGRADES) {
          if ((S.mods.counts[item.id] || 0) < item.max) pool.push(item.id);
        }
        if (pool.length === 0) return;
        const options = [];
        while (options.length < 3 && pool.length > 0) {
          options.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
        }
        S.pick = { options: options, t: 0 };
        sfxPlay('wave');
        syncHud(true);
      }

      function chooseUpgrade(id) {
        if (S.pick === null || S.pick.options.indexOf(id) < 0) return false;
        applyUpgrade(S.mods, S.player, id);
        S.player.speed = S.mods.speed;
        S.pick = null;
        sfxPlay('pickup');
        if (S.ai.on) petSay('game.report.upgrade', { name: t('game.up.' + id + '.name') }, false);
        syncHud(true);
        return true;
      }

      // 托管挑卡：按档位/血量/波次给权重，挑最高分那张
      function aiPickUpgrade() {
        if (S.pick === null || S.pick.options.length === 0) return null;
        const hpRatio = S.player.maxHp > 0 ? S.player.hp / S.player.maxHp : 1;
        let best = null;
        let bestWeight = -Infinity;
        for (const id of S.pick.options) {
          const weight = upgradeWeight(id, S.ai.level, hpRatio, S.wave);
          if (weight > bestWeight) {
            bestWeight = weight;
            best = id;
          }
        }
        return best;
      }

      // 播放速度：0.5× / 1× / 2×，写进 localStorage 方便下次接着用
      function setSpeed(mult) {
        const value = Number(mult);
        if (SPEEDS.indexOf(value) < 0) return S.speedMul;
        S.speedMul = value;
        writeSpeed(value);
        syncHud(true);
        return value;
      }

      function cycleSpeed() {
        const idx = SPEEDS.indexOf(S.speedMul);
        return setSpeed(SPEEDS[(idx + 1) % SPEEDS.length]);
      }

      // AI 档位：菜鸟 / 正常 / 宗师
      function setLevel(id) {
        if (LEVELS.indexOf(id) < 0) return S.ai.level;
        S.ai.level = id;
        writeLevel(id);
        syncHud(true);
        return id;
      }

      function cycleLevel() {
        const idx = LEVELS.indexOf(S.ai.level);
        return setLevel(LEVELS[(idx + 1) % LEVELS.length]);
      }

      // ------------------------------------------------------------------
      // AI pilot（大肥鱼托管）：每帧算一个「意图」，仍然走原有输入通道，
      // 这样手玩和托管共用同一套物理/开火/冲刺逻辑。mx/my 已归一化。
      // ------------------------------------------------------------------
      function aiThink() {
        const p = S.player;
        const W = view.W;
        const H = view.H;
        let mx = 0;
        let my = 0;
        let state = 'cruise';
        let dashNow = false;
        // 档位参数：菜鸟瞄得糙、不预判；宗师瞄得准、提前量偏大
        const LV = AI_LEVELS[S.ai.level] || AI_LEVELS.normal;

        // 1) 躲子弹：算最近接近点，往垂直于弹道的一侧滑步
        for (const b of S.eBullets) {
          const rx = p.x - b.x;
          const ry = p.y - b.y;
          const vv = b.vx * b.vx + b.vy * b.vy;
          if (vv <= 0) continue;
          const tt = (rx * b.vx + ry * b.vy) / vv;
          if (tt <= 0.5 || tt > 40) continue;
          const closest = Math.hypot(rx - b.vx * tt, ry - b.vy * tt);
          if (closest > p.r + 30) continue;
          const bs = Math.sqrt(vv);
          const ux = b.vx / bs;
          const uy = b.vy / bs;
          const side = rx * uy - ry * ux > 0 ? -1 : 1;
          const wgt = (1 - tt / 40) * 2.6 * LV.dodge;
          mx += -uy * side * wgt;
          my += ux * side * wgt;
          state = 'dodge';
          if (tt < 14 && closest < p.r + 20 && p.dashCD <= 0 && LV.dodge >= 1) dashNow = true;
        }

        // 2) 近战敌人：贴脸就退，中距离保持；顺便挑一个最值得打的目标
        let target = null;
        let targetScore = -Infinity;
        let nearMelee = null;
        let nearMeleeD = Infinity;
        for (const e of S.enemies) {
          const spec = TYPES[e.type];
          const ex = p.x - e.x;
          const ey = p.y - e.y;
          const d = Math.hypot(ex, ey) || 0.001;
          if (!spec.ranged) {
            if (d < nearMeleeD) { nearMeleeD = d; nearMelee = e; }
            const danger = e.r + p.r + 34;
            if (d < danger) {
              const wgt = (1 - d / danger) * 2.4;
              mx += (ex / d) * wgt;
              my += (ey / d) * wgt;
              state = 'retreat';
            } else if (d < 180) {
              mx += (ex / d) * 0.6;
              my += (ey / d) * 0.6;
            }
          }
          const weight = spec.ranged ? 1.5 : spec.score / 25;
          // 菜鸟只打最近的，正常/宗师按价值挑（远程兵优先）
          const score = LV.nearest === true ? 1 / (d + 1) : weight / (d + 90);
          if (d < 700 && score > targetScore) {
            targetScore = score;
            target = e;
          }
        }

        // 3) 别撞墙
        const edge = 88;
        if (p.x < edge) mx += ((edge - p.x) / edge) * 1.6;
        if (p.x > W - edge) mx -= ((p.x - (W - edge)) / edge) * 1.6;
        if (p.y < edge) my += ((edge - p.y) / edge) * 1.6;
        if (p.y > H - edge) my -= ((p.y - (H - edge)) / edge) * 1.6;

        // 4) 残血先吃血包
        if (p.hp < 78 && S.pickups.length > 0) {
          let best = null;
          let bestD = Infinity;
          for (const k of S.pickups) {
            const d = Math.hypot(k.x - p.x, k.y - p.y);
            if (d < bestD) { bestD = d; best = k; }
          }
          if (best !== null) {
            const d = Math.max(1, bestD);
            mx += ((best.x - p.x) / d) * 1.3;
            my += ((best.y - p.y) / d) * 1.3;
            state = 'heal';
          }
        }

        // 5) 侧向游走，别站桩当靶子；太远就往前压一点保持火力覆盖
        if (target !== null) {
          const ux = target.x - p.x;
          const uy = target.y - p.y;
          const d = Math.hypot(ux, uy) || 1;
          const orbit = S.time % 300 < 150 ? 1 : -1;
          mx += (-uy / d) * 0.45 * orbit;
          my += (ux / d) * 0.45 * orbit;
          if (d > 560) {
            mx += (ux / d) * 0.7;
            my += (uy / d) * 0.7;
          }
        }

        // 6) 空场时回中间，别缩在角落
        if (S.enemies.length === 0) {
          const cx = W / 2 - p.x;
          const cy = H / 2 - p.y;
          const cd = Math.hypot(cx, cy);
          if (cd > 40) {
            mx += (cx / cd) * 0.5;
            my += (cy / cd) * 0.5;
          }
        }

        // 7) 残血被围 → 冲刺脱离（冲刺有无敌帧）
        if (!dashNow && nearMelee !== null && nearMeleeD < 130 && p.hp < p.maxHp * LV.dashHp && p.dashCD <= 0) {
          dashNow = true;
          state = 'dash';
        }

        // 8) 瞄准：打提前量
        let aimX = S.mouse.x;
        let aimY = S.mouse.y;
        let fire = false;
        if (target !== null) {
          const spec = TYPES[target.type];
          const d = Math.hypot(target.x - p.x, target.y - p.y);
          const ang = Math.atan2(p.y - target.y, p.x - target.x);
          const lead = (d / 14) * LV.lead;
          aimX = target.x + Math.cos(ang) * spec.speed * lead;
          aimY = target.y + Math.sin(ang) * spec.speed * lead;
          fire = true;
          // 瞄准抖动：每 8 帧换一次，配合档位让菜鸟明显打不准
          if (LV.aimJitter > 0) {
            if (S.time % 8 === 0) S.ai.aimErr = (Math.random() - 0.5) * 2 * LV.aimJitter;
            const rx = aimX - p.x;
            const ry = aimY - p.y;
            const ca = Math.cos(S.ai.aimErr);
            const sa = Math.sin(S.ai.aimErr);
            aimX = p.x + rx * ca - ry * sa;
            aimY = p.y + rx * sa + ry * ca;
          }
        } else {
          aimX = p.x + Math.cos(S.time * 0.06) * 140;
          aimY = p.y + Math.sin(S.time * 0.06) * 140;
        }
        if (state === 'cruise' && target !== null) state = 'hunt';

        const len = Math.hypot(mx, my);
        if (len > 0.0001) { mx /= len; my /= len; } else { mx = 0; my = 0; }

        return { mx: mx, my: my, aimX: aimX, aimY: aimY, fire: fire, dash: dashNow, state: state };
      }

      function addFloat(x, y, text, color, size) {
        S.floatTexts.push({ x: x, y: y, text: text, color: color, size: size, life: 50 });
      }

      function hurtPlayer(dmg) {
        const p = S.player;
        if (S.phase !== 'playing') return;
        if (p.dashT > 0) return; // dash invulnerability frames
        // 鱼鳞护盾：有层数就直接吃掉这一下，然后开始充能
        if (S.mods.shieldCharges > 0) {
          S.mods.shieldCharges--;
          S.mods.shieldT = UPGRADE_SHIELD_COOLDOWN;
          p.flash = 10;
          S.shake = Math.max(S.shake, 6);
          addFloat(p.x, p.y - p.r - 20, t('game.shieldBlock'), C.ice, 16);
          sfxPlay('hit');
          syncHud(true);
          return;
        }
        p.hp -= dmg;
        p.flash = 10;
        S.shake = Math.max(S.shake, calmMode ? 2 : 8);
        sfxPlay('hurt');
        // 残血提醒：每局只说一次，免得一直念
        if (!S.petTalk.lowHpTold && p.hp > 0 && p.hp / p.maxHp < 0.35) {
          S.petTalk.lowHpTold = true;
          petSay('game.report.lowHp', undefined, false);
        }
        if (p.hp <= 0) {
          p.hp = 0;
          flushPetStats();
          S.phase = 'over';
          S.mouse.down = false;
          sfxPlay('over');
          const best = S.score > S.petTalk.bestScore;
          if (best) S.petTalk.bestScore = S.score;
          writeBest(S.score);
          // 本机结算：局数 +1、记排行榜、判定成就，全部只写本机存储
          const runs = readRuns() + 1;
          writeRuns(runs);
          const rank = recordLeaderboard(S.score, S.wave);
          const unlocked = unlockAchievements({
            score: S.score,
            wave: S.wave,
            kills: S.petTalk.kills,
            maxStreak: S.petTalk.maxStreak,
            ai: S.ai.on,
            runs: runs
          });
          S.lastResult = { rank: rank, runs: runs, unlocked: unlocked, best: S.petTalk.bestScore };
          // 本局没提前喊过纪录就用「破纪录」的台词，否则报普通阵亡
          petSayNow(best && !S.petTalk.recordTold ? 'game.report.deathBest' : 'game.report.death',
            { wave: S.wave, score: S.score });
          syncHud(true);
        }
      }

      function update() {
        const p = S.player;
        const W = view.W;
        const H = view.H;
        // 三选一进行中：冻结模拟；托管时等 40 帧再按权重自己挑一张
        if (S.pick !== null) {
          S.pick.t++;
          if (S.ai.on && S.pick.t >= PICK_DELAY_AI) {
            const pickId = aiPickUpgrade();
            if (pickId !== null) chooseUpgrade(pickId);
          }
          return;
        }
        S.time++;
        if (p.dashCD > 0) p.dashCD--;
        if (p.flash > 0) p.flash--;
        if (S.shake > 0) S.shake *= 0.85;
        // 护盾充能：每 10 秒回一格（有强化才有护盾）
        if (S.mods.shieldMax > 0 && S.mods.shieldCharges < S.mods.shieldMax) {
          S.mods.shieldT--;
          if (S.mods.shieldT <= 0) {
            S.mods.shieldCharges++;
            S.mods.shieldT = UPGRADE_SHIELD_COOLDOWN;
            addFloat(p.x, p.y - p.r - 18, t('game.shieldBack'), C.ice, 14);
            syncHud(true);
          }
        }
        // 连杀计数只在击杀密集时有效：3 秒没打死人就归零
        if (S.petTalk.streak > 0 && S.time - S.petTalk.killT > 180) S.petTalk.streak = 0;
        // 连杀窗口过期：倍率回到 ×1（HUD 的连杀徽章随之消失）
        if (S.combo.count > 0 && S.time - S.combo.t > COMBO_WINDOW + S.mods.comboBonus) {
          S.combo.count = 0;
          S.combo.mult = 1;
        }
        // 「加油」buff 与摸头扭动的剩余帧数
        if (S.pet.buffT > 0) S.pet.buffT--;
        if (S.pet.wiggle > 0) S.pet.wiggle--;
        if (S.pet.happyT > 0) S.pet.happyT--;

        let dx = 0;
        let dy = 0;
        if (S.ai.on) {
          const intent = aiThink();
          dx = intent.mx;
          dy = intent.my;
          S.mouse.x = intent.aimX;
          S.mouse.y = intent.aimY;
          S.mouse.down = intent.fire;
          S.ai.state = intent.state;
          if (intent.dash) dash();
        } else {
          if (S.keys.w || S.keys.W) dy -= 1;
          if (S.keys.s || S.keys.S) dy += 1;
          if (S.keys.a || S.keys.A) dx -= 1;
          if (S.keys.d || S.keys.D) dx += 1;
        }
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
          // 被摸了三下会开心 5 秒：射速 +25%
          p.fireCD = S.pet.buffT > 0 ? Math.max(3, Math.round(S.mods.fireCD / 1.25)) : S.mods.fireCD;
          // 双管齐射：shots 越多扇面越宽，单发也带伤害/穿透强化
          const shots = S.mods.shots;
          for (let s = 0; s < shots; s++) {
            const offset = shots === 1 ? 0 : (s - (shots - 1) / 2) * S.mods.spread;
            const a = p.dir + offset + (Math.random() - 0.5) * 0.1;
            S.bullets.push({
              x: p.x + Math.cos(a) * 20,
              y: p.y + Math.sin(a) * 20,
              vx: Math.cos(a) * 14,
              vy: Math.sin(a) * 14,
              life: 70,
              dmg: S.mods.dmg,
              pierce: S.mods.pierce,
              hit: []
            });
          }
          const muzzle = p.dir;
          for (let i = 0; i < 3; i++) {
            S.particles.push({
              x: p.x + Math.cos(muzzle) * 24,
              y: p.y + Math.sin(muzzle) * 24,
              r: 4, life: 8, max: 8, color: C.gold,
              vx: Math.cos(muzzle) * 3 + (Math.random() - 0.5) * 2,
              vy: Math.sin(muzzle) * 3 + (Math.random() - 0.5) * 2
            });
          }
          S.shake = Math.max(S.shake, 3);
          sfxPlay('shoot');
        }

        // spawn / wave progression
        S.waveTimer++;
        if (S.bossPending) {
          S.bossPending = false;
          spawnBoss();
        }
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
          sfxPlay('wave');
          addFloat(W / 2, H / 2 - 60, t('game.waveBanner', { n: S.wave }), C.gold, 26);
          // 冲锋波警报：敌人会从同一侧成排压上
          if (S.chargeWave) {
            addFloat(W / 2, H / 2 - 96, t('game.chargeBanner', { n: S.wave }), C.orange, 24);
            if (S.ai.on) petSay('game.report.charge', { wave: S.wave }, true);
          }
          // 解说只在偶数波念一句：每波都念太吵，隔一波刚好（用 urgent 保证不被上一句挤掉）
          if (S.wave % 2 === 0) petSay('game.report.wave', { wave: S.wave }, true);
          // 每清两波给一次三选一强化（第 1 波开场不给）
          if (S.wave % 2 === 0) offerUpgrades();
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

          if (spec.boss) {
            // 蓄力冲锋：隔一阵加速撞过来，撞上伤害高
            e.chargeCD--;
            if (e.chargeCD <= 0 && dist < 620) {
              e.chargeCD = 240;
              e.chargeT = 38;
              S.shake = Math.max(S.shake, 6);
              sfxPlay('dash');
            }
            if (e.chargeT > 0) e.chargeT--;
            const spd = e.speed * (e.chargeT > 0 ? 6 : 1);
            if (dist > e.r + p.r - 6) {
              e.x += Math.cos(ang) * spd;
              e.y += Math.sin(ang) * spd;
            }
            // 环形弹幕
            e.fireCD--;
            if (e.fireCD <= 0) {
              e.fireCD = 200;
              const shots = 8;
              for (let i = 0; i < shots; i++) {
                const a = ang + (Math.PI * 2 * i) / shots;
                S.eBullets.push({ x: e.x, y: e.y, vx: Math.cos(a) * 4.2, vy: Math.sin(a) * 4.2, life: 220 });
              }
              sfxPlay('shoot');
            }
            if (dist < e.r + p.r) {
              hurtPlayer(spec.dmg);
              const push = Math.atan2(e.y - p.y, e.x - p.x);
              e.x += Math.cos(push) * 40;
              e.y += Math.sin(push) * 40;
            }
          } else if (spec.ranged) {
            const keep = 260;
            const move = dist > keep + 40 ? 1 : dist < keep - 40 ? -0.6 : 0;
            e.x += Math.cos(ang) * e.speed * move;
            e.y += Math.sin(ang) * e.speed * move;
            // 包抄：隔一阵换一侧横移，逼玩家转枪口，不再只是站桩对射
            e.flankT--;
            if (e.flankT <= 0) {
              e.flankT = 180 + Math.random() * 140;
              e.flankDir = -e.flankDir;
            }
            e.x += Math.cos(ang + Math.PI / 2) * e.speed * 0.55 * e.flankDir;
            e.y += Math.sin(ang + Math.PI / 2) * e.speed * 0.55 * e.flankDir;
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
              // 穿透弹：同一颗子弹不重复打同一只，穿完 pierce 次才消失
              if (b.hit !== undefined && b.hit.indexOf(e) >= 0) continue;
              if (b.hit !== undefined) b.hit.push(e);
              e.hp -= b.dmg !== undefined ? b.dmg : 1;
              e.flash = 6;
              if (b.pierce !== undefined && b.pierce > 0) b.pierce--;
              else b.life = 0;
              if (e.hp > 0) sfxPlay('hit');
              for (let i = 0; i < 5; i++) {
                S.particles.push({
                  x: b.x, y: b.y, r: 3, life: 14, max: 14, color: C.redSoft,
                  vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5
                });
              }
              if (e.hp <= 0) {
                const spec = TYPES[e.type];
                // 连杀倍率：3 秒内接着杀，3 连 ×2、6 连 ×3
                S.combo.count = S.time - S.combo.t <= COMBO_WINDOW + S.mods.comboBonus ? S.combo.count + 1 : 1;
                S.combo.t = S.time;
                S.combo.mult = comboMultiplier(S.combo.count);
                if (S.combo.mult > S.combo.best) S.combo.best = S.combo.mult;
                const gain = spec.score * S.combo.mult;
                sfxPlay('kill');
                S.score += gain;
                S.petTalk.kills++;
                S.petTalk.killT = S.time;
                if (S.petTalk.kills === 1) petSay('game.report.firstBlood', undefined, false);
                S.petTalk.streak++;
                if (S.petTalk.streak > S.petTalk.maxStreak) S.petTalk.maxStreak = S.petTalk.streak;
                // 连杀只在「短时间五杀」且距上次夸过 20 秒以上才念，否则太啰嗦
                if (S.petTalk.streak >= 5 && S.time - S.petTalk.streakT > 1200) {
                  S.petTalk.streak = 0;
                  S.petTalk.streakT = S.time;
                  petSay('game.report.streak', undefined, false);
                }
                if (S.score >= S.petTalk.milestone + 1000) {
                  S.petTalk.milestone = Math.floor(S.score / 1000) * 1000;
                  petSay('game.report.milestone', { score: S.petTalk.milestone }, false);
                }
                petCheckRecord();
                if (spec.boss) {
                  // 击杀精英：大震动 + 必掉两个血包 + 解说报一句
                  S.shake = Math.max(S.shake, 18);
                  addFloat(e.x, e.y - e.r - 14, t('game.bossDown'), C.gold, 20);
                  if (S.ai.on) petSay('game.report.bossDown', { wave: S.wave }, true);
                  S.pickups.push({ x: e.x - 24, y: e.y, r: 10, life: 600 });
                  S.pickups.push({ x: e.x + 24, y: e.y, r: 10, life: 600 });
                }
                addFloat(e.x, e.y - e.r, '+' + gain + (S.combo.mult > 1 ? ' ×' + S.combo.mult : ''), C.gold, 16);
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
          if (Math.hypot(pickup.x - p.x, pickup.y - p.y) < pickup.r + p.r + S.mods.magnet) {
            p.hp = Math.min(p.maxHp, p.hp + 30);
            sfxPlay('pickup');
            addFloat(pickup.x, pickup.y - 16, '+30 HP', C.green, 16);
            // 只有真的掉了血才值得一提
            if (p.hp < p.maxHp) petSay('game.report.heal', undefined, false);
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
            if (spec.boss) {
              // 精英多一圈金边，跟杂兵区分开
              g.strokeStyle = C.gold;
              g.lineWidth = 3;
              g.beginPath();
              g.arc(0, 0, e.r - 9, 0, Math.PI * 2);
              g.stroke();
            }
            g.restore();
            if (e.hp < e.maxHp) {
              g.fillStyle = 'rgba(0,0,0,0.5)';
              g.fillRect(e.x - e.r, e.y - e.r - 10, e.r * 2, 4);
              g.fillStyle = C.red;
              g.fillRect(e.x - e.r, e.y - e.r - 10, e.r * 2 * (e.hp / e.maxHp), 4);
            }
          }

          // Boss 血条：屏幕上沿中间，观战时一眼看到还剩多少
          const boss = S.enemies.find((e) => TYPES[e.type].boss);
          if (boss) {
            const barW = Math.min(380, view.W * 0.56);
            const barX = (view.W - barW) / 2;
            const barY = 84;
            g.fillStyle = 'rgba(0,0,0,0.45)';
            g.fillRect(barX - 2, barY - 2, barW + 4, 14);
            g.fillStyle = '#ff4b63';
            g.fillRect(barX, barY, barW * Math.max(0, boss.hp / boss.maxHp), 10);
            g.font = '700 11px ' + FONT;
            g.textAlign = 'center';
            g.fillStyle = C.redSoft;
            g.fillText(t('game.bossLabel'), view.W / 2, barY - 8);
          }

          // player：大肥鱼本体（被摸时眯眼开心）
          if (live) {
            drawPetFish(g, p.x, p.y, p.dir, S.time, p.flash, S.pet.wiggle, S.pet.happyT > 0 ? 'happy' : null);
            if (S.ai.on) {
              g.font = '600 12px ' + FONT;
              g.textAlign = 'center';
              g.fillStyle = 'rgba(232, 236, 245, 0.92)';
              g.fillText(t('game.petName'), p.x, p.y - p.r - 14);
              g.font = '11px ' + FONT;
              g.fillStyle = C.ice;
              g.fillText(t('game.state.' + S.ai.state), p.x, p.y + p.r + 20);
            }

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

      function frame(ts) {
        raf = window.requestAnimationFrame(frame);
        // rAF 时间戳：离线测试桩不带参数，就按一帧 60Hz 记，保持行为一致。
        const now = typeof ts === 'number' && isFinite(ts) ? ts : lastTs + STEP_MS;
        if (lastTs === 0) lastTs = now;
        // 切后台回来时别一次补算太多帧，最多补 250ms；再乘播放速度（0.5×/1×/2×）
        acc += Math.min(250, Math.max(0, now - lastTs)) * S.speedMul;
        lastTs = now;
        let steps = 0;
        while (acc >= STEP_MS && steps < 5) {
          acc -= STEP_MS;
          steps++;
          if (S.phase === 'playing') {
            if (!S.paused) update();
          } else if (S.phase === 'over' && S.ai.on) {
            // 观战模式：倒下后自动续一局，别让观众等太久
            S.ai.overT++;
            if (S.ai.overT > 150) start();
          }
        }
        if (renderOn) draw();
        syncHud(false);
      }

      function startLoop() {
        if (raf !== 0 || disposed) return;
        lastTs = 0;
        acc = 0;
        raf = window.requestAnimationFrame(frame);
      }

      function destroy() {
        disposed = true;
        if (raf !== 0) window.cancelAnimationFrame(raf);
        raf = 0;
        if (petAudio) {
          try { petAudio.pause(); } catch (err) { /* 卸载时静默 */ }
          petAudio = null;
        }
        if (pendingSpeech !== null) {
          releaseSpeech(pendingSpeech);
          pendingSpeech = null;
        }
      }

      function keyDown(event) {
        if (S.ai.on || S.paused) return; // 托管中或暂停中，玩家输入不干扰
        if (event.key === 'Shift') {
          dash();
          return;
        }
        const key = event.key.toLowerCase();
        if (key === 'w' || key === 'a' || key === 's' || key === 'd') S.keys[key] = true;
      }

      function keyUp(event) {
        if (S.ai.on) return;
        S.keys[event.key.toLowerCase()] = false;
      }

      function releaseAll() {
        S.keys = Object.create(null);
        S.mouse.down = false;
      }

      function pointerMove(event) {
        if (S.ai.on) return;
        const rect = canvas.getBoundingClientRect();
        S.mouse.x = event.clientX - rect.left;
        S.mouse.y = event.clientY - rect.top;
      }

      function pointerDown(event) {
        if (S.paused) return;
        if (S.ai.on) {
          // 托管时鼠标不参与战斗，但可以点鱼身摸摸它
          petFishAt(event);
          return;
        }
        pointerMove(event);
        if (event.button === 0 || event.button === undefined) S.mouse.down = true;
      }

      // 摸摸大肥鱼：点中鱼身就冒爱心、扭一下；每 3 下给 5 秒「加油」（射速 +25%）
      // petFish() 是纯逻辑版，桌面挂件里点小鱼也走这里（不需要命中判定）
      // 把这一局摸鱼/观战数据并进本机统计：阵亡或手动退出时各记一次
      function flushPetStats() {
        if (S.phase !== 'playing') return;
        const pets = S.pet.count;
        const seconds = Math.round(S.time / 60);
        if (pets <= 0 && seconds <= 0) return;
        const stats = readPetStats();
        const day = todayKey();
        if (stats.day !== day) {
          stats.day = day;
          stats.todayPets = 0;
          stats.todaySeconds = 0;
        }
        stats.todayPets += pets;
        stats.todaySeconds += seconds;
        stats.totalPets += pets;
        stats.totalSeconds += seconds;
        stats.bestCombo = Math.max(stats.bestCombo, S.combo.best);
        writeStored(PET_STATS_KEY, stats);
      }

      function petFish(head) {
        if (S.phase !== 'playing' || S.paused) return false;
        const p = S.player;
        S.pet.count++;
        S.pet.last = S.time;
        S.pet.wiggle = 14;
        // 摸头顶：眯眼开心一会儿；摸身上：普通扭动
        if (head === true) S.pet.happyT = 90;
        S.pet.sinceCheer++;
        sfxPlay('pet');
        const hearts = head === true ? 4 : 3;
        for (let i = 0; i < hearts; i++) {
          addFloat(p.x + (Math.random() - 0.5) * 30, p.y - p.r - 12 - Math.random() * 10, '♥',
            i === 0 ? '#ff8fbf' : '#ff5f9e', 13 + Math.floor(Math.random() * 6));
        }
        if (S.pet.sinceCheer >= 3) {
          S.pet.sinceCheer = 0;
          S.pet.buffT = 300; // 5 秒
          sfxPlay('cheer');
          addFloat(p.x, p.y - p.r - 34, t('game.petCheer'), C.gold, 18);
          if (S.ai.on) petSay('game.report.pet', { n: S.pet.count }, false);
        }
        syncHud(true);
        return true;
      }

      function petFishAt(event) {
        if (S.phase !== 'playing' || S.paused) return;
        const p = S.player;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (Math.hypot(x - p.x, y - p.y) > p.r + 22) return;
        // 换算到鱼的本地坐标，判断摸的是头还是身子（鱼头朝 +x）
        const dx = x - p.x;
        const dy = y - p.y;
        const cos = Math.cos(-p.dir);
        const sin = Math.sin(-p.dir);
        const localX = dx * cos - dy * sin;
        petFish(localX > 8);
      }

      function pointerUp() {
        S.mouse.down = false;
      }

      // 暂停：只冻结模拟（update 不再跑），画面、HUD 和连杀计时都停在原地。
      // 观战时托管也一起停；继续后从暂停处接着打。
      function pause() {
        if (S.phase !== 'playing' || S.paused) return;
        S.paused = true;
        releaseAll();
        // 正在念的战报也一起停，别让暂停时耳边还在说话
        if (petAudio) {
          try { petAudio.pause(); } catch (err) { /* 静默 */ }
        }
        syncHud(true);
      }

      function resume() {
        if (!S.paused) return;
        S.paused = false;
        // 暂停时掐断的那句话，继续后接着念完
        if (petAudio && petAudio.paused && !petAudio.ended) {
          const playing = petAudio.play();
          if (playing && typeof playing.catch === 'function') playing.catch(() => {});
        }
        syncHud(true);
      }

      function togglePause() {
        if (S.paused) {
          resume();
        } else {
          pause();
        }
      }

      // 退出这一局，回到开始界面。本局分数作废，历史最高分和本机存档不动。
      function exitGame() {
        if (S.phase === 'idle') return;
        flushPetStats();
        S.phase = 'idle';
        S.paused = false;
        S.score = 0;
        S.wave = 1;
        S.waveTimer = 0;
        S.spawnQueue = 0;
        S.spawnCD = 0;
        S.bossPending = false;
        S.time = 0;
        S.shake = 0;
        S.bullets = [];
        S.enemies = [];
        S.eBullets = [];
        S.particles = [];
        S.pickups = [];
        S.floatTexts = [];
        S.combo.count = 0;
        S.combo.mult = 1;
        S.combo.t = -9999;
        S.combo.best = 1;
        S.lastResult = null;
        S.mods = defaultMods();
        S.pick = null;
        S.chargeWave = false;
        S.player.maxHp = 100;
        S.player.speed = S.mods.speed;
        S.pet.count = 0;
        S.pet.wiggle = 0;
        S.pet.buffT = 0;
        S.pet.sinceCheer = 0;
        S.pet.happyT = 0;
        S.ai.on = false;
        S.ai.overT = 0;
        S.ai.state = 'cruise';
        S.petTalk.streak = 0;
        S.petTalk.streakT = -9999;
        S.petTalk.maxStreak = 0;
        S.petTalk.last = -9999;
        S.petTalk.lastLine = '';
        releaseAll();
        syncHud(true);
      }

      function setAI(on) {
        S.ai.on = on === true;
        S.ai.overT = 0;
        S.ai.state = 'cruise';
        S.mouse.down = false;
        S.keys = Object.create(null);
        if (S.ai.on) S.petTalk.greeted = false; // 每次重新接管都先打个招呼
        syncHud(true);
      }

      // 只给离线脚本读数用：正式运行时组件不会调用它。
      function debugState() {
        const boss = S.enemies.find((e) => TYPES[e.type].boss) || null;
        return {
          phase: S.phase,
          paused: S.paused,
          time: S.time,
          wave: S.wave,
          score: S.score,
          ai: S.ai.on,
          best: S.petTalk.bestScore,
          runs: readRuns(),
          result: S.lastResult,
          skin: readSkin(),
          combo: S.combo.mult,
          comboCount: S.combo.count,
          comboBest: S.combo.best,
          boss: boss ? { hp: boss.hp, maxHp: boss.maxHp } : null,
          speed: S.speedMul,
          level: S.ai.level,
          mods: S.mods,
          pick: S.pick ? S.pick.options.slice() : null,
          chargeWave: S.chargeWave,
          pet: { count: S.pet.count, buff: S.pet.buffT > 0, happy: S.pet.happyT > 0 },
          player: { x: Math.round(S.player.x), y: Math.round(S.player.y) }
        };
      }

      // 换皮肤：组件点按钮时调用；没解锁会返回 false 并保持原皮肤。
      function chooseSkin(id) {
        const ok = setSkin(id);
        if (ok) syncHud(true);
        return ok;
      }

      return {
        resize: resize,
        start: start,
        startLoop: startLoop,
        destroy: destroy,
        setAI: setAI,
        setSkin: chooseSkin,
        pause: pause,
        resume: resume,
        togglePause: togglePause,
        exitGame: exitGame,
        chooseUpgrade: chooseUpgrade,
        setSpeed: setSpeed,
        cycleSpeed: cycleSpeed,
        setLevel: setLevel,
        cycleLevel: cycleLevel,
        keyDown: keyDown,
        keyUp: keyUp,
        releaseAll: releaseAll,
        pointerMove: pointerMove,
        pointerDown: pointerDown,
        pointerUp: pointerUp,
        // 后台挂件用：把 HUD 换个去处（React → DOM），并在收回时强制重发一帧
        canvas: canvas,
        // 挂件里点小鱼：不用命中判定，直接摸一下；暂停/非对局时返回 false
        pet: petFish,
        setHudSink: function (sink) {
          hudSink = typeof sink === 'function' ? sink : function () {};
        },
        syncHud: syncHud,
        // 挂件形态切换用：小鱼形态省 CPU（只跳过绘制），声音只压音效
        setRender: setRender,
        setSfxSilence: setSfxSilence,
        // 待机小鱼的 96px 缩略画面（挂件定时调用，用当前皮肤和状态）
        drawPetThumb: drawPetThumb,
        // 安静摸鱼：低刺激模式 + 很轻的水族箱底噪
        setCalm: function (next) {
          const on = setCalmMode(next);
          // 安静下来的时候顺手放慢节奏：还在 1× 就切到 0.5×（自己选过的速度不动）
          if (on === true && S.speedMul === 1) setSpeed(0.5);
          syncHud(true);
          return on;
        },
        readCalm: readCalm,
        setAmbient: function (next) {
          writeAmbient(next === true);
          const on = setAmbient(next === true);
          syncHud(true);
          return on;
        },
        readAmbient: readAmbient,
        // 摸头顶会眯眼开心：离线脚本可以验证这个状态
        petHead: function () { return petFish(true); },
        // 仅给离线脚本用：直接扣血，方便确定性地打出阵亡结算
        debugDamage: hurtPlayer,
        debugState: debugState
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

    // 托管时鼠标不参与战斗，光标改成手型提示「可以摸鱼」
    const canvasPetStyle = Object.assign({}, canvasStyle, { cursor: 'pointer' });

    // 大屏观战：整个面板浮到视口上层，stage 自动占满剩余空间，canvas 跟着变大
    const expandStyle = Object.assign({}, panelStyle, {
      position: 'fixed',
      inset: '0',
      zIndex: '80',
      minHeight: '0',
      background: 'rgba(9, 11, 22, 0.97)'
    });

    // 摸鱼小窗：缩成可拖动的角落小窗，代替「大屏」方便一边干活一边看鱼打
    const MINI_W = 300;
    const MINI_H = 236;
    const miniPanelStyle = {
      position: 'fixed',
      width: MINI_W + 'px',
      height: MINI_H + 'px',
      zIndex: '85',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '10px',
      border: '1px solid rgba(120, 180, 255, 0.35)',
      background: 'rgba(9, 11, 22, 0.97)',
      boxShadow: '0 18px 40px rgba(0, 0, 0, 0.45)',
      overflow: 'hidden'
    };
    const miniHeaderStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px',
      padding: '6px 8px',
      cursor: 'move',
      borderBottom: '1px solid rgba(120, 180, 255, 0.18)'
    };

    // ------------------------------------------------------------------
    // 后台常驻浮窗：切到别的面板（比如去干活）时，引擎不销毁，
    // 画布被搬到右下角的小浮窗里继续打；回来点「回到面板」再搬回去。
    // 一局因此不会因为换面板而中断重开。
    // ------------------------------------------------------------------
    // 像 dsh-pet 一样常驻在页面角落：默认缩成一只小鱼，随时点一点摸摸它，
    // 又不挡着底下干活（容器 pointer-events: none，只有小鱼和按钮能点）。
    // 双击小鱼展开成摸鱼窗看画面，拖动标题栏换位置，位置和形态会记住。
    const FLOAT_W = 320;
    const FLOAT_H = 236;
    const FISH_W = 96;
    // 小鱼三档尺寸：小 / 中 / 大（都记在 dsh-shooter:desk 里）
    const FISH_SIZES = { sm: 64, md: FISH_W, lg: 128 };
    const DESK_KEY = 'dsh-shooter:desk'; // { right, bottom, mode: 'fish' | 'card', size: 'sm' | 'md' | 'lg' }
    let layoutApi = null; // apply() 里拿到的 ctx.layout，浮窗「回到面板」用
    let liveGame = null; // 跨面板挂载复用的引擎实例
    let liveCanvas = null; // 引擎正在用的画布（面板里就是 React 渲染的那块）
    let liveReactCanvas = null; // 面板渲染的 canvas：被浮窗接管后隐藏，避免两块画布
    let liveFloat = null; // { host, card, box, fish, stat, hud, title, pauseBtn, muteBtn, desk }
    let floatToken = 0; // 取消「已经安排但还没执行」的浮窗动作
    let floatPointerBound = false;

    function readDesk() {
      const raw = readStored(DESK_KEY);
      const state = raw !== null && typeof raw === 'object' ? raw : {};
      const right = Number(state.right);
      const bottom = Number(state.bottom);
      return {
        right: isFinite(right) ? clamp(right, 4, 2000) : 18,
        bottom: isFinite(bottom) ? clamp(bottom, 4, 2000) : 18,
        mode: state.mode === 'card' ? 'card' : 'fish',
        size: state.size === 'sm' || state.size === 'lg' ? state.size : 'md'
      };
    }

    function deskFishSize(desk) {
      return FISH_SIZES[desk !== null && desk.size === 'sm' ? 'sm' : desk !== null && desk.size === 'lg' ? 'lg' : 'md'] || FISH_W;
    }

    // 摸鱼统计：今天摸了几下、看了多久、最高连杀。只记本机，不上传。
    const PET_STATS_KEY = 'dsh-shooter:petstats';
    function todayKey() {
      const d = new Date();
      const pad = function (n) { return n < 10 ? '0' + n : String(n); };
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    function readPetStats() {
      const raw = readStored(PET_STATS_KEY);
      const state = raw !== null && typeof raw === 'object' ? raw : {};
      const count = function (v) {
        const n = Number(v);
        return isFinite(n) && n > 0 ? Math.floor(n) : 0;
      };
      return {
        day: typeof state.day === 'string' ? state.day : todayKey(),
        todayPets: count(state.todayPets),
        todaySeconds: count(state.todaySeconds),
        totalPets: count(state.totalPets),
        totalSeconds: count(state.totalSeconds),
        bestCombo: count(state.bestCombo)
      };
    }


    function floatPointerDown(event) {
      if (liveGame === null) return;
      liveGame.pointerDown(event);
    }

    function floatPointerMove(event) {
      if (liveGame === null) return;
      liveGame.pointerMove(event);
    }

    function floatPointerUp() {
      if (liveGame === null) return;
      liveGame.pointerUp();
    }

    // 引擎画布不是 React 渲染的那块时（被浮窗接管过），指针事件得自己绑
    function bindLivePointer() {
      if (floatPointerBound || liveCanvas === null || liveCanvas === liveReactCanvas) return;
      liveCanvas.addEventListener('pointerdown', floatPointerDown);
      liveCanvas.addEventListener('pointermove', floatPointerMove);
      liveCanvas.addEventListener('pointerup', floatPointerUp);
      floatPointerBound = true;
    }

    function unbindLivePointer() {
      if (!floatPointerBound) return;
      if (liveCanvas !== null) {
        liveCanvas.removeEventListener('pointerdown', floatPointerDown);
        liveCanvas.removeEventListener('pointermove', floatPointerMove);
        liveCanvas.removeEventListener('pointerup', floatPointerUp);
      }
      floatPointerBound = false;
    }

    // 挂件里的小气泡：抬手不打字的时候，也能看到它在说话
    let bubbleTimer = 0;

    function deskBubble(text, ms) {
      if (liveFloat === null || liveFloat.bubble === null) return;
      if (typeof text !== 'string' || text === '') return;
      liveFloat.bubble.textContent = text;
      liveFloat.bubble.style.opacity = '1';
      if (bubbleTimer !== 0 && typeof window.clearTimeout === 'function') window.clearTimeout(bubbleTimer);
      bubbleTimer = typeof window.setTimeout === 'function'
        ? window.setTimeout(function () {
          if (liveFloat !== null && liveFloat.bubble !== null) liveFloat.bubble.style.opacity = '0';
        }, ms || 2000)
        : 0;
    }

    // 从多版本台词里随机抽一句（语言包已把数组拍平成 LINE_SEP 字符串）
    function deskLine(key) {
      const lines = tLines(key);
      if (lines.length === 0) return '';
      return lines[Math.floor(Math.random() * lines.length)];
    }

    function deskSay(key, ms) {
      const line = deskLine(key);
      if (line !== '') deskBubble(line, ms);
    }

    function pulseFish() {
      if (liveFloat === null || liveFloat.fish === null) return;
      liveFloat.fish.style.transform = 'scale(1.14)';
      if (typeof window.setTimeout === 'function') {
        window.setTimeout(function () {
          if (liveFloat !== null && liveFloat.fish !== null) liveFloat.fish.style.transform = '';
        }, 200);
      }
    }

    // 挂件里的 HUD：没有 React，直接写 textContent
    function updateFloatHud(payload) {
      if (liveFloat === null) return;
      if (liveFloat.title !== null) {
        liveFloat.title.textContent = payload.phase === 'idle'
          ? t('game.floatIdle')
          : t('game.floatTitle', { wave: payload.wave, score: payload.score });
      }
      if (liveFloat.hud !== null) {
        liveFloat.hud.textContent = payload.paused
          ? t('game.floatPaused')
          : t('game.floatHud', { score: payload.score, wave: payload.wave, hp: payload.hp });
      }
      if (liveFloat.stat !== null) liveFloat.stat.textContent = payload.phase === 'idle' ? '' : String(payload.score);
      if (liveFloat.pauseBtn !== null) liveFloat.pauseBtn.textContent = payload.paused ? '▶' : '⏸';
      if (liveFloat.muteBtn !== null) liveFloat.muteBtn.textContent = readMuted() ? '🔇' : '🔊';

      // 缩略画布不可用时才退回 emoji；正常情况小鱼由 drawPetThumb 画真身
      if (liveFloat.face !== null && liveFloat.thumb === null) {
        const dizzy = liveFloat.dizzyUntil > nowMs();
        const face = payload.phase === 'idle' ? '🐟'
          : dizzy ? '😵‍💫'
          : payload.boss === true ? '😰'
          : payload.hp * 3 <= payload.maxHp ? '😣'
          : payload.petBuff === true ? '💪'
          : payload.combo > 1 ? '😤'
          : payload.aiState === 'heal' ? '😋'
          : '🐟';
        liveFloat.face.textContent = face;
      }

      // 轻提示：阵亡、Boss 登场、破纪录——抖一下 + 一句话，不吵但不会错过
      const last = liveFloat.last;
      if (last !== null) {
        if (payload.phase === 'over' && last.phase === 'playing') {
          deskSay('game.desk.dead', 2600);
          pulseFish();
        } else if (payload.boss === true && last.boss !== true) {
          deskSay('game.desk.boss', 2400);
          pulseFish();
        } else if (payload.newRecord === true && last.record !== true) {
          deskSay('game.desk.record', 2400);
          pulseFish();
        }
      }
      liveFloat.last = {
        phase: payload.phase,
        boss: payload.boss === true,
        record: payload.newRecord === true
      };
    }

    // 待机小鱼的缩略画面：12fps 重绘，几乎不耗 CPU，但看起来是「活的」
    let thumbTimer = 0;
    let fadeTimer = 0;
    let lastInteract = 0;
    let lastIdleLine = 0;

    function touchDesk() {
      lastInteract = nowMs();
      if (liveFloat !== null) liveFloat.host.style.opacity = '1';
    }

    function tickThumb() {
      if (liveFloat === null || liveGame === null || liveFloat.thumb === null) return;
      const state = liveGame.debugState();
      const mood = liveFloat.belly === true ? 'belly'
        : liveFloat.dizzyUntil > nowMs() ? 'dizzy'
        : state.phase !== 'playing' || state.paused === true ? 'sleep'
        : state.pet !== null && state.pet !== undefined && state.pet.buff === true ? 'buff' : null;
      // 它知道鼠标在哪：待在角落时会慢慢转头看你
      let lookDir;
      if (liveFloat.mouse !== null && typeof liveFloat.host.getBoundingClientRect === 'function') {
        const rect = liveFloat.host.getBoundingClientRect();
        const cx = (rect.left || 0) + (rect.width || 0) / 2;
        const cy = (rect.top || 0) + (rect.height || 0) / 2;
        const lx = liveFloat.mouse.x - cx;
        const ly = liveFloat.mouse.y - cy;
        if (lx * lx + ly * ly > 400) lookDir = Math.atan2(ly, lx);
      }
      if (typeof liveGame.drawPetThumb === 'function') {
        if (liveFloat.face !== null) liveFloat.face.style.display = 'none';
        liveGame.drawPetThumb(liveFloat.thumb, mood, lookDir);
      } else if (liveFloat.face !== null) {
        // 老引擎没有缩略渲染时退回 emoji
        liveFloat.face.style.display = 'block';
        liveFloat.face.textContent = mood === 'dizzy' ? '😵‍💫' : mood === 'sleep' ? '😴' : mood === 'buff' ? '💪' : '🐟';
      }
    }

    function startThumbLoop() {
      if (thumbTimer !== 0 || typeof window.setInterval !== 'function') return;
      thumbTimer = window.setInterval(tickThumb, 80);
      tickThumb();
    }

    function stopThumbLoop() {
      if (thumbTimer !== 0 && typeof window.clearInterval === 'function') window.clearInterval(thumbTimer);
      thumbTimer = 0;
    }

    // 长时间不理它：先是半透明「退到背景里」，再久一点自己说句话
    let lastBreak = 0;

    function startFadeWatch() {
      if (fadeTimer !== 0 || typeof window.setInterval !== 'function') return;
      fadeTimer = window.setInterval(function () {
        if (liveFloat === null) return;
        if (liveFloat.desk.mode !== 'fish') {
          liveFloat.host.style.opacity = '1';
          return;
        }
        const idle = nowMs() - lastInteract;
        liveFloat.host.style.opacity = idle > 30000 ? '0.55' : '1';
        if (idle > 45000 && nowMs() - lastIdleLine > 45000) {
          lastIdleLine = nowMs();
          // 安静摸鱼时，闲置久了就带你做一次缓慢呼吸
          deskSay(readCalm() ? 'game.calm.breathe' : 'game.desk.idle', 2600);
          lastInteract = nowMs();
        }
        // 安静摸鱼时，每 40 分钟轻轻提醒一次起来动动（不弹窗、不抢焦点）
        if (readCalm() && nowMs() - lastBreak > 40 * 60 * 1000) {
          lastBreak = nowMs();
          deskSay('game.desk.break', 3200);
        }
      }, 10000);
    }

    function stopFadeWatch() {
      if (fadeTimer !== 0 && typeof window.clearInterval === 'function') window.clearInterval(fadeTimer);
      fadeTimer = 0;
    }

    // 拖到屏幕边附近会吸附到边距上，摆位置不用抠像素
    function snapDesk() {
      if (liveFloat === null) return;
      const desk = liveFloat.desk;
      const card = desk.mode === 'card';
      const w = card ? FLOAT_W : deskFishSize(desk);
      const h = card ? FLOAT_H : deskFishSize(desk);
      const width = typeof window.innerWidth === 'number' ? window.innerWidth : 1200;
      const height = typeof window.innerHeight === 'number' ? window.innerHeight : 800;
      const edge = 14;
      const left = width - desk.right - w;
      const top = height - desk.bottom - h;
      if (left < 70) desk.right = Math.max(edge, width - w - edge);
      else if (width - left - w < 70) desk.right = edge;
      if (top < 70) desk.bottom = Math.max(edge, height - h - edge);
      else if (desk.bottom < 70) desk.bottom = edge;
      writeStored(DESK_KEY, desk);
      deskLayout();
    }

    // 按当前形态摆位置和大小：小鱼按档位 64/96/128，摸鱼窗 320×236
    function deskLayout() {
      if (liveFloat === null) return;
      const desk = liveFloat.desk;
      const host = liveFloat.host;
      const card = desk.mode === 'card';
      const size = card ? FLOAT_W : deskFishSize(desk);
      host.style.right = desk.right + 'px';
      host.style.bottom = desk.bottom + 'px';
      host.style.width = size + 'px';
      host.style.height = (card ? FLOAT_H : size) + 'px';
      liveFloat.card.style.display = card ? 'flex' : 'none';
      liveFloat.fish.style.display = card ? 'none' : 'flex';
      if (liveCanvas !== null) liveCanvas.style.display = card ? 'block' : 'none';
      if (card && liveGame !== null) liveGame.resize();
      // 缩成小鱼的「安静摸鱼」：工作时不出音效、跳过画布绘制；展开卡片再恢复
      if (liveGame !== null) {
        liveGame.setSfxSilence(!card);
        liveGame.setRender(card);
      }
      // 待机小鱼只在小鱼形态下按 12fps 重绘；卡片形态停掉省电
      if (card) stopThumbLoop();
      else startThumbLoop();
    }

    function setDeskMode(mode) {
      if (liveFloat === null) return;
      if (typeof liveFloat.hideMenu === 'function') liveFloat.hideMenu();
      liveFloat.desk.mode = mode === 'card' ? 'card' : 'fish';
      writeStored(DESK_KEY, liveFloat.desk);
      deskLayout();
      touchDesk();
    }

    // 点小鱼冒的心心：纯 DOM 动画，跟游戏的 Canvas 粒子互不相干
    function spawnHearts(anchor) {
      if (typeof document !== 'object' || document === null || typeof document.createElement !== 'function') return;
      for (let i = 0; i < 3; i++) {
        const heart = document.createElement('span');
        heart.textContent = '♥';
        heart.style.cssText = [
          'position:absolute', 'left:50%', 'top:44%',
          'font-size:' + (12 + Math.floor(Math.random() * 8)) + 'px',
          'color:' + (i === 0 ? '#ff8fbf' : '#ff5f9e'),
          'pointer-events:none', 'user-select:none',
          'text-shadow:0 1px 3px rgba(0,0,0,0.6)'
        ].join(';');
        anchor.appendChild(heart);
        const dx = Math.round((Math.random() - 0.5) * 42);
        if (typeof heart.animate === 'function') {
          const motion = heart.animate(
            [
              { transform: 'translate(-50%, 0) scale(0.8)', opacity: 1 },
              { transform: 'translate(calc(-50% + ' + dx + 'px), -44px) scale(1.15)', opacity: 0 }
            ],
            { duration: 720 + Math.floor(Math.random() * 180), easing: 'ease-out' }
          );
          motion.onfinish = function () { if (heart.parentNode !== null) heart.parentNode.removeChild(heart); };
        } else if (anchor.removeChild) {
          anchor.removeChild(heart);
        }
      }
    }

    // 拖动时甩出一串小气泡，像鱼在水里被拎着走
    function spawnBubbles(anchor) {
      if (typeof document !== 'object' || document === null || typeof document.createElement !== 'function') return;
      for (let i = 0; i < 2; i++) {
        const bubble = document.createElement('span');
        bubble.textContent = '○';
        bubble.style.cssText = [
          'position:absolute', 'left:50%', 'top:40%',
          'font-size:' + (6 + Math.floor(Math.random() * 6)) + 'px',
          'color:rgba(160,220,255,0.75)',
          'pointer-events:none', 'user-select:none'
        ].join(';');
        anchor.appendChild(bubble);
        const dx = Math.round((Math.random() - 0.5) * 34);
        if (typeof bubble.animate === 'function') {
          const motion = bubble.animate(
            [
              { transform: 'translate(-50%, 0) scale(0.7)', opacity: 0.9 },
              { transform: 'translate(calc(-50% + ' + dx + 'px), -34px) scale(1.1)', opacity: 0 }
            ],
            { duration: 620 + Math.floor(Math.random() * 220), easing: 'ease-out' }
          );
          motion.onfinish = function () { if (bubble.parentNode !== null) bubble.parentNode.removeChild(bubble); };
        } else if (anchor.removeChild) {
          anchor.removeChild(bubble);
        }
      }
    }

    // 像 dsh-pet 那样挂在页面角落：整体不吃鼠标，只有小鱼和按钮能点
    function ensureFloatHost() {
      if (liveFloat !== null) return liveFloat;
      if (typeof document !== 'object' || document === null || typeof document.createElement !== 'function') return null;
      if (typeof document.body !== 'object' || document.body === null) return null;
      const initialDesk = readDesk();
      const initialSize = initialDesk.mode === 'card' ? FLOAT_W : deskFishSize(initialDesk);
      const host = document.createElement('div');
      host.setAttribute('data-dsh-shooter-float', '1');
      host.style.cssText = [
        'position:fixed', 'right:' + initialDesk.right + 'px', 'bottom:' + initialDesk.bottom + 'px',
        'width:' + initialSize + 'px', 'height:' + (initialDesk.mode === 'card' ? FLOAT_H : initialSize) + 'px',
        'z-index:9999', 'display:none',
        'pointer-events:none',
        'transition:width 140ms ease-out, height 140ms ease-out, opacity 400ms ease-out',
        'font-family:' + FONT, 'color:#d8def0'
      ].join(';');

      const card = document.createElement('div');
      card.style.cssText = [
        'display:none', 'flex-direction:column',
        'width:100%', 'height:100%',
        'border-radius:12px', 'overflow:hidden',
        'border:1px solid rgba(255,210,87,0.45)',
        'background:rgba(9,11,22,0.96)',
        'box-shadow:0 18px 44px rgba(0,0,0,0.5)',
        'pointer-events:auto'
      ].join(';');
      const bar = document.createElement('div');
      bar.style.cssText = [
        'display:flex', 'align-items:center', 'gap:4px',
        'padding:5px 7px',
        'border-bottom:1px solid rgba(255,210,87,0.18)',
        'cursor:move', 'touch-action:none', 'user-select:none'
      ].join(';');
      const title = document.createElement('span');
      title.style.cssText = 'flex:1 1 auto;font-size:12px;font-weight:600;color:' + C.gold + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
      title.textContent = t('game.floatIdle');
      const smallButton = function (label, hint) {
        const button = document.createElement('button');
        button.type = 'button';
        button.tabIndex = -1; // 不抢焦点：点挂件时输入框里的字和光标都还在
        button.addEventListener('mousedown', function (event) { event.preventDefault(); });
        button.textContent = label;
        if (hint) button.title = hint;
        button.style.cssText = 'cursor:pointer;line-height:1;font:600 11px ' + FONT + ';color:#d8def0;background:rgba(120,180,255,0.12);border:1px solid rgba(120,180,255,0.25);border-radius:6px;padding:3px 6px';
        return button;
      };
      const pauseBtn = smallButton('⏸', t('game.pause'));
      const muteBtn = smallButton(readMuted() ? '🔇' : '🔊', readMuted() ? t('game.sfxOn') : t('game.sfxOff'));
      const foldBtn = smallButton('⌄', t('game.floatCollapse'));
      const backBtn = smallButton('←', t('game.floatBack'));
      const closeBtn = smallButton('✕', t('game.floatStop'));
      bar.appendChild(title);
      bar.appendChild(pauseBtn);
      bar.appendChild(muteBtn);
      bar.appendChild(foldBtn);
      bar.appendChild(backBtn);
      bar.appendChild(closeBtn);

      const box = document.createElement('div');
      box.style.cssText = 'position:relative;flex:1 1 auto;min-height:0';
      const hud = document.createElement('div');
      hud.style.cssText = 'position:absolute;left:8px;right:8px;bottom:6px;font-size:11px;color:#c7d0e6;pointer-events:none;text-shadow:0 1px 2px rgba(0,0,0,0.8)';
      box.appendChild(hud);
      card.appendChild(bar);
      card.appendChild(box);

      // 小鱼形态：一只圆滚滚的按钮，点一下就是摸摸它
      const fish = document.createElement('button');
      fish.type = 'button';
      fish.tabIndex = -1; // 同理不抢焦点
      fish.title = t('game.floatExpand');
      fish.style.cssText = [
        'display:flex', 'align-items:center', 'justify-content:center',
        'position:relative',
        'width:100%', 'height:100%',
        'border-radius:50%',
        'border:1px solid rgba(255,210,87,0.5)',
        'background:radial-gradient(circle at 42% 34%, rgba(120,190,255,0.28), rgba(16,26,48,0.72) 72%)',
        'box-shadow:0 10px 26px rgba(0,0,0,0.45), 0 0 0 3px rgba(255,210,87,0.08)',
        'font-size:42px', 'line-height:1', 'cursor:pointer',
        'pointer-events:auto', 'user-select:none',
        'transition:transform 120ms ease-out'
      ].join(';');
      // 缩略画布：用同一只鱼的形象待机，跟着皮肤换色
      const thumb = document.createElement('canvas');
      thumb.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border-radius:50%;pointer-events:none';
      fish.appendChild(thumb);
      const face = document.createElement('span');
      face.textContent = '🐟';
      face.style.cssText = 'display:none;font-size:42px;line-height:1;pointer-events:none';
      fish.appendChild(face);
      const stat = document.createElement('span');
      stat.style.cssText = [
        'position:absolute', 'left:0', 'right:0', 'bottom:5px',
        'text-align:center', 'font:600 11px ' + FONT,
        'color:' + C.gold, 'pointer-events:none', 'text-shadow:0 1px 2px rgba(0,0,0,0.8)'
      ].join(';');
      fish.appendChild(stat);

      // 挂件头顶的小气泡：阵亡 / Boss / 破纪录 / 被摸的时候冒一句话
      const bubble = document.createElement('div');
      bubble.style.cssText = [
        'position:absolute', 'right:0', 'bottom:calc(100% + 8px)',
        'max-width:240px', 'padding:6px 9px',
        'border-radius:10px', 'background:rgba(10,14,28,0.94)',
        'border:1px solid rgba(255,210,87,0.35)',
        'font:600 12px ' + FONT, 'color:#e8eeff',
        'opacity:0', 'transition:opacity 160ms ease-out',
        'pointer-events:none', 'white-space:nowrap',
        'overflow:hidden', 'text-overflow:ellipsis'
      ].join(';');

      // 右键 / 长按小鱼弹出的快捷菜单：不展开卡片也能切状态
      const menu = document.createElement('div');
      menu.style.cssText = [
        'position:absolute', 'right:0', 'bottom:calc(100% + 10px)',
        'display:none', 'flex-direction:column', 'gap:2px',
        'min-width:118px', 'padding:4px',
        'border-radius:10px', 'background:rgba(10,14,28,0.97)',
        'border:1px solid rgba(255,210,87,0.35)',
        'box-shadow:0 12px 30px rgba(0,0,0,0.45)',
        'pointer-events:auto', 'z-index:2'
      ].join(';');
      let menuOpened = false;
      let menuTimer = 0;
      let pressTimer = 0;
      let pressFired = false;

      const hideMenu = function () {
        if (menuTimer !== 0 && typeof window.clearTimeout === 'function') window.clearTimeout(menuTimer);
        menuTimer = 0;
        menu.style.display = 'none';
        menu.textContent = '';
        menuOpened = false;
      };

      const menuButton = function (label, run) {
        const button = document.createElement('button');
        button.type = 'button';
        button.tabIndex = -1;
        button.addEventListener('mousedown', function (event) { event.preventDefault(); });
        button.textContent = label;
        button.style.cssText = [
          'cursor:pointer', 'text-align:left', 'white-space:nowrap',
          'font:600 11px ' + FONT, 'color:#d8def0',
          'background:transparent', 'border:0', 'border-radius:6px',
          'padding:5px 7px'
        ].join(';');
        button.addEventListener('mouseenter', function () { button.style.background = 'rgba(120,180,255,0.16)'; });
        button.addEventListener('mouseleave', function () { button.style.background = 'transparent'; });
        button.addEventListener('click', function () {
          hideMenu();
          run();
        });
        menu.appendChild(button);
        return button;
      };

      const showMenu = function () {
        if (liveGame === null) return;
        const state = liveGame.debugState();
        menu.textContent = '';
        // 鱼贴在屏幕上方时把菜单翻到下面，别被切掉
        const rect = host.getBoundingClientRect();
        const below = typeof rect.top === 'number' && rect.top < 220;
        menu.style.bottom = below ? 'auto' : 'calc(100% + 10px)';
        menu.style.top = below ? 'calc(100% + 10px)' : 'auto';
        if (state.phase === 'playing') {
          menuButton(state.paused === true ? t('game.resume') : t('game.pause'), function () {
            liveGame.togglePause();
          });
        }
        menuButton(t('game.speed') + ' ' + speedLabel(state.speed), function () {
          const next = liveGame.cycleSpeed();
          if (isFinite(next)) deskBubble(t('game.speed') + ' ' + speedLabel(next), 1200);
        });
        if (state.ai === true) {
          menuButton(t('game.aiLevel') + ' ' + t('game.level.' + state.level), function () {
            const next = liveGame.cycleLevel();
            if (typeof next === 'string') deskBubble(t('game.aiLevel') + ' ' + t('game.level.' + next), 1200);
          });
        }
        menuButton(t('game.desk.size') + ' ' + t('game.desk.size.' + liveFloat.desk.size), function () {
          const order = ['sm', 'md', 'lg'];
          const index = order.indexOf(liveFloat.desk.size);
          liveFloat.desk.size = order[(index + 1) % order.length];
          writeStored(DESK_KEY, liveFloat.desk);
          deskLayout();
        });
        // 安静摸鱼：音效变轻、解说温柔、HUD 不显示数字，再配上很轻的水声
        menuButton(readCalm() ? t('game.desk.calmOn') : t('game.desk.calmOff'), function () {
          const next = liveGame.setCalm(!readCalm());
          deskBubble(next ? t('game.desk.calmOn') : t('game.desk.calmOff'), 1500);
          if (next && readAmbient()) setAmbient(true);
          else if (!next) setAmbient(false);
        });
        menuButton(readAmbient() ? t('game.desk.ambientOn') : t('game.desk.ambientOff'), function () {
          const on = liveGame.setAmbient(!readAmbient());
          deskBubble(on ? t('game.desk.ambientOn') : t('game.desk.ambientOff'), 1500);
        });
        menuButton(t('game.desk.feed'), function () {
          if (liveGame === null) return;
          liveGame.pet();
          spawnHearts(fish);
          sfxPlay('feed');
          deskSay('game.desk.feedLine', 1600);
        });
        menuButton(readMuted() ? t('game.sfxOn') : t('game.sfxOff'), function () {
          setMuted(!readMuted());
          if (liveFloat.muteBtn !== null) liveFloat.muteBtn.textContent = readMuted() ? '🔇' : '🔊';
        });
        menuButton(t('game.floatBack'), function () {
          if (layoutApi !== null && typeof layoutApi.selectPanel === 'function') layoutApi.selectPanel(PANEL_ID);
        });
        menuButton(t('game.floatStop'), function () {
          stopLiveGame();
          host.style.display = 'none';
        });
        menu.style.display = 'flex';
        menuOpened = true;
        // 6 秒没动自动收起
        if (typeof window.setTimeout === 'function') {
          menuTimer = window.setTimeout(function () { hideMenu(); }, 6000);
        }
      };

      host.appendChild(card);
      host.appendChild(fish);
      host.appendChild(bubble);
      host.appendChild(menu);
      document.body.appendChild(host);

      liveFloat = {
        host: host, card: card, box: box, fish: fish, face: face, thumb: thumb, stat: stat,
        hud: hud, title: title, pauseBtn: pauseBtn, muteBtn: muteBtn,
        bubble: bubble, menu: menu, dizzyUntil: 0, last: null, belly: false, mouse: null,
        desk: readDesk(),
        hideMenu: hideMenu, showMenu: showMenu
      };

      // 记一下鼠标位置，待机小鱼会转头看你
      if (typeof window.addEventListener === 'function') {
        window.addEventListener('mousemove', function (event) {
          if (liveFloat !== null) liveFloat.mouse = { x: event.clientX, y: event.clientY };
        });
      }

      // 点小鱼：冒爱心 + 说一句；短时间连点太多会「摸晕」，让它有点性格
      let petClicks = 0;
      let petClickT = 0;
      fish.addEventListener('mousedown', function (event) { event.preventDefault(); });
      fish.addEventListener('click', () => {
        if (fishMoved) {
          fishMoved = false;
          return;
        }
        touchDesk();
        const petted = liveGame !== null && liveGame.pet() !== false;
        spawnHearts(fish);
        fish.style.transform = 'scale(0.92)';
        if (typeof window.setTimeout === 'function') {
          window.setTimeout(function () { fish.style.transform = ''; }, 120);
        }
        const stamp = nowMs();
        if (stamp - petClickT > 1500) petClicks = 0;
        petClickT = stamp;
        petClicks++;
        if (petClicks >= 5) {
          // 摸太狠了：晕两秒，表情变晕，别再冒爱心
          petClicks = 0;
          liveFloat.dizzyUntil = stamp + 2000;
          deskSay('game.desk.dizzy', 2200);
          if (liveGame !== null) liveGame.syncHud(true);
          if (typeof window.setTimeout === 'function') {
            window.setTimeout(function () { if (liveGame !== null) liveGame.syncHud(true); }, 2050);
          }
          return;
        }
        if (petted) deskSay('game.desk.pet', 1500);
      });
      fish.addEventListener('dblclick', (event) => {
        if (event) event.preventDefault();
        setDeskMode('card');
      });
      fish.addEventListener('mouseenter', function () { touchDesk(); fish.style.transform = 'scale(1.06)'; });
      fish.addEventListener('mouseleave', function () { fish.style.transform = ''; });

      // 小鱼本身也能拖走：拖超过 4px 算换位置，否则算摸摸
      let fishDrag = null;
      let fishMoved = false;
      fish.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        touchDesk();
        if (menuOpened) hideMenu();
        // 按住 300ms 不松手 = 它翻过身让你摸肚皮（松手翻回来）；拖动会取消
        pressFired = false;
        if (typeof window.setTimeout === 'function') {
          pressTimer = window.setTimeout(function () {
            pressFired = true;
            liveFloat.belly = true;
            spawnHearts(fish);
            deskSay('game.desk.pet', 1500);
          }, 300);
        }
        // 万一松手发生在小鱼之外（没有指针捕获），也要把肚皮翻回来、别卡在翻肚状态
        if (typeof window.addEventListener === 'function') {
          const bellyUp = function () {
            if (liveFloat !== null) liveFloat.belly = false;
            if (pressTimer !== 0 && typeof window.clearTimeout === 'function') window.clearTimeout(pressTimer);
            pressTimer = 0;
            window.removeEventListener('pointerup', bellyUp);
            window.removeEventListener('pointercancel', bellyUp);
          };
          window.addEventListener('pointerup', bellyUp);
          window.addEventListener('pointercancel', bellyUp);
        }
        fishDrag = {
          x: event.clientX,
          y: event.clientY,
          right: liveFloat.desk.right,
          bottom: liveFloat.desk.bottom
        };
        fishMoved = false;
        // 抓住指针：拖出小鱼范围也还能继续拖
        if (typeof fish.setPointerCapture === 'function' && typeof event.pointerId === 'number') {
          try { fish.setPointerCapture(event.pointerId); } catch (err) { /* 不支持就算了 */ }
        }
      });
      fish.addEventListener('pointermove', (event) => {
        if (fishDrag === null) return;
        const dx = fishDrag.x - event.clientX;
        const dy = fishDrag.y - event.clientY;
        if (!fishMoved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        if (!fishMoved && pressTimer !== 0) {
          if (typeof window.clearTimeout === 'function') window.clearTimeout(pressTimer);
          pressTimer = 0;
          liveFloat.belly = false;
        }
        fishMoved = true;
        touchDesk();
        const width = typeof window.innerWidth === 'number' ? window.innerWidth : 1200;
        const height = typeof window.innerHeight === 'number' ? window.innerHeight : 800;
        liveFloat.desk.right = clamp(fishDrag.right + dx, 4, Math.max(4, width - 120));
        liveFloat.desk.bottom = clamp(fishDrag.bottom + dy, 4, Math.max(4, height - 120));
        deskLayout();
        // 拖动时轻微倾斜，像被拎着走
        fish.style.transform = 'rotate(' + (dx >= 0 ? -5 : 5) + 'deg) scale(1.04)';
        if (Math.random() < 0.3) spawnBubbles(fish);
      });
      fish.addEventListener('pointerup', () => {
        if (pressTimer !== 0 && typeof window.clearTimeout === 'function') window.clearTimeout(pressTimer);
        pressTimer = 0;
        if (liveFloat !== null) liveFloat.belly = false;
        fish.style.transform = '';
        if (fishDrag !== null && fishMoved) {
          writeStored(DESK_KEY, liveFloat.desk);
          snapDesk();
          // 长按已经弹出了菜单，这次 click 不再算摸摸
          fishMoved = true;
        }
        if (pressFired) fishMoved = true;
        fishDrag = null;
      });
      fish.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        touchDesk();
        showMenu();
      });

      pauseBtn.addEventListener('click', () => {
        if (liveGame !== null) liveGame.togglePause();
      });
      muteBtn.addEventListener('click', () => {
        setMuted(!readMuted());
        muteBtn.textContent = readMuted() ? '🔇' : '🔊';
        muteBtn.title = readMuted() ? t('game.sfxOn') : t('game.sfxOff');
      });
      foldBtn.addEventListener('click', () => setDeskMode('fish'));
      backBtn.addEventListener('click', () => {
        // 让 DSH 切回枪战精英面板：面板重新挂载时会把引擎和画布收回
        if (layoutApi !== null && typeof layoutApi.selectPanel === 'function') layoutApi.selectPanel(PANEL_ID);
      });
      closeBtn.addEventListener('click', () => {
        stopLiveGame();
        host.style.display = 'none';
      });

      // 拖标题栏换位置，松手记住并吸附到最近的边；限制在视口里
      bar.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        touchDesk();
        const startX = event.clientX;
        const startY = event.clientY;
        const startRight = liveFloat.desk.right;
        const startBottom = liveFloat.desk.bottom;
        const move = function (ev) {
          const width = typeof window.innerWidth === 'number' ? window.innerWidth : 1200;
          const height = typeof window.innerHeight === 'number' ? window.innerHeight : 800;
          liveFloat.desk.right = clamp(startRight + (startX - ev.clientX), 4, Math.max(4, width - 120));
          liveFloat.desk.bottom = clamp(startBottom + (startY - ev.clientY), 4, Math.max(4, height - 120));
          deskLayout();
        };
        const up = function () {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          if (liveFloat !== null) {
            writeStored(DESK_KEY, liveFloat.desk);
            snapDesk();
          }
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      });

      return liveFloat;
    }

    // 把引擎画布搬进挂件，接着跑（小鱼形态下画布藏起来，战斗照常进行）
    function floatLive(game) {
      if (typeof document !== 'object' || document === null) return;
      if (liveGame !== game || liveCanvas === null) return;
      const win = ensureFloatHost();
      if (win === null) return;
      const style = liveCanvas.style;
      style.position = 'absolute';
      style.left = '0';
      style.top = '0';
      style.width = '100%';
      style.height = '100%';
      style.display = 'block';
      style.cursor = 'default';
      win.box.appendChild(liveCanvas);
      win.host.style.display = 'block';
      game.setHudSink(updateFloatHud);
      game.syncHud(true);
      deskLayout();
      touchDesk();
      startFadeWatch();
      // 安静摸鱼 + 水声开着：挂件一出现就垫上很轻的水族箱底噪
      if (readCalm() && readAmbient()) setAmbient(true);
      // 手动玩的时候被切走：先暂停，别让鱼站着挨打；托管则继续打
      const state = game.debugState();
      if (state.phase === 'playing' && state.ai !== true && state.paused !== true) game.pause();
      bindLivePointer();
    }

    // 把引擎画布搬回面板
    function dockLive(stage, setHud) {
      stopThumbLoop();
      stopFadeWatch();
      setAmbient(false);
      if (liveFloat !== null && typeof liveFloat.hideMenu === 'function') liveFloat.hideMenu();
      if (liveFloat !== null) liveFloat.host.style.display = 'none';
      if (liveCanvas !== null) {
        const style = liveCanvas.style;
        style.position = 'absolute';
        style.left = '0';
        style.top = '0';
        style.width = '100%';
        style.height = '100%';
        style.display = 'block';
        if (stage !== null && stage !== undefined && liveCanvas.parentElement !== stage) stage.appendChild(liveCanvas);
        // 收回面板后引擎画布仍压在上面，指针事件继续自己绑着
        bindLivePointer();
      }
      // React 自己渲染的那块画布让位给引擎画布，避免画两次
      if (liveReactCanvas !== null && liveReactCanvas !== liveCanvas) liveReactCanvas.style.display = 'none';
      if (liveGame !== null) {
        // 回到面板里：恢复正常绘制和音效
        liveGame.setSfxSilence(false);
        liveGame.setRender(true);
        liveGame.setHudSink(setHud);
        // 画布从 320×236 的挂件搬回整块舞台，内部分辨率得重新量一次
        liveGame.resize();
        liveGame.syncHud(true);
      }
    }

    function stopLiveGame() {
      unbindLivePointer();
      stopThumbLoop();
      stopFadeWatch();
      setAmbient(false);
      if (liveFloat !== null && typeof liveFloat.hideMenu === 'function') liveFloat.hideMenu();
      // 收工时把被搬走的画布从挂件里摘掉，别在隐藏的宿主里留一个没人用的 canvas
      if (liveCanvas !== null && liveCanvas.parentNode !== null) {
        try { liveCanvas.parentNode.removeChild(liveCanvas); } catch (err) { /* 已经摘掉了 */ }
      }
      if (liveGame !== null) {
        try { liveGame.destroy(); } catch (err) { /* 已经关了 */ }
      }
      liveGame = null;
      liveCanvas = null;
      liveReactCanvas = null;
    }

    // 交互反馈：面板是窄侧栏，靠位移/亮度/聚焦框这些小动作把「可点」讲清楚
    function fxRemember(el) {
      if (el.__fxBase) return;
      el.__fxBase = { transform: el.style.transform, filter: el.style.filter };
    }
    function fxReset(el) {
      const base = el.__fxBase;
      if (!base) return;
      el.style.transform = base.transform;
      el.style.filter = base.filter;
    }
    function fxEnter(event) {
      const el = event.currentTarget;
      fxRemember(el);
      el.style.transform = 'translateY(-1px)';
      el.style.filter = 'brightness(1.12)';
    }
    function fxDown(event) {
      const el = event.currentTarget;
      fxRemember(el);
      el.style.transform = 'scale(0.985)';
    }
    function fxUp(event) {
      const el = event.currentTarget;
      if (el.__fxBase) {
        el.style.transform = 'translateY(-1px)';
        el.style.filter = 'brightness(1.12)';
      }
    }
    function fxFocus(event) {
      const el = event.currentTarget;
      el.style.outline = '2px solid rgba(79, 195, 247, 0.72)';
      el.style.outlineOffset = '2px';
    }
    function fxBlur(event) {
      const el = event.currentTarget;
      el.style.outline = '';
      el.style.outlineOffset = '';
    }
    const FX = {
      onMouseEnter: fxEnter,
      onMouseLeave(event) { fxReset(event.currentTarget); },
      onMouseDown: fxDown,
      onMouseUp: fxUp,
      onFocus: fxFocus,
      onBlur: fxBlur
    };
    // 把 hover/focus 反馈拼进任何按钮的 props 里
    function pressable(extra) {
      return Object.assign({ type: 'button' }, FX, extra || {});
    }

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

    const aiChipStyle = {
      border: '1px solid rgba(255, 210, 87, 0.6)',
      background: 'rgba(255, 210, 87, 0.14)',
      color: C.gold
    };

    const aiChipButtonStyle = Object.assign({}, ghostButtonStyle, aiChipStyle);


    const metaLineStyle = {
      fontSize: '13px',
      color: C.ink,
      alignSelf: 'stretch',
      display: 'flex',
      gap: '10px',
      alignItems: 'baseline'
    };

    const metaEmptyStyle = { fontSize: '12px', color: C.muted, alignSelf: 'stretch' };

    const metaChipsStyle = { display: 'flex', flexWrap: 'wrap', gap: '6px', alignSelf: 'stretch' };

    const skinChipStyle = Object.assign({}, ghostButtonStyle, { padding: '3px 10px', fontSize: '12px' });

    const skinChipActiveStyle = Object.assign({}, skinChipStyle, aiChipStyle);

    // ---------------------------------------------------------- 开始界面（主页）
    // 窄侧栏里也要像个正经游戏首页：英雄区 + 主 CTA + 快捷设置 + 战绩 + 档案分区
    const homeScrollStyle = Object.assign({}, overlayStyle, {
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      gap: '12px',
      padding: '22px 16px 26px',
      overflowY: 'auto',
      background: 'radial-gradient(1200px 420px at 50% -10%, rgba(255, 210, 87, 0.1), transparent 60%), rgba(9, 11, 22, 0.92)'
    });

    const homeColStyle = {
      width: '100%',
      maxWidth: '520px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    };

    const homeHeroStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      textAlign: 'center',
      padding: '4px 0 2px'
    };

    const kickerStyle = {
      fontSize: '11px',
      letterSpacing: '3px',
      textTransform: 'uppercase',
      color: C.muted
    };

    const homeTitleStyle = Object.assign({}, titleStyle, {
      fontSize: 'clamp(26px, 4.6vw, 40px)',
      letterSpacing: '4px',
      lineHeight: 1.15
    });

    const homeSubStyle = {
      fontSize: '13px',
      lineHeight: 1.7,
      color: '#9aa3b8',
      maxWidth: '440px'
    };

    const bestBadgeStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      marginTop: '6px',
      padding: '3px 12px',
      borderRadius: '999px',
      border: '1px solid rgba(255, 210, 87, 0.35)',
      background: 'rgba(255, 210, 87, 0.08)',
      color: C.gold,
      fontSize: '12px'
    };

    const homeCardStyle = {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '10px 12px',
      borderRadius: '14px',
      border: '1px solid rgba(120, 140, 180, 0.18)',
      background: 'rgba(16, 21, 36, 0.72)',
      textAlign: 'left'
    };

    const homeCardTitleStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px',
      fontSize: '11px',
      letterSpacing: '2px',
      color: C.muted
    };

    const homeCtaStyle = Object.assign({}, primaryButtonStyle, {
      width: '100%',
      marginTop: '0',
      padding: '14px 18px',
      borderRadius: '14px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      letterSpacing: '2px',
      transition: 'transform 140ms ease, filter 140ms ease, box-shadow 140ms ease'
    });

    const homeCtaSubStyle = {
      fontSize: '12px',
      fontWeight: 400,
      letterSpacing: 0,
      color: 'rgba(16, 19, 31, 0.72)'
    };

    const homeSecondaryStyle = Object.assign({}, ghostButtonStyle, {
      width: '100%',
      padding: '10px 14px',
      borderRadius: '12px',
      fontSize: '13px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px',
      transition: 'transform 140ms ease, filter 140ms ease, border-color 140ms ease'
    });

    const homeSecondarySubStyle = { fontSize: '11px', color: '#7d879b' };

    const homeShortcutStyle = {
      textAlign: 'center',
      fontSize: '11px',
      letterSpacing: '1px',
      color: '#5f6a80'
    };

    const settingsRowStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px'
    };

    const settingsLabelStyle = { fontSize: '12px', color: '#8a94a8' };

    const statGridStyle = {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '8px'
    };

    const statCardStyle = {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      padding: '8px 10px',
      borderRadius: '12px',
      border: '1px solid rgba(120, 140, 180, 0.16)',
      background: 'rgba(16, 21, 36, 0.6)'
    };

    const statValueStyle = { fontSize: '18px', fontWeight: 700, lineHeight: 1.2, color: C.gold };
    const statLabelStyle = { fontSize: '11px', letterSpacing: '1px', color: C.muted };

    const tabStripStyle = {
      display: 'flex',
      gap: '4px',
      padding: '3px',
      borderRadius: '11px',
      border: '1px solid rgba(120, 140, 180, 0.16)',
      background: 'rgba(10, 13, 24, 0.6)'
    };

    const tabStyle = {
      flex: 1,
      padding: '6px 8px',
      border: 'none',
      borderRadius: '8px',
      background: 'transparent',
      color: '#8a94a8',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'background 120ms ease, color 120ms ease'
    };

    const tabActiveStyle = Object.assign({}, tabStyle, {
      background: 'rgba(255, 210, 87, 0.14)',
      color: C.gold,
      fontWeight: 600
    });

    const tabBodyStyle = {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      maxHeight: '176px',
      overflowY: 'auto',
      paddingRight: '2px'
    };

    const hintLineStyle = { fontSize: '11px', lineHeight: 1.7, color: '#6f7a90' };

    const helpBoxStyle = Object.assign({}, homeCardStyle, { gap: '6px' });


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

    // 安静摸鱼时的 HUD：只剩一行很轻的提示
    const calmHudStyle = {
      position: 'absolute',
      top: '14px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '5px 14px',
      borderRadius: '999px',
      border: '1px solid rgba(120, 200, 255, 0.25)',
      background: 'rgba(16, 24, 40, 0.45)',
      fontSize: '12px',
      letterSpacing: '1px',
      color: 'rgba(196, 216, 240, 0.85)',
      pointerEvents: 'none',
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

    const comboBadgeStyle = {
      marginTop: '4px',
      fontSize: '14px',
      fontWeight: 700,
      color: C.gold,
      textShadow: '0 0 12px rgba(255, 210, 87, 0.55)'
    };

    // 三选一强化：三张卡横排，键盘 1/2/3 或点击选择
    const pickOverlayStyle = Object.assign({}, overlayStyle, { gap: '18px', zIndex: '70' });

    const pickGridStyle = {
      display: 'flex',
      gap: '14px',
      flexWrap: 'wrap',
      justifyContent: 'center'
    };

    const pickCardStyle = {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      alignItems: 'flex-start',
      width: '172px',
      minHeight: '118px',
      padding: '14px 16px',
      border: '1px solid rgba(255, 210, 87, 0.35)',
      borderRadius: '14px',
      background: 'rgba(24, 30, 48, 0.92)',
      color: C.ink,
      textAlign: 'left',
      cursor: 'pointer'
    };

    const pickKeyStyle = {
      alignSelf: 'flex-start',
      padding: '1px 8px',
      borderRadius: '6px',
      background: 'rgba(255, 210, 87, 0.16)',
      color: C.gold,
      fontSize: '12px',
      fontWeight: 700
    };

    const pickNameStyle = { fontSize: '16px', fontWeight: 700, color: C.gold };

    const pickDescStyle = { fontSize: '12px', color: '#9aa3b8', lineHeight: 1.6 };

    // 观战控件：右下角常驻小胶囊（速度、AI 档位）
    const watchBarStyle = {
      position: 'absolute',
      right: '12px',
      bottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      pointerEvents: 'auto',
      color: C.ink,
      fontFamily: FONT
    };

    const watchChipStyle = Object.assign({}, ghostButtonStyle, { padding: '4px 10px', fontSize: '12px' });

    const watchChipActiveStyle = Object.assign({}, watchChipStyle, aiChipStyle);

    // 已选强化：左下角一排小徽章
    const upgradesBarStyle = {
      position: 'absolute',
      left: '12px',
      bottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      flexWrap: 'wrap',
      maxWidth: '55%',
      pointerEvents: 'none',
      color: C.ink,
      fontFamily: FONT
    };

    const upgradeChipStyle = {
      padding: '2px 9px',
      borderRadius: '999px',
      border: '1px solid rgba(255, 210, 87, 0.35)',
      background: 'rgba(255, 210, 87, 0.1)',
      color: C.gold,
      fontSize: '12px'
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
      const [hud, setHud] = React.useState({
        phase: 'idle', score: 0, wave: 1, hp: 100, maxHp: 100, ai: false, aiState: 'cruise',
        paused: false, best: readBest(), result: null, combo: 1,
        speed: readSpeed(), level: readLevel(), shield: 0, shieldMax: 0, upgrades: [], pick: null,
        pets: 0, petBuff: false, calm: readCalm(), ambient: readAmbient()
      });
      // 大屏观战：面板浮到视口上层；muted：音效+解说一起静音，存 localStorage
      const [expanded, setExpanded] = React.useState(false);
      // 摸鱼小窗：右下角可拖动的小窗口，边干活边看大肥鱼打
      const [mini, setMini] = React.useState(false);
      const [miniPos, setMiniPos] = React.useState({ left: 24, top: 96 });
      const [muted, setMutedState] = React.useState(readMuted());
      // 本机排行榜 / 成就 / 皮肤：每局结束和手动换皮肤后重读
      const [meta, setMeta] = React.useState(readMeta());
      // 今日摸鱼战绩（摸了几下、看了多久），进开始界面时刷新
      const [petStats, setPetStats] = React.useState(readPetStats());
      // 开始界面的分区标签（排行榜 / 成就 / 皮肤）与提示折叠
      const [homeTab, setHomeTab] = React.useState('leaderboard');
      const [helpOpen, setHelpOpen] = React.useState(false);

      React.useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas === null) return undefined;
        floatToken++; // 这次挂载取消上一次卸载时安排的浮窗
        let game = gameRef.current;
        if (liveGame !== null && liveCanvas !== null) {
          // 从浮窗收回：同一个引擎、同一块画布，一局接着打
          game = liveGame;
          liveReactCanvas = canvas;
          dockLive(canvas.parentElement, setHud);
        } else {
          game = mountGame(canvas, setHud);
          liveGame = game;
          liveCanvas = canvas;
          liveReactCanvas = canvas;
        }
        gameRef.current = game;
        game.resize();
        game.startLoop();

        const onKeyDown = (event) => {
          const el = liveCanvas !== null ? liveCanvas : canvasRef.current;
          if (el === null || !el.isConnected) return;
          // 面板被浮窗接管或还没排好版时，键盘别乱指挥游戏
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
          gameRef.current = null;
          const state = game.debugState();
          if (state.phase === 'idle' || liveGame !== game) {
            game.destroy();
            if (liveGame === game) {
              // 开始界面被切走：这一局本来就结束了，干净收尾别留半截引擎
              unbindLivePointer();
              liveGame = null;
              liveCanvas = null;
              liveReactCanvas = null;
              if (liveFloat !== null) liveFloat.host.style.display = 'none';
            }
            return;
          }
          // 对局还没结束：等 React 把这块画布从面板上摘掉，再搬进右下角浮窗接着打
          // 先断开已卸载组件的 setState，免得这 80ms 里的 HUD 更新打到已经卸掉的组件上
          game.setHudSink(null);
          const token = ++floatToken;
          if (typeof window.setTimeout === 'function') {
            window.setTimeout(() => {
              if (token === floatToken) floatLive(game);
            }, 80);
          }
        };
      }, []);

      // Esc：大屏时先退大屏；对局中则暂停/继续，别让观众找不到暂停键
      React.useEffect(() => {
        const onKey = (event) => {
          if (event.key !== 'Escape') return;
          if (expanded) {
            setExpanded(false);
            return;
          }
          if (mini) {
            setMini(false);
            return;
          }
          const game = gameRef.current;
          if (game === null) return;
          if (game.debugState().phase === 'playing') game.togglePause();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
      }, [expanded, mini]);

      // 选卡热键：三选一遮罩打开时，按 1 / 2 / 3 选对应那张
      const pickOpen = hud.pick !== null && hud.pick !== undefined;
      React.useEffect(() => {
        if (!pickOpen) return undefined;
        const onKey = (event) => {
          if (event.key !== '1' && event.key !== '2' && event.key !== '3') return;
          if (isTypingTarget(event.target)) return;
          const game = gameRef.current;
          if (game === null) return;
          const options = game.debugState().pick;
          if (options === null) return;
          const index = Number(event.key) - 1;
          if (index >= 0 && index < options.length) {
            event.preventDefault();
            game.chooseUpgrade(options[index]);
          }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
      }, [pickOpen]);

      // 开始界面快捷键：1 = 观战，2 = 自己玩（键盘用户不必先 Tab 到按钮）
      React.useEffect(() => {
        if (hud.phase !== 'idle') return undefined;
        const onKey = (event) => {
          if (isTypingTarget(event.target)) return;
          if (event.key !== '1' && event.key !== '2') return;
          const game = gameRef.current;
          if (game === null) return;
          event.preventDefault();
          game.setAI(event.key === '1');
          game.start();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
      }, [hud.phase]);

      // 一局结束（或回到 idle）后重读本机数据：排行榜和成就是结算时写入的
      React.useEffect(() => {
        if (hud.phase !== 'playing') {
          setMeta(readMeta());
          setPetStats(readPetStats());
        }
      }, [hud.phase]);

      const startGame = () => {
        const game = gameRef.current;
        if (game === null) return;
        game.setAI(false);
        game.start();
      };

      // 让大肥鱼接管：直接开一局并交给 AI
      const startWatch = () => {
        const game = gameRef.current;
        if (game === null) return;
        game.setAI(true);
        game.start();
      };

      const togglePilot = () => {
        const game = gameRef.current;
        if (game === null) return;
        const next = hud.ai !== true;
        game.setAI(next);
        if (next && hud.phase !== 'playing') game.start();
      };

      // 安静摸鱼：低刺激模式（音效变轻、解说温柔、HUD 不显示数字）
      const toggleCalm = () => {
        const game = gameRef.current;
        if (game === null) return;
        game.setCalm(!(hud.calm === true));
      };

      // 摸鱼小窗：缩成角落小窗；打开时若还没在玩，就先让大肥鱼接管开一局
      const toggleMini = () => {
        const next = !mini;
        setMini(next);
        if (next) {
          setExpanded(false);
          if (hud.phase !== 'playing') startWatch();
        }
      };

      // 拖动小窗：按住标题栏移动，位置限制在视口内
      const onMiniPointerDown = (event) => {
        if (typeof window !== 'object' || window === null || typeof window.addEventListener !== 'function') return;
        const startX = typeof event.clientX === 'number' ? event.clientX : 0;
        const startY = typeof event.clientY === 'number' ? event.clientY : 0;
        const start = { left: miniPos.left, top: miniPos.top };
        const maxX = Math.max(0, (window.innerWidth || 1200) - MINI_W);
        const maxY = Math.max(0, (window.innerHeight || 800) - MINI_H);
        const onMove = (moveEvent) => {
          const dx = (typeof moveEvent.clientX === 'number' ? moveEvent.clientX : startX) - startX;
          const dy = (typeof moveEvent.clientY === 'number' ? moveEvent.clientY : startY) - startY;
          setMiniPos({
            left: Math.max(0, Math.min(maxX, start.left + dx)),
            top: Math.max(0, Math.min(maxY, start.top + dy))
          });
        };
        const onUp = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      };

      // 暂停 / 继续：冻结模拟，画面停在原地
      const togglePause = () => {
        const game = gameRef.current;
        if (game === null) return;
        game.togglePause();
      };

      // 退出这一局回到开始界面（本局分数作废，存档不动）
      const exitGame = () => {
        const game = gameRef.current;
        if (game === null) return;
        game.exitGame();
      };

      const toggleMute = () => {
        const next = !muted;
        setMuted(next);
        setMutedState(next);
      };

      // 三选一：点卡或按 1/2/3 选；托管时引擎会在 40 帧后自己挑
      const chooseUpgrade = (id) => {
        const game = gameRef.current;
        if (game === null) return;
        game.chooseUpgrade(id);
      };

      // 播放速度 / AI 档位：点一下循环到下一档，立刻生效并记住
      const cycleSpeed = () => {
        const game = gameRef.current;
        if (game !== null) game.cycleSpeed();
      };

      const cycleLevel = () => {
        const game = gameRef.current;
        if (game !== null) game.cycleLevel();
      };

      // 档案标签的键盘导航：左右方向键在三个分区之间切换
      const onTabKey = (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        const ids = ['leaderboard', 'achievements', 'skins'];
        const index = ids.indexOf(homeTab);
        const step = event.key === 'ArrowRight' ? 1 : -1;
        setHomeTab(ids[(index + step + ids.length) % ids.length]);
        event.preventDefault();
      };

      // 换皮肤：没解锁的按钮点了也没反应（handle 会拒绝），解锁的立刻写存档
      const chooseSkin = (id) => {
        const game = gameRef.current;
        if (game === null) return;
        if (game.setSkin(id)) setMeta(readMeta());
      };

      const unlockedCount = meta.achievementList.filter((item) => item.unlocked).length;
      const achNames = (ids) => ids.map((id) => t('game.ach.' + id + '.name')).join(t('game.listSep'));
      const formatEntryDate = (at) => {
        if (!(at > 0)) return '';
        const date = new Date(at);
        return (date.getMonth() + 1) + '/' + date.getDate();
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
            style: hud.ai === true ? canvasPetStyle : canvasStyle,
            onPointerMove: (event) => { if (gameRef.current !== null) gameRef.current.pointerMove(event); },
            onPointerDown: (event) => { if (gameRef.current !== null) gameRef.current.pointerDown(event); }
          })
        )
      ];

      if (playing && hud.calm === true) {
        // 安静摸鱼：不显示分数/连杀/波次，只留一行小字——不制造「要更高分」的压力
        children.push(h('div', { key: 'hud', style: calmHudStyle }, t('game.calmHint')));
      } else if (playing) {
        children.push(
          h(
            'div',
            { key: 'hud', style: hudStyle },
            h('div', { style: hudBoxStyle },
              h('div', { style: hudLabelStyle }, t('hud.score')),
              h('div', { style: hudValueStyle }, String(hud.score)),
              hud.combo > 1 ? h('div', { style: comboBadgeStyle }, t('game.combo', { n: hud.combo })) : null
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
              })),
              hud.shieldMax > 0
                ? h('div', { style: { fontSize: '12px', color: C.ice, marginTop: '4px' } }, '🛡 ' + hud.shield + '/' + hud.shieldMax)
                : null
            ),
            h('div', { style: hudBoxStyle },
              h('div', { style: hudLabelStyle }, t('hud.wave')),
              h('div', { style: hudValueStyle }, String(hud.wave))
            )
          )
        );
        // 已选强化：左下角一排小徽章，观战一眼能看到这局攒了什么
        if (hud.upgrades.length > 0 && !mini) {
          children.push(
            h(
              'div',
              { key: 'upgrades', style: upgradesBarStyle },
              hud.upgrades.map((item) => h(
                'span',
                { key: 'up-' + item.id, style: upgradeChipStyle, title: t('game.up.' + item.id + '.desc') },
                t('game.up.' + item.id + '.name') + (item.count > 1 ? ' ×' + item.count : '')
              ))
            )
          );
        }
        // 右下角常驻观战控件：点一下切速度 / AI 档位；小窗太挤就不显示
        if (!mini) children.push(
          h(
            'div',
            { key: 'watch', style: watchBarStyle },
            h('button', {
              type: 'button',
              style: watchChipStyle,
              title: t('game.speed'),
              onClick: cycleSpeed
            }, speedLabel(hud.speed)),
            h('button', {
              type: 'button',
              style: hud.ai === true ? watchChipActiveStyle : watchChipStyle,
              title: t('game.aiLevel'),
              onClick: cycleLevel
            }, t('game.level.' + hud.level)),
            // 摸摸大肥鱼：托管时点鱼身累计次数，连摸三下会开心 5 秒（射速 +25%）
            h('div', {
              key: 'pets',
              style: hud.petBuff ? watchChipActiveStyle : watchChipStyle,
              title: t('game.petHint')
            }, hud.petBuff ? t('game.petBuff') : t('game.pets', { n: hud.pets }))
          )
        );
      }

      if (hud.phase === 'idle') {
        const homeTabs = [
          { id: 'leaderboard', label: t('game.leaderboard') },
          { id: 'achievements', label: t('game.ach') },
          { id: 'skins', label: t('game.skin') }
        ];
        // 档案分区的内容：一次只渲染一块，窄侧栏里不至于拖成长瀑布
        let tabBody;
        if (homeTab === 'leaderboard') {
          tabBody = meta.leaderboard.length === 0
            ? h('div', { style: metaEmptyStyle }, t('game.leaderboardEmpty'))
            : meta.leaderboard.map((entry, index) => h(
              'div',
              { key: 'lb' + index, style: metaLineStyle },
              h('span', { style: { color: index === 0 ? C.gold : C.muted, minWidth: '20px' } }, '#' + (index + 1)),
              h('span', { style: { fontWeight: 600 } }, String(entry.score)),
              h('span', { style: { color: C.muted, fontSize: '12px' } }, t('game.lbRow', { wave: entry.wave, date: formatEntryDate(entry.at) }))
            ));
        } else if (homeTab === 'achievements') {
          tabBody = h(
            'div',
            { style: metaChipsStyle },
            meta.achievementList.map((item) => h(
              'span',
              {
                key: 'ach-' + item.id,
                title: t('game.ach.' + item.id + '.desc'),
                style: {
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  border: '1px solid ' + (item.unlocked ? 'rgba(255, 210, 87, 0.55)' : 'rgba(120, 140, 180, 0.22)'),
                  color: item.unlocked ? C.gold : '#5d687e',
                  background: item.unlocked ? 'rgba(255, 210, 87, 0.1)' : 'transparent'
                }
              },
              (item.unlocked ? '✓ ' : '· ') + t('game.ach.' + item.id + '.name')
            ))
          );
        } else {
          tabBody = h(
            'div',
            { style: metaChipsStyle },
            meta.skins.map((item) => h(
              'button',
              pressable({
                key: 'skin-' + item.id,
                style: Object.assign({}, item.active ? skinChipActiveStyle : skinChipStyle, item.unlocked ? null : { opacity: 0.45 }),
                title: item.unlocked
                  ? t('game.skin.' + item.id)
                  : t('game.skinLocked', { req: t('game.ach.' + item.req + '.name') }),
                onClick: () => chooseSkin(item.id)
              }),
              (item.unlocked ? '' : '🔒 ') + t('game.skin.' + item.id)
            ))
          );
        }
        children.push(
          h(
            'div',
            { key: 'start', style: homeScrollStyle },
            h(
              'div',
              { style: homeColStyle },
              // 英雄区：一行小字 + 标题 + 一句说明 + 最高分徽章
              h(
                'div',
                { style: homeHeroStyle },
                h('div', { style: kickerStyle }, t('game.home.kicker')),
                h('div', { style: homeTitleStyle }, t('game.titleMain'), h('span', { style: { color: C.red } }, t('game.titleAccent'))),
                h('div', { style: homeSubStyle }, t('game.watchHint')),
                hud.best > 0
                  ? h('div', { style: bestBadgeStyle }, '🏆 ' + t('game.best', { score: hud.best }))
                  : null
              ),
              // 主 CTA：让大肥鱼玩；次级 CTA：自己玩
              h(
                'button',
                pressable({
                  style: homeCtaStyle,
                  onClick: startWatch,
                  title: t('game.home.shortcut'),
                  'aria-label': t('game.watch')
                }),
                h('span', null, t('game.watch')),
                h('span', { style: homeCtaSubStyle }, t('game.home.watchSub'))
              ),
              h(
                'button',
                pressable({
                  style: homeSecondaryStyle,
                  onClick: startGame,
                  'aria-label': t('game.play')
                }),
                h('span', null, t('game.play')),
                h('span', { style: homeSecondarySubStyle }, t('game.home.playSub'))
              ),
              h('div', { style: homeShortcutStyle }, t('game.home.shortcut')),
              // 观战设置：三行，左边标签右边胶囊，一眼知道点哪
              h(
                'div',
                { style: homeCardStyle },
                h('div', { style: homeCardTitleStyle }, h('span', null, t('game.home.quick'))),
                h(
                  'div',
                  { style: settingsRowStyle },
                  h('span', { style: settingsLabelStyle }, t('game.speed')),
                  h('button', pressable({ style: watchChipStyle, onClick: cycleSpeed, title: t('game.speed') }), speedLabel(hud.speed))
                ),
                h(
                  'div',
                  { style: settingsRowStyle },
                  h('span', { style: settingsLabelStyle }, t('game.aiLevel')),
                  h('button', pressable({
                    style: hud.ai === true ? watchChipActiveStyle : watchChipStyle,
                    onClick: cycleLevel,
                    title: t('game.level.' + hud.level)
                  }), t('game.level.' + hud.level))
                ),
                h(
                  'div',
                  { style: settingsRowStyle },
                  h('span', { style: settingsLabelStyle }, t('game.home.calm')),
                  h('button', pressable({
                    style: hud.calm === true ? watchChipActiveStyle : watchChipStyle,
                    title: t('game.calmHint'),
                    onClick: toggleCalm
                  }), t(hud.calm === true ? 'game.home.on' : 'game.home.off'))
                )
              ),
              // 战绩：三格数字，扫一眼就知道自己到哪了
              h(
                'div',
                { style: statGridStyle },
                h('div', { style: statCardStyle },
                  h('div', { style: statValueStyle }, String(hud.best)),
                  h('div', { style: statLabelStyle }, t('game.home.statBest'))),
                h('div', { style: statCardStyle },
                  h('div', { style: statValueStyle }, String(meta.runs)),
                  h('div', { style: statLabelStyle }, t('game.home.statRuns'))),
                h('div', { style: statCardStyle },
                  h('div', { style: statValueStyle }, unlockedCount + '/' + meta.achievementList.length),
                  h('div', { style: statLabelStyle }, t('game.home.statAch')))
              ),
              // 本机档案：标签切换，内容区固定高度滚动
              h(
                'div',
                { style: homeCardStyle },
                h('div', { style: homeCardTitleStyle }, h('span', null, t('game.home.library'))),
                h(
                  'div',
                  { style: tabStripStyle, role: 'tablist', 'aria-label': t('game.home.library') },
                  homeTabs.map((tab) => h(
                    'button',
                    pressable({
                      key: 'tab-' + tab.id,
                      role: 'tab',
                      'aria-selected': homeTab === tab.id,
                      style: homeTab === tab.id ? tabActiveStyle : tabStyle,
                      onClick: () => setHomeTab(tab.id),
                      onKeyDown: onTabKey
                    }),
                    tab.label
                  ))
                ),
                h('div', { style: tabBodyStyle }, tabBody)
              ),
              // 提示折叠：默认只留一行入口，不把开始界面撑满
              h(
                'button',
                pressable({
                  style: Object.assign({}, ghostButtonStyle, { alignSelf: 'center', padding: '4px 14px', fontSize: '11px' }),
                  onClick: () => setHelpOpen(!helpOpen),
                  'aria-expanded': helpOpen
                }),
                t(helpOpen ? 'game.home.helpHide' : 'game.home.help') + ' ' + (helpOpen ? '▴' : '▾')
              ),
              helpOpen
                ? h(
                  'div',
                  { style: helpBoxStyle },
                  h('div', { style: hintLineStyle },
                    h('span', { style: keyCapStyle }, 'W'),
                    h('span', { style: keyCapStyle }, 'A'),
                    h('span', { style: keyCapStyle }, 'S'),
                    h('span', { style: keyCapStyle }, 'D'),
                    h('span', { style: { margin: '0 6px' } }, t('game.move')),
                    h('span', { style: keyCapStyle }, '🖱'),
                    h('span', { style: { margin: '0 6px' } }, t('game.aim')),
                    h('span', { style: keyCapStyle }, 'Shift'),
                    h('span', { style: { margin: '0 6px' } }, t('game.dash'))
                  ),
                  h('div', { style: hintLineStyle }, t('game.hint')),
                  h('div', { style: hintLineStyle }, t('game.readout')),
                  h('div', { style: hintLineStyle }, t('game.petHint')),
                  h('div', { style: hintLineStyle }, t('game.keepHint'))
                )
                : null,
              (petStats.todayPets > 0 || petStats.todaySeconds > 0)
                ? h('div', { style: Object.assign({}, hintLineStyle, { color: C.gold, opacity: 0.85, textAlign: 'center' }) },
                  t('game.petStats', {
                    pets: petStats.todayPets,
                    minutes: Math.max(1, Math.round(petStats.todaySeconds / 60))
                  }))
                : null
            )
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
            hud.best > 0
              ? h('div', { style: subtitleStyle }, t('game.best', { score: hud.best }))
              : null,
            hud.comboBest > 1
              ? h('div', { style: subtitleStyle }, t('game.bestCombo', { n: hud.comboBest }))
              : null,
            hud.result !== null && hud.result !== undefined && hud.result.rank >= 0
              ? h('div', { style: { fontSize: '13px', color: C.gold } }, t('game.rank', { n: hud.result.rank + 1 }))
              : null,
            hud.result !== null && hud.result !== undefined && hud.result.unlocked.length > 0
              ? h('div', { style: { fontSize: '13px', color: C.gold } }, t('game.newAch', { names: achNames(hud.result.unlocked) }))
              : null,
            hud.ai === true
              ? h('div', { style: subtitleStyle }, t('game.aiResume'))
              : h('button', { type: 'button', style: primaryButtonStyle, onClick: startGame }, t('game.retry'))
          )
        );
      }

      // 暂停遮罩：压在画面上，只留一条缝看清战场；Esc 或「继续」回到战斗
      if (playing && hud.paused === true) {
        children.push(
          h(
            'div',
            { key: 'paused', style: overlayStyle },
            h('div', { style: Object.assign({}, titleStyle, { fontSize: 'clamp(24px, 4vw, 40px)', letterSpacing: '4px' }) }, t('game.paused')),
            h('div', { style: subtitleStyle }, t('game.pauseHint')),
            h(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' } },
              h('button', { type: 'button', style: primaryButtonStyle, onClick: togglePause }, t('game.resume')),
              h('button', { type: 'button', style: Object.assign({}, ghostButtonStyle, { padding: '10px 22px', fontSize: '14px' }), onClick: exitGame }, t('game.exit'))
            )
          )
        );
      }

      // 三选一强化：清偶数波后弹出，托管时大肥鱼会自己挑，玩家也可以抢着点
      if (playing && hud.pick !== null && hud.pick !== undefined) {
        const options = Array.isArray(hud.pick.options) ? hud.pick.options : [];
        children.push(
          h(
            'div',
            { key: 'pick', style: pickOverlayStyle },
            h('div', { style: Object.assign({}, titleStyle, { fontSize: 'clamp(22px, 3.4vw, 34px)', letterSpacing: '3px' }) }, t('game.pick.title')),
            h('div', { style: subtitleStyle }, hud.ai === true ? t('game.pick.aiHint') : t('game.pick.hint')),
            h(
              'div',
              { style: pickGridStyle },
              options.map((id, index) => h(
                'button',
                {
                  key: 'pick-' + id,
                  type: 'button',
                  style: pickCardStyle,
                  onClick: () => chooseUpgrade(id)
                },
                h('div', { style: pickKeyStyle }, String(index + 1)),
                h('div', { style: pickNameStyle }, t('game.up.' + id + '.name')),
                h('div', { style: pickDescStyle }, t('game.up.' + id + '.desc'))
              ))
            )
          )
        );
      }

      const rootStyle = mini
        ? Object.assign({}, miniPanelStyle, { left: miniPos.left + 'px', top: miniPos.top + 'px' })
        : expanded ? expandStyle : panelStyle;

      return h(
        'div',
        { style: rootStyle },
        h(
          'div',
          { style: mini ? miniHeaderStyle : headerStyle, onPointerDown: mini ? onMiniPointerDown : undefined },
          h(
            'div',
            { style: { display: 'flex', alignItems: 'baseline', gap: '10px', minWidth: 0 } },
            h('span', { style: { fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' } }, t('panel.title')),
            mini ? null : h('span', {
              style: {
                fontSize: '12px',
                color: 'var(--dsw-alias-label-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }
            }, t('panel.tagline'))
          ),
          h(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: '8px', flex: '0 0 auto' } },
            mini ? null : h('button', {
              type: 'button',
              style: muted ? aiChipButtonStyle : ghostButtonStyle,
              onClick: toggleMute,
              title: t(muted ? 'game.sfxOn' : 'game.sfxOff')
            }, muted ? '🔇' : '🔊'),
            mini ? null : h('button', {
              type: 'button',
              style: expanded ? aiChipButtonStyle : ghostButtonStyle,
              onClick: () => setExpanded(!expanded),
              title: t(expanded ? 'game.collapse' : 'game.expand')
            }, t(expanded ? 'game.collapse' : 'game.expand')),
            // 小窗摸鱼：在面板 / 角落小窗之间切换
            h('button', {
              type: 'button',
              style: mini ? aiChipButtonStyle : ghostButtonStyle,
              onClick: toggleMini,
              title: t(mini ? 'game.unmini' : 'game.mini')
            }, t(mini ? 'game.unmini' : 'game.mini')),
            mini ? null : h('button', {
              type: 'button',
              style: hud.ai === true ? aiChipButtonStyle : ghostButtonStyle,
              onClick: togglePilot,
              title: t('game.watch')
            }, t(hud.ai === true ? 'game.aiOn' : 'game.aiOff')),
            playing
              ? h('button', {
                type: 'button',
                style: hud.paused === true ? aiChipButtonStyle : ghostButtonStyle,
                onClick: togglePause,
                title: t(hud.paused === true ? 'game.resume' : 'game.pause')
              }, hud.paused === true ? '▶' : '⏸')
              : null,
            playing
              ? h('button', {
                type: 'button',
                style: ghostButtonStyle,
                onClick: exitGame,
                title: t('game.exit')
              }, '✕')
              : null,
            playing
              ? h('button', {
                type: 'button',
                style: ghostButtonStyle,
                onClick: () => { if (gameRef.current !== null) gameRef.current.start(); }
              }, t('game.restart'))
              : null
          )
        ),
        h('div', { style: { position: 'relative', display: 'flex', flex: '1 1 auto', minHeight: 0 } }, children)
      );
    }

    function apply(ctx) {
      localeService = ctx.locale;
      translate = ctx.locale.bind(NS);
      // 后台浮窗里「回到面板」要能切回来；没有 layout 服务时按钮就只是不响应
      layoutApi = ctx.layout || null;

      ctx.effect(() => ctx.locale.register(NS, flattenDict(DICTS)), 'dsh-shooter: dictionaries');

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
      // layout：浮窗的「回到面板」用它切回枪战精英（和插件页同一种做法）
      inject: ['slots', 'locale', 'layout'],
      apply: apply,
      // 仅给离线脚本用（scripts/）；DSH 只读取 name/inject/apply。
      __test: {
        mountGame: mountGame,
        drawPetFish: drawPetFish,
        ShooterPanel: ShooterPanel,
        sfxPlay: sfxPlay,
        setMuted: setMuted,
        readBest: readBest,
        writeBest: writeBest,
        readMeta: readMeta,
        setSkin: setSkin,
        readLeaderboard: readLeaderboard,
        recordLeaderboard: recordLeaderboard,
        readAchievements: readAchievements,
        unlockAchievements: unlockAchievements,
        readRuns: readRuns,
        SKINS: SKINS,
        ACHIEVEMENTS: ACHIEVEMENTS,
        comboMultiplier: comboMultiplier,
        comboWindow: COMBO_WINDOW,
        UPGRADES: UPGRADES,
        defaultMods: defaultMods,
        applyUpgrade: applyUpgrade,
        upgradeWeight: upgradeWeight,
        SPEEDS: SPEEDS,
        LEVELS: LEVELS,
        AI_LEVELS: AI_LEVELS,
        speedLabel: speedLabel,
        readSpeed: readSpeed,
        writeSpeed: writeSpeed,
        readLevel: readLevel,
        writeLevel: writeLevel,
        readPetStats: readPetStats,
        setSfxSilence: setSfxSilence,
        readDesk: readDesk,
        FISH_SIZES: FISH_SIZES,
        deskFishSize: deskFishSize,
        readCalm: readCalm,
        setCalmMode: setCalmMode,
        readAmbient: readAmbient,
        writeAmbient: writeAmbient,
        setAmbient: setAmbient
      }
    };
  }
});

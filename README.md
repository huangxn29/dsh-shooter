# dsh-shooter

A top-down arena shooter that opens as a full panel in [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), reached from a crosshair entry in the left sidebar.

[中文说明](#中文说明)

## What it does

The sidebar entry opens a self-contained arena shooter rendered on a canvas: survive ever-larger waves of enemies, keep your health bar above zero, and restart when the run ends. The panel chrome (header, buttons, overlays) is drawn with the harness theme tokens, so it follows the active light or dark theme; the playfield keeps its own dark palette.

- **Waves.** Each wave queues more enemies than the last; a new wave starts once the field is clear.
- **Four enemy types.** Grunts chase you, runners are fast and fragile, tanks are slow and armoured, gunners keep their distance and shoot back.
- **Dash.** A short burst with a few invulnerable frames — the way out of a corner.
- **Health pickups.** A small chance to drop from a defeated enemy.
- **Bilingual.** English and 简体中文 strings come from the harness client locale service, so the panel follows the language you pick in the harness.
- **Offline.** No network calls, no storage, no data collection.

## Controls

| Input | Action |
| --- | --- |
| `W` `A` `S` `D` | Move |
| Mouse | Aim |
| Hold left button | Fire |
| `Shift` | Dash |

Keys only steer the game while its panel is the visible one, so typing in the chat composer never moves the player.

## Install

Requires DeepSeek Harness 0.2.0 or newer with a Web client.

Install it from the DeepSeek Harness plugin market, or add this repository with your harness's `dsh plugin add` command — run `dsh plugin --help` to see the spec form your version accepts.

After installing, open the Plugins page and enable **Shooter elite**; the entry appears at the bottom of the left sidebar panel list. Reload the page once if the entry does not show up immediately.

## Uninstall

Disable or remove **Shooter elite** on the Plugins page. Nothing else is left behind — the plugin writes no files outside its own package.

## License

MIT. See [LICENSE](LICENSE).

---

## 中文说明

一个俯视角竞技场射击游戏，作为完整面板运行在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 里，入口是左侧栏面板列表里的准星图标。

- **波次**：每一波敌人更多，清空场地即进入下一波。
- **四种敌人**：小兵追击、疾行者快速而脆弱、重装者迟缓但皮厚、枪手保持距离并远程射击。
- **冲刺**：短距离突进，带几帧无敌，用来脱身。
- **回血包**：击败敌人有小概率掉落。
- **双语**：中英文案取自 harness 的客户端语言服务，跟随你选择的界面语言。
- **完全离线**：不联网、不写存储、不收集任何数据。

**操作**：`WASD` 移动，鼠标瞄准，按住左键射击，`Shift` 冲刺。只有在游戏面板可见时按键才会生效，不会干扰在聊天框里的输入。

**安装**：需要 DeepSeek Harness 0.2.0 及以上的 Web 版本。在插件市场安装，或用 `dsh plugin add` 添加本仓库（具体写法见 `dsh plugin --help`）。安装后在插件页启用「枪战精英」，入口出现在左侧栏面板列表底部；若未立即出现，刷新一次页面。

**卸载**：在插件页禁用或移除「枪战精英」即可，插件不会在自身目录之外留下文件。

**许可**：MIT，见 [LICENSE](LICENSE)。

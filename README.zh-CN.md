<p align="center">
  <img src="media/logo.png" alt="REAP" width="80" height="80" />
</p>

<h1 align="center">REAP</h1>

<p align="center">
  <strong>Recursive Evolutionary Autonomous Pipeline</strong><br>
  AI与人类通过迭代Generation来进化软件的开发管线。
</p>

> [English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md)

<table align="center">
<tr>
<td align="center"><strong>Genome</strong><br><sub>设计与知识</sub></td>
<td align="center">→</td>
<td align="center"><strong>Evolution</strong><br><sub>代际进化</sub></td>
<td align="center">→</td>
<td align="center"><strong>Civilization</strong><br><sub>Source Code</sub></td>
</tr>
</table>

REAP定义应用程序的遗传信息（Genome），为每个世代设定目标进行实现，并将过程中发现的Genome缺陷反馈到后续阶段。随着世代的积累，Genome不断进化，Source Code（Civilization）持续成长。

## 为什么选择REAP？

在使用AI代理进行开发时，你是否遇到过这些问题？

- **上下文丢失** — 每次开启新会话，代理就会忘记项目上下文
- **分散开发** — 没有明确目标地到处修改代码
- **设计与代码脱节** — 文档和代码随着时间推移越来越不一致
- **遗忘的教训** — 辛苦获得的经验教训无法带到下一次工作中

REAP通过**基于世代的进化模型**解决这些问题：

- 每个世代专注于一个目标（Objective → Completion）
- AI代理在每次会话开始时自动获取当前上下文（SessionStart Hook）
- 实现过程中发现的设计问题记录在backlog中，在Completion时反映
- 回顾（Completion）中提取的教训积累在Genome中

## 安装

```bash
# npm
npm install -g @c-d-cc/reap

# 或 Bun
bun install -g @c-d-cc/reap
```

> **要求**：[Node.js](https://nodejs.org) v18+，[Claude Code](https://claude.ai/claude-code)或[OpenCode](https://opencode.ai) CLI。[Bun](https://bun.sh)是可选的。

## 快速开始

```bash
# 1. 初始化项目

# 新项目
reap init my-project

# 现有项目
cd my-project
reap init

# 2. 在Claude Code中运行一个完整的Generation
claude
> /reap.evolve "实现用户认证"
```

`/reap.evolve`会自动运行一个Generation的完整生命周期 — 从Objective到Completion — 与用户交互式进行。它处理Generation的创建、每个阶段的执行以及阶段间的推进。这是日常开发中最常用的核心命令。

如果需要更精细的控制，也可以手动推进每个阶段：

```bash
> /reap.start            # 开始新的Generation
> /reap.objective        # 定义目标 + 规格
> /reap.next             # 前进到下一阶段
> /reap.planning         # 实施计划
> /reap.next
> /reap.implementation   # AI+人类协作编写代码
> ...
```

## 生命周期

每个Generation经历5个阶段的生命周期：

```
Objective → Planning → Implementation ⟷ Validation → Completion
（目标定义）  （计划）     （实现）             （验证）     （完成）
```

| 阶段 | 内容 | 产出物 |
|------|------|--------|
| **Objective** | 定义目标 + 需求 + 验收标准 | `01-objective.md` |
| **Planning** | 任务分解、实施方案、依赖关系 | `02-planning.md` |
| **Implementation** | AI+人类协作编写代码 | `03-implementation.md` |
| **Validation** | 执行测试、检查完成条件 | `04-validation.md` |
| **Completion** | 回顾 + 应用Genome变更 + 归档 | `05-completion.md` |

## 核心概念

### Genome

应用程序的遗传信息 — 架构原则、业务规则、开发约定、技术约束的集合。

```
.reap/genome/
├── principles.md      # 架构原则/决策
├── domain/            # 业务规则（按模块）
├── conventions.md     # 开发规则/约定
└── constraints.md     # 技术约束/选择
```

**Genome不变原则**：当前世代不直接修改Genome。发现问题时记录在backlog中，仅在Completion阶段反映。

**Environment不变原则**：当前世代不直接修改Environment。发现外部环境变化时记录在backlog中，在Completion阶段反映。

### Backlog

`.reap/life/backlog/`中存储所有待反映的项目。每个项目使用markdown + frontmatter格式：

- `type: genome-change` — 在Completion时应用到Genome
- `type: environment-change` — 在Completion时应用到Environment
- `type: task` — 下一个Objective的目标候选（延期任务、技术债务等）

每个项目还有`status`字段：

- `status: pending` — 未处理项目（默认）
- `status: consumed` — 在当前世代中已处理（需要`consumedBy: gen-XXX`）

归档时（`/reap.next` from Completion），`consumed`项目移至lineage，`pending`项目结转到下一个世代的backlog。

**部分完成是正常的** — 依赖Genome变更的任务标记为`[deferred]`并交接到下一个世代。

### 四轴结构

```
.reap/
├── genome/        # 遗传信息（跨世代进化）
├── environment/   # 外部环境（API文档、基础设施、业务约束）
├── life/          # 当前世代的状态和产出物
└── lineage/       # 已完成世代的归档
```

## CLI命令

| 命令 | 说明 |
|------|------|
| `reap init <name>` | 初始化项目。创建`.reap/`结构 |
| `reap status` | 查看当前Generation状态 |
| `reap update` | 将命令/模板/hook同步到最新版本 |
| `reap fix` | 诊断和修复`.reap/`结构 |
| `reap help` | 输出CLI命令 + 斜杠命令 + 工作流摘要 |

### 选项

```bash
reap init my-project --mode adoption    # 将REAP应用到现有项目
reap init my-project --preset bun-hono-react  # 使用预设初始化Genome
reap update --dry-run                   # 预览变更
```

## 代理集成

REAP通过斜杠命令和会话钩子与AI代理集成。当前支持的代理：**Claude Code**、**OpenCode**。

### 斜杠命令

斜杠命令安装在`.claude/commands/`中，驱动整个工作流：

| 命令 | 说明 |
|------|------|
| `/reap.start` | 开始新的Generation |
| `/reap.objective` | 定义目标 + 需求 |
| `/reap.planning` | 任务分解 + 实施计划 |
| `/reap.implementation` | AI+人类协作编写代码 |
| `/reap.validation` | 执行测试、检查完成条件 |
| `/reap.completion` | 回顾 + 应用Genome变更 |
| `/reap.next` | 前进到下一个生命周期阶段 |
| `/reap.back` | 回到前一个阶段（micro loop） |
| `/reap.status` | 显示当前Generation状态和项目健康度 |
| `/reap.sync` | 基于源代码同步Genome |
| `/reap.help` | 24+主题的上下文AI帮助（workflow, genome, backlog, strict, agents, hooks, config, evolve, regression, author及所有命令名） |
| `/reap.update` | 检查REAP更新并升级到最新版本 |
| **`/reap.evolve`** | **从头到尾运行一个完整的Generation（推荐）** |

### SessionStart Hook

每次会话开始时自动运行，向AI代理注入以下内容：

- REAP工作流完整指南（Genome、生命周期、四轴结构等）
- 当前Generation状态（在哪个阶段、下一步做什么）
- 遵循REAP生命周期的规则

这确保即使打开新会话，代理也能立即理解项目上下文。

### Strict模式

在`.reap/config.yml`中设置`strict: true`可以限制AI代理在REAP工作流之外修改代码：

```yaml
# .reap/config.yml
strict: true      # 默认：false
language: korean  # 产出物和交互的语言
autoUpdate: true  # 会话开始时自动更新
agents:           # 检测到的代理（由reap init/update管理）
  - claude-code
  - opencode
```

| 情境 | 行为 |
|------|------|
| 无活跃Generation / 非实现阶段 | 代码修改完全阻止 |
| Implementation阶段 | 仅允许`02-planning.md`范围内的修改 |
| 逃生舱 | 用户明确请求"override"或"bypass strict"时允许 |

Strict模式默认禁用（`strict: false`）。

### REAP Hooks

在`.reap/config.yml`中定义hook，在生命周期事件时执行命令或AI提示：

```yaml
hooks:
  onGenerationStart:
    - command: "echo 'Generation started'"
  onStageTransition:
    - command: "echo 'Stage changed'"
  onGenerationComplete:
    - command: "reap update"
    - prompt: "如果本Generation有功能变更，请更新README。"
  onRegression:
    - command: "echo 'Regressed'"
```

每个hook使用`command`（shell命令）或`prompt`（AI代理指令）之一。

| 事件 | 触发时机 |
|------|----------|
| `onGenerationStart` | `/reap.start`创建新Generation后 |
| `onStageTransition` | `/reap.next`前进到下一阶段后 |
| `onGenerationComplete` | `/reap.next`归档已完成的Generation后 |
| `onRegression` | `/reap.back`回到前一阶段后 |

Hook由AI代理在项目根目录中执行。

## `reap init`后的项目结构

```
my-project/
├── src/                          # Civilization（源代码）
└── .reap/
    ├── config.yml                # 项目配置
    ├── genome/                   # 遗传信息
    │   ├── principles.md
    │   ├── domain/
    │   ├── conventions.md
    │   └── constraints.md
    ├── environment/              # 外部环境
    ├── life/                     # 当前世代
    │   ├── current.yml
    │   └── backlog/
    └── lineage/                  # 已完成世代的归档

~/.claude/                        # 用户级别（reap init时安装）
├── commands/                     # 斜杠命令（/reap.*）
└── settings.json                 # SessionStart hook注册
```

## 谱系压缩（Lineage Compression）

随着世代的积累，lineage目录会变大。REAP通过自动两级压缩来管理：

| 级别 | 输入 | 输出 | 最大行数 | 触发条件 |
|------|------|------|----------|----------|
| **Level 1** | 世代文件夹（5个产出物） | `gen-XXX.md` | 40行 | lineage > 10,000行 + 5个以上世代 |
| **Level 2** | 5个Level 1文件 | `epoch-XXX.md` | 60行 | Level 1达到5个以上 |

压缩在世代完成时自动执行。压缩后的文件以目标（Objective）和结果（Completion）为中心保存，中间过程仅保留特别事项。

## 进化流程（Evolution Flow）

```
Generation #1 (Genome v1)
  → Objective: "实现用户认证"
  → Planning → Implementation
  → Implementation中发现需要OAuth2 → 在backlog中记录genome-change
  → Validation (partial)
  → Completion → 回顾 + genome反映 → Genome v2 → 归档

Generation #2 (Genome v2)
  → Objective: "OAuth2集成 + 权限管理"
  → 上一世代的延期任务 + 新目标
  → ...
```

## 预设（Presets）

使用`reap init --preset`应用适合技术栈的Genome初始配置。

| 预设 | 技术栈 |
|------|--------|
| `bun-hono-react` | Bun + Hono + React |

```bash
reap init my-project --preset bun-hono-react
```

## 入口模式（Entry Modes）

| 模式 | 说明 |
|------|------|
| `greenfield` | 从零开始构建新项目（默认） |
| `migration` | 参考现有系统进行新建 |
| `adoption` | 将REAP应用到现有代码库 |

## 作者

**HyeonIL Choi** — [c-d.cc](https://c-d.cc) | [LinkedIn](https://www.linkedin.com/in/hichoi-dev) | [GitHub](https://github.com/c-d-cc/reap)

## 许可证

MIT

> [English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md)

<p align="center">
  <img src="media/logo.png" alt="REAP" width="80" height="80" />
</p>

<h1 align="center">REAP</h1>

<p align="center">
  <strong>Recursive Evolutionary Autonomous Pipeline</strong><br>
  AI与人类通过迭代Generation来进化软件的开发管线。
</p>

<table align="center">
<tr>
<td align="center"><strong>Knowledge Base</strong><br><sub>Genome + Environment</sub></td>
<td align="center">→</td>
<td align="center"><strong>Evolution</strong><br><sub>代际进化</sub></td>
<td align="center">→</td>
<td align="center"><strong>Civilization</strong><br><sub>Source Code</sub></td>
</tr>
</table>

REAP记录应用程序的设计知识 — Genome（架构、约定、约束）和Environment（外部API、基础设施） — 并在每个世代设定目标进行实现。过程中发现的缺陷反馈到Knowledge Base。随着世代的积累，知识不断进化，Source Code（Civilization）持续成长。

## 目录

- [为什么选择REAP？](#为什么选择reap)
- [安装](#安装)
- [快速开始](#快速开始)
- [生命周期](#生命周期)
- [核心概念](#核心概念)
- [分布式工作流 — 并行开发](#分布式工作流--并行开发)
- [CLI命令](#cli命令)
- [代理集成](#代理集成)
- [`reap init`后的项目结构](#reap-init后的项目结构)
- [谱系压缩（Lineage Compression）](#谱系压缩lineage-compression)
- [进化流程（Evolution Flow）](#进化流程evolution-flow)
- [预设（Presets）](#预设presets)
- [签名锁定（Signature-Based Locking）](#签名锁定signature-based-locking)
- [入口模式（Entry Modes）](#入口模式entry-modes)

## 为什么选择REAP？

在使用AI代理进行开发时，你是否遇到过这些问题？

- **上下文丢失** — 每次开启新会话，代理就会忘记项目上下文
- **分散开发** — 没有明确目标地到处修改代码
- **设计与代码脱节** — 文档和代码随着时间推移越来越不一致
- **遗忘的教训** — 辛苦获得的经验教训无法带到下一次工作中
- **协作混乱** — 多个开发者或代理并行工作时冲突频发，合并变成噩梦

REAP通过**基于世代的进化模型**解决这些问题：

- 每个世代专注于一个目标（Objective → Completion）
- AI代理在每次会话开始时自动获取当前上下文（SessionStart Hook）
- 实现过程中发现的设计问题记录在backlog中，在Completion时反映
- 回顾（Completion）中提取的教训积累在Genome中
- 跨世代自动检测重复的手动操作，经用户确认后生成Hook
- 跨分支的并行工作通过genome-first合并工作流进行协调 — 先解决设计冲突，再解决代码冲突

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

## 生命周期 [↗](https://reap.cc/docs/lifecycle)

每个Generation经历5个阶段的生命周期：

```
Objective → Planning → Implementation ⟷ Validation → Completion
（目标定义）  （计划）     （实现）             （验证）     （完成）
```

| 阶段 | 内容 | 产出物 |
|------|------|--------|
| **Objective** | 通过结构化头脑风暴定义目标与设计：澄清问题、方案替代、分段设计、视觉伴侣、Spec审查 | `01-objective.md` |
| **Planning** | 任务分解、实施方案、依赖关系 | `02-planning.md` |
| **Implementation** | AI+人类协作编写代码 | `03-implementation.md` |
| **Validation** | 执行测试、检查完成条件 | `04-validation.md` |
| **Completion** | 回顾 + 应用Genome变更 + Hook建议 + 自动归档（consume + archive + commit） | `05-completion.md` |

## 核心概念 [↗](https://reap.cc/docs/core-concepts)

### Genome [↗](https://reap.cc/docs/genome)

应用程序的遗传信息 — 架构原则、业务规则、开发约定、技术约束的集合。

```
.reap/genome/
├── principles.md      # 架构原则/决策
├── domain/            # 业务规则（按模块）
├── conventions.md     # 开发规则/约定
├── constraints.md     # 技术约束/选择
└── source-map.md      # C4 Container/Component图（Mermaid）
```

**Genome不变原则**：当前世代不直接修改Genome。发现问题时记录在backlog中，仅在Completion阶段反映。

**Environment不变原则**：当前世代不直接修改Environment。发现外部环境变化时记录在backlog中，在Completion阶段反映。

### Backlog [↗](https://reap.cc/docs/backlog)

`.reap/life/backlog/`中存储所有待反映的项目。每个项目使用markdown + frontmatter格式：

- `type: genome-change` — 在Completion时应用到Genome
- `type: environment-change` — 在Completion时应用到Environment
- `type: task` — 下一个Objective的目标候选（延期任务、技术债务等）

每个项目还有`status`字段：

- `status: pending` — 未处理项目（默认）
- `status: consumed` — 在当前世代中已处理（需要`consumedBy: gen-XXX-{hash}`）

归档时（`/reap.next` from Completion），`consumed`项目移至lineage，`pending`项目结转到下一个世代的backlog。

**部分完成是正常的** — 依赖Genome变更的任务标记为`[deferred]`并交接到下一个世代。

### 四轴结构 [↗](https://reap.cc/docs/core-concepts)

```
.reap/
├── genome/        # 遗传信息（跨世代进化）
├── environment/   # 外部环境（API文档、基础设施、业务约束）
├── life/          # 生命周期 — 当前世代的状态和产出物
└── lineage/       # 已完成世代的归档
```

## 分布式工作流 — 并行开发

> **⚠ 早期阶段** — 分布式工作流需要进一步测试。请在生产环境中谨慎使用。我们正在收集反馈 — [提交Issue](https://github.com/c-d-cc/reap/issues)。

REAP支持多个开发者或AI代理在同一项目中并行工作的分布式协作，无需中央服务器，Git是唯一的传输层。

### 工作原理

```
Machine A: branch-a — gen-046-a (authentication)    → /reap.push
Machine B: branch-b — gen-046-b (search)            → /reap.push

Machine A:
  /reap.pull branch-b   → Fetch + 运行完整的合并Generation生命周期
```

每台机器在自己的分支和Generation上独立工作。需要合并时，REAP通过**genome-first**策略来协调（[了解更多](https://reap.cc/docs/merge-generation)）：

1. **Detect** — 通过git ref扫描远程分支的genome和lineage，识别分歧点
2. **Mate** — 首先解决Genome冲突（由人工判断）
3. **Merge** — 以确定的Genome为基准合并源代码（`git merge --no-commit`）
4. **Sync** — AI比较Genome和源代码的一致性；发现不一致时由用户确认
5. **Validation** — 运行机械化测试（bun test、tsc、build）— 与正常Generation相同
6. **Completion** — 提交合并结果并归档

### 分布式工作流斜杠命令

所有分布式操作通过AI代理执行：

```bash
/reap.pull <branch>        # Fetch + 运行完整合并Generation（分布式 /reap.evolve）
/reap.merge <branch>       # 本地分支完整合并Generation（无需fetch）
/reap.push                 # 验证REAP状态 + push当前分支
/reap.merge.start          # 启动合并Generation（用于逐步控制）
/reap.merge.detect         # 分析分歧
/reap.merge.mate           # 解决Genome冲突
/reap.merge.merge          # 合并源代码
/reap.merge.sync           # 验证Genome-源代码一致性
/reap.merge.validation     # 运行机械化测试（bun test、tsc、build）
/reap.merge.evolve         # 从当前阶段运行合并生命周期
```

### 核心原则

- **Opt-in** — `git pull`/`push`始终正常工作。REAP命令是附加的。
- **Genome-first** — 在源代码合并之前先解决Genome冲突。就像先修宪再修法。
- **无需服务器** — 一切基于本地 + Git，无需外部服务。
- **DAG lineage** — 每个世代通过基于哈希的ID（`gen-046-a3f8c2`）引用其父代，形成有向无环图，天然支持并行工作。

## CLI命令 [↗](https://reap.cc/docs/cli-reference)

| 命令 | 说明 |
|------|------|
| `reap init <name>` | 初始化项目。创建`.reap/`结构 |
| `reap status` | 查看当前Generation状态 |
| `reap update` | 将命令/模板/hook同步到最新版本 |
| `reap fix` | 诊断和修复`.reap/`结构 |
| `reap help` | 输出CLI命令 + 斜杠命令 + 工作流摘要（显示版本 + 最新状态） |
| `reap run <cmd>` | 直接执行斜杠命令的脚本（由1行`.md` wrapper内部调用） |

### 选项

```bash
reap init my-project --mode adoption    # 将REAP应用到现有项目
reap init my-project --preset bun-hono-react  # 使用预设初始化Genome
reap update --dry-run                   # 预览变更
```

## 代理集成

REAP通过斜杠命令和会话钩子与AI代理集成。当前支持的代理：**Claude Code**、**OpenCode**。

### Script Orchestrator架构

从v0.11.0开始，28个斜杠命令全部采用**1行`.md` wrapper + TypeScript脚本**模式。每个`.md`文件仅调用`reap run <cmd>`，TS脚本（`src/cli/commands/run/`）处理所有确定性逻辑，以structured JSON形式指示AI代理。大幅提升了一致性和可测试性。

### 签名锁定（Signature-Based Locking） [↗](https://reap.cc/docs/advanced)

REAP使用加密nonce链来强制执行阶段顺序。当阶段命令运行时，脚本生成一次性nonce，将其哈希存储在`current.yml`中，并将nonce返回给AI代理。`/reap.next`需要此nonce才能推进 — 没有它，推进将被拒绝。

```
Stage Command          current.yml              /reap.next
─────────────          ───────────              ──────────
生成nonce ────────────→ 存储hash(nonce)
将nonce返回给AI                            ←── AI传递nonce
                                               验证hash(nonce)
                                               ✓ 阶段推进
```

这可以防止：
- **跳过阶段** — 未执行的阶段不存在有效的nonce
- **伪造令牌** — 哈希是单向的，从哈希推测nonce是不可行的
- **重放旧nonce** — 每个nonce是一次性的，绑定到当前阶段

### autoSubagent模式

执行`/reap.evolve`时，可自动将整个Generation生命周期委托给subagent：

```yaml
# .reap/config.yml
autoSubagent: true    # 默认值: true
```

Subagent接收完整上下文后自主执行所有阶段，仅在确实遇到阻碍时才向用户确认。

### 错误时自动Issue报告

当`reap run`执行中发生意外错误时，可通过`gh issue create`自动创建GitHub Issue：

```yaml
# .reap/config.yml
autoIssueReport: true    # 默认值: true（检测到gh CLI时）
```

### AI Migration Agent

`reap update`执行时，如果检测到项目与最新REAP版本之间的结构性差异（缺失的config字段、过时的模板等），会提供AI辅助的迁移提示。代理分析差异并交互式地应用变更，无需手动迁移。

`reap init`会明确声明所有config字段，`reap update`时自动补全缺失字段。

### CLAUDE.md集成

`reap init`和`reap update`执行时，会在`.claude/CLAUDE.md`中添加REAP管理段落，为Claude Code会话提供必要的项目上下文。

### 斜杠命令 [↗](https://reap.cc/docs/command-reference)

斜杠命令安装在`.claude/commands/`中，驱动整个工作流：

| 命令 | 说明 |
|------|------|
| `/reap.start` | 开始新的Generation |
| `/reap.objective` | 定义目标 + 需求 |
| `/reap.planning` | 任务分解 + 实施计划 |
| `/reap.implementation` | AI+人类协作编写代码 |
| `/reap.validation` | 执行测试、检查完成条件 |
| `/reap.completion` | 回顾 + 应用Genome变更 + lineage压缩 |
| `/reap.next` | 前进到下一个生命周期阶段 |
| `/reap.back` | 回到前一个阶段（micro loop） |
| `/reap.abort` | 中止当前Generation（rollback/stash/hold + backlog保存） |
| `/reap.status` | 显示当前Generation状态和项目健康度 |
| `/reap.sync` | 同时同步Genome和Environment |
| `/reap.sync.genome` | 基于源代码同步Genome |
| `/reap.sync.environment` | 发现和记录外部环境依赖 |
| `/reap.config` | 显示当前项目配置 |
| `/reap.report` | 向REAP项目报告bug/反馈（隐私保护） |
| `/reap.help` | 24+主题的上下文AI帮助 |
| `/reap.update` | 升级REAP包 + 同步命令/模板/hook |
| **`/reap.evolve`** | **从头到尾运行一个完整的Generation（推荐）** |
| **`/reap.pull <branch>`** | **Fetch + 运行完整合并Generation（分布式 `/reap.evolve`）** |
| **`/reap.merge <branch>`** | **本地分支完整合并Generation（无需fetch）** |
| `/reap.push` | 验证REAP状态并push当前分支 |
| `/reap.merge.start` | 启动合并Generation以整合分歧分支 |
| `/reap.merge.detect` | 分析分支间的分歧 |
| `/reap.merge.mate` | 在源代码合并前解决Genome冲突 |
| `/reap.merge.merge` | 以解决后的Genome为指导合并源代码 |
| `/reap.merge.sync` | 验证Genome与源代码的一致性（AI比较，用户确认） |
| `/reap.merge.validation` | 运行机械化测试（bun test、tsc、build） |
| **`/reap.merge.evolve`** | **自动运行完整的合并生命周期** |

### SessionStart Hook [↗](https://reap.cc/docs/hooks)

每次会话开始时自动运行，向AI代理注入以下内容：

- REAP工作流完整指南（Genome、生命周期、四轴结构等）
- 当前Generation状态（在哪个阶段、下一步做什么）
- 遵循REAP生命周期的规则
- Genome新鲜度检测 — 检查上次Genome更新后是否有代码相关提交（`src/`、`tests/`、`package.json`、`tsconfig.json`、`scripts/`），纯文档变更除外
- Source-map漂移检测 — 将`source-map.md`中记录的组件与项目中的实际文件进行比对

这确保即使打开新会话，代理也能立即理解项目上下文。

### Strict模式

Strict模式控制AI代理被允许执行的操作。支持两个细粒度选项：

```yaml
# .reap/config.yml
strict: true              # 简写：同时启用edit和merge

# 或细粒度控制：
strict:
  edit: true              # 将代码修改限制在REAP生命周期内
  merge: false            # 限制直接的git pull/push/merge
```

**`strict.edit`** — 代码修改控制：

| 情境 | 行为 |
|------|------|
| 无活跃Generation / 非实现阶段 | 代码修改完全阻止 |
| Implementation阶段 | 仅允许`02-planning.md`范围内的修改 |
| 逃生舱 | 用户明确请求"override"或"bypass strict"时允许 |

**`strict.merge`** — Git命令控制：启用后，直接使用`git pull`/`push`/`merge`将被限制。代理会引导用户使用`/reap.pull`、`/reap.push`、`/reap.merge`。

两者默认都禁用。`strict: true`同时启用两者。

Strict模式默认禁用（`strict: false`）。

### REAP Hooks [↗](https://reap.cc/docs/hooks)

Hook基于文件，存储在`.reap/hooks/`中。每个Hook是一个以`{event}.{name}.{md|sh}`命名的文件：

- `.md`文件包含AI提示词（由AI代理执行）
- `.sh`文件包含Shell脚本（直接执行）

```
.reap/hooks/
├── onLifeStarted.context-load.md
├── onLifeCompleted.version-bump.md
├── onLifeCompleted.readme-update.md
├── onLifeTransited.notify.sh
└── onLifeRegretted.alert.sh
```

每个Hook文件支持包含以下字段的frontmatter：

```yaml
---
condition: has-code-changes   # .reap/hooks/conditions/中的脚本名称
order: 10                     # 执行顺序（数值越小越先执行）
---
```

**Normal Lifecycle Events:**

| 事件 | 触发时机 |
|------|----------|
| `onLifeStarted` | `/reap.start`创建新Generation后 |
| `onLifeObjected` | objective阶段完成后 |
| `onLifePlanned` | planning阶段完成后 |
| `onLifeImplemented` | implementation阶段完成后 |
| `onLifeValidated` | validation阶段完成后 |
| `onLifeCompleted` | completion + 归档后（git commit之后运行） |
| `onLifeTransited` | 所有stage转换时（通用） |
| `onLifeRegretted` | `/reap.back` regression时 |

**Merge Lifecycle Events:**

| 事件 | 触发时机 |
|------|----------|
| `onMergeStarted` | `/reap.merge.start`创建合并Generation后 |
| `onMergeDetected` | detect阶段完成后 |
| `onMergeMated` | mate阶段完成后（genome确定） |
| `onMergeMerged` | merge阶段完成后（源代码合并） |
| `onMergeSynced` | sync阶段完成后 |
| `onMergeValidated` | merge validation完成后 |
| `onMergeCompleted` | merge completion + 归档后 |
| `onMergeTransited` | 所有merge stage转换时（通用） |

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
    │   ├── constraints.md
    │   └── source-map.md
    ├── hooks/                    # Lifecycle hooks (.md/.sh)
    ├── environment/              # 外部环境
    ├── life/                     # 当前世代
    │   ├── current.yml
    │   └── backlog/
    └── lineage/                  # 已完成世代的归档

~/.reap/                          # 用户级别（reap init时安装）
├── commands/                     # 斜杠命令原件（1行.md wrapper）
└── templates/                    # Artifact模板

~/.claude/
└── settings.json                 # SessionStart hook注册

.claude/commands/                 # 项目级斜杠命令
└── reap.*.md                     # 活跃斜杠命令（调用`reap run <cmd>`）
```

## 谱系压缩（Lineage Compression）

随着世代的积累，lineage目录会变大。REAP通过自动两级压缩来管理：

| 级别 | 输入 | 输出 | 最大行数 | 触发条件 |
|------|------|------|----------|----------|
| **Level 1** | 世代文件夹（5个产出物） | `gen-XXX-{hash}.md` | 40行 | lineage > 5,000行 + 5个以上世代 |
| **Level 2** | 5个Level 1文件 | `epoch-XXX.md` | 60行 | Level 1达到5个以上 |

压缩在世代完成时自动执行。最近3个世代始终受到保护，不会被压缩。压缩后的文件以目标（Objective）和结果（Completion）为中心保存，中间过程仅保留特别事项。

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

**HyeonIL Choi** — [hichoi@c-d.cc](mailto:hichoi@c-d.cc) | [c-d.cc](https://c-d.cc) | [LinkedIn](https://www.linkedin.com/in/hichoi-dev) | [GitHub](https://github.com/casamia918)

## 许可证

MIT

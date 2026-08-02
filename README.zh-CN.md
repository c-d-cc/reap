<p align="center">
  <img src="https://raw.githubusercontent.com/c-d-cc/reap/main/media/logo.png" alt="REAP" width="80" height="80" />
</p>

<h1 align="center">REAP</h1>

<p align="center">
  <strong>Recursive Evolutionary Autonomous Pipeline</strong><br>
  一个自我进化的开发管道，AI 与人类在代际迭代中协同进化软件。
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/c-d-cc/reap/main/media/architecture.png" alt="REAP Architecture" width="600" />
</p>

REAP 是一个基于代际迭代的开发管道，AI 与人类协作构建和进化软件。人类提供愿景并做出关键决策。AI 学习项目知识——Genome（架构、规范、约束）和 Environment（代码库、依赖、领域）——然后通过结构化的代际迭代来实施、验证和适应。每个完成的代际迭代将经验教训回馈到知识库中。随着时间推移，知识和源代码（Civilization）都在自我进化。

## 目录

- [什么是 REAP？](#什么是-reap)
- [安装](#安装)
- [快速开始](#快速开始-)
- [生命周期](#生命周期-)
- [核心概念](#核心概念-)
- [合并生命周期](#合并生命周期-)
- [自进化特性](#自进化特性-)
- [斜杠命令](#斜杠命令-)
- [智能体集成](#智能体集成-)
- [项目结构](#项目结构)
- [配置](#配置-)
- [从 v0.15 升级](#从-v015-升级-)

## 什么是 REAP？ [↗](https://reap.cc/docs/introduction)

在使用 AI 智能体进行开发时，你是否遇到过以下问题？

- **上下文丢失** — 开启新会话时，智能体忘记了一切
- **开发零散** — 代码修改没有明确的方向或目标
- **设计与代码脱节** — 文档与实际实现产生偏差
- **经验教训遗忘** — 辛苦获得的洞见无法延续
- **协作混乱** — 多个智能体或开发者产生相互冲突的变更

REAP 通过**自进化代际模型**解决这些问题：

- 每个代际迭代遵循结构化的生命周期：了解当前状态、规划目标、实施、验证和反思
- AI 智能体在每次会话开始时自动恢复完整的项目上下文
- 规范性知识（Genome）通过人类批准的适应在每个代际迭代完成时进化
- AI 通过分析愿景与当前状态之间的差距自动选择目标
- 清晰度驱动的交互确保 AI 以结构化、带示例和诚实意见的方式进行沟通
- 跨分支的并行工作通过 genome 优先的合并工作流进行协调

## 安装

> **需要全局安装。**

```bash
npm install -g @c-d-cc/reap
```

> **前提条件**：[Node.js](https://nodejs.org) v18+ 以及以下任一受支持的 AI 智能体：
> - [Claude Code](https://claude.ai/claude-code) CLI（默认）
> - [OpenCode](https://opencode.ai) — `/reap.init` 后在 `.reap/config.yml` 中设置 `agentClient: opencode`

## 快速开始 [↗](https://reap.cc/docs/quick-start)

打开你的 AI 智能体（Claude Code 或 OpenCode）并使用斜杠命令：

```bash
# 在你的项目中初始化 REAP（自动检测是全新项目还是已有代码库）
/reap.init

# 运行一个完整的代际迭代
/reap.evolve
```

`/reap.evolve` 驱动整个代际迭代生命周期——从学习到完成。AI 探索项目、规划工作、实施、验证并反思。这是日常开发的主要命令。

> **OpenCode 用户**：`/reap.init` 后，在 `.reap/config.yml` 中设置 `agentClient: opencode`，然后运行 `reap update` 以重新生成客户端特定的资产（`opencode.json`、`.opencode/plugins/reap-plugin.ts`、`AGENTS.md` 以及 `~/.config/opencode/commands/` 中的斜杠命令）。

> **注意：** 用户通过 AI 智能体中的 `/reap.*` 斜杠命令与 REAP 交互。CLI 是驱动这些命令的内部引擎。

## 生命周期 [↗](https://reap.cc/docs/lifecycle)

每个代际迭代遵循五个阶段的生命周期。

```
learning → planning → implementation ⟷ validation → completion
```

| 阶段 | 执行内容 | 产出物 |
|------|---------|--------|
| **Learning** | 探索项目，构建上下文，审阅 genome 和 environment | `01-learning.md` |
| **Planning** | 定义目标，分解任务，映射依赖关系 | `02-planning.md` |
| **Implementation** | AI 与人类协作构建 | `03-implementation.md` |
| **Validation** | 运行测试，验证完成标准 | `04-validation.md` |
| **Completion** | 反思，收集适应度反馈，适应 genome，归档 | `05-completion.md` |

## 核心概念 [↗](https://reap.cc/docs/core-concepts)

### Genome — 如何构建 [↗](https://reap.cc/docs/genome)

项目的规范性知识。三个文件，始终完整加载：

```
.reap/genome/
  application.md    # 项目身份、架构、规范、约束
  evolution.md      # AI 行为指南、进化方向、软生命周期规则
  invariants.md     # 绝对约束（仅限人类编辑）
```

### Environment — 当前状态 [↗](https://reap.cc/docs/environment)

项目的描述性知识。两级加载策略：

```
.reap/environment/
  summary.md        # 会话开始时始终加载（约100行）
  domain/           # 领域知识（按需加载）
  resources/        # 外部参考文档——API 文档、SDK 规范（按需加载）
  docs/             # 项目参考文档——设计文档、规范（按需加载）
  source-map.md     # 当前代码结构 + 依赖关系（按需加载）
```

### Vision — 前进方向 [↗](https://reap.cc/docs/vision)

长期目标和方向。AI 在适应阶段参考 vision 来决定下一步最有价值的工作。

```
.reap/vision/
  goals.md          # 北极星目标
  docs/             # 规划文档
  memory/           # AI 记忆（3层：longterm、midterm、shortterm）
```

### Backlog [↗](https://reap.cc/docs/backlog)

在代际迭代过程中发现的问题绝不在当场修复。它们作为 backlog 项记录在 `.reap/life/backlog/` 中：

- `type: genome-change` — 在适应阶段应用的 genome 修改
- `type: environment-change` — environment 更新
- `type: task` — 未来代际迭代的工作项

Backlog 项在代际迭代之间自动传递。已消费的项随代际迭代的 lineage 一起归档。

### Lineage — 我们学到了什么 [↗](https://reap.cc/docs/lineage)

已完成代际迭代的归档，具有两级自动压缩：

- **第1级**：代际文件夹（5个产出物）→ 单个摘要文件
- **第2级**：100+ 个第1级文件 → 单个 `epoch.md`

保留 DAG 元数据以支持分支感知的 lineage 遍历。

### Hooks [↗](https://reap.cc/docs/hooks)

`.reap/hooks/` 中基于文件的生命周期事件钩子：
- `.md` 文件：由智能体执行的 AI 提示
- `.sh` 文件：直接执行的 Shell 脚本

### 原则

- **Genome 不可变性**：Genome 在代际迭代期间永远不会被修改。问题记录在 backlog 中，在 completion 的适应阶段应用。
- **Environment 不可变性**：Environment 在代际迭代期间永远不会被直接修改。变更记录在 backlog 中，在 completion 的反思阶段应用。
- **人类判断适应度**：没有定量指标。人类的自然语言反馈是唯一的适应度信号。
- **禁止自我适应度评估**：AI 永远不会给自己的成功打分。只允许自我评估（元认知）。

## 合并生命周期 [↗](https://reap.cc/docs/merge-generation)

当多个开发者或智能体并行工作时，REAP 提供 genome 优先的合并工作流。

```
detect → mate → merge → reconcile → validation → completion
```

| 阶段 | 用途 |
|------|------|
| **Detect** | 识别分支间的分歧 |
| **Mate** | 首先解决 genome 冲突（人类决定） |
| **Merge** | 在确定的 genome 指导下合并源代码 |
| **Reconcile** | 验证 genome 与源代码的一致性 |
| **Validation** | 运行测试 |
| **Completion** | 提交合并结果并归档 |

## 自进化特性 [↗](https://reap.cc/docs/self-evolving)

### 差距驱动的目标选择

AI 通过分析愿景与当前状态之间的差距来自动选择下一个代际迭代的目标。它交叉参考 `vision/goals.md` 中未完成的目标与待处理的 backlog 项，按影响力排列优先级，并提出最有价值的下一步。人类批准或调整。

### 人类判断适应度

没有定量指标。人类在适应度阶段的自然语言反馈是唯一的适应度信号。AI 永远不会给自己的成功打分——只允许自我评估（元认知）。

### 清晰度驱动的交互

AI 根据当前上下文的明确程度调整其沟通风格：

- **高清晰度**（目标明确，任务已定义）→ 以最少的提问执行
- **中等清晰度**（有方向，细节不清）→ 提供2-3个带权衡分析的选项
- **低清晰度**（目标模糊）→ 通过示例进行积极对话以建立共同理解

### Cruise 模式

预先批准 N 个代际迭代进行自主执行：
- AI 从愿景差距中选择目标，自主运行完整的生命周期
- 如果检测到不确定性或风险，cruise 暂停并请求人类反馈
- 所有 N 个代际迭代完成后，人类审阅整批结果

## 斜杠命令 [↗](https://reap.cc/docs/command-reference)

| 命令 | 描述 |
|------|------|
| `/reap.evolve` | 运行一个完整的代际迭代（推荐） |
| `/reap.start` | 开始一个新的代际迭代 |
| `/reap.next` | 推进到下一阶段 |
| `/reap.back` | 返回上一阶段 |
| `/reap.early-close` | 轻量级终止 — 保留部分价值，自动延迟未完成任务 |
| `/reap.abort` | 中止当前代际迭代 |
| `/reap.knowledge` | 审阅和管理 genome/environment |
| `/reap.merge` | 合并生命周期操作 |
| `/reap.pull` | 拉取 + 合并生命周期 |
| `/reap.push` | 验证 + 推送 |
| `/reap.status` | 检查当前状态 |
| `/reap.help` | 显示可用命令 |
| `/reap.init` | 在项目中初始化 REAP |
| `/reap.run` | 直接执行生命周期命令 |
| `/reap.config` | 查看/编辑项目配置 |

## 智能体集成

REAP 通过基于 `agentClient` 配置字段的适配器层与 AI 智能体集成。当前支持的客户端：

- **Claude Code** (`agentClient: claude-code`，默认) — 通过 `CLAUDE.md` 中的 `@` 导入加载静态知识；通过 SessionStart 钩子 (`reap load-context`) 注入动态状态；斜杠命令安装到 `~/.claude/commands/reap.*.md`。
<!-- reap:carrier(opencode-config-path) -->
- **OpenCode** (`agentClient: opencode`) — 通过 `opencode.json` 的 `instructions` 字段加载静态知识；通过 `.reap/.session-state.md` 传递动态状态，捆绑的 OpenCode 插件 (`.opencode/plugins/reap-plugin.ts`) 在 `session.created` / `tool.execute.before` 时自动刷新；斜杠命令安装到 `~/.config/opencode/commands/reap.*.md` (`$XDG_CONFIG_HOME` is honoured when set)。

通过编辑 `.reap/config.yml`，然后运行 `reap install-skills` 和 `reap update` 即可切换客户端。REAP 会重新生成入口点文件 (CLAUDE.md vs AGENTS.md)、会话集成以及任何客户端特定的资产。斜杠命令目录中的 `reap.` 前缀已保留 — 安装为先清理后复制方式，将覆盖这些位置中的任何 `reap.*.md` 文件。自定义命令请使用其他前缀 (`mytool.md`、`team.md` 等)。

### 工作原理

1. **入口点文件** (claude-code 为 `CLAUDE.md`，opencode 为 `AGENTS.md`) 指示 AI 在会话开始时加载 genome、environment 和 reap-guide
2. **斜杠命令** — `/reap.start`、`/reap.status`、`/reap.evolve` 等在 Claude Code 和 OpenCode 中均可工作；每个命令调用 `reap run <cmd>`，向 AI 返回结构化的 JSON 指令
3. **基于签名的锁定**（nonce 链）在代码层面强制执行阶段顺序——不可跳过、不可伪造、不可重放
4. **动态状态转储** — 每个 REAP 生命周期命令同步写入 `.reap/.session-state.md`，因此 OpenCode 用户在下次会话中始终能看到命令执行后的状态

### Subagent 模式

`/reap.evolve` 可以将整个代际迭代委托给一个子智能体，该子智能体自主运行所有阶段，仅在真正受阻时才浮出。

### Evaluator Agent（可选功能）

REAP 提供第二个子智能体定义 `reap-evaluate`，作为构建者工作的**独立审查者**运行。只读（仅 Read/Glob/Grep/Bash），定性评估（无评分），**顾问**角色 — 将关注点呈现给用户，但由构建者做出最终生命周期判决。

在 `.reap/config.yml` 中添加一行即可启用：

```yaml
evaluator: true   # 默认值: false
```

启用后，validation 阶段将在构建者声明 pass/partial/fail 之前启动 `reap-evaluate` 子智能体。Evaluator 将：
- 独立运行 typecheck、构建和完整测试套件，
- 对照 `02-planning.md` 的完成标准交叉验证实现，
- 发现 genome 约定偏离、讨好信号、回归风险等问题，
- 根据置信度 × 影响度矩阵进行升级处理。

子智能体调用失败时，构建者继续正常 validation — evaluator 是可选建议，而非门控。

**Fitness 阶段 + Cruise 模式**: evaluator 也在 fitness 阶段运行。validation 期间记录的 high-severity concern 在下次 fitness 阶段运行时会**自动中止 cruise 模式** — `cruiseCount` 从 `config.yml` 中清除，cruise 提示被替换为 supervised fallback，用户审查问题后再撰写 fitness 反馈。

### Code Intelligence Daemon（可选功能）

REAP 内置本地代码智能守护进程（`localhost:17224`），跨代际维护 Tree-sitter 符号图。解析 15+ 种语言，将图存储在 SQLite 中，并提供符号搜索、调用关系分析、blast-radius 影响、社区检测和进程流追踪的 HTTP API。

在 `.reap/config.yml` 中添加一行即可启用：

```yaml
daemon: true   # 默认值: false
```

启用后，REAP 自动：
- 在 generation 开始时向 daemon 注册项目，
- 在关键生命周期时刻（learning、implementation 完成、completion commit）重新索引，
- 在构建者/evaluator 提示中添加包含查询示例和 staleness 检查协议的"Code Intelligence"部分。

守护进程首次使用时自动启动，30 分钟空闲后自动关闭：

```bash
reap daemon status   # 检查运行状态
reap daemon stop     # 停止守护进程
```

守护进程是只读加速器 — 绝不修改代码。不可用时智能体回退到标准 Read/Grep/Glob 工具，生命周期不会中断。

**Staleness 检查**: 每次索引运行记录 `lastIndexedCommit`（索引时的 `HEAD` 哈希）。智能体可通过 `GET /projects/:id/status` 与当前 `HEAD` 比较，决定查询前是否需要重新索引。

## 项目结构

```
my-project/
  src/                        # 你的代码
  .reap/
    config.yml                # 项目配置
    genome/                   # 规范性知识（3个文件）
      application.md
      evolution.md
      invariants.md
    environment/              # 描述性知识（两级）
      summary.md
      domain/
      resources/              # 外部参考文档（API、SDK）
      docs/                   # 项目参考文档（设计、规范）
      source-map.md
    vision/                   # 长期目标
      goals.md
      docs/
      memory/                 # AI 记忆（longterm/midterm/shortterm）
    life/                     # 当前代际迭代
      current.yml
      backlog/
    lineage/                  # 已完成的代际迭代归档
    hooks/                    # 生命周期钩子（.md/.sh）
```

## 配置 [↗](https://reap.cc/docs/configuration)

`.reap/config.yml` 中的项目设置：

```yaml
project: my-project           # 项目名称
language: english              # 产出物/提示语言
autoSubagent: true             # 在 evolve 中自动委托给子智能体
strictEdit: false               # 将代码变更限制在 REAP 生命周期内
strictMerge: false              # 限制直接 git pull/push/merge
agentClient: claude-code       # AI 智能体客户端
# cruiseCount: 1/5             # 存在时 = cruise 模式（当前/总计）
# evaluator: true              # 可选：在 validation/fitness 中启动 reap-evaluate
# daemon: true                 # 可选：本地代码智能守护进程
```

关键设置：
- **`cruiseCount`**：存在时启用 cruise 模式。格式 `当前/总计`。cruise 完成后移除。
- **`strictEdit`**：将代码变更限制在计划范围内的 implementation 阶段。
- **`strictMerge`**：限制直接 git pull/push/merge——请改用 `/reap.pull`、`/reap.push`、`/reap.merge`。
- **`agentClient`**：决定使用哪个适配器进行技能部署。
- **`evaluator`**：可选独立审查者。`true` 时在 validation 阶段启动 `reap-evaluate` 子智能体作为顾问。默认 `false`。参见上方 [Evaluator Agent](#evaluator-agent可选功能)。
- **`daemon`**：可选本地代码智能守护进程。`true` 时 REAP 在生命周期检查点自动索引，并在智能体提示中包含 daemon 查询指示。默认 `false`。参见上方 [Code Intelligence Daemon](#code-intelligence-daemon可选功能)。

## 从 v0.15 升级 [↗](https://reap.cc/docs/migration-guide)

REAP v0.16 是基于[自进化管道](https://reap.cc/docs/self-evolving)架构的完全重写。

### 迁移步骤

1. **安装 v0.16：**
   ```bash
   npm install -g @c-d-cc/reap
   ```
   这会自动将 v0.16 技能安装到 `~/.claude/commands/`，并移除旧版 v0.15 项目级技能。

2. **在你的项目中打开 Claude Code** 并运行：
   ```
   /reap.update
   ```

3. **按照多阶段迁移流程操作：**

   | 阶段 | 执行内容 | 你的角色 |
   |------|---------|---------|
   | **Confirm** | 显示将要变更的内容，在 `.reap/v15/` 创建备份 | 审阅并确认 |
   | **Execute** | 重构目录，迁移配置/钩子/lineage/backlog | 自动执行 |
   | **Genome Convert** | AI 从 v0.15 文件重构 genome 为新的3文件结构 | 审阅 AI 的工作 |
   | **Vision** | 设置 vision/goals.md 和 memory | 提供项目方向 |
   | **Complete** | 迁移结果总结 | 验证 |

4. **验证**你的项目正常运行：
   ```
   /reap.status
   /reap.evolve
   ```

### 中断的迁移

如果迁移被中断（API 错误、会话断开等），你的进度会保存在 `.reap/migration-state.yml` 中。只需再次运行 `/reap.update`——它会从中断处恢复，跳过已完成的步骤。

要重新开始，删除 `.reap/migration-state.yml` 并再次运行 `/reap.update`。

### 备份

所有 v0.15 文件保存在 `.reap/v15/`。验证迁移后，你可以安全地删除该目录。

### 变更内容

**生命周期重新设计：**
- 第一阶段现在是 `learning`（原为 `objective`）。AI 在设定目标之前先探索项目。
- Completion 现在是4个阶段：`reflect` → `fitness` → `adapt` → `commit`（原为5个阶段）。
- 新概念：embryo 代际迭代、cruise 模式、愿景驱动的规划。

**新增 Vision 层：**
- `vision/goals.md` — 长期目标，在适应阶段进行差距驱动的目标选择
- `vision/memory/` — 3层记忆（longterm、midterm、shortterm）用于跨代际迭代的上下文
- `vision/design/` — 规划文档和规范

**Genome 重构（3个文件）：**
- `application.md` — 项目身份、架构、规范、约束
- `evolution.md` — AI 行为指南、进化方向、软生命周期规则
- `invariants.md` — 绝对约束（仅限人类编辑）

**新特性：**
- 清晰度驱动的交互：AI 根据上下文清晰度调整沟通深度
- Cruise 模式：预先批准 N 个代际迭代，AI 自主运行并进行自我评估
- 带有 reconcile 阶段的合并生命周期，用于验证 genome 与源代码的一致性
- 带有3层记忆的 Vision 系统，用于跨代际迭代的上下文

**已弃用的命令：**
- `/reap.sync` → `/reap.knowledge`
- `/reap.refreshKnowledge` → `/reap.knowledge`

## 作者

**HyeonIL Choi** — [hichoi@c-d.cc](mailto:hichoi@c-d.cc) | [c-d.cc](https://c-d.cc) | [LinkedIn](https://www.linkedin.com/in/hichoi-dev) | [GitHub](https://github.com/casamia918)

## 许可证

MIT

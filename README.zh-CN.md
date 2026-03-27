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
- [快速开始](#快速开始)
- [生命周期](#生命周期-)
- [核心概念](#核心概念-)
- [合并生命周期](#合并生命周期-)
- [自进化特性](#自进化特性-)
- [斜杠命令](#斜杠命令)
- [智能体集成](#智能体集成-)
- [项目结构](#项目结构)
- [配置](#配置-)
- [从 v0.15 升级](#从-v015-升级)

## 什么是 REAP？

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

> **前提条件**：[Node.js](https://nodejs.org) v18+，[Claude Code](https://claude.ai/claude-code) CLI。

## 快速开始

打开你的 AI 智能体（Claude Code）并使用斜杠命令：

```bash
# 在你的项目中初始化 REAP（自动检测是全新项目还是已有代码库）
/reap.init

# 运行一个完整的代际迭代
/reap.evolve
```

`/reap.evolve` 驱动整个代际迭代生命周期——从学习到完成。AI 探索项目、规划工作、实施、验证并反思。这是日常开发的主要命令。

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

## 合并生命周期 [↗](https://reap.cc/docs/merge-lifecycle)

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

## 斜杠命令

| 命令 | 描述 |
|------|------|
| `/reap.evolve` | 运行一个完整的代际迭代（推荐） |
| `/reap.start` | 开始一个新的代际迭代 |
| `/reap.next` | 推进到下一阶段 |
| `/reap.back` | 返回上一阶段 |
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

## 智能体集成 [↗](https://reap.cc/docs/agent-integration)

REAP 通过斜杠命令和生命周期钩子与 AI 智能体集成。当前支持：**Claude Code**。架构使用适配器模式以支持未来的智能体。

### 工作原理

1. **CLAUDE.md** 指示 AI 在会话开始时加载 genome、environment 和 reap-guide
2. **斜杠命令** 调用 `reap run <cmd>`，返回结构化 JSON 指令给 AI
3. **基于签名的锁定**（nonce 链）在代码层面强制执行阶段顺序——不可跳过、不可伪造、不可重放

### Subagent 模式

`/reap.evolve` 可以将整个代际迭代委托给一个子智能体，该子智能体自主运行所有阶段，仅在真正受阻时才浮出。

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
```

关键设置：
- **`cruiseCount`**：存在时启用 cruise 模式。格式 `当前/总计`。cruise 完成后移除。
- **`strictEdit`**：将代码变更限制在计划范围内的 implementation 阶段。
- **`strictMerge`**：限制直接 git pull/push/merge——请改用 `/reap.pull`、`/reap.push`、`/reap.merge`。
- **`agentClient`**：决定使用哪个适配器进行技能部署。

## 从 v0.15 升级

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
- `vision/docs/` — 规划文档和规范

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

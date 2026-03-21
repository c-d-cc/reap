> [English](README.md) | [한국어](README.ko.md) | [简体中文](README.zh-CN.md)

<p align="center">
  <img src="media/logo.png" alt="REAP" width="80" height="80" />
</p>

<h1 align="center">REAP</h1>

<p align="center">
  <strong>Recursive Evolutionary Autonomous Pipeline</strong><br>
  AIと人間がGenerationを重ねてソフトウェアを進化させる開発パイプライン。
</p>

<table align="center">
<tr>
<td align="center"><strong>Knowledge Base</strong><br><sub>Genome + Environment</sub></td>
<td align="center">→</td>
<td align="center"><strong>Evolution</strong><br><sub>世代を超えた進化</sub></td>
<td align="center">→</td>
<td align="center"><strong>Civilization</strong><br><sub>Source Code</sub></td>
</tr>
</table>

REAPはアプリケーションの設計知識 — Genome（アーキテクチャ、コンベンション、制約）とEnvironment（外部API、インフラ） — を記録し、各世代で目標を設定して実装します。その過程で発見した欠陥はKnowledge Baseにフィードバックされます。世代を重ねるごとに知識が進化し、Source Code（Civilization）が成長します。

## 目次

- [なぜREAPか？](#なぜreapか)
- [インストール](#インストール)
- [クイックスタート](#クイックスタート)
- [ライフサイクル](#ライフサイクル)
- [コアコンセプト](#コアコンセプト)
- [分散ワークフロー — 並行開発](#分散ワークフロー--並行開発)
- [CLIコマンド](#cliコマンド)
- [エージェント連携](#エージェント連携)
- [`reap init`後のプロジェクト構造](#reap-init後のプロジェクト構造)
- [系譜圧縮（Lineage Compression）](#系譜圧縮lineage-compression)
- [進化フロー（Evolution Flow）](#進化フローevolution-flow)
- [プリセット（Presets）](#プリセットpresets)
- [署名ベースロック（Signature-Based Locking）](#署名ベースロックsignature-based-locking)
- [エントリーモード（Entry Modes）](#エントリーモードentry-modes)

## なぜREAPか？

AIエージェントと開発する際、こんな問題に遭遇したことはありませんか？

- **コンテキストの喪失** — 新しいセッションを開くとエージェントがプロジェクトのコンテキストを忘れる
- **散発的な開発** — 明確な目標なくあちこちのコードを修正
- **設計とコードの乖離** — ドキュメントとコードが時間とともに離れていく
- **教訓の忘却** — 苦労して得たインサイトが次の作業に反映されない
- **コラボレーションの混乱** — 複数の開発者やエージェントが並行して作業すると、競合が頻発しマージが悪夢になる

REAPは**世代ベースの進化モデル**でこれらの問題を解決します：

- 各世代は一つの目標に集中（Objective → Completion）
- AIエージェントが毎セッション開始時に現在のコンテキストを自動認識（SessionStart Hook）
- 実装中に発見した設計問題はbacklogに記録、Completionで反映
- レトロスペクティブ（Completion）で導き出した教訓がGenomeに蓄積
- 世代を重ねて繰り返される手作業を自動検出し、ユーザー確認の上でHookとして生成
- ブランチ間の並行作業はgenome-firstマージワークフローで調整 — コードの競合の前に設計の競合を解決

## インストール

```bash
# npm
npm install -g @c-d-cc/reap

# または Bun
bun install -g @c-d-cc/reap
```

> **要件**: [Node.js](https://nodejs.org) v18+、[Claude Code](https://claude.ai/claude-code)または[OpenCode](https://opencode.ai) CLI。[Bun](https://bun.sh)はオプションです。

## クイックスタート

```bash
# 1. プロジェクトの初期化

# 新規プロジェクト
reap init my-project

# 既存プロジェクト
cd my-project
reap init

# 2. Claude Codeで1つのGeneration全体を実行
claude
> /reap.evolve "ユーザー認証の実装"
```

`/reap.evolve`は1つのGenerationのライフサイクル全体を — ObjectiveからCompletionまで — ユーザーと対話しながら自動実行します。Generation作成、各ステージの実行、ステージ間の前進をすべて処理します。日常の開発で最も多く使う中心的なコマンドです。

より細かい制御が必要な場合は、各ステージを手動で進めることもできます：

```bash
> /reap.start            # 新しいGenerationを開始
> /reap.objective        # 目標 + 仕様を定義
> /reap.next             # 次のステージへ前進
> /reap.planning         # 実装計画
> /reap.next
> /reap.implementation   # AI+Human協力でコード実装
> ...
```

## ライフサイクル [↗](https://reap.cc/docs/lifecycle)

各Generation（世代）は5段階のライフサイクルを経ます：

```
Objective → Planning → Implementation ⟷ Validation → Completion
（目標定義）  （計画）     （実装）             （検証）     （完了）
```

| ステージ | 内容 | 成果物 |
|----------|------|--------|
| **Objective** | 構造化ブレインストーミングによる目標・設計定義：明確化質問、アプローチ代案、セクション別設計、ビジュアルコンパニオン、Specレビュー | `01-objective.md` |
| **Planning** | タスク分解、実装アプローチ、依存関係 | `02-planning.md` |
| **Implementation** | AI+Human協力でコード実装 | `03-implementation.md` |
| **Validation** | テスト実行、完了条件の確認 | `04-validation.md` |
| **Completion** | レトロスペクティブ + Genome変更反映 + Hook提案 + 自動アーカイブ（consume + archive + commit） | `05-completion.md` |

## コアコンセプト [↗](https://reap.cc/docs/core-concepts)

### Genome [↗](https://reap.cc/docs/genome)

アプリケーションの遺伝情報 — アーキテクチャ原則、ビジネスルール、開発コンベンション、技術制約の集合。

```
.reap/genome/
├── principles.md      # アーキテクチャ原則/決定
├── domain/            # ビジネスルール（モジュール別）
├── conventions.md     # 開発ルール/コンベンション
├── constraints.md     # 技術制約/選択
└── source-map.md      # C4 Container/Componentダイアグラム（Mermaid）
```

**Genome不変原則**: 現在の世代ではGenomeを直接変更しません。問題を発見した場合はbacklogに記録し、Completionステージでのみ反映します。

**Environment不変原則**: 現在の世代ではEnvironmentを直接変更しません。外部環境の変化を発見した場合はbacklogに記録し、Completionステージで反映します。

### Backlog [↗](https://reap.cc/docs/backlog)

`.reap/life/backlog/`に次に反映するすべての項目を保存します。各項目はmarkdown + frontmatter形式：

- `type: genome-change` — CompletionでGenomeに反映
- `type: environment-change` — CompletionでEnvironmentに反映
- `type: task` — 次のObjectiveでのgoal候補（deferredタスク、技術的負債など）

各項目は`status`フィールドも持ちます：

- `status: pending` — 未処理項目（デフォルト）
- `status: consumed` — 現在の世代で処理完了（`consumedBy: gen-XXX-{hash}`必須）

アーカイブ時点（`/reap.next` from Completion）で`consumed`項目はlineageに移動し、`pending`項目は次の世代のbacklogに繰り越されます。

**部分完了は正常** — Genome変更に依存するタスクは`[deferred]`とマークし、次の世代に引き継ぎます。

### 4軸構造 [↗](https://reap.cc/docs/core-concepts)

```
.reap/
├── genome/        # 遺伝情報（世代を超えて進化）
├── environment/   # 外部環境（APIドキュメント、インフラ、ビジネス制約）
├── life/          # ライフサイクル — 現在の世代の状態と成果物
└── lineage/       # 完了した世代のアーカイブ
```

## 分散ワークフロー — 並行開発

> **⚠ 初期段階** — 分散ワークフローにはさらなるテストが必要です。本番環境でのご使用にはご注意ください。フィードバックを収集しています — [Issueを登録](https://github.com/c-d-cc/reap/issues)。

REAPは複数の開発者やAIエージェントが同一プロジェクトで並行して作業する分散コラボレーションをサポートします。中央サーバー不要で、Gitだけで動作します。

### 動作の仕組み

```
Machine A: branch-a — gen-046-a (authentication)    → /reap.push
Machine B: branch-b — gen-046-b (search)            → /reap.push

Machine A:
  /reap.pull branch-b   → Fetch + マージGeneration全ライフサイクルを実行
```

各マシンは自分のブランチとGenerationで独立して作業します。統合するタイミングで、REAPは**genome-first**戦略でマージを調整します（[詳しく見る](https://reap.cc/docs/merge-generation)）：

1. **Detect** — リモートブランチのgenomeとlineageをgit refでスキャンし、分岐点を特定
2. **Mate** — Genomeの競合を最初に解決（人間が判断）
3. **Merge** — 確定したGenomeを基準にソースコードをマージ（`git merge --no-commit`）
4. **Sync** — AIがGenomeとソースを比較して整合性を確認；不整合があればユーザーが確認
5. **Validation** — 機械的テストを実行（bun test、tsc、build）— 通常のGenerationと同様
6. **Completion** — マージ結果をコミットしてアーカイブ

### 分散ワークフロー用スラッシュコマンド

すべての分散操作はAIエージェントを通じて実行します：

```bash
/reap.pull <branch>        # Fetch + マージGeneration全体を実行（分散版 /reap.evolve）
/reap.merge <branch>       # ローカルブランチのマージGeneration全体を実行（fetchなし）
/reap.push                 # REAP状態を検証 + 現在のブランチをpush
/reap.merge.start          # マージGenerationを開始（ステップバイステップ制御用）
/reap.merge.detect         # 分岐を分析
/reap.merge.mate           # Genomeの競合を解決
/reap.merge.merge          # ソースコードをマージ
/reap.merge.sync           # Genome-ソース間の整合性を検証
/reap.merge.validation     # 機械的テストを実行（bun test、tsc、build）
/reap.merge.evolve         # 現在のステージからマージライフサイクルを実行
```

### 基本原則

- **Opt-in** — `git pull`/`push`は常にそのまま動作します。REAPコマンドは付加的なものです。
- **Genome-first** — ソースマージの前にGenomeの競合を解決します。憲法を改正してから法律を更新するようなものです。
- **サーバー不要** — すべてがローカル + Git。外部サービスは不要です。
- **DAG lineage** — 各世代はハッシュベースのID（`gen-046-a3f8c2`）で親を参照し、有向非巡回グラフを形成するため、並行作業を自然にサポートします。

## CLIコマンド [↗](https://reap.cc/docs/cli-reference)

| コマンド | 説明 |
|----------|------|
| `reap init <name>` | プロジェクト初期化。`.reap/`構造を作成 |
| `reap status` | 現在のGeneration状態を確認 |
| `reap update` | コマンド/テンプレート/hookを最新バージョンに同期 |
| `reap fix` | `.reap/`構造の診断と修復 |
| `reap help` | CLIコマンド + スラッシュコマンド + ワークフロー概要を出力（バージョン + 最新状況表示） |
| `reap run <cmd>` | スラッシュコマンドのスクリプトを直接実行（1行`.md`ラッパーが内部的に使用） |

### オプション

```bash
reap init my-project --mode adoption    # 既存プロジェクトにREAPを適用
reap init my-project --preset bun-hono-react  # プリセットでGenomeを初期化
reap update --dry-run                   # 変更のプレビュー
```

## エージェント連携

REAPはスラッシュコマンドとセッションフックを通じてAIエージェントと統合します。現在サポートされているエージェント：**Claude Code**、**OpenCode**。

### Script Orchestratorアーキテクチャ

v0.11.0より、28個のスラッシュコマンドが**1行`.md`ラッパー + TypeScriptスクリプト**構造に移行しました。各`.md`ファイルは`reap run <cmd>`を呼び出し、TSスクリプト（`src/cli/commands/run/`）がすべての決定論的ロジックを処理して、AIエージェントにstructured JSONで指示します。一貫性とテスト容易性が大幅に向上しました。

### 署名ベースロック（Signature-Based Locking） [↗](https://reap.cc/docs/advanced)

REAPは暗号学的nonceチェーンを使用してステージの順序を強制します。ステージコマンドが実行されると、スクリプトがワンタイムnonceを生成し、そのハッシュを`current.yml`に保存して、nonceをAIエージェントに返します。`/reap.next`はこのnonceがなければ進行できず、なければ拒否されます。

```
Stage Command          current.yml              /reap.next
─────────────          ───────────              ──────────
nonce生成 ────────────→ hash(nonce)を保存
AIにnonce返却                              ←── AIがnonceを渡す
                                               hash(nonce)を検証
                                               ✓ ステージ前進
```

これにより以下を防止します：
- **ステージのスキップ** — 実行されていないステージには有効なnonceが存在しない
- **トークンの偽造** — ハッシュは一方向であり、ハッシュからnonceを推測することは不可能
- **古いnonceの再利用** — 各nonceはワンタイムで、現在のステージにバインドされている

### autoSubagentモード

`/reap.evolve`実行時、自動的にsubagentにGenerationライフサイクル全体を委任できます：

```yaml
# .reap/config.yml
autoSubagent: true    # デフォルト: true
```

Subagentは完全なコンテキストを受け取り、すべてのステージを自律的に実行します。本当にブロックされた場合のみユーザーに確認を求めます。

### エラー時の自動Issue報告

`reap run`の実行中に予期しないエラーが発生した場合、`gh issue create`を通じてGitHub Issueを自動作成できます：

```yaml
# .reap/config.yml
autoIssueReport: true    # デフォルト: true（gh CLIがある場合）
```

### AI Migration Agent

`reap update`の実行時にプロジェクトと最新REAPバージョン間の構造的な差分（不足しているconfigフィールド、古いテンプレートなど）が検出されると、AI支援のマイグレーションプロンプトが表示されます。エージェントが差分を分析し、対話的に変更を適用するため、手動マイグレーションは不要です。

`reap init`ではすべてのconfigフィールドを明示的に宣言し、`reap update`時に不足しているフィールドは自動的に補完されます。

### CLAUDE.md連携

`reap init`と`reap update`の実行時に、`.claude/CLAUDE.md`にREAP管理セクションを追加し、Claude Codeセッションに必要なプロジェクトコンテキストを提供します。

### スラッシュコマンド [↗](https://reap.cc/docs/command-reference)

スラッシュコマンドが`.claude/commands/`にインストールされ、ワークフロー全体を駆動します：

| コマンド | 説明 |
|----------|------|
| `/reap.start` | 新しいGenerationを開始 |
| `/reap.objective` | 目標 + 要件の定義 |
| `/reap.planning` | タスク分解 + 実装計画 |
| `/reap.implementation` | AI+Human協力でコード実装 |
| `/reap.validation` | テスト実行、完了条件の確認 |
| `/reap.completion` | レトロスペクティブ + Genome変更反映 + lineage圧縮 |
| `/reap.next` | 次のライフサイクルステージへ前進 |
| `/reap.back` | 前のステージに回帰（micro loop） |
| `/reap.abort` | 現在のGenerationを中断（rollback/stash/hold + backlog保存） |
| `/reap.status` | 現在のGeneration状態とプロジェクト健全性を表示 |
| `/reap.sync` | GenomeとEnvironmentを同時に同期 |
| `/reap.sync.genome` | ソースコードベースでGenomeを最新化 |
| `/reap.sync.environment` | 外部環境依存関係の発見と文書化 |
| `/reap.config` | 現在のプロジェクト設定を表示 |
| `/reap.report` | REAPプロジェクトにバグ/フィードバックを報告（プライバシー保護） |
| `/reap.help` | 24+トピックのcontextual AIヘルプ |
| `/reap.update` | REAPパッケージのアップグレード + コマンド/テンプレート/hook同期 |
| **`/reap.evolve`** | **1つのGeneration全体を最初から最後まで実行（推奨）** |
| **`/reap.pull <branch>`** | **Fetch + マージGeneration全体を実行（分散版 `/reap.evolve`）** |
| **`/reap.merge <branch>`** | **ローカルブランチのマージGeneration全体を実行（fetchなし）** |
| `/reap.push` | REAP状態を検証して現在のブランチをpush |
| `/reap.merge.start` | 分岐ブランチを統合するマージGenerationを開始 |
| `/reap.merge.detect` | ブランチ間の分岐を分析 |
| `/reap.merge.mate` | ソースマージの前にGenomeの競合を解決 |
| `/reap.merge.merge` | 解決済みGenomeを基準にソースコードをマージ |
| `/reap.merge.sync` | Genome-ソース間の整合性を検証（AI比較、ユーザー確認） |
| `/reap.merge.validation` | 機械的テストを実行（bun test、tsc、build） |
| **`/reap.merge.evolve`** | **マージライフサイクル全体を自動実行** |

### SessionStart Hook [↗](https://reap.cc/docs/hooks)

毎セッション開始時に自動実行され、AIエージェントに以下を注入します：

- REAPワークフロー全体のガイド（Genome、ライフサイクル、4軸構造など）
- 現在のGeneration状態（どのステージにいるか、次に何をすべきか）
- REAPライフサイクルに従うルール
- Genome鮮度検出 — 最後のGenome更新以降にコード関連のコミット（`src/`、`tests/`、`package.json`、`tsconfig.json`、`scripts/`）があったかを確認（ドキュメントのみの変更は除外）
- Source-mapドリフト検出 — `source-map.md`に記録されたコンポーネントとプロジェクト内の実際のファイルを比較

これにより、新しいセッションを開いてもエージェントがプロジェクトコンテキストを即座に把握します。

### Strictモード

Strictモードは、AIエージェントが許可される操作を制御します。2つの細かいオプションをサポートします：

```yaml
# .reap/config.yml
strict: true              # 省略形：editとmerge両方を有効化

# または細かい制御：
strict:
  edit: true              # コード変更をREAPライフサイクルに制限
  merge: false            # raw git pull/push/mergeを制限
```

**`strict.edit`** — コード変更制御：

| 状況 | 動作 |
|------|------|
| アクティブGenerationなし / 実装ステージ外 | コード変更は完全にブロック |
| Implementationステージ | `02-planning.md`の範囲内でのみ変更許可 |
| エスケープハッチ | ユーザーが「override」「bypass strict」等を明示的に要求した場合に許可 |

**`strict.merge`** — Gitコマンド制御：有効にすると`git pull`/`push`/`merge`の直接使用が制限されます。エージェントが`/reap.pull`、`/reap.push`、`/reap.merge`の使用を案内します。

どちらもデフォルトで無効。`strict: true`は両方を有効にします。

Strictモードはデフォルトで無効です（`strict: false`）。

### REAP Hooks [↗](https://reap.cc/docs/hooks)

Hookはファイルベースで`.reap/hooks/`に保存されます。各Hookは`{event}.{name}.{md|sh}`形式のファイルです：

- `.md`ファイルはAIプロンプトを含みます（AIエージェントが実行）
- `.sh`ファイルはシェルスクリプトを含みます（直接実行）

```
.reap/hooks/
├── onLifeStarted.context-load.md
├── onLifeCompleted.version-bump.md
├── onLifeCompleted.readme-update.md
├── onLifeTransited.notify.sh
└── onLifeRegretted.alert.sh
```

各Hookファイルは以下のフィールドを持つfrontmatterをサポートします：

```yaml
---
condition: has-code-changes   # .reap/hooks/conditions/内のスクリプト名
order: 10                     # 実行順序（小さいほど先に実行）
---
```

**Normal Lifecycle Events:**

| イベント | トリガー |
|----------|----------|
| `onLifeStarted` | `/reap.start`で新しいGeneration作成後 |
| `onLifeObjected` | objectiveステージ完了後 |
| `onLifePlanned` | planningステージ完了後 |
| `onLifeImplemented` | implementationステージ完了後 |
| `onLifeValidated` | validationステージ完了後 |
| `onLifeCompleted` | completion + archiving後（git commit後に実行） |
| `onLifeTransited` | すべてのstage遷移時（汎用） |
| `onLifeRegretted` | `/reap.back` regression時 |

**Merge Lifecycle Events:**

| イベント | トリガー |
|----------|----------|
| `onMergeStarted` | `/reap.merge.start`でマージGeneration作成後 |
| `onMergeDetected` | detectステージ完了後 |
| `onMergeMated` | mateステージ完了後（genome確定） |
| `onMergeMerged` | mergeステージ完了後（ソースマージ） |
| `onMergeSynced` | syncステージ完了後 |
| `onMergeValidated` | merge validation完了後 |
| `onMergeCompleted` | merge completion + archiving後 |
| `onMergeTransited` | すべてのmerge stage遷移時（汎用） |

## `reap init`後のプロジェクト構造

```
my-project/
├── src/                          # Civilization（ソースコード）
└── .reap/
    ├── config.yml                # プロジェクト設定
    ├── genome/                   # 遺伝情報
    │   ├── principles.md
    │   ├── domain/
    │   ├── conventions.md
    │   ├── constraints.md
    │   └── source-map.md
    ├── hooks/                    # Lifecycle hooks (.md/.sh)
    ├── environment/              # 外部環境
    ├── life/                     # 現在の世代
    │   ├── current.yml
    │   └── backlog/
    └── lineage/                  # 完了した世代のアーカイブ

~/.reap/                          # ユーザーレベル（reap initでインストール）
├── commands/                     # スラッシュコマンド原本（1行.mdラッパー）
└── templates/                    # Artifactテンプレート

~/.claude/
└── settings.json                 # SessionStart hookの登録

.claude/commands/                 # プロジェクトレベルのスラッシュコマンド
└── reap.*.md                     # アクティブなスラッシュコマンド（`reap run <cmd>`を呼び出し）
```

## 系譜圧縮（Lineage Compression）

世代が蓄積されるとlineageディレクトリが大きくなります。REAPは自動2段階圧縮でこれを管理します：

| レベル | 入力 | 出力 | 最大行数 | トリガー |
|--------|------|------|----------|----------|
| **Level 1** | 世代フォルダ（5つの成果物） | `gen-XXX-{hash}.md` | 40行 | lineage > 5,000行 + 5世代以上 |
| **Level 2** | Level 1ファイル5つ | `epoch-XXX.md` | 60行 | Level 1が5つ以上 |

圧縮は世代完了時に自動実行されます。直近3世代は常に圧縮から保護されます。圧縮されたファイルは目標（Objective）と結果（Completion）を中心に保存し、中間過程は特記事項のみを残します。

## 進化フロー（Evolution Flow）

```
Generation #1 (Genome v1)
  → Objective: "ユーザー認証の実装"
  → Planning → Implementation
  → Implementation中にOAuth2の必要性を発見 → backlogにgenome-changeを記録
  → Validation (partial)
  → Completion → レトロスペクティブ + genome反映 → Genome v2 → アーカイブ

Generation #2 (Genome v2)
  → Objective: "OAuth2連携 + 権限管理"
  → 前世代のdeferredタスク + 新しい目標
  → ...
```

## プリセット（Presets）

`reap init --preset`で技術スタックに合ったGenome初期設定を適用できます。

| プリセット | スタック |
|------------|----------|
| `bun-hono-react` | Bun + Hono + React |

```bash
reap init my-project --preset bun-hono-react
```

## エントリーモード（Entry Modes）

| モード | 説明 |
|--------|------|
| `greenfield` | ゼロから新しいプロジェクトを構築（デフォルト） |
| `migration` | 既存システムを参照しながら新規構築 |
| `adoption` | 既存コードベースにREAPを適用 |

## 作者

**HyeonIL Choi** — [hichoi@c-d.cc](mailto:hichoi@c-d.cc) | [c-d.cc](https://c-d.cc) | [LinkedIn](https://www.linkedin.com/in/hichoi-dev) | [GitHub](https://github.com/casamia918)

## ライセンス

MIT

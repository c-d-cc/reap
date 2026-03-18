<p align="center">
  <img src="media/logo.png" alt="REAP" width="80" height="80" />
</p>

<h1 align="center">REAP</h1>

<p align="center">
  <strong>Recursive Evolutionary Autonomous Pipeline</strong><br>
  AIと人間がGenerationを重ねてソフトウェアを進化させる開発パイプライン。
</p>

> [English](README.md) | [한국어](README.ko.md) | [简体中文](README.zh-CN.md)

<table align="center">
<tr>
<td align="center"><strong>Genome</strong><br><sub>設計とナレッジ</sub></td>
<td align="center">→</td>
<td align="center"><strong>Evolution</strong><br><sub>世代を超えた進化</sub></td>
<td align="center">→</td>
<td align="center"><strong>Civilization</strong><br><sub>Source Code</sub></td>
</tr>
</table>

REAPはアプリケーションの遺伝情報（Genome）を定義し、各世代で目標を設定して実装し、その過程で発見したGenomeの欠陥を次のステージにフィードバックします。世代を重ねるごとにGenomeが進化し、Source Code（Civilization）が成長します。

## なぜREAPか？

AIエージェントと開発する際、こんな問題に遭遇したことはありませんか？

- **コンテキストの喪失** — 新しいセッションを開くとエージェントがプロジェクトのコンテキストを忘れる
- **散発的な開発** — 明確な目標なくあちこちのコードを修正
- **設計とコードの乖離** — ドキュメントとコードが時間とともに離れていく
- **教訓の忘却** — 苦労して得たインサイトが次の作業に反映されない

REAPは**世代ベースの進化モデル**でこれらの問題を解決します：

- 各世代は一つの目標に集中（Objective → Completion）
- AIエージェントが毎セッション開始時に現在のコンテキストを自動認識（SessionStart Hook）
- 実装中に発見した設計問題はbacklogに記録、Completionで反映
- レトロスペクティブ（Completion）で導き出した教訓がGenomeに蓄積

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

## ライフサイクル

各Generation（世代）は5段階のライフサイクルを経ます：

```
Objective → Planning → Implementation ⟷ Validation → Completion
（目標定義）  （計画）     （実装）             （検証）     （完了）
```

| ステージ | 内容 | 成果物 |
|----------|------|--------|
| **Objective** | 目標 + 要件 + 受入基準の定義 | `01-objective.md` |
| **Planning** | タスク分解、実装アプローチ、依存関係 | `02-planning.md` |
| **Implementation** | AI+Human協力でコード実装 | `03-implementation.md` |
| **Validation** | テスト実行、完了条件の確認 | `04-validation.md` |
| **Completion** | レトロスペクティブ + Genome変更反映 + アーカイブ | `05-completion.md` |

## コアコンセプト

### Genome

アプリケーションの遺伝情報 — アーキテクチャ原則、ビジネスルール、開発コンベンション、技術制約の集合。

```
.reap/genome/
├── principles.md      # アーキテクチャ原則/決定
├── domain/            # ビジネスルール（モジュール別）
├── conventions.md     # 開発ルール/コンベンション
└── constraints.md     # 技術制約/選択
```

**Genome不変原則**: 現在の世代ではGenomeを直接変更しません。問題を発見した場合はbacklogに記録し、Completionステージでのみ反映します。

**Environment不変原則**: 現在の世代ではEnvironmentを直接変更しません。外部環境の変化を発見した場合はbacklogに記録し、Completionステージで反映します。

### Backlog

`.reap/life/backlog/`に次に反映するすべての項目を保存します。各項目はmarkdown + frontmatter形式：

- `type: genome-change` — CompletionでGenomeに反映
- `type: environment-change` — CompletionでEnvironmentに反映
- `type: task` — 次のObjectiveでのgoal候補（deferredタスク、技術的負債など）

各項目は`status`フィールドも持ちます：

- `status: pending` — 未処理項目（デフォルト）
- `status: consumed` — 現在の世代で処理完了（`consumedBy: gen-XXX`必須）

アーカイブ時点（`/reap.next` from Completion）で`consumed`項目はlineageに移動し、`pending`項目は次の世代のbacklogに繰り越されます。

**部分完了は正常** — Genome変更に依存するタスクは`[deferred]`とマークし、次の世代に引き継ぎます。

### 4軸構造

```
.reap/
├── genome/        # 遺伝情報（世代を超えて進化）
├── environment/   # 外部環境（APIドキュメント、インフラ、ビジネス制約）
├── life/          # 現在の世代の状態と成果物
└── lineage/       # 完了した世代のアーカイブ
```

## CLIコマンド

| コマンド | 説明 |
|----------|------|
| `reap init <name>` | プロジェクト初期化。`.reap/`構造を作成 |
| `reap status` | 現在のGeneration状態を確認 |
| `reap update` | コマンド/テンプレート/hookを最新バージョンに同期 |
| `reap fix` | `.reap/`構造の診断と修復 |
| `reap help` | CLIコマンド + スラッシュコマンド + ワークフロー概要を出力 |

### オプション

```bash
reap init my-project --mode adoption    # 既存プロジェクトにREAPを適用
reap init my-project --preset bun-hono-react  # プリセットでGenomeを初期化
reap update --dry-run                   # 変更のプレビュー
```

## エージェント連携

REAPはスラッシュコマンドとセッションフックを通じてAIエージェントと統合します。現在サポートされているエージェント：**Claude Code**、**OpenCode**。

### スラッシュコマンド

スラッシュコマンドが`.claude/commands/`にインストールされ、ワークフロー全体を駆動します：

| コマンド | 説明 |
|----------|------|
| `/reap.start` | 新しいGenerationを開始 |
| `/reap.objective` | 目標 + 要件の定義 |
| `/reap.planning` | タスク分解 + 実装計画 |
| `/reap.implementation` | AI+Human協力でコード実装 |
| `/reap.validation` | テスト実行、完了条件の確認 |
| `/reap.completion` | レトロスペクティブ + Genome変更反映 |
| `/reap.next` | 次のライフサイクルステージへ前進 |
| `/reap.back` | 前のステージに回帰（micro loop） |
| `/reap.status` | 現在のGeneration状態とプロジェクト健全性を表示 |
| `/reap.sync` | ソースコードベースでGenomeを最新化 |
| `/reap.help` | 24+トピックのcontextual AIヘルプ（workflow, genome, backlog, strict, agents, hooks, config, evolve, regression, authorおよび全コマンド名） |
| `/reap.update` | REAPのアップデート確認と最新バージョンへのアップグレード |
| **`/reap.evolve`** | **1つのGeneration全体を最初から最後まで実行（推奨）** |

### SessionStart Hook

毎セッション開始時に自動実行され、AIエージェントに以下を注入します：

- REAPワークフロー全体のガイド（Genome、ライフサイクル、4軸構造など）
- 現在のGeneration状態（どのステージにいるか、次に何をすべきか）
- REAPライフサイクルに従うルール

これにより、新しいセッションを開いてもエージェントがプロジェクトコンテキストを即座に把握します。

### Strictモード

`.reap/config.yml`に`strict: true`を設定すると、AIエージェントがREAPワークフロー外でコードを変更することを制限します：

```yaml
# .reap/config.yml
strict: true      # デフォルト: false
language: korean  # 成果物とインタラクションの言語
autoUpdate: true  # セッション開始時の自動アップデート
agents:           # 検出されたエージェント（reap init/updateで管理）
  - claude-code
  - opencode
```

| 状況 | 動作 |
|------|------|
| アクティブGenerationなし / 実装ステージ外 | コード変更は完全にブロック |
| Implementationステージ | `02-planning.md`の範囲内でのみ変更許可 |
| エスケープハッチ | ユーザーが「override」「bypass strict」等を明示的に要求した場合に許可 |

Strictモードはデフォルトで無効です（`strict: false`）。

### REAP Hooks

`.reap/config.yml`にhookを定義して、ライフサイクルイベントでコマンドやAIプロンプトを実行できます：

```yaml
hooks:
  onGenerationStart:
    - command: "echo 'Generation started'"
  onStageTransition:
    - command: "echo 'Stage changed'"
  onGenerationComplete:
    - command: "reap update"
    - prompt: "今回のGenerationで変更された機能があればREADMEに反映せよ。"
  onRegression:
    - command: "echo 'Regressed'"
```

各hookは`command`（シェルコマンド）または`prompt`（AIエージェント指示）のいずれかを使用します。

| イベント | トリガー |
|----------|----------|
| `onGenerationStart` | `/reap.start`で新しいGeneration作成後 |
| `onStageTransition` | `/reap.next`で次のステージに前進後 |
| `onGenerationComplete` | `/reap.next`で完了したGenerationをアーカイブ後 |
| `onRegression` | `/reap.back`で前のステージに回帰後 |

HookはAIエージェントがプロジェクトルートディレクトリで実行します。

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
    │   └── constraints.md
    ├── environment/              # 外部環境
    ├── life/                     # 現在の世代
    │   ├── current.yml
    │   └── backlog/
    └── lineage/                  # 完了した世代のアーカイブ

~/.claude/                        # ユーザーレベル（reap initでインストール）
├── commands/                     # スラッシュコマンド（/reap.*）
└── settings.json                 # SessionStart hookの登録
```

## 系譜圧縮（Lineage Compression）

世代が蓄積されるとlineageディレクトリが大きくなります。REAPは自動2段階圧縮でこれを管理します：

| レベル | 入力 | 出力 | 最大行数 | トリガー |
|--------|------|------|----------|----------|
| **Level 1** | 世代フォルダ（5つの成果物） | `gen-XXX.md` | 40行 | lineage > 10,000行 + 5世代以上 |
| **Level 2** | Level 1ファイル5つ | `epoch-XXX.md` | 60行 | Level 1が5つ以上 |

圧縮は世代完了時に自動実行されます。圧縮されたファイルは目標（Objective）と結果（Completion）を中心に保存し、中間過程は特記事項のみを残します。

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

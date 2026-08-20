<p align="center">
  <img src="https://raw.githubusercontent.com/c-d-cc/reap/main/media/logo.png" alt="REAP" width="80" height="80" />
</p>

<h1 align="center">REAP</h1>

<p align="center">
  <strong>Recursive Evolutionary Autonomous Pipeline</strong><br>
  AIと人間がジェネレーションを重ねてソフトウェアを共進化させる、自己進化型開発パイプライン。
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/c-d-cc/reap/main/media/architecture.png" alt="REAP Architecture" width="600" />
</p>

REAPは、AIと人間が協力してソフトウェアを構築・進化させるジェネレーションベースの開発パイプラインです。人間がビジョンを提供し、重要な意思決定を行います。AIはプロジェクトの知識 — Genome（アーキテクチャ、コンベンション、制約）と Environment（コードベース、依存関係、ドメイン）— を学習し、構造化されたジェネレーションを通じて実装・検証・適応を行います。各ジェネレーションの完了時に得られた教訓がナレッジベースにフィードバックされます。時間の経過とともに、知識とソースコード（Civilization）の両方が自己進化します。

## 目次

- [REAPとは？](#reapとは)
- [インストール](#インストール)
- [アンインストール](#アンインストール)
- [クイックスタート](#クイックスタート-)
- [ライフサイクル](#ライフサイクル-)
- [コアコンセプト](#コアコンセプト-)
- [マージライフサイクル](#マージライフサイクル-)
- [自己進化機能](#自己進化機能-)
- [スラッシュコマンド](#スラッシュコマンド-)
- [エージェント統合](#エージェント統合-)
- [プロジェクト構造](#プロジェクト構造)
- [設定](#設定-)
- [v0.15からのアップグレード](#v015からのアップグレード-)

## REAPとは？ [↗](https://reap.cc/docs/introduction)

AIエージェントを使った開発で、こんな問題に遭遇したことはありませんか？

- **コンテキストの喪失** — 新しいセッションを開始するとエージェントがすべてを忘れてしまう
- **散漫な開発** — 明確な方向性や目標なくコードが変更される
- **設計とコードの乖離** — ドキュメントと実装が食い違っていく
- **教訓の忘却** — 苦労して得た知見が次に活かされない
- **コラボレーションの混乱** — 複数のエージェントや開発者が矛盾する変更を生む

REAPはこれらを**自己進化型ジェネレーションモデル**で解決します：

- 各ジェネレーションは構造化されたライフサイクルに従う：現在の状態を学習し、目標を計画し、実装し、検証し、振り返る
- AIエージェントがセッション開始時にプロジェクトの完全なコンテキストを自動復元する
- 規範的知識（Genome）は、各ジェネレーション完了時に人間が承認した適応を通じて進化する
- AIがビジョンと現状のギャップを分析して自動的に目標を選択する
- 明確性駆動のインタラクションにより、AIが構造・例示・率直な意見をもってコミュニケーションする
- ブランチ間の並行作業は genome-first マージワークフローで調整される

## インストール

> **グローバルインストールが必要です。**

```bash
npm install -g @c-d-cc/reap
```

> **要件**: [Node.js](https://nodejs.org) v18以上、およびサポートされるAIエージェントの1つ:
> - [Claude Code](https://claude.ai/claude-code) CLI（デフォルト）
> - [OpenCode](https://opencode.ai) — `/reap.init` 後に `.reap/config.yml` で `agentClient: opencode` に設定

### アンインストール

`npm uninstall -g @c-d-cc/reap` はパッケージだけを削除します。REAP がホームに置いたもの — スラッシュコマンド、エージェント定義、`~/.claude/settings.json` の SessionStart フック、`~/.reap/` — は REAP 自身のコードが書いたものであり、npm はその存在を知りません。さらに npm はアンインストール時にコードを一切実行しないため、REAP がパッケージフックで片付けることもできません。

パッケージを削除する**前に**、REAP で REAP を削除してください:

```bash
reap uninstall            # 何が削除されるかを表示
reap uninstall --confirm  # 実行し、パッケージ削除まで npm に渡す
```

Claude Code と OpenCode 両方の場所から REAP のファイルを削除し、`settings.json` から REAP の項目だけを取り除き、`~/.reap/` の中で REAP 自身が書いたものだけ（allowlist であり、ディレクトリ全体ではありません）を削除してから、REAP の npm パッケージに対して `npm uninstall -g` を実行します。同じディレクトリにあるあなた自身のファイルはそのまま残ります — `reapdev.*` も、`~/.reap/` 内のその他のものも同様です。

**すでにパッケージを削除した場合は?** `reap` コマンドがなく、ファイルだけが残っている状態です。何もインストールせずに実行できます:

```bash
npx @c-d-cc/reap uninstall --confirm
```

`reap destroy` は別物です — **1つのプロジェクト**から REAP を取り除くもので（`.reap/`、CLAUDE.md の REAP セクション、`.gitignore` の項目）、マシンには触れません。

## クイックスタート [↗](https://reap.cc/docs/quick-start)

AIエージェント（Claude Code または OpenCode）を開き、スラッシュコマンドを使います：

```bash
# プロジェクトにREAPを初期化（新規/既存コードベースを自動判別）
/reap.init

# ジェネレーションを実行
/reap.evolve
```

`/reap.evolve` はジェネレーションライフサイクル全体を駆動します — 学習から完了まで。AIがプロジェクトを探索し、作業を計画し、実装し、検証し、振り返ります。日常の開発で使うメインコマンドです。

> **OpenCodeユーザー**: `/reap.init` 後、`.reap/config.yml` で `agentClient: opencode` に設定し、`reap update` を実行してクライアント固有のアセット（`opencode.json`、`.opencode/plugins/reap-plugin.ts`、`AGENTS.md`、`~/.config/opencode/commands/` のスラッシュコマンド）を再生成してください。

> **注意:** ユーザーはAIエージェント内の `/reap.*` スラッシュコマンドを通じてREAPとやり取りします。CLIはそれらのコマンドを動かす内部エンジンです。

## ライフサイクル [↗](https://reap.cc/docs/lifecycle)

各ジェネレーションは5段階のライフサイクルに従います。

```
learning → planning → implementation ⟷ validation → completion
```

| ステージ | 内容 | アーティファクト |
|----------|------|------------------|
| **Learning** | プロジェクトを探索し、コンテキストを構築、genome と environment をレビュー | `01-learning.md` |
| **Planning** | 目標を定義し、タスクを分解、依存関係をマッピング | `02-planning.md` |
| **Implementation** | AI と人間の協力で構築 | `03-implementation.md` |
| **Validation** | テストを実行し、完了基準を検証 | `04-validation.md` |
| **Completion** | 振り返り、フィットネスフィードバックの収集、genome の適応、アーカイブ | `05-completion.md` |

## コアコンセプト [↗](https://reap.cc/docs/core-concepts)

### Genome — 構築方法 [↗](https://reap.cc/docs/genome)

プロジェクトの規範的知識。3つのファイルで構成され、常に完全にロードされます：

```
.reap/genome/
  application.md    # プロジェクトのアイデンティティ、アーキテクチャ、コンベンション、制約
  evolution.md      # AI行動ガイド、進化の方向性、ソフトライフサイクルルール
  invariants.md     # 絶対的制約（人間のみ編集可）
```

### Environment — 現在の状態 [↗](https://reap.cc/docs/environment)

プロジェクトの記述的知識。2層ローディング戦略：

```
.reap/environment/
  summary.md        # セッション開始時に常にロード（約100行）
  domain/           # ドメイン知識（オンデマンド）
  resources/        # 外部リファレンスドキュメント — API仕様、SDK仕様（オンデマンド）
  docs/             # プロジェクトリファレンスドキュメント — 設計書、仕様書（オンデマンド）
  source-map.md     # 現在のコード構造 + 依存関係（オンデマンド）
```

### Vision — 向かう先 [↗](https://reap.cc/docs/vision)

長期的な目標と方向性。AIは adapt フェーズで vision を参照し、次に最も価値のあるものを決定します。

```
.reap/vision/
  goals.md          # 北極星となる目標
  docs/             # 計画ドキュメント
  memory/           # AIメモリ（3層: longterm, midterm, shortterm）
```

### Backlog [↗](https://reap.cc/docs/backlog)

ジェネレーション中に発見された課題は、その場で修正しません。`.reap/life/backlog/` に backlog アイテムとして記録されます：

- `type: genome-change` — adapt フェーズで適用する genome の変更
- `type: environment-change` — environment の更新
- `type: task` — 将来のジェネレーションの作業項目

Backlog アイテムはジェネレーション間で自動的に引き継がれます。消費されたアイテムはジェネレーションの lineage とともにアーカイブされます。

### Lineage — 学んだこと [↗](https://reap.cc/docs/lineage)

完了したジェネレーションのアーカイブ。2段階の自動圧縮：

- **レベル1**: ジェネレーションフォルダ（5つのアーティファクト）→ 単一のサマリーファイル
- **レベル2**: 100以上のレベル1ファイル → 単一の `epoch.md`

DAGメタデータはブランチ対応の lineage 走査のために保持されます。

### Hooks [↗](https://reap.cc/docs/hooks)

`.reap/hooks/` 内のファイルベースのライフサイクルイベントフック：
- `.md` ファイル: エージェントが実行するAIプロンプト
- `.sh` ファイル: 直接実行されるシェルスクリプト

### 原則

- **Genome の不変性**: ジェネレーション中に genome は変更されません。課題は backlog に記録され、completion の adapt フェーズで適用されます。
- **Environment の不変性**: ジェネレーション中に environment は直接変更されません。変更は backlog に記録され、completion の reflect フェーズで適用されます。
- **人間がフィットネスを判断**: 定量的メトリクスは使用しません。人間の自然言語フィードバックが唯一のフィットネスシグナルです。
- **自己フィットネスの禁止**: AIは自身の成功をスコアリングしません。自己評価（メタ認知）のみが許可されます。

## マージライフサイクル [↗](https://reap.cc/docs/merge-generation)

複数の開発者やエージェントが並行して作業する場合、REAPは genome-first マージワークフローを提供します。

```
detect → mate → merge → reconcile → validation → completion
```

| ステージ | 目的 |
|----------|------|
| **Detect** | ブランチ間の分岐を検出 |
| **Mate** | genome のコンフリクトを最初に解決（人間が判断） |
| **Merge** | 確定した genome に基づいてソースコードをマージ |
| **Reconcile** | genome とソースの整合性を検証 |
| **Validation** | テストを実行 |
| **Completion** | マージ結果をコミットしアーカイブ |

## 自己進化機能 [↗](https://reap.cc/docs/self-evolving)

### ギャップ駆動の目標選択

AIはビジョンと現状のギャップを分析して、次のジェネレーションの目標を自動選択します。`vision/goals.md` の未達成目標と pending 状態の backlog アイテムを照合し、インパクトで優先順位を付け、最も価値のある次のステップを提案します。人間が承認または調整します。

### 人間がフィットネスを判断

定量的メトリクスは使用しません。フィットネスフェーズでの人間の自然言語フィードバックが唯一のフィットネスシグナルです。AIは自身の成功をスコアリングしません — 自己評価（メタ認知）のみが許可されます。

### 明確性駆動のインタラクション

AIは現在のコンテキストの明確さに応じてコミュニケーションスタイルを調整します：

- **高い明確性**（明確な目標、定義されたタスク）→ 最小限の質問で実行
- **中程度の明確性**（方向性はあるが詳細が不明確）→ トレードオフ付きの2〜3つの選択肢を提示
- **低い明確性**（曖昧な目標）→ 例示を用いた積極的な対話で共通理解を構築

### Cruise Mode

N世代分の自律実行を事前承認：
- AIがビジョンのギャップから目標を選択し、ライフサイクル全体を自律的に実行
- 不確実性やリスクが検出された場合、cruise を一時停止して人間のフィードバックを要求
- 全N世代の完了後、人間がバッチをレビュー

## スラッシュコマンド [↗](https://reap.cc/docs/command-reference)

| コマンド | 説明 |
|----------|------|
| `/reap.evolve` | ジェネレーション全体を実行（推奨） |
| `/reap.start` | 新しいジェネレーションを開始 |
| `/reap.next` | 次のステージへ進む |
| `/reap.back` | 前のステージに戻る |
| `/reap.early-close` | 軽量終了 — 部分的な価値を保存、未完了タスクを自動的に次世代へ繰り越し |
| `/reap.abort` | 現在のジェネレーションを中止 |
| `/reap.knowledge` | genome/environment のレビューと管理 |
| `/reap.merge` | マージライフサイクル操作 |
| `/reap.pull` | fetch + マージライフサイクル |
| `/reap.push` | 検証 + push |
| `/reap.status` | 現在の状態を確認 |
| `/reap.help` | 利用可能なコマンドを表示 |
| `/reap.init` | プロジェクトにREAPを初期化 |
| `/reap.run` | ライフサイクルコマンドを直接実行 |
| `/reap.config` | プロジェクト設定の表示/編集 |

## エージェント統合

REAPは`agentClient` configフィールドをキーとするアダプタレイヤーを通じてAIエージェントと統合します。現在サポートされているクライアント:

- **Claude Code** (`agentClient: claude-code`, デフォルト) — `CLAUDE.md`の`@`インポートで静的ナレッジ; SessionStartフック(`reap load-context`)で動的状態を注入; スラッシュコマンドは`~/.claude/commands/reap.*.md`にインストール。
<!-- reap:carrier(opencode-config-path) -->
- **OpenCode** (`agentClient: opencode`) — `opencode.json`の`instructions`フィールドで静的ナレッジ; `.reap/.session-state.md`で動的状態を伝達、バンドルされたOpenCodeプラグイン(`.opencode/plugins/reap-plugin.ts`)が`session.created` / `tool.execute.before`時に自動更新; スラッシュコマンドは`~/.config/opencode/commands/reap.*.md` (`$XDG_CONFIG_HOME` is honoured when set)にインストール。

`.reap/config.yml`を編集してから`reap install-skills`に続いて`reap update`を実行することでクライアントを切り替えます。REAPはエントリーポイントファイル(CLAUDE.md vs AGENTS.md)、セッション統合、およびクライアント固有のアセットを再生成します。スラッシュコマンドディレクトリの`reap.`プレフィックスは予約されています — インストールはcleanup-then-copy方式で、その場所の`reap.*.md`ファイルを上書きします。カスタムコマンドには別のプレフィックス(`mytool.md`、`team.md`など)を使用してください。

### 仕組み

1. **エントリーポイントファイル** (claude-codeでは`CLAUDE.md`、opencodeでは`AGENTS.md`)がセッション開始時にgenome、environment、reap-guideをロードするようAIに指示
2. **スラッシュコマンド** — `/reap.start`、`/reap.status`、`/reap.evolve`などはClaude CodeとOpenCodeの両方で動作; それぞれが`reap run <cmd>`を呼び出し、AIに構造化されたJSON指示を返す
3. **署名ベースのロック**（nonceチェーン）がコードレベルでステージの順序を強制 — スキップ・偽造・リプレイ不可
4. **動的状態ダンプ** — すべてのREAPライフサイクルコマンドが同期的に`.reap/.session-state.md`に書き込むため、OpenCodeユーザーは次のセッションで常にコマンド後の状態を確認可能

### Subagent Mode

`/reap.evolve` はジェネレーション全体を subagent に委任でき、subagent は本当にブロックされた場合のみ介入を求めながら、全ステージを自律的に実行します。

### Evaluator Agent（オプトイン）

REAP は2つ目のサブエージェント定義 `reap-evaluate` を提供します。ビルダーの作業を独立してレビューする**独立レビュアー**として機能します。読み取り専用（Read/Glob/Grep/Bashのみ）、定性的評価（スコアなし）、**アドバイザー**として動作 — 懸念事項をユーザーに表面化しますが、ビルダーが最終的なライフサイクル判断を下します。

`.reap/config.yml` に1行追加して有効化：

```yaml
evaluator: true   # デフォルト: false
```

有効化すると、validationステージでビルダーがpass/partial/failを宣言する前に `reap-evaluate` をサブエージェントとして起動します。Evaluatorは：
- typecheck、ビルド、完全なテストスイートを独立して実行し、
- `02-planning.md`の完了基準と実装をクロスチェックし、
- genomコンベンション逸脱、sycophancyの危険信号、リグレッションリスクへの懸念を表面化し、
- 信頼度 × 影響度マトリクスに従ってエスカレーションします。

サブエージェントの呼び出しが失敗しても、ビルダーは通常のvalidationを続行します — evaluatorはオプトインのアドバイスであり、ゲートではありません。

**Fitness phase + cruise mode**: evaluatorはfitnessフェーズでも実行されます。validationで記録されたhigh-severity concernは次のfitnessフェーズ実行時に**cruise modeを自動停止**します — `cruiseCount`が `config.yml` から削除され、cruiseプロンプトがsupervised fallbackに置き換えられ、ユーザーが懸念事項を確認した後にfeedbackを作成できます。

### Code Intelligence

REAP はコードインデックスを内蔵しています。インストールするものも、起動するものも、バックグラウンドで動くプロセスもありません。

Tree-sitter パーサーが追跡中のすべてのファイルを走査し、定義されたシンボルとその間の呼び出し・import を記録して、結果を `.reap/.index/` に gzip された JSON として保存します。15 言語が同梱され、**ネイティブビルドはありません** — グラマーは WebAssembly です。

```bash
reap index                     # update — デフォルト動作
reap index status              # 統計、import 解決率、インデックス済みコミット
reap index impact <file>       # このファイルを変更すると何が影響を受けるか
reap index search <query>      # 定義を探す（file:line を返す）
reap index callers <symbolId>  # 誰がこれを呼ぶか（src/core/lifecycle.ts::nextStage）
reap index callees <symbolId>  # これが何を呼ぶか
```

**変更の単位はコミットです。** インデックスは自分が記述する SHA を記録するため、何を再解析するかは `git diff` 一回、そもそも再解析が必要かは文字列比較一回で決まります。本リポジトリの完全インデックスは約 0.3 秒、変更がなければゼロです。`HEAD` が動けば — コミット・ブランチ切り替え・rebase・pull の後 — クエリ自身がインデックスを更新します。REAP が先んじて更新するのは自分がコミットした直後だけ — `completion` の末尾と `early-close` です。

代償は **コミットされていない作業がインデックスに入らない** ことです。それは Grep で探してください。`reap index status` は常に自分が記述するコミットを示します。

**`impact` を信じる前に `status` を見てください。** `impact` が知っていることはすべて解決済みの import エッジ由来なので、`imports` の比率が低ければグラフは不完全であり、空の blast radius は *なし* ではなく *不明* を意味します:

```
symbols: 1530  (function 902, method 341, class 187, type 100)
edges:   3688  (CALLS 3145, IMPORTS 543)
imports: 543/543 resolved (100%)
commit:  1a2b3c4
```

（例示の数値です。）この一行がなかったために 5 か月を失いました。このインデクサーの前身は標準的な TypeScript プロジェクトで import を **一つも** 解決できず — `./x.js` という specifier を、それを生成する `x.ts` に対応づけられませんでした — blast radius がゼロを返し続ける間、すべてのテストは通り CI はずっと緑でした。どの検査も「インデックスは走ったか」を問い、「その答えは意味をなすか」を誰も問わなかったからです。

インデックスは `.reap/.index/` にあり gitignore されます。削除しても常に安全です — 次のコマンドが作り直します。

## プロジェクト構造

```
my-project/
  src/                        # ソースコード
  .reap/
    config.yml                # プロジェクト設定
    genome/                   # 規範的知識（3ファイル）
      application.md
      evolution.md
      invariants.md
    environment/              # 記述的知識（2層）
      summary.md
      domain/
      resources/              # 外部リファレンスドキュメント（API、SDK）
      docs/                   # プロジェクトリファレンスドキュメント（設計、仕様）
      source-map.md
    vision/                   # 長期目標
      goals.md
      docs/
      memory/                 # AIメモリ（longterm/midterm/shortterm）
    life/                     # 現在のジェネレーション
      current.yml
      backlog/
    lineage/                  # 完了したジェネレーションのアーカイブ
    hooks/                    # ライフサイクルフック（.md/.sh）
```

## 設定 [↗](https://reap.cc/docs/configuration)

`.reap/config.yml` のプロジェクト設定：

```yaml
project: my-project           # プロジェクト名
language: english              # アーティファクト/プロンプトの言語
autoSubagent: true             # evolve で subagent に自動委任
strictEdit: false               # コード変更をREAPライフサイクルに制限
strictMerge: false              # 直接の git pull/push/merge を制限
agentClient: claude-code       # AIエージェントクライアント
# cruiseCount: 1/5             # 存在する場合 = cruise mode（現在/合計）
# evaluator: true              # オプトイン: validation/fitnessで reap-evaluate を起動
```

主要な設定項目：
- **`cruiseCount`**: 存在する場合、cruise mode を有効化。フォーマットは `current/total`。cruise 完了後に削除されます。
- **`strictEdit`**: コード変更を、計画されたスコープ内の implementation ステージに制限します。
- **`strictMerge`**: 直接の git pull/push/merge を制限します — 代わりに `/reap.pull`、`/reap.push`、`/reap.merge` を使用してください。
- **`agentClient`**: スキルのデプロイに使用するアダプターを決定します。
- **`evaluator`**: オプトインの独立レビュアー。`true`のとき、validationステージで `reap-evaluate` サブエージェントをアドバイザーとして起動します。デフォルト `false`。上記の [Evaluator Agent](#evaluator-agentオプトイン) を参照。

## v0.15からのアップグレード [↗](https://reap.cc/docs/migration-guide)

REAP v0.16 は [Self-Evolving Pipeline](https://reap.cc/docs/self-evolving) アーキテクチャに基づく完全な書き直しです。

### マイグレーション手順

1. **v0.16をインストール:**
   ```bash
   npm install -g @c-d-cc/reap
   ```
   v0.16のスキルが `~/.claude/commands/` に自動インストールされ、レガシーのv0.15プロジェクトレベルスキルが削除されます。

2. **プロジェクトでClaude Codeを開き**、以下を実行:
   ```
   /reap.update
   ```

3. **マルチフェーズマイグレーションに従います:**

   | フェーズ | 内容 | あなたの役割 |
   |----------|------|-------------|
   | **Confirm** | 変更内容を表示、`.reap/v15/` にバックアップを作成 | レビューして確認 |
   | **Execute** | ディレクトリの再構成、config/hooks/lineage/backlog のマイグレーション | 自動 |
   | **Genome Convert** | AIがv0.15ファイルから新しい3ファイル構造に genome を再構築 | AIの作業をレビュー |
   | **Vision** | vision/goals.md とメモリをセットアップ | プロジェクトの方向性を提供 |
   | **Complete** | マイグレーション結果のサマリー | 検証 |

4. **プロジェクトの動作を確認:**
   ```
   /reap.status
   /reap.evolve
   ```

### 中断されたマイグレーション

マイグレーションが中断された場合（APIエラー、セッション切断など）、進捗は `.reap/migration-state.yml` に保存されます。`/reap.update` を再度実行するだけで、完了済みのステップをスキップして中断箇所から再開します。

最初からやり直す場合は、`.reap/migration-state.yml` を削除してから `/reap.update` を再度実行してください。

### バックアップ

すべてのv0.15ファイルは `.reap/v15/` に保持されます。マイグレーションの検証後、このディレクトリを安全に削除できます。

### 変更点

**ライフサイクルの再設計:**
- 最初のステージは `learning` になりました（以前は `objective`）。AIが目標を設定する前にプロジェクトを探索します。
- Completion は4フェーズになりました: `reflect` → `fitness` → `adapt` → `commit`（以前は5フェーズ）。
- 新しいコンセプト: embryo ジェネレーション、cruise mode、ビジョン駆動プランニング。

**Vision レイヤーの追加:**
- `vision/goals.md` — 長期目標、adapt フェーズでのギャップ駆動目標選択
- `vision/memory/` — 3層メモリ（longterm, midterm, shortterm）によるジェネレーション間コンテキスト
- `vision/design/` — 計画ドキュメントと仕様書

**Genome の再構成（3ファイル）:**
- `application.md` — プロジェクトのアイデンティティ、アーキテクチャ、コンベンション、制約
- `evolution.md` — AI行動ガイド、進化の方向性、ソフトライフサイクルルール
- `invariants.md` — 絶対的制約（人間のみ編集可）

**新機能:**
- 明確性駆動のインタラクション: AIがコンテキストの明確さに応じてコミュニケーションの深さを調整
- Cruise mode: N世代を事前承認、AIが自己評価付きで自律実行
- reconcile ステージ付きマージライフサイクルで genome とソースの整合性を検証
- 3層メモリによるジェネレーション間コンテキストを持つ Vision システム

**非推奨コマンド:**
- `/reap.sync` → `/reap.knowledge`
- `/reap.refreshKnowledge` → `/reap.knowledge`

## 作者

**HyeonIL Choi** — [hichoi@c-d.cc](mailto:hichoi@c-d.cc) | [c-d.cc](https://c-d.cc) | [LinkedIn](https://www.linkedin.com/in/hichoi-dev) | [GitHub](https://github.com/casamia918)

## ライセンス

MIT

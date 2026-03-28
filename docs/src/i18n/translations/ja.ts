import type { Translations } from "./en";

export const ja: Translations = {
  // Nav & Sidebar
  nav: {
    getStarted: "はじめる",
    groups: {
      gettingStarted: "はじめに",
      guide: "ガイド",
      collaboration: "コラボレーション",
      reference: "リファレンス",
      other: "その他",
    },
    items: {
      introduction: "イントロダクション",
      quickStart: "クイックスタート",
      coreConcepts: "コアコンセプト",
      genome: "Genome",
      environment: "Environment",
      lifecycle: "Life Cycle",
      lineage: "Lineage",
      backlog: "Backlog",
      hooks: "Hooks",
      advanced: "上級",
      collaborationOverview: "分散ワークフロー",
      mergeGeneration: "Merge Generation",
      mergeCommands: "Mergeコマンド",
      cliReference: "CLIリファレンス",
      commandReference: "コマンドリファレンス",
      hookReference: "Hookリファレンス",
      comparison: "比較",
      configuration: "設定",
      recoveryGeneration: "Recovery Generation",
      releaseNotes: "リリースノート",
    },
  },

  // Hero Page
  hero: {
    tagline: "Recursive Evolutionary Autonomous Pipeline",
    title: "REAP",
    description: "AIと人間が協力してアプリケーションを世代ごとに進化させる開発パイプラインです。セッション間でコンテキストが持続し、開発は構造化されたライフサイクルに従い、設計ドキュメントはコードとともに進化します。",
    getStarted: "はじめる →",
    whyReap: "なぜREAP？",
    whyReapDesc: "AIエージェントは強力ですが、構造がなければ開発は混沌とします。コンテキストは毎セッションでリセットされ、コード変更は目的なく散在し、設計ドキュメントは現実と乖離し、過去の作業からの教訓は消え去ります。",
    problems: [
      { problem: "コンテキストの喪失", solution: "CLAUDE.md + Memoryが毎セッションでプロジェクトのフルコンテキストを自動的に復元します" },
      { problem: "散在した開発", solution: "各世代は構造化されたライフサイクルを通じて一つの目標に集中します" },
      { problem: "設計とコードの乖離", solution: "実装中に発見されたGenomeの変更はbacklogを通じてフィードバックされます" },
      { problem: "忘れられた教訓", solution: "振り返りはGenomeに蓄積され、LineageがすべてのGenerationをアーカイブします" },
      { problem: "コラボレーションの混乱", solution: "Genome優先のmergeワークフローが並行ブランチを調整します — コードの競合より先に設計の競合を解決します" },
    ],
    threeLayer: "4層アーキテクチャ",
    threeLayerDesc: "REAPは相互接続された4つの層で構成されています：Knowledgeが基盤を提供し、Visionが方向性を示し、Generationが作業を実行し、Civilizationが進化していきます。",
    layers: [
      { label: "Knowledge", sub: "Genome + Environment", path: ".reap/genome/ + .reap/environment/", desc: "Genome（規範的 — アーキテクチャ、コンベンション、制約）とEnvironment（記述的 — 技術スタック、ソース構造、ドメイン）。各世代の作業の基盤となります。" },
      { label: "Vision", sub: "Goals + Memory", path: ".reap/vision/", desc: "長期的な目標と方向性。Visionが各世代を駆動し、次に追求すべき目標を決定します。Memoryはセッション間でコンテキストを持続させます。" },
      { label: "Generation", sub: "進化サイクル", path: ".reap/life/ → .reap/lineage/", desc: "各GenerationはLearning → Planning → Implementation → Validation → Completionを実行します。完了時にlineageにアーカイブされます。" },
      { label: "Civilization", sub: "ソースコード", path: "your codebase/", desc: ".reap/以外のすべて。世代が進化させるもの。教訓はKnowledgeにフィードバックされます。" },
    ],
    lifecycle: "Generationライフサイクル",
    lifecycleDesc: "各世代は、目標定義から振り返りとアーカイブまで、5つのステージを経て進行します。",
    stages: [
      ["Learning", "プロジェクトの探索、コンテキストの構築、genomeとenvironmentのレビュー", "01-learning.md"],
      ["Planning", "タスクの分解、アプローチの選択、依存関係のマッピング", "02-planning.md"],
      ["Implementation", "AI + 人間のコラボレーションによる実装", "03-implementation.md"],
      ["Validation", "テストの実行、完了基準の検証", "04-validation.md"],
      ["Completion", "振り返り + フィットネスフィードバック + genome適応 + アーカイブ（4フェーズ）", "05-completion.md"],
    ],
    stageHeaders: ["ステージ", "内容", "アーティファクト"],
    installation: "インストール",
    installStep1: "1. グローバルにインストール",
    installStep2: "2. Claude Codeを開き、初期化して開始",
    installStep3: "",
    installNote: [
      { before: "", code: "/reap.evolve", after: " はLearningからCompletionまでの完全なGenerationライフサイクルを自律的に実行します。" },
      { linkText: "ステージコマンド", after: "で手動で制御することもできます。" },
    ],
    keyConcepts: "主要コンセプト",
    concepts: [
      { label: "Genomeの不変性", desc: "Genomeは通常のGeneration中には変更されません。問題はgenome-changeバックログアイテムとして記録され、Completionのadaptフェーズで適用されます。（Embryo generationでは自由な変更が可能です。）" },
      { label: "BacklogとDeferral", desc: ".reap/life/backlog/のアイテムにはtype: genome-change | environment-change | taskがあります。部分的な完了は正常です — 遅延タスクは次の世代に引き継がれます。" },
      { label: "VisionとMemory", desc: "Vision（.reap/vision/）が各世代の目標を駆動します。Memoryは3層の自由形式記録システム（longterm/midterm/shortterm）で、AIがセッション間でコンテキストを持続させます。" },
      { label: "Lineage", desc: "完了したGenerationは.reap/lineage/にアーカイブされます。振り返りはそこに蓄積されます。時間とともに圧縮されます（Level 1 → gen-XXX-{hash}.md、Level 2 → epoch.md）。" },
      { label: "4層アーキテクチャ", desc: "Vision（目標 + memory）、Knowledge（genome + environment）、Generation（ライフサイクル）、Civilization（ソースコード）。" },
      { label: "分散ワークフロー", desc: "複数の開発者やエージェントが別々のブランチで並行作業します。/reap.pullがフェッチしてgenome優先のmerge generationを実行します。/reap.pushがプッシュ前に状態を検証します。サーバー不要 — Gitがトランスポート層です。" },
    ],
    documentation: "ドキュメント",
    docLinks: [
      { href: "/docs/introduction", title: "イントロダクション", desc: "REAPとは何か、なぜ使うのか、4層アーキテクチャ。" },
      { href: "/docs/quick-start", title: "クイックスタート", desc: "インストールして最初のGenerationをステップバイステップで実行。" },
      { href: "/docs/core-concepts", title: "コアコンセプト", desc: "Genome、ライフサイクル、BacklogとDeferralの詳細。" },
      { href: "/docs/lifecycle", title: "Life Cycle", desc: "/reap.evolve、ステージコマンド、マイクロループ、completionフェーズ。" },
      { href: "/docs/self-evolving", title: "自己進化", desc: "明確性駆動インタラクション、cruiseモード、memory、ギャップ駆動進化。" },
      { href: "/docs/command-reference", title: "コマンドリファレンス", desc: "/reap.evolve、ステージコマンド、/reap.status — すべてのスラッシュコマンド。" },
      { href: "/docs/hook-reference", title: "Hookリファレンス", desc: "ライフサイクルhooks：ファイルベースのイベントhook、条件、実行順序。" },
      { href: "/docs/migration-guide", title: "移行ガイド", desc: "v0.15からのアップグレード — レジューム対応のステップバイステップ移行。" },
      { href: "/docs/comparison", title: "比較", desc: "REAPと従来のスペック駆動開発ツールの比較。" },
      { href: "/docs/advanced", title: "上級", desc: "署名ベースのロック、lineage圧縮、エントリーモード。" },
    ],
  },

  // Introduction Page
  intro: {
    title: "イントロダクション",
    breadcrumb: "はじめに",
    description: "REAP（Recursive Evolutionary Autonomous Pipeline）は、AIと人間が協力してアプリケーションを世代ごとに段階的に進化させる開発パイプラインです。各AIセッションを独立したタスクとして扱うのではなく、REAPは構造化されたライフサイクルとGenomeと呼ばれる生きた知識ベースを通じて継続性を維持します。",
    threeLayer: "4層アーキテクチャ",
    layerItems: [
      { label: "Vision", sub: "Goals + Memory", path: ".reap/vision/" },
      { label: "Knowledge", sub: "Genome + Environment", path: ".reap/genome/ + .reap/environment/" },
      { label: "Generation", sub: "進化サイクル", path: ".reap/life/ → .reap/lineage/" },
      { label: "Civilization", sub: "ソースコード", path: "your codebase/" },
    ],
    layerDescs: [
      "長期的な目標と方向性。Visionが各世代を駆動し、次に追求すべき目標を決定します。Memoryは3層の自由形式記録システムで、AIがセッション間でコンテキストを持続させます。",
      "Genome（規範的 — アーキテクチャ、コンベンション、制約）とEnvironment（記述的 — 技術スタック、ソース構造、ドメイン）。各世代の作業の基盤となります。",
      "Visionに駆動され、Knowledgeに基づく単一の進化サイクル。Learning → Planning → Implementation → Validation → Completionに従います。",
      "ソースコードおよび.reap/外のすべてのプロジェクトアーティファクト。世代が進化させるもの。教訓はKnowledgeにフィードバックされます。",
    ],
    whyReap: "なぜREAP？",
    problemHeader: "課題",
    solutionHeader: "REAPの解決策",
    problems: [
      ["コンテキストの喪失 — エージェントが毎セッションでプロジェクトコンテキストを忘れる", "CLAUDE.md + Memory — 毎セッションでgenome、environment、reap-guideをロード。Memoryがセッション間でコンテキストを持続。"],
      ["散在した開発 — 明確な目標なくコードが変更される", "Generationモデル — 各世代は構造化されたライフサイクルで一つの目標に集中"],
      ["設計とコードの乖離 — ドキュメントがコードから乖離する", "Backlogを通じたGenome変更 — 実装中に発見された設計の欠陥を記録し、Completionのadaptフェーズで適用"],
      ["忘れられた教訓 — 過去の作業からの知見が失われる", "LineageとMemory — 教訓がgenomeとmemoryに蓄積され、世代がアーカイブ・圧縮される"],
      ["コラボレーションの混乱 — 並行作業が競合する変更を引き起こす", "分散ワークフロー — Genome優先のmergeがコードの前に設計を調整、DAG lineageが並行ブランチを追跡"],
    ],
    fourAxis: "4層アーキテクチャ",
    fourAxisDesc: "REAPは相互接続された4つの層で構成されています：",
    axes: [
      { axis: "Vision", path: ".reap/vision/", desc: "長期的な目標と方向性。目標 + memoryによるセッション間コンテキスト。" },
      { axis: "Knowledge", path: ".reap/genome/ + .reap/environment/", desc: "Genome（規範的）+ Environment（記述的）。各世代の基盤。" },
      { axis: "Generation", path: ".reap/life/", desc: "現在の世代のライフサイクル。進行状態とアーティファクト。" },
      { axis: "Civilization", path: "your codebase/ + .reap/lineage/", desc: "ソースコード + 完了した世代のアーカイブ。" },
    ],
    projectStructure: "プロジェクト構造",
  },

  // Quick Start Page
  quickstart: {
    title: "クイックスタート",
    breadcrumb: "はじめに",
    prerequisites: "前提条件",
    prerequisiteItems: [
      { name: "Node.js", desc: "v18以降", required: true },
      { name: "npm", desc: "Node.jsに同梱", required: true },
      { name: "Claude Code or OpenCode", desc: "AIエージェントCLI（少なくとも1つ必要）", required: true },
      { name: "Bun", desc: "代替パッケージマネージャー", required: false },
    ],
    required: "必須",
    optional: "任意",
    install: "インストール",
    initProject: "プロジェクトの初期化",
    runFirst: "最初のGenerationを実行",
    runFirstDesc: "プロジェクトディレクトリでClaude Codeを開きます：",
    evolveTitle: "/reap.evolve がメインコマンドです",
    evolveDesc: "Generationライフサイクル全体 — Learning、Planning、Implementation、Validation、Completion — を自律的に実行します。AIエージェントがすべてのステージを駆動し、本当にブロックされた場合にのみ停止します。日常の開発で最も使用するコマンドです。",
    manualControl: "手動ステージ制御",
    manualControlDesc: "各ステージを個別に制御することもできます：",
    whatHappens: "Generation中に何が起こるか",
    stageHeaders: ["ステージ", "内容", "アーティファクト"],
    stages: [
      ["Learning", "プロジェクトの探索、コンテキストの構築、genomeとenvironmentのレビュー", "01-learning.md"],
      ["Planning", "タスクの分解、アプローチの選択、依存関係のマッピング", "02-planning.md"],
      ["Implementation", "AI + 人間のコラボレーションによる実装", "03-implementation.md"],
      ["Validation", "テストの実行、完了基準の検証", "04-validation.md"],
      ["Completion", "振り返り、フィットネスフィードバックの収集、genome適応、アーカイブ", "05-completion.md"],
    ],
    commandLoading: "コマンドの読み込み方法",
    commandLoadingDesc: "REAPスラッシュコマンドはREAPプロジェクトでのみ読み込まれます — 非REAPプロジェクトでは表示されません。",
    commandLoadingDetails: [
      { label: "ソース", desc: "コマンドのオリジナルは~/.reap/commands/に保存されます（reap initとreap updateでインストール）" },
      { label: "読み込み", desc: "REAPプロジェクトを開くと、セッションhookが自動的にコマンドを.claude/commands/にシンボリックリンクします" },
      { label: "非REAPプロジェクト", desc: "シンボリックリンクが作成されないため、AIエージェントのスキルリストにREAPスキルは表示されません" },
      { label: "後方互換性", desc: "~/.claude/commands/のリダイレクトスタブにより、移行中の古いセットアップも動作し続けます" },
    ],
  },

  // Core Concepts Page
  concepts: {
    title: "コアコンセプト",
    breadcrumb: "ガイド",
    fourAxisTitle: "4層アーキテクチャ",
    fourAxisDesc: "REAPは相互接続された4つの層で構成されています：",
    axes: [
      { axis: "Vision", path: ".reap/vision/", desc: "長期的な目標と方向性。目標が各世代を駆動します。Memoryがセッション間でコンテキストを持続させます。", href: "/docs/self-evolving" },
      { axis: "Knowledge", path: ".reap/genome/ + .reap/environment/", desc: "Genome（規範的 — どう構築するか）+ Environment（記述的 — 何が存在するか）。各世代の基盤。", href: "/docs/genome" },
      { axis: "Generation", path: ".reap/life/", desc: "Visionに駆動され、Knowledgeに基づく単一の進化サイクル。Learning → Planning → Implementation → Validation → Completionに従います。", href: "/docs/lifecycle" },
      { axis: "Civilization", path: "your codebase/", desc: "ソースコードおよび.reap/外のすべてのプロジェクトアーティファクト。世代が進化させるもの。教訓はKnowledgeにフィードバックされます。", href: "/docs/lineage" },
    ],
    principlesTitle: "主要原則",
    principles: [
      { name: "Genomeの不変性", desc: "通常のGeneration中には変更されません。変更はbacklog → Completionのadaptフェーズを通じて行われます。（Embryo generationでは自由な変更が可能です。）" },
      { name: "人間がフィットネスを判断", desc: "定量的メトリクスはありません。人間の自然言語フィードバックが唯一のフィットネスシグナルです。" },
      { name: "明確性駆動インタラクション", desc: "AIはコンテキストの明確さに基づいてコミュニケーションの深度を調整します — 積極的な対話から自律的な実行まで。詳細は自己進化機能を参照してください。" },
    ],
    lifecycleTitle: "ライフサイクル概要",
    lifecycleDesc: "各世代は5つのステージに従い、各ステップでアーティファクトを生成します：",
    stageHeaders: ["ステージ", "内容", "アーティファクト"],
    stages: [
      ["Learning", "プロジェクトの探索、コンテキストの構築、genomeとenvironmentのレビュー", "01-learning.md"],
      ["Planning", "タスク分解 + 実装計画", "02-planning.md"],
      ["Implementation", "AI + 人間のコラボレーションによるコーディング", "03-implementation.md"],
      ["Validation", "テストの実行、完了基準の検証", "04-validation.md"],
      ["Completion", "振り返り + フィットネスフィードバック + genome適応 + アーカイブ（4フェーズ）", "05-completion.md"],
    ],
    sessionInitTitle: "セッションコンテキストの読み込み",
    sessionInitDesc: "REAPプロジェクトを開くと、CLAUDE.mdがAIエージェントにgenome、environment、REAPガイドを読み込むよう指示します。エージェントはプロジェクトの知識を即座にロードし、現在の状態を理解します。",
    sessionInitAlt: "REAPセッションコンテキストの読み込み — CLAUDE.mdを通じてgenome、environment、ガイドがロードされる",
    evolutionFlowTitle: "進化フロー",
    evolutionFlowDesc: "知識は世代を超えて蓄積されます。各世代がGenomeを進化させ、教訓がLineageに蓄積されます：",
  },

  // Workflow Page
  workflow: {
    title: "ワークフロー",
    breadcrumb: "ガイド",
    intro: "GenerationはREAPにおける作業の基本単位です。各世代は単一の目標を5つのステージを通じて遂行し、途中でアーティファクトを生成します。各ステージで何が起こり、どのように接続されるかを説明します。",
    evolveTitle: "/reap.evolve — 主要な作業方法",
    evolveDesc: "/reap.evolveを実行し、AIエージェントにすべてのステージを自律的に進行させるのが基本です。Generation全体をサブエージェントに委任でき、本当にブロックされた場合（曖昧な目標、重大なトレードオフ、genome競合、予期しないエラー）にのみ介入を求めます。サブエージェントは開始、各ステージの実行、進行、アーカイブを処理します。",
    evolveNote: "細かい制御が必要な場合は、個別のステージコマンドを実行できます。詳細はコマンドリファレンスを参照してください。",
    stageWalkthrough: "ステージ別ウォークスルー",
    stageDetails: [
      {
        title: "1. Learning",
        desc: "プロジェクトを探索しコンテキストを構築します。AIはgenome、environment、lineageをレビューし、明確性レベルを評価します。目標設定の前に現在の状態を徹底的に理解します。",
        output: "01-learning.md — コンテキスト探索、genome/environmentレビュー、明確性評価。",
      },
      {
        title: "2. Planning",
        desc: "目標を実行可能なタスクに分解します。AIはlearningのコンテキストを読み、genomeのコンベンションと制約を参照し、アーキテクチャ決定を含む実装計画を提案します。",
        output: "02-planning.md — フェーズ分けされたタスクリスト、依存関係、並列可能タスクは[P]でマーク。",
      },
      {
        title: "3. Implementation",
        desc: "コードを構築します。タスクは順次実行され、各完了は即座に記録されます。genomeやenvironmentの欠陥が発見された場合はbacklogに記録され、直接適用されることはありません。保留中のgenome変更に依存するタスクは[deferred]とマークされます。",
        output: "03-implementation.md — 完了タスクテーブル、遅延タスク、genome-changeバックログアイテム。",
      },
      {
        title: "4. Validation",
        desc: "作業を検証します。テスト、lint、ビルド、型チェックを実行します。完了基準を確認し、軽微な修正（5分以内、設計変更なし）を適用します。判定はpass、partial（一部基準を遅延）、またはfailです。",
        output: "04-validation.md — 実際のコマンド出力を含むテスト結果、基準チェックテーブル、判定。",
      },
      {
        title: "5. Completion（4フェーズ）",
        desc: "Reflect：振り返りを書き、environmentを更新。Fitness：人間のフィードバックを収集（cruiseモードでは自己評価）。Adapt：genomeをレビューし、backlogの変更を適用し、次世代の目標を提案。Commit：lineageにアーカイブ + gitコミット。",
        output: "05-completion.md — 振り返り、フィットネスフィードバック、genome変更ログ、次世代へのヒント。",
      },
    ],
    microLoop: "マイクロループ（リグレッション）",
    microLoopDesc: "どのステージでも前のステージに戻ることができます。これは一般的なことです — validationが失敗してimplementationに戻る、またはimplementation中にplanningの欠陥が見つかりplanningに戻るなど。リグレッションの理由はタイムラインと対象アーティファクトに記録されます。",
    artifactHandling: "リグレッション時のアーティファクト処理：",
    artifactRules: [
      { label: "対象ステージより前：", desc: "そのまま保持" },
      { label: "対象ステージ：", desc: "上書き（implementationのみ追記）" },
      { label: "対象ステージより後：", desc: "保持され、再入時に上書き" },
    ],
    minorFix: "軽微な修正",
    minorFixDesc: "些細な問題（タイポ、lintエラーなど）は、5分以内に解決でき設計変更が不要な場合、リグレッションなしで現在のステージで直接修正できます。修正はステージアーティファクトに記録されます。",
    roleSeparation: "役割分担",
    roleHeaders: ["誰が", "役割"],
    roles: [
      ["CLI (reap)", "プロジェクトのセットアップとメンテナンス — init、status、run"],
      ["AIエージェント", "ワークフロー実行者 — スラッシュコマンドで各ステージの作業を遂行"],
      ["人間", "意思決定者 — 目標設定、コードレビュー、フィットネスフィードバックの提供"],
    ],
  },

  // CLI Page
  cli: {
    title: "CLIリファレンス",
    breadcrumb: "リファレンス",
    initTitle: "reap init",
    initDesc: "新しいREAPプロジェクトを初期化します。greenfield（空のプロジェクト）とadoption（既存のコードベース）を自動検出します。.reap/構造を作成し、スラッシュコマンドとhooksをインストールします。",
    initHeaders: ["オプション", "値", "説明"],
    initOptions: [
      ["--mode", "greenfield | adoption", "自動検出されたプロジェクトエントリーモードを上書き"],
      ["--repair", "", "再初期化せずに壊れた.reap/構造を修復"],
      ["--migrate", "", "v0.15からv0.16の構造に移行"],
    ],
    statusTitle: "reap status",
    statusDesc: "現在のプロジェクトとGenerationの状態を表示します。",
    statusNote: "プロジェクト名、アクティブなGeneration（id、goal、stage）、完了したGenerationの総数、REAPバージョンを表示します。",
    runTitle: "reap run",
    runDesc: "ライフサイクルコマンドを直接実行します。スラッシュコマンドの内部で使用され、細かいステージ制御に利用されます。",
    runNote: "例：reap run start --goal \"...\"、reap run learning、reap run completion --phase reflect。各コマンドはAIエージェント向けの構造化されたJSON指示を返します。",
    fixTitle: "reap fix",
    fixDesc: ".reap/ディレクトリ構造を診断・修復します。読み取り専用モードには--checkを使用します（修正せずに問題を報告）。",
    fixNote: "不足しているディレクトリのチェック、config.ymlの存在確認、current.ymlステージの検証、不足構造の再作成を行います。--checkでは、変更を加えずに構造の整合性チェックを実行します。",
    cleanTitle: "reap clean",
    cleanDesc: "REAPプロジェクトをインタラクティブなオプションでリセットします。",
    cleanNote: "REAPプロジェクトの一部（例：life、lineage、genome）を選択的にリセットするインタラクティブプロンプトを提供します。",
    destroyTitle: "reap destroy",
    destroyDesc: "プロジェクトからすべてのREAPファイルを削除します。",
    destroyNote: ".reap/ディレクトリとプロジェクト内のすべてのREAP関連ファイルを完全に削除します。確認のために「yes destroy」と入力する必要があります。",
    makeBacklogTitle: "reap make backlog",
    makeBacklogDesc: "バックログアイテムを作成します。バックログファイルの作成にサポートされている唯一の方法です。",
    makeBacklogNote: "オプション：--type <genome-change|environment-change|task> --title <title> [--body <body>] [--priority <priority>]。バックログファイルを直接作成しないでください。",
    cruiseTitle: "reap cruise",
    cruiseDesc: "cruiseモードの設定 — N世代の自律的実行を事前承認します。",
    cruiseNote: "使用法：reap cruise <count>。各世代は自己評価付きの完全なライフサイクルを実行します。不確実性やリスクが検出された場合、cruiseは一時停止して人間のフィードバックを要求します。",
    helpTitle: "reap help",
    helpDesc: "CLIコマンド、スラッシュコマンド、ワークフローの概要を表示します。",
    helpNote: "設定された言語でヘルプテキストを出力します（現在enとkoに対応）。言語ファイルが見つからない場合は英語にフォールバックします。",
  },

  // Command Reference Page
  commands: {
    title: "コマンドリファレンス",
    breadcrumb: "リファレンス",
    intro: "REAPには2種類のコマンドがあります：CLIコマンドとスラッシュコマンド。",
    cliCommandsDesc: "CLIコマンド（reap ...）はターミナルで実行します。プロジェクトのセットアップとメンテナンス — init、status、run、fix、clean、destroy、make backlog、cruiseを処理します。AIエージェントとは対話しません。",
    slashCommandsDesc: "スラッシュコマンド（/reap.*）はAIエージェントCLI（Claude Code）内で実行します。開発ワークフローを駆動します — AIエージェントがプロンプトを読み、記述されたタスクをインタラクティブに実行します。",
    slashTitle: "スラッシュコマンド",
    slashIntro: "すべてのREAP操作は/reap.*スラッシュコマンドを通じて行われます。これはユーザーとAIエージェントの両方にとって主要なインターフェースです。",
    commandHeaders: ["コマンド", "説明"],
    normalTitle: "ライフサイクルコマンド",
    normalCommands: [
      ["/reap.evolve", "Generationライフサイクル全体を実行します（推奨）。日常開発の主要コマンド。すべてのステージをループ — learning、planning、implementation、validation、completion。"],
      ["/reap.start", "新しいGenerationを開始します。目標のプロンプト、current.ymlの作成、ステージをlearningに設定します。"],
      ["/reap.next", "次のライフサイクルステージに進みます。アーティファクトの存在とnonceチェーンを検証してから進行します。"],
      ["/reap.back", "前のステージに戻ります（マイクロループ）。使用法：/reap.back [--reason \"<reason>\"]"],
      ["/reap.abort", "現在のGenerationを中止します。2フェーズプロセス：確認（何が起こるか表示）して実行。オプション：--phase execute、--reason、--source-action <rollback|stash|hold|none>、--save-backlog。"],
    ],
    mergeTitle: "コラボレーションコマンド",
    mergeCommands: [
      ["/reap.merge", "並行ブランチのmergeライフサイクル。使用法：/reap.merge [--type merge --parents \"<branchA>,<branchB>\"]"],
      ["/reap.pull", "リモートの変更をフェッチし、merge機会を検出します。"],
      ["/reap.push", "REAP状態を検証（進行中のGenerationがある場合は警告）し、現在のブランチをリモートにプッシュします。"],
    ],
    generalTitle: "一般コマンド",
    generalCommands: [
      ["/reap.init", "プロジェクトでREAPを初期化します。greenfieldと既存コードベースを自動検出します。"],
      ["/reap.knowledge", "genome、environment、コンテキスト知識を管理します。サブコマンド：reload、genome、environment。"],
      ["/reap.config", "プロジェクト設定（.reap/config.yml）の表示・編集。"],
      ["/reap.status", "現在のGeneration状態、ステージの進行状況、backlogの概要を確認します。"],
      ["/reap.help", "利用可能なコマンドとトピックを表示します。"],
      ["/reap.run", "ライフサイクルコマンドを直接実行します。細かいステージとフェーズの制御用。"],
      ["/reap.update", "v0.15からv0.16への移行を実行します。"],
    ],
    commandStructure: "スクリプトオーケストレーターアーキテクチャ",
    commandStructureDesc: "すべてのスラッシュコマンドはreap run <cmd>を呼び出す1行の.mdラッパーです。TypeScriptスクリプトがすべての決定論的ロジックを処理し、AIエージェント向けの構造化されたJSON指示を返します。パターン：Gate（前提条件チェック）→ Steps（作業実行）→ Artifact（.reap/life/に記録）。",
  },

  // Recovery Generation Page
  recovery: {
    title: "Recovery Generation",
    breadcrumb: "その他",
    intro: "Recovery Generationは、過去の世代のアーティファクトにエラーや不整合が発見された場合にレビューと修正を行う特殊なGenerationタイプです。type: recoveryを使用し、recoversフィールドで対象世代を参照します。",
    triggerTitle: "トリガー方法",
    triggerDesc: "/reap.evolve.recoveryコマンドに対象のGeneration IDを指定して使用します。システムが対象のアーティファクトをレビューし、修正が必要な場合にのみrecovery generationを作成します。",
    criteriaTitle: "レビュー基準",
    criteriaHeaders: ["基準", "説明"],
    criteriaItems: [
      ["アーティファクトの不整合", "同一Generation内のアーティファクト間の矛盾（例：目標と実装設計の不一致）"],
      ["構造的欠陥", "アーティファクトの欠落セクション、不完全な内容、またはフォーマットエラー"],
      ["人間指定の修正", "ユーザーが明示的に要求した修正"],
    ] as string[][],
    processTitle: "プロセスフロー",
    processDesc: "recoveryコマンドは2つのフェーズで実行されます：review（基準に対してアーティファクトを分析）とcreate（問題が見つかった場合にrecovery generationを開始）。",
    processFlow: `/reap.evolve.recovery gen-XXX
  → 対象世代のlineageアーティファクトをロード
  → 3つの基準に対してレビュー
  → 問題発見 → recovery generationを自動開始（type: recovery）
  → 問題なし   → "recovery不要"（Generationは作成されない）`,
    stagesTitle: "ステージ目的の比較",
    stagesDesc: "Recovery generationは通常のGenerationと同じ5ステージのライフサイクルに従いますが、各ステージの目的が異なります。",
    stageHeaders: ["ステージ", "通常", "Recovery"],
    stageItems: [
      ["Learning", "プロジェクトの探索、コンテキストの構築", "対象世代のアーティファクトをレビューし、必要な修正を特定"],
      ["Planning", "タスク分解", "レビューするファイル/ロジック + 検証基準のリスト作成"],
      ["Implementation", "コードの記述", "既存コードのレビューと修正"],
      ["Validation", "検証", "修正後の検証"],
      ["Completion", "振り返り", "振り返り + 元のGenerationに対する修正記録"],
    ] as string[][],
    currentYmlTitle: "current.ymlの拡張",
    currentYmlDesc: "Recovery generationはcurrent.ymlとmeta.ymlにrecoversフィールドを追加します。parentsフィールドは通常のDAGルールに従い、recoversは修正対象を別途参照します。",
    notesTitle: "注意事項",
    notes: [
      "既存の通常/merge generationには影響しません",
      "Recovery generationにも同じlineage圧縮ルールが適用されます",
      "Recovery generationは通常のGenerationと同じ5つのアーティファクトを生成します",
      "目標には対象Generationの元の目標 + completionが自動的に引用されます",
    ],
  },

  // Configuration Page
  config: {
    title: "設定",
    breadcrumb: "リファレンス",
    intro: "REAPプロジェクトは.reap/config.ymlを通じて設定されます。このファイルはreap init中に作成され、プロジェクト設定、strictモード、エージェント統合を制御します。",
    structure: "設定ファイル構造",
    fields: "フィールド",
    fieldHeaders: ["フィールド", "説明"],
    fieldItems: [
      ["project", "プロジェクト名（init中に設定）"],
      ["language", "アーティファクトとユーザーインタラクションの言語（例：korean、english、japanese）。デフォルト：english"],
      ["autoSubagent", "/reap.evolveをAgent toolでサブエージェントに自動委任（デフォルト：true）"],
      ["strictEdit", "コード変更をREAPライフサイクルに制限（デフォルト：false）。下記のStrictモードを参照。"],
      ["strictMerge", "直接のgit pull/push/mergeを制限 — 代わりにREAPコマンドを使用（デフォルト：false）。下記のStrictモードを参照。"],
      ["agentClient", "使用するAIエージェントクライアント（デフォルト：claude-code）。スキルデプロイメントとセッションhookに使用するアダプターを決定"],
      ["cruiseCount", "存在する場合、cruiseモードを有効にします。形式：current/total（例：1/5）。cruise完了後に自動削除"],
    ],
    strictMode: "Strictモード",
    strictModeDesc: "StrictモードはAIエージェントが実行できる操作を制御します。2つの独立した設定：",
    strictConfigExample: `strictEdit: true    # コード変更をREAPライフサイクルに制限
strictMerge: true   # 直接のgit pull/push/mergeを制限`,
    strictEditTitle: "strictEdit — コード変更制御",
    strictEditDesc: "有効にすると、AIエージェントはREAPワークフロー外でコードを変更できません。",
    strictHeaders: ["コンテキスト", "動作"],
    strictRules: [
      ["アクティブなGenerationなし / implementation以外のステージ", "コード変更は完全にブロック"],
      ["Implementationステージ", "02-planning.mdの範囲内の変更のみ許可"],
      ["エスケープハッチ", "ユーザーが明示的に「override」または「bypass strict」を要求 — バイパスはその特定のアクションのみに適用され、その後strictモードが再適用"],
    ],
    strictMergeTitle: "strictMerge — Gitコマンド制御",
    strictMergeDesc: "有効にすると、直接のgit pull、git push、git mergeコマンドが制限されます。エージェントはユーザーに代わりにREAPスラッシュコマンド（/reap.pull、/reap.push、/reap.merge）を使用するよう案内します。",
    strictNote: "どちらもデフォルトでは無効です。ファイルの読み取り、コード分析、質問への回答は、strictモードに関係なく常に許可されます。",
    entryModes: "エントリーモード",
    entryModeHeaders: ["モード", "用途"],
    entryModeItems: [
      ["greenfield", "ゼロから始める新規プロジェクト"],
      ["adoption", "既存のコードベースにREAPを適用"],
      ["migration", "既存のシステムから新しいアーキテクチャへの移行"],
    ],
  },

  // Hook Reference Page
  hooks: {
    title: "Hooks",
    breadcrumb: "ガイド",
    intro: "REAP hooksを使用すると、主要なライフサイクルイベントで自動化を実行できます。Hooksは.reap/hooks/に個別のファイルとして保存され、AIエージェントが適切なタイミングで実行します。",
    hookTypes: "Hookタイプ",
    hookTypesIntro: "各hookファイルは拡張子に基づいて2つのタイプのいずれかをサポートします：",
    commandType: "command (.sh)",
    commandTypeDesc: "シェルスクリプト。AIエージェントによってプロジェクトルートディレクトリで実行されます。スクリプト、CLIツール、ビルドコマンドに使用します。",
    promptType: "prompt (.md)",
    promptTypeDesc: "MarkdownのAIエージェント指示。エージェントがプロンプトを読み、記述されたタスクを実行します — コード分析、ファイル変更、ドキュメント更新など。判断が必要なタスクに使用します。",
    hookTypeNote: "各hookは単一のファイルです。同じイベントの複数のhookはフロントマターで指定された順序で実行されます。",
    fileNaming: "ファイル命名規則",
    fileNamingDesc: "Hookファイルは次のパターンに従います：.reap/hooks/{event}.{name}.{md|sh}",
    fileNamingFrontmatter: "各hookファイルはオプションのYAMLフロントマターをサポートします：",
    frontmatterHeaders: ["フィールド", "説明"],
    frontmatterItems: [
      ["condition", ".reap/hooks/conditions/内の条件スクリプト名（例：always、has-code-changes、version-bumped）"],
      ["order", "同じイベントの複数のhookがある場合の数値実行順序（デフォルト：50、小さい値が先に実行）"],
    ],
    events: "イベント",
    normalEventsTitle: "通常ライフサイクルイベント",
    mergeEventsTitle: "Mergeライフサイクルイベント",
    eventHeaders: ["イベント", "発火タイミング"],
    eventItems: [
      ["onLifeStarted", "/reap.startが新しいGenerationを作成した後"],
      ["onLifeLearned", "learningステージ完了後"],
      ["onLifePlanned", "planningステージ完了後"],
      ["onLifeImplemented", "implementationステージ完了後"],
      ["onLifeValidated", "validationステージ完了後"],
      ["onLifeCompleted", "completion + アーカイブ後（gitコミット後に実行）"],
      ["onLifeTransited", "任意のステージ遷移後（汎用）"],
      ["onMergeStarted", "merge generationが作成された後"],
      ["onMergeDetected", "detectステージ完了後"],
      ["onMergeMated", "mateステージ完了後（genomeが解決）"],
      ["onMergeMerged", "mergeステージ完了後（ソースがmerge済み）"],
      ["onMergeReconciled", "reconcileステージ完了後（genome-ソースの整合性が検証済み）"],
      ["onMergeValidated", "merge validation完了後"],
      ["onMergeCompleted", "merge completion + アーカイブ後"],
      ["onMergeTransited", "任意のmergeステージ遷移後（汎用）"],
    ],
    configuration: "ファイルベース設定",
    configurationDesc: "Hooksはファイルベースです — config.ymlではなく.reap/hooks/に保存されます。各hookは{event}.{name}.{md|sh}という名前のファイルです。",
    configExample: `.reap/hooks/
├── onLifeCompleted.reap-update.sh
├── onLifeCompleted.docs-update.md
├── onLifeImplemented.lint-check.sh
└── onMergeMated.notify.md

# 例：.md hook（AIプロンプト）
# ---
# condition: has-code-changes
# order: 30
# ---
# 変更をレビューし、必要に応じてドキュメントを更新してください。

# 例：.sh hook（シェルスクリプト）
# #!/bin/bash
# # condition: always
# # order: 20
# reap update`,
    hookSuggestion: "自動Hook提案",
    hookSuggestionDesc: "Completionステージ（Phase 5: Hook Suggestion）で、REAPは世代にわたる繰り返しパターンを検出します — 繰り返される手動ステップ、繰り返されるコマンド、一貫したステージ後のアクションなど。パターンが検出されると、REAPはそれを自動化するhookの作成を提案します。Hookの作成には常にユーザーの確認が必要です。",
    executionNotes: "実行に関する注意事項",
    executionItems: [
      "HooksはCLIではなくAIエージェントによって実行されます。エージェントが.reap/hooks/をスキャンして一致するファイルを探します。",
      ".shファイルはプロジェクトルートディレクトリでシェルスクリプトとして実行されます。",
      ".mdファイルはAIプロンプトとして読み込まれ、エージェントがそれに従います。",
      "同じイベント内のhooksは順序通りに実行されます（フロントマターの'order'フィールド、小さい値が先に実行）。",
      "条件は.reap/hooks/conditions/{name}.shで評価されます（exit 0 = 実行、非ゼロ = スキップ）。",
      "onLifeCompleted/onMergeCompleted hooksはgitコミット後に実行されます — hooksによるファイル変更はコミットされません。",
    ],
  },

  // Advanced Page
  advanced: {
    title: "上級",
    breadcrumb: "ガイド",
    signatureTitle: "署名ベースのロック",
    signatureDesc: "REAPは暗号学的nonceチェーンを使用してステージの順序を強制します。有効なnonceがなければ、AIエージェントは次のステージに進めません — スキップしようとしても。",
    signatureFlow: `Stage Command          current.yml              /reap.next
─────────────          ───────────              ──────────
generate nonce ──────→ store hash(nonce)
return nonce to AI                         ←── AI passes nonce
                                               verify hash(nonce)
                                               ✓ advance stage`,
    signatureHow: "仕組み",
    signatureHowItems: [
      "ステージコマンド（例：/reap.objective）がランダムnonceを生成",
      "nonceのSHA-256ハッシュがcurrent.ymlに保存",
      "nonceはJSON応答でAIエージェントに返される",
      "/reap.nextがnonceを受け取り、ハッシュしてcurrent.ymlと比較",
      "一致 → ステージ進行。不一致 → 拒否。",
    ],
    signatureComparisonTitle: "プロンプトのみ vs 署名ベース",
    signatureComparisonHeaders: ["脅威", "プロンプトのみ", "署名ベース"],
    signatureComparisonItems: [
      ["ステージのスキップ", "AIのコンプライアンスに依存", "ブロック — 有効なnonceなし"],
      ["トークンの偽造", "該当なし", "不可能 — 一方向ハッシュ"],
      ["古いnonceの再利用", "該当なし", "ブロック — 使い捨て、ステージ紐付け"],
      ["プロンプトインジェクション", "脆弱", "nonceはプロンプトコンテキスト外"],
    ],
    compressionTitle: "Lineage圧縮",
    compressionDesc: "世代が蓄積されるにつれ、lineageアーカイブはCompletionステージ中に自動的に圧縮されます。",
    compressionHeaders: ["レベル", "入力", "出力", "トリガー", "保護"],
    compressionItems: [
      ["Level 1", "Generationフォルダー（5アーティファクト）", "gen-XXX-{hash}.md（40行）", "lineage > 5,000行 + 5世代以上", "直近3件 + DAGリーフノード"],
      ["Level 2", "100件以上のLevel 1ファイル", "単一のepoch.md", "Level 1ファイル > 100件", "直近9件 + フォークポイント"],
    ],
    compressionProtection: "DAGの保存：Level 1ファイルはフロントマターにメタデータを保持します。Level 2のepoch.mdはgenerationハッシュチェーンを保存します。フォークガード：Level 2圧縮前にすべてのローカル/リモートブランチがスキャンされ、フォークポイントが保護されます。epoch圧縮されたGenerationはmergeベースとして使用できません。",
    entryModes: "エントリーモード",
    entryModesDesc: "reap init --modeで指定します。Genomeの初期構造を制御します。",
    entryModeHeaders: ["モード", "説明"],
    entryModeItems: [
      ["greenfield", "ゼロから新しいプロジェクトを構築。デフォルトモード。Genomeは空から成長します。"],
      ["migration", "既存のシステムを参照しながら新規構築。Genomeは既存システムの分析で初期化されます。"],
      ["adoption", "既存のコードベースにREAPを適用。Genomeはテンプレートから開始し、最初のGenerationのLearningステージで充実されます。"],
    ],
  },

  // Distributed Workflow - Overview
  collaboration: {
    title: "分散ワークフロー",
    breadcrumb: "コラボレーション",
    intro: "REAPは、複数の開発者やAIエージェントが同じプロジェクトで並行して作業するコラボレーション環境向けの分散ワークフローをサポートします — 中央サーバーは不要です。Gitが唯一のトランスポート層です。",
    caution: "分散ワークフローは現在初期段階であり、さらなるテストが必要です。本番環境では注意して使用してください。ユーザーフィードバックを積極的に収集しています — 問題や提案は",
    cautionLink: "GitHub Issues",
    cautionUrl: "https://github.com/c-d-cc/reap/issues",
    howItWorks: "仕組み",
    howItWorksDesc: "各開発者やエージェントは自分のブランチとGenerationで独立して作業します。統合の時が来たら、REAPがgenome優先の戦略でmergeをオーケストレーションします。",
    flowSteps: [
      "マシンAがbranch-aでgen-046-aを完了 → /reap.push",
      "マシンBがbranch-bでgen-046-bを完了 → /reap.push",
      "マシンAが/reap.pull branch-bを実行 → フェッチ + 完全なmerge generationライフサイクル",
    ],
    principles: "主要原則",
    principleItems: [
      { label: "オプトイン", desc: "git pull/pushは通常通り動作します。REAPコマンドは追加的です — 分散ワークフローの使用タイミングは自由に選べます。" },
      { label: "Genome優先", desc: "ソースmergeの前にGenomeの競合を解決します。法律を更新する前に憲法を修正するようなものです。" },
      { label: "サーバー不要", desc: "すべてローカル + Git。外部サービスも中央コーディネーションも不要です。" },
      { label: "DAG lineage", desc: "各GenerationはハッシュベースのID（gen-046-a3f8c2）で親を参照し、並行作業を自然にサポートする有向非巡回グラフを形成します。" },
    ],
    scenarios: "使用シナリオ",
    scenarioItems: [
      { label: "リモートブランチ（マルチマシン）", desc: "異なる開発者やエージェントが別々のマシンで作業し、リモートブランチにプッシュします。/reap.pushで公開し、/reap.pull <branch>でフェッチとmergeを行います。", example: "/reap.push → /reap.pull branch-b" },
      { label: "ローカルworktree（マルチエージェント）", desc: "複数のAIエージェントがgit worktreeを使用して同じマシンで並行作業します。各worktreeには独自のブランチとGenerationがあります。/reap.merge.startで直接統合 — フェッチ不要。", example: "/reap.merge.start worktree-branch" },
      { label: "混合", desc: "一部の作業はローカル（worktree）、一部はリモート（他のマシン）。必要に応じてリモートブランチには/reap.pullを、ローカルブランチには/reap.merge.startを組み合わせて使用します。" },
    ],
    pullPush: "Pull & Push（リモート）",
    pullDesc: "/reap.pull <branch>は/reap.evolveの分散版です。リモートをフェッチし、新しいGenerationを検出し、Detectから Completionまでの完全なmerge generationライフサイクルを実行します。",
    pushDesc: "/reap.pushは現在のREAP状態を検証（進行中のGenerationがある場合は警告）し、現在のブランチをリモートにプッシュします。",
    merge: "Merge（ローカル / Worktree）",
    mergeDesc: "/reap.merge.start <branch>はローカルブランチから直接merge generationを作成します — フェッチ不要のworktreeベースの並行開発に最適です。/reap.merge.evolveで完全なmergeライフサイクルを実行するか、各ステージを手動で進めます。",
    gitRefReading: "Git Refベースの読み取り",
    gitRefDesc: "merge前に、対象ブランチのgenomeとlineageはgit ref（git show、git ls-tree）で読み取られます — チェックアウト不要。リモートとローカルの両方のブランチで動作します。",
  },

  // Distributed Workflow - Merge Lifecycle
  mergeGeneration: {
    title: "Merge Generation",
    breadcrumb: "コラボレーション",
    intro: "分岐したブランチをmergeする必要がある場合、REAPはMerge Generationと呼ばれる特殊な6ステージのライフサイクルを実行します — 通常のGenerationライフサイクルとは別のものです。中核原則：まずgenomeを整合させ、その後にソースコードをmergeする。",
    whyLonger: "Merge Generationが通常のgit mergeと異なるのはなぜですか？",
    whyLongerDesc: "通常のgit mergeはソースコードの競合のみを解決します。しかし、2つのブランチが独立して進化する場合 — それぞれ独自のGeneration、genome変更、設計決定を持つ — ソースコードだけをmergeしても不十分です。genome（アーキテクチャ原則、コンベンション、制約、ビジネスルール）も分岐している可能性があります。Merge Generationはソースmergeの前に3つの重要なステップを追加します：genomeの分岐検出、mating（genome競合の解決）、merge後のgenome-ソース整合性の検証。これにより、mergeされたコードベースがコンパイルが通るだけでなく、設計的にも一貫していることが保証されます。",
    whyGenomeFirst: "なぜgenomeの整合が先なのか",
    whyGenomeFirstDesc: "ソースコードの競合を解決しても、意味的な競合がないことは保証されません。2つのコードはきれいにmergeされる — gitの競合は一切ない — にもかかわらず、意図、アーキテクチャ、ビジネスロジックにおいて互いに矛盾することがあります。genomeベースの推論だけがこれらの見えない競合を検出できます：mergeされたコードはまだアーキテクチャ原則に従っているか？コンベンションは一貫しているか？ビジネスルールは整合しているか？これが、REAPがソースコードに触れる前にgenomeを整合させる理由です。genomeが確定すれば、それが構文的にだけでなく意味的にもソース競合を解決するための権威あるガイドとなります。",
    whyLongerPoints: [
      { label: "通常のgit merge", desc: "ソース競合 → 解決 → コミット。設計の一貫性はチェックされない。意味的な競合は検出されない。" },
      { label: "Merge Generation", desc: "まずGenomeを整合 → genomeに基づくソースmerge → genome-ソース整合性の検証 → validation → コミット。見えない意味的な競合が検出される。" },
    ],
    stageOrder: "ステージ順序",
    stages: [
      { name: "Detect", desc: "git refで対象ブランチをスキャン。DAG BFSで共通祖先を検索。genomeの差分を抽出。競合をWRITE-WRITEまたはCROSS-FILEに分類。", artifact: "01-detect.md" },
      { name: "Mate", desc: "すべてのgenome競合を人間に提示。WRITE-WRITE：A、Bを選択、または手動merge。CROSS-FILE：論理的な互換性をチェック。進行前にgenomeが完全に解決されている必要あり。", artifact: "02-mate.md" },
      { name: "Merge", desc: "対象ブランチでgit merge --no-commitを実行。確定したgenomeに基づいてソース競合を解決。意味的な競合をチェック — コンパイルは通るがgenomeと矛盾するコード。", artifact: "03-merge.md" },
      { name: "Reconcile", desc: "merge後のgenome-ソース整合性を検証。AIがgenomeとソースコードを比較。不整合があればユーザーが確認。問題がある場合はMergeまたはMateにリグレッション。", artifact: "04-reconcile.md" },
      { name: "Validation", desc: "すべての機械的テストコマンドを実行（test、lint、build、型チェック）。失敗した場合はMergeまたはMateにリグレッション。", artifact: "05-validation.md" },
      { name: "Completion", desc: "mergeされた結果をコミット。meta.ymlにtype: mergeと両方の親を記録。lineageにアーカイブ。", artifact: "06-completion.md" },
    ],
    stageHeaders: ["ステージ", "内容", "アーティファクト"],
    conflictTypes: "競合タイプ",
    conflictHeaders: ["タイプ", "説明", "解決方法"],
    conflicts: [
      ["WRITE-WRITE", "同じgenomeファイルが両方のブランチで変更", "人間が決定：Aを維持、Bを維持、またはmerge"],
      ["CROSS-FILE", "異なるgenomeファイルが変更されたが、両方のブランチでgenomeが変更", "人間が論理的な互換性をレビュー"],
      ["ソース競合", "ソースコードのgit merge競合", "確定したgenomeに基づいて解決"],
      ["意味的な競合", "コードはきれいにmergeされるがgenome（アーキテクチャ、コンベンション、ビジネスルール）と矛盾", "Reconcileステージで検出 — AIがgenomeとソースを比較、ユーザーが解決を確認"],
      ["競合なし", "genomeおよびソースの競合なし", "自動的に進行"],
    ],
    regression: "Mergeリグレッション",
    regressionDesc: "ValidationまたはReconcileの失敗はMergeまたはMateにリグレッションできます。MergeはGenomeの問題が発見された場合にMateにリグレッションできます。リグレッションルールは通常のGenerationと同じパターンに従います — 理由はタイムラインとアーティファクトに記録されます。",
    currentYml: "current.yml構造（Merge）",
  },

  // Distributed Workflow - Merge Commands
  mergeCommands: {
    title: "Mergeコマンド",
    breadcrumb: "コラボレーション",
    intro: "すべての分散ワークフロー操作はAIエージェントが実行するスラッシュコマンドです。merge用のCLIコマンドはありません — genome競合の解決とソースmergeのガイダンスにはAIエージェントが不可欠です。",
    primaryCommands: "プライマリコマンド",
    primaryItems: [
      { cmd: "/reap.pull <branch>", desc: "分散mergeのワンストップコマンド。リモートをフェッチし、対象ブランチの新しいGenerationを検出し、merge generationを作成し、完全なmergeライフサイクルを実行します。/reap.evolveの分散版です。" },
      { cmd: "/reap.merge <branch>", desc: "ローカルブランチの完全なmerge generationを実行。フェッチ不要 — worktreeベースの並行開発に最適。/reap.pullのローカル版。" },
      { cmd: "/reap.push", desc: "REAP状態を検証（進行中のGenerationがある場合は警告）し、現在のブランチをプッシュします。Generationの完了後に使用してください。" },
    ],
    stageCommands: "ステージコマンド（細かい制御）",
    stageItems: [
      { cmd: "/reap.merge.start", desc: "対象ブランチのmerge generationを作成。detectを実行し、01-detect.mdを生成します。" },
      { cmd: "/reap.merge.detect", desc: "分岐レポートをレビュー。必要に応じて再実行。" },
      { cmd: "/reap.merge.mate", desc: "人間とインタラクティブにgenome競合を解決。" },
      { cmd: "/reap.merge.merge", desc: "git merge --no-commitを実行し、ソース競合を解決。" },
      { cmd: "/reap.merge.reconcile", desc: "genome-ソースの整合性を検証。AIがgenomeとソースを比較、ユーザーが不整合を確認。" },
      { cmd: "/reap.merge.validation", desc: "機械的テスト（bun test、tsc、build）を実行。失敗時にリグレッション。" },
      { cmd: "/reap.merge.completion", desc: "merge generationをコミットしアーカイブ。" },
      { cmd: "/reap.merge.evolve", desc: "現在のステージからcompletionまでmergeライフサイクルを実行。" },
    ],
    mergeHooks: "Merge Hooks",
    mergeHookHeaders: ["イベント", "発火タイミング"],
    mergeHookItems: [
      ["onMergeStarted", "/reap.merge.startがmerge generationを作成した後"],
      ["onMergeDetected", "detectステージ完了後"],
      ["onMergeMated", "mateステージ完了後（genomeが解決）"],
      ["onMergeMerged", "mergeステージ完了後（ソースがmerge済み）"],
      ["onMergeReconciled", "reconcileステージ完了後（genome-ソースの整合性が検証済み）"],
      ["onMergeValidated", "merge validation完了後"],
      ["onMergeCompleted", "merge completion + アーカイブ後"],
      ["onMergeTransited", "任意のmergeステージ遷移後（汎用）"],
    ],
    mergeHookNote: "onMergeTransitedは通常ライフサイクルのonLifeTransitedと同様に、すべてのmergeステージ遷移時に発火します。",
  },

  // Comparison Page
  comparison: {
    title: "比較",
    breadcrumb: "はじめに",
    heading: "Spec Kitとの比較",
    desc: "Spec Kitはスペック駆動開発 — コードの前に仕様を書くこと — の先駆者です。REAPはこのコンセプトをベースに、主要な制限事項に対処しています：",
    items: [
      { title: "静的スペック vs 生きたGenome", desc: "従来のツールはスペックを静的なドキュメントとして扱います。REAPのGenomeは生きたシステムです — 実装中に見つかった欠陥はbacklogを通じてフィードバックされ、Completionで適用されます。設計はコードとともに進化します。" },
      { title: "セッション間メモリなし", desc: "ほとんどのAI開発ツールはセッション間でコンテキストを失います。REAPのCLAUDE.md + 3層Memoryシステムが、毎セッションでプロジェクトのフルコンテキスト（genome、environment、vision、memory）を自動復元します。" },
      { title: "リニアワークフロー vs マイクロループ", desc: "従来のツールはリニアなフロー（スペック → 計画 → 構築）に従います。REAPは構造化されたリグレッションをサポートします — どのステージでもアーティファクトを保持しながら前のステージにループバックできます。" },
      { title: "独立したタスク vs 世代進化", desc: "従来のツールの各タスクは独立しています。REAPでは世代が相互に積み重なります。知識はLineageアーカイブとGenomeの進化を通じて蓄積されます。" },
      { title: "ライフサイクルhookなし", desc: "REAPはライフサイクルの各ポイントで自動化するための16のステージレベルhook（onLifeStartedからonMergeCompletedまで）を提供します。" },
    ],
  },

  // Genome Page
  genomePage: {
    title: "Genome",
    breadcrumb: "ガイド",
    intro: "Genomeはreapの権威ある知識ソースです — アーキテクチャ原則、開発コンベンション、技術的制約、ドメインルール。プロジェクトのDNAです。",
    structureTitle: "構造",
    structure: `.reap/genome/
├── application.md     # プロジェクトアイデンティティ、アーキテクチャ、コンベンション
├── evolution.md       # AI行動ガイド、進化の方向性
└── invariants.md      # 絶対的な制約（人間のみ編集可能）`,
    principlesTitle: "3つのファイル",
    principles: [
      "application.md — プロジェクトアイデンティティ、アーキテクチャ決定、開発コンベンション、制約。",
      "evolution.md — AI行動ガイド、インタラクション原則、コード品質ルール、ソフトライフサイクルルール。",
      "invariants.md — 決して違反できない絶対的な制約。人間のみがこのファイルを変更できます。",
    ],
    immutabilityTitle: "Genomeの不変性",
    immutabilityDesc: "Genomeは通常のGeneration中には変更されません。Implementation中に発見された問題はgenome-changeバックログアイテムとして記録され、Completionのadaptフェーズでのみ適用されます。",
    immutabilityWhy: "例外：Embryo generation（初期段階のプロジェクト）では、どのステージでもgenomeの自由な変更が許可されます。プロジェクトが成熟すると、AIはadaptフェーズでembryoからnormalへの移行を提案し、人間が承認します。",
    contextTitle: "常にロード済み",
    contextDesc: "3つのgenomeファイルすべてが、CLAUDE.mdを通じてセッション開始時にAIエージェントのコンテキストに完全にロードされます。エージェントはプロジェクトのアーキテクチャ、コンベンション、制約に常にアクセスできます — 手動でのブリーフィングは不要です。",
    evolutionTitle: "世代を通じた進化",
    evolutionDesc: "各世代の終わり（Completionのadaptフェーズ）で、genome-changeバックログアイテムがレビューされGenomeに適用されます。これにより、Genomeがその世代で実際に起こったことに基づいて意図的に進化することが保証されます。",
    syncTitle: "ナレッジ管理",
    syncDesc: "/reap.knowledgeを使用してGenomeとEnvironmentをレビュー・管理します。コマンドはコンテキストのリロード、genomeファイルの検査、environmentデータの管理オプションを提供します。",
  },

  // Environment Page
  environmentPage: {
    title: "Environment",
    breadcrumb: "ガイド",
    intro: "Environmentはプロジェクトの記述的知識です — 現在何が存在するかを示します。技術スタック、ソース構造、ビルド設定、ドメイン知識、コード依存関係をキャプチャします。Genome（規範的 — どう構築するか）とは異なり、Environmentは現在の状態を記述します。",
    structureTitle: "2層構造",
    structure: `.reap/environment/
├── summary.md      # 常にロード（~100行） — 技術スタック、ソース構造、ビルド、テスト
├── domain/         # ドメイン知識（オンデマンド）
├── resources/      # 外部参照ドキュメント — APIドキュメント、SDK仕様（オンデマンド）
├── docs/           # プロジェクト参照ドキュメント — 設計書、仕様（オンデマンド）
└── source-map.md   # コード構造 + 依存関係（オンデマンド）`,
    layersTitle: "層",
    layerHeaders: ["層", "読み込み", "内容", "制限"],
    layerItems: [
      ["summary.md", "セッション開始時に常にロード", "技術スタック、ソース構造、ビルド設定、テストセットアップ。AIの基本的な理解。", "~100行"],
      ["domain/", "オンデマンド（必要時にロード）", "ドメイン知識 — ビジネスルール、API仕様、インフラの詳細。", "制限なし"],
      ["resources/", "オンデマンド（必要時にロード）", "外部参照ドキュメント — APIドキュメント、SDK仕様、サードパーティドキュメント。", "制限なし"],
      ["docs/", "オンデマンド（必要時にロード）", "プロジェクト参照ドキュメント — 設計書、仕様、アーキテクチャ決定。", "制限なし"],
      ["source-map.md", "オンデマンド（必要時にロード）", "現在のコード構造と依存関係マップ。", "制限なし"],
    ],
    immutabilityTitle: "Environmentの不変性",
    immutabilityDesc: "Genomeと同様に、EnvironmentもGeneration中に直接変更されません。変更はenvironment-changeバックログアイテムとして記録され、Completionのreflectフェーズで適用されます。",
    immutabilityWhy: "変更をGeneration中にEnvironmentを書き直すのではなくbacklogに記録することで、Generationは安定したマップ上で完了します。更新は、構築されたものの完全なコンテキストを持つreflectフェーズで一度だけ意図的に行われます。",
    flowTitle: "読み込み戦略",
    flowDesc: "summary.mdはセッション開始時に常にロードされます。domain/やsource-map.mdは、AIが特定のタスクでより深いコンテキストを必要とする場合にオンデマンドでロードされます。",
    syncTitle: "ナレッジ管理",
    syncDesc: "/reap.knowledgeを使用してEnvironmentをレビュー・管理します。Completionのreflectフェーズで、AIはGeneration中に行われた変更を反映するようenvironmentを自動更新します。",
    syncSources: [
      { label: "summary.md", role: "常にロード", desc: "プロジェクトの技術的状態のコンパクトな概要。毎セッションにロードされ、AIが基本的なコンテキストを持ちます。" },
      { label: "domain/ + resources/ + docs/ + source-map.md", role: "オンデマンド", desc: "AIが現在のタスクに特定のドメイン、外部参照、または構造コンテキストを必要とする場合にロードされる詳細な知識。" },
    ],
    syncContrast: "2層戦略はコンテキストウィンドウの効率性（summary.mdは小さい）と深度（domain/やsource-map.mdは必要時に利用可能）のバランスを取ります。",
  },

  // Lifecycle Page (renamed from Workflow)
  lifecyclePage: {
    title: "Life Cycle",
    breadcrumb: "ガイド",
    intro: "ライフサイクルはREAPの心臓部です — 各世代は5つのステージ（Learning → Planning → Implementation → Validation → Completion）を流れ、各ステップでアーティファクトを生成します。Completionには4つのフェーズがあります：reflect → fitness → adapt → commit。",
    structureTitle: "アーティファクト構造",
    structure: `.reap/life/
├── current.yml          # 現在のGeneration状態（id、goal、stage、timeline）
├── 01-learning.md       # コンテキスト探索、genome/environmentレビュー
├── 02-planning.md       # タスク分解、依存関係
├── 03-implementation.md # 実装ログ、変更内容
├── 04-validation.md     # テスト結果、完了基準チェック
├── 05-completion.md     # reflect + fitness + adapt + commit
└── backlog/             # 次世代へのアイテム
    ├── fix-auth-bug.md  #   type: task
    └── add-index.md     #   type: genome-change`,
    structureDesc: "各ステージは.reap/life/にアーティファクトを生成します。Generationが完了すると、すべてのアーティファクトが.reap/lineage/gen-XXX-hash-slug/にアーカイブされ、current.ymlは次のGenerationのためにクリアされます。",
  },

  // Lineage Page
  lineagePage: {
    title: "Lineage",
    breadcrumb: "ガイド",
    intro: "Lineageは完了したGenerationのアーカイブです。ライフサイクルを完了したすべてのGenerationが、完全なアーティファクトとDAGメタデータとともに保存されます。",
    structureTitle: "構造",
    structureDesc: "完了した各Generationがアーティファクトとメタデータを含むディレクトリを作成します：",
    structure: `.reap/lineage/
├── gen-042-a3f8c2-fix-login-bug/   # 完全なGeneration（ディレクトリ）
│   ├── meta.yml                      # DAGメタデータ（id、parents、genomeHash）
│   ├── 01-learning.md
│   ├── 02-planning.md
│   ├── 03-implementation.md
│   ├── 04-validation.md
│   └── 05-completion.md
├── gen-030-b7e1f2.md                 # Level 1圧縮（単一ファイル）
└── epoch.md                          # Level 2圧縮（ハッシュチェーン）`,
    dagTitle: "DAG（有向非巡回グラフ）",
    dagDesc: "各Generationはmeta.ymlに親を記録し、DAGを形成します。これにより、複数のマシンが独立して作業し、後からmergeする分散ワークフローが可能になります。",
    compressionTitle: "圧縮",
    compressionDesc: "Completionステージ中にlineageサイズを管理するため、圧縮が自動実行されます。",
    compressionHeaders: ["レベル", "入力", "出力", "トリガー", "保護"],
    compressionItems: [
      ["Level 1", "Generationフォルダー", "gen-XXX-{hash}.md（40行）", "> 5,000行 + 5世代以上", "直近3件 + DAGリーフノード"],
      ["Level 2", "100件以上のLevel 1ファイル", "単一のepoch.md", "Level 1ファイル > 100件", "直近9件 + フォークポイント"],
    ],
    compressionSafety: "DAGの保存：Level 1はフロントマターにメタデータを保持します。Level 2のepoch.mdはgenerationハッシュチェーンを保存します。フォークガード：Level 2圧縮前にすべてのローカル/リモートブランチがスキャンされ、フォークポイントが保護されます。epoch圧縮されたGenerationはmergeベースとして使用できません。",
  },

  // Backlog Page
  backlogPage: {
    title: "Backlog",
    breadcrumb: "ガイド",
    intro: "Backlogは世代間でアイテムを引き継ぎます — 遅延タスク、genome変更、environment変更。.reap/life/backlog/に存在します。",
    typesTitle: "アイテムタイプ",
    typeHeaders: ["タイプ", "説明", "適用タイミング"],
    typeItems: [
      ["task", "遅延作業、技術的負債、機能アイデア", "次世代の目標候補として参照"],
      ["genome-change", "Generation中に発見されたGenome変更", "Completionのadaptフェーズで Genomeに適用"],
      ["environment-change", "Generation中に発見された外部environment変更", "Completionのreflectフェーズで Environmentに適用"],
    ],
    statusTitle: "ステータス",
    statusHeaders: ["ステータス", "意味"],
    statusItems: [
      ["pending", "未処理（デフォルト）"],
      ["consumed", "Generationで処理済み（consumedBy: gen-XXX-{hash}が必要）"],
    ],
    archivingTitle: "アーカイブルール",
    archivingDesc: "アーカイブ時に、consumedアイテムはlineageに移動します。pendingアイテムは次世代のbacklogに引き継がれます。",
    deferralTitle: "タスクの遅延",
    deferralDesc: "部分的な完了は正常です — Genome変更に依存するタスクは[deferred]とマークされ、次世代に引き渡されます。",
    abortTitle: "Abort Backlog",
    abortDesc: "/reap.abortでGenerationが中止された場合、目標と進捗をabortメタデータ（abortedFrom、abortReason、stage、sourceAction、changedFiles）付きでbacklogに保存できます。これにより後で再開するためのコンテキストが保持されます。",
    formatTitle: "ファイルフォーマット",
    format: `---
type: task
status: pending
priority: medium
---

# タスクタイトル

タスクの説明。`,
  },

  // Self-Evolving Page
  selfEvolvingPage: {
    title: "自己進化機能",
    breadcrumb: "ガイド",
    intro: "REAP は静的なフレームワークではありません。AI がビジョンとメモリから自動的に目標を選択し、人間が自然言語フィードバックで適応度を判断し、パイプラインがコンテキストの明確さに基づいてコミュニケーションスタイルを調整します。これらの機能が連携して、プロジェクトとともに真に進化する開発パイプラインを作り出します。",
    gapDrivenTitle: "ギャップ駆動の目標選択",
    gapDrivenDesc: "各 Generation の終了時（adapt フェーズ）、AI はプロジェクトのビジョンと現在の状態とのギャップを分析して次の目標を提案します。これが REAP を自己進化させる中核メカニズムです。",
    gapDrivenSteps: [
      "vision/goals.md から未完了の目標を読み取る",
      "優先度向上のために保留中のバックログ項目とクロスリファレンス",
      "インパクトでランク付け — 関連するバックログタスクがある目標がより高いスコア",
      "人間の承認のためにトップ候補を提案",
    ],
    gapDrivenNote: "クルーズモードでは、人間の介入なしに Generation 間で目標選択が自動的に行われます。",
    fitnessTitle: "人間が適応度を判断",
    fitnessDesc: "定量的な指標はありません。適応度フェーズでの人間の自然言語フィードバックが唯一の適応度シグナルです。AI は自身の成功をスコア化することを明示的に禁じられており、自己評価（メタ認知）のみが許可されています。",
    fitnessNote: "これにより、プロジェクトは AI が最適化できる方向ではなく、人間が価値を置く方向に進化します。",
    clarityTitle: "明確度駆動のインタラクション",
    clarityDesc: "AI は現在のコンテキストがどの程度定義されているかを動的に評価し、それに応じてコミュニケーションの深さを調整します。明確度は各 Generation の開始時、学習ステージで評価されます。",
    clarityHeaders: ["明確度", "シグナル", "AI の行動"],
    clarityRows: [
      ["High", "明確な目標、定義されたタスク、確立されたパターン", "最小限の質問で実行。結果を報告。"],
      ["Medium", "方向は存在するが、詳細が不明確", "トレードオフのある 2-3 の選択肢を提示。人間に選択させる。"],
      ["Low", "曖昧な目標、矛盾する制約", "例を用いた積極的な対話で共有理解を構築。"],
    ],
    cruiseTitle: "クルーズモード",
    cruiseDesc: "N 個の Generation を自律実行として事前承認します。AI がビジョンギャップとバックログタスクから目標を選択し、完全なライフサイクルを実行し、各 Generation を自己評価（自己スコア化ではない）します。",
    cruiseActivation: "アクティベーション：",
    cruiseActivationDesc: "config.yml に cruiseCount: 1/5 を設定します。カウンターは各 Generation 完了後にインクリメントされます。",
    cruiseGoalSelection: "目標選択：",
    cruiseGoalSelectionDesc: "adapt 中に AI が vision/goals.md と現在の状態のギャップを分析し、最も価値の高い次の目標を選択します。",
    cruiseFitness: "適応度：",
    cruiseFitnessDesc: "クルーズモードでは、適応度フェーズは人間のフィードバックを待つ代わりに自己評価（メタ認知）を使用します。AI は自身の成功をスコア化することを明示的に禁じられています。",
    cruisePause: "一時停止条件：",
    cruisePauseDesc: "クルーズは次の場合に自動的に一時停止し、人間の入力を要求します：(1) 不確実性が AI の信頼度閾値を超えた場合、(2) 人間の判断が必要な決定の場合（例：互換性を破る API 変更）、(3) バックログに矛盾する優先度がある場合。すべての N 個の Generation が完了した後、人間がバッチレビューを行います。",
    memoryTitle: "メモリシステム",
    memoryDesc: "メモリは AI がセッションと Generation にわたってコンテキストを永続化する自由形式の記録システムです。Genome（変更制限あり）や Lineage（時間とともに圧縮される）とは異なり、メモリは常にアクセス可能で自由に書き込めます。",
    memoryHeaders: ["階層", "寿命", "内容", "更新トリガー"],
    memoryRows: [
      ["longterm", "プロジェクト全期間", "繰り返しパターン、アーキテクチャ選択の理由、設計の教訓", "教訓が発生した時"],
      ["midterm", "複数 Generation", "進行中のタスクフロー、複数 Generation 計画、合意された方向", "コンテキストが変化した時"],
      ["shortterm", "1-2 セッション", "セッション引き継ぎ、未完了の議論、バックログスナップショット", "毎 Generation（必須）"],
    ],
    memoryRulesTitle: "ルール：",
    memoryRules: [
      "いつでも読み書き可能 — フェーズ制限なし、許可不要",
      "内容とタイミングは AI の判断。必須フォーマットなし",
      "予想される寿命に合った階層にコンテンツを配置。関連性の変化に応じて昇格/降格",
      "スキャンしやすく保つ — 段落より箇条書き。空ファイルは有効な状態",
      "メモリはプロジェクトとともに git コミットされ、任意の AI エージェントがアクセス可能",
    ],
    visionEvolutionTitle: "ビジョン＆ギャップ駆動の進化",
    visionEvolutionDesc: "ビジョンは各 Generation の主要な推進力です。.reap/vision/goals.md ファイルがプロジェクトの北極星目標を定義します。adapt フェーズで AI はギャップ分析を実行します：ビジョン目標をコードベースの現在の状態と比較します。",
    visionSteps: [
      { title: "1. 目標定義", desc: "人間が goals.md に高レベルの目標を記述します。各目標は Markdown チェックボックス項目です。サブ目標のためにネストできます。" },
      { title: "2. ギャップ分析（adapt フェーズ）", desc: "AI が未完了の目標を現在のコードベース、環境、Generation 履歴と比較します。最も価値の高いギャップを特定し、次の Generation の目標として提案します。" },
      { title: "3. 自動チェックマーク", desc: "Generation がビジョン目標を達成すると、AI は adapt フェーズで goals.md の対応するチェックボックスをマークします。これによりプロジェクトの進捗を永続的に確認できます。" },
      { title: "4. 継続的サイクル", desc: "ビジョンも進化します。人間がプロジェクトの方向が変わると目標を更新します。AI は完了した目標と残りの目標の両方を参照して軌道を維持します。" },
    ],
  },

  // Vision Page
  visionPage: {
    title: "ビジョン",
    breadcrumb: "ガイド",
    intro: "ビジョンは方向を導くレイヤーです。人間がプロジェクトの行き先を定義し — 目標、マイルストーン、優先順位を設定します。AI は adapt フェーズでビジョンを参照してギャップを分析し次の目標を提案しますが、ビジョンは人間が所有します。",
    structureTitle: "構造",
    goalsTitle: "目標",
    goalsDesc: "goals.md にはプロジェクトの長期目標がチェックリストとして含まれています。adapt フェーズで AI がビジョンと現在の状態のギャップを分析し、次の Generation の目標を提案します。完了した目標は自動的にチェックされます。",
    memoryTitle: "メモリ",
    memoryDesc: "メモリは AI がセッションと Generation にわたってコンテキストを永続化する自由形式の記録システムです。genome（変更制限あり）や lineage（圧縮される）とは異なり、メモリは常にアクセス可能で自由に書き込めます。",
    memoryHeaders: ["階層", "寿命", "目的"],
    memoryRows: [
      ["Shortterm", "1-2 セッション", "Generation 要約、次セッション引き継ぎ、未決事項"],
      ["Midterm", "複数 Generation", "大規模タスクフロー、複数 Generation 計画、合意された方向"],
      ["Longterm", "プロジェクト全期間", "設計の教訓、アーキテクチャ決定の根拠、移行の教訓"],
    ],
    whenToUpdateTitle: "更新タイミング",
    whenToUpdateItems: [
      { label: "Reflect フェーズ", desc: "メモリを更新する自然なタイミング（shortterm は毎 Generation 必須）" },
      { label: "いつでも", desc: "有用なコンテキストが発生したら、どのステージでもメモリを更新可能" },
      { label: "Shortterm クリーンアップ", desc: "処理済みの項目を削除" },
    ],
    whatNotTitle: "メモリに書くべきでないもの",
    whatNotItems: [
      "コード変更の詳細 — environment に属する",
      "テスト数やビルド状態 — artifact に属する",
      "既に genome にある原則 — 重複禁止",
    ],
    gapDrivenTitle: "ギャップ駆動の進化",
    gapDrivenDesc: "Completion の adapt フェーズで AI は：",
    gapDrivenSteps: [
      "goals.md を読み、バックログをスキャン",
      "未完了の目標と保留中のタスクを特定",
      "現在のプロジェクト状態とクロスリファレンス",
      "最もインパクトのあるギャップに基づいて次の Generation の目標を提案",
    ],
  },

  // Migration Guide Page
  migrationGuidePage: {
    title: "マイグレーションガイド (v0.15 → v0.16)",
    breadcrumb: "その他",
    intro: "REAP v0.16 は自己進化パイプラインアーキテクチャに基づく完全な書き直しです。ライフサイクル、genome 構造、設定、ビジョンシステムがすべて再設計されました。ガイド付きマイグレーションツールが自動的に移行を処理します。",
    whyMigrateTitle: "なぜマイグレーションが必要？",
    whyMigrateItems: [
      "ライフサイクルの再設計：learning が最初のステージとして objective を置換",
      "Genome が 3 つの焦点ファイルに再構成（application.md、evolution.md、invariants.md）",
      "Generation 間のコンテキスト永続化のための 3 層メモリを持つビジョンレイヤー",
      "Genome ファーストの調整を持つ Merge ライフサイクル",
      "ファイルベースの Hook がインライン Hook 設定を置換",
    ],
    stepsTitle: "マイグレーション手順",
    step1: "v0.16 をグローバルにインストールします。v0.16 スキルが自動デプロイされ、レガシー v0.15 プロジェクトレベルスキルが削除されます。",
    step2: "プロジェクトで Claude Code を開き、マイグレーションコマンドを実行します。",
    step3: "5 フェーズのガイド付きマイグレーションに従います：",
    step3Headers: ["フェーズ", "実行内容", "あなたの役割"],
    step3Rows: [
      ["confirm", "変更内容を表示し、.reap/v15/ にバックアップを作成", "確認"],
      ["execute", "ディレクトリ再構成、config/hooks/lineage/backlog のマイグレーション", "自動"],
      ["genome-convert", "AI が v0.15 ファイルから新しい 3 ファイル構造に genome を再構築", "AI の作業を確認"],
      ["vision", "vision/goals.md とメモリ階層ファイルのセットアップ", "プロジェクトの方向を提供"],
      ["complete", "マイグレーション結果のサマリー", "検証"],
    ],
    step4: "マイグレーションが成功したか確認します。",
    whatChangesTitle: "変更点",
    whatChangesHeaders: ["領域", "v0.15", "v0.16"],
    whatChangesRows: [
      ["Lifecycle", "objective → planning → impl → validation → completion（5 フェーズ）", "learning → planning → impl → validation → completion（4 フェーズ）"],
      ["Genome", "複数ファイル、フラット構造", "3 ファイル：application.md + evolution.md + invariants.md"],
      ["Config", "JSON ベースの設定", "YAML ベースの config.yml（cruiseCount、strictEdit、strictMerge、autoSubagent）"],
      ["Vision", "ビジョンシステムなし", "vision/goals.md + 3 層メモリ"],
      ["Hooks", "インライン設定", "ファイルベース：.reap/hooks/{event}.{name}.{md|sh}"],
      ["Environment", "単一の知識ファイル", "2 層：summary.md（常時ロード）+ domain/（オンデマンド）"],
    ],
    interruptedTitle: "中断されたマイグレーション",
    interruptedDesc: "マイグレーションが中断された場合（API エラー、セッション切断など）、進行状況は .reap/migration-state.yml に保存されます。このファイルは完了したフェーズを追跡します。",
    interruptedResume: "再開するには：",
    interruptedResumeDesc: "/reap.update を再度実行してください。完了したフェーズをスキップし、中断した箇所から続行します。",
    interruptedRestart: "最初からやり直すには：",
    interruptedRestartDesc: ".reap/migration-state.yml を削除し、/reap.update を再度実行してください。",
    backupTitle: "バックアップ",
    backupDesc: "すべての v0.15 ファイルは confirm フェーズで .reap/v15/ に保存されます。これはマイグレーション前の状態の完全なスナップショットです。",
    backupItems: [
      "バックアップは破壊的な変更が行われる前に作成されます",
      "マイグレーションの動作確認後（/reap.status、/reap.evolve）、.reap/v15/ を安全に削除できます",
      "すべてが正常に動作することを確認するため、少なくとも 1 つの完全な Generation の間バックアップを保持してください",
    ],
    deprecatedTitle: "非推奨コマンド",
    deprecatedDesc: "いくつかの v0.15 スラッシュコマンドが v0.16 で名前変更または統合されました。",
    deprecatedHeaders: ["v0.15 コマンド", "v0.16 代替", "備考"],
    deprecatedRows: [
      ["/reap.sync", "/reap.knowledge", "genome、environment、コンテキスト知識の管理"],
      ["/reap.refreshKnowledge", "/reap.knowledge reload", "ディスクからすべての知識を再読み込み"],
      ["/reap.objective", "/reap.run", "ステージごとのコマンドが reap run <stage> に置換"],
      ["/reap.complete", "/reap.run", "ステージごとのコマンドが reap run <stage> に置換"],
    ],
    deprecatedNote: "レガシー v0.15 プロジェクトレベルスキルファイルは npm install 時に自動的に削除されます。.claude/commands/ に残っている場合は安全に削除できます。",
  },

  // Release Notes Page
  releaseNotes: {
    title: "リリースノート",
    breadcrumb: "その他",
    breakingBannerTitle: "v0.16の破壊的変更",
    breakingBannerDesc: "v0.15.xからv0.16.xへの自動更新はブロックされています。手動でアップグレードするには/reap.updateを実行してください。",
    breakingBannerItems: [
      "REAPは自己進化パイプラインに移行 — AIが人間と協力して再帰的パイプラインを通じてソフトウェアを自己進化させます。",
      "ライフサイクルの変更：learning → planning → implementation → validation → completion（新しいLearningステージの追加、ObjectiveとPlanningの統合）。",
      "最適なスキルマッチングのためにスラッシュコマンドを再構成：10の自動マッチングスキル + 6の直接呼び出し専用スキル。",
      "CLIコマンドをユーザー向けインターフェースから削除。すべての操作はスラッシュコマンドのみに（CLIコマンドは内部使用に限定）。",
    ],
    versions: [
      {
        version: "0.16.4",
        notes: "欠落していたnpmメタデータを復元（license、author、repository、homepage、keywords）。GitHub Releaseにリリースノートが表示されない問題を修正。",
      },
      {
        version: "0.16.3",
        notes: "vision/docsをvision/designにリネーム — ルートdocs/との混同を防止。VisionにDesignセクション追加（Memoryと区別される独立した設計文書スペース）。Evaluator Agent設計ドキュメント追加。npm互換のためREADME言語リンク修正。",
      },
      {
        version: "0.16.2",
        notes: "'reap make hook' CLIコマンド追加 — 正しいファイル名規則とfrontmatterでhookファイルを生成。デフォルトhook conditions（always、has-code-changes、version-bumped）と例テンプレートの復元。'reap init'時に自動インストール。'reap make'コマンドを拡張可能なディレクトリ構造にリファクタリング。docsから古いPresetsとSession Context Loadingセクションを削除。",
      },
      {
        version: "0.16.1",
        notes: "npm READMEの画像が表示されない問題を修正。docsサイトのSPAルーティングを復元（404.html fallback）。READMEのドキュメントリンク修正（merge-lifecycle、agent-integration）。不足していたdocsリンクマッピングを追加。READMEおよびworkflow変更に対するdocs workflowトリガーパスを追加。",
      },
      {
        version: "0.16.0",
        notes: "自己進化パイプラインとしての完全書き直し。新しいgenome構造（application.md、evolution.md、invariants.md）。Learningステージの追加。明確性駆動インタラクション。自律的マルチ世代実行のためのCruiseモード。3層memory（longterm/midterm/shortterm）を持つVision層。genome-ソース整合性のためのReconcileステージをMergeライフサイクルに追加。/reap.knowledgeが/reap.syncを置換。2フェーズの/reap.abort。条件と実行順序を持つファイルベースhooks。",
      },
      {
        version: "0.15.13",
        notes: "commander.jsを組み込みCLIライブラリに置換。ランタイム依存関係：2 → 1。",
      },
      {
        version: "0.15.12",
        notes: "reap update自動アップグレード後にリリース通知が正しく表示されるように修正。",
      },
      {
        version: "0.15.11",
        notes: "reap pullがahead-onlyブランチに対してmergeを誤って推奨する問題を修正。git rev-listを使用して正確なahead/behind/diverged検出を実装。",
      },
      {
        version: "0.15.10",
        notes: "リリース通知の言語マッチングを修正（例：\"korean\" → \"ko\"）。",
      },
      {
        version: "0.15.9",
        notes: "reap update後にリリース通知が表示されない問題を修正。パス解決をrequire.resolveに変更（__dirnameの代わり）。",
      },
      {
        version: "0.15.8",
        notes: "config.ymlからversionフィールドを削除。reap update後にコミットされていない変更がなくなりました。",
      },
      {
        version: "0.15.7",
        notes: "UPDATE_NOTICE.mdをRELEASE_NOTICE.mdに名称変更。通知コンテンツをインライン化（GitHub Discussions依存を排除）。",
      },
      {
        version: "0.15.6",
        notes: "UPDATE_NOTICE.mdがnpmパッケージに含まれない問題を修正。",
      },
      {
        version: "0.15.5",
        notes: "整合性チェックがsource-map.mdの行数で警告しないように修正。",
      },
      {
        version: "0.15.4",
        notes: "バグ修正と新しいreap make backlogコマンド。lineageアーカイブ、reap backのnonceチェーン修正、直近20世代の圧縮保護を追加。",
      },
    ],
  },
};

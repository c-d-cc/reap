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
      introduction: "紹介",
      quickStart: "クイックスタート",
      coreConcepts: "コアコンセプト",
      workflow: "ワークフロー",
      advanced: "上級",
      collaborationOverview: "分散ワークフロー",
      mergeGeneration: "マージGeneration",
      mergeCommands: "マージコマンド",
      cliReference: "CLIリファレンス",
      commandReference: "コマンドリファレンス",
      hookReference: "Hookリファレンス",
      comparison: "比較",
      configuration: "設定",
    },
  },

  // Hero Page
  hero: {
    tagline: "Recursive Evolutionary Autonomous Pipeline",
    title: "REAP",
    description: "AIと人間が協力してGenerationを繰り返しながらアプリケーションを進化させる開発パイプライン。セッション間のコンテキストを維持し、構造化されたライフサイクルで開発を行い、設計ドキュメントがコードとともに進化します。",
    getStarted: "はじめる →",
    whyReap: "なぜREAPか？",
    whyReapDesc: "AIエージェントは強力ですが、構造がなければ開発は混乱します。セッションごとにコンテキストがリセットされ、コード変更が目的なく散在し、設計ドキュメントは現実と乖離し、過去の教訓は失われます。",
    problems: [
      { problem: "コンテキストの喪失", solution: "SessionStart Hookが毎セッションでプロジェクト全体のコンテキストを自動注入" },
      { problem: "散発的な開発", solution: "各Generationが構造化されたライフサイクルを通じて一つの目標に集中" },
      { problem: "設計とコードの乖離", solution: "実装中に発見されたGenome変異がbacklogを通じてフィードバック" },
      { problem: "忘れられた教訓", solution: "レトロスペクティブがGenomeに蓄積。Lineageが全Generationを保管" },
      { problem: "コラボレーションの混乱", solution: "Genomeファーストのマージワークフローが並行ブランチを調整 — コード衝突の前に設計衝突を解決" },
    ],
    threeLayer: "3-Layerモデル",
    threeLayerDesc: "すべてのREAPプロジェクトは3つの概念的レイヤーで構成されます。Genomeは何を作るかを定義し、Evolutionプロセスがそれを構築し、Civilizationがその成果物です。",
    layers: [
      { label: "Genome", sub: "設計 & ナレッジ", path: ".reap/genome/", desc: "アーキテクチャ原則、ビジネスルール、コンベンション、技術制約、ソースマップ（C4ダイアグラム）。Generation進行中は変更しない。" },
      { label: "Evolution", sub: "世代プロセス", path: ".reap/life/ → .reap/lineage/", desc: "各GenerationはObjective → Planning → Implementation → Validation → Completionを実行。完了時にlineageへ保管。" },
      { label: "Civilization", sub: "ソースコード", path: "your codebase/", desc: ".reap/以外のすべて。各Generationの完了とともに成長し改善される。" },
    ],
    lifecycle: "Generationライフサイクル",
    lifecycleDesc: "各Generationは目標定義からレトロスペクティブ・保管まで5つのステージを経ます。",
    stages: [
      ["Objective", "構造化ブレインストーミングによる目標・設計定義", "01-objective.md"],
      ["Planning", "タスク分解、アプローチ選択、依存関係マッピング", "02-planning.md"],
      ["Implementation", "AI + 人間の協力で実装", "03-implementation.md"],
      ["Validation", "テスト実行、完了基準の検証", "04-validation.md"],
      ["Completion", "レトロスペクティブ + Genome変更適用 + Generation保管", "05-completion.md"],
    ],
    stageHeaders: ["ステージ", "内容", "成果物"],
    installation: "インストール",
    installStep1: "1. グローバルインストール",
    installStep2: "2. プロジェクトの初期化",
    installStep3: "3. 最初のGenerationを実行（Claude Codeで）",
    installNote: [
      { before: "", code: "/reap.evolve", after: "はGenerationライフサイクル全体（ObjectiveからCompletionまで）を対話的に実行します。" },
      { linkText: "ステージコマンド", after: "で各ステージを手動制御することもできます。" },
    ],
    keyConcepts: "主要コンセプト",
    concepts: [
      { label: "Genome Immutability", desc: "Generation進行中はGenomeを変更しません。Implementation中に発見された設計問題はbacklogにgenome-change項目として記録され、Completionでのみ適用されます。" },
      { label: "Backlog & Deferral", desc: ".reap/life/backlog/の項目はtype: genome-change | environment-change | taskを持ちます。部分完了は正常であり、未完了タスクは次のGenerationのObjectiveに引き継がれます。" },
      { label: "SessionStart Hook", desc: "新しいAIエージェントセッションごとに自動的にGenome全体、現在のGeneration状態、ワークフロールールを注入し、セッション間のコンテキスト喪失を排除します。" },
      { label: "Lineage", desc: "完了したGenerationは.reap/lineage/に保管されます。レトロスペクティブがそこに蓄積されます。時間とともに圧縮されます（Level 1 → gen-XXX-{hash}.md、Level 2 → epoch-XXX.md）。" },
      { label: "Four-Axis Structure", desc: ".reap/配下のすべてが4つの軸にマッピングされます：Genome（設計）、Environment（外部コンテキスト）、Life（現在のGeneration）、Lineage（過去のGeneration保管）。" },
      { label: "Distributed Workflow", desc: "複数の開発者やエージェントが別々のブランチで並行して作業します。/reap.pullはリモートを取得してGenomeファーストのマージGenerationを実行します。/reap.pushはプッシュ前に状態を検証します。サーバー不要 — Gitがトランスポート層です。" },
    ],
    documentation: "ドキュメント",
    docLinks: [
      { href: "/docs/introduction", title: "紹介", desc: "REAPとは、なぜ使うのか、3-Layerモデル、Four-Axis構造。" },
      { href: "/docs/quick-start", title: "クイックスタート", desc: "インストールして最初のGenerationをステップバイステップで実行。" },
      { href: "/docs/core-concepts", title: "コアコンセプト", desc: "Genome、ライフサイクル、Backlog & Deferralの詳細。" },
      { href: "/docs/workflow", title: "ワークフロー", desc: "/reap.evolve、ステージコマンド、micro loop、hooks。" },
      { href: "/docs/cli-reference", title: "CLIリファレンス", desc: "reap init、status、update、fixの全オプション。" },
      { href: "/docs/command-reference", title: "コマンドリファレンス", desc: "/reap.evolve、ステージコマンド、/reap.status — 全スラッシュコマンド。" },
      { href: "/docs/hook-reference", title: "Hookリファレンス", desc: "ライフサイクルhooks：commandとpromptタイプ、events、SessionStart。" },
      { href: "/docs/comparison", title: "比較", desc: "REAPと既存のスペック駆動開発ツールとの比較。" },
      { href: "/docs/advanced", title: "上級", desc: "Lineage圧縮、プリセット、entryモード。" },
    ],
  },

  // Introduction Page
  intro: {
    title: "紹介",
    breadcrumb: "はじめに",
    description: "REAP（Recursive Evolutionary Autonomous Pipeline）は、AIと人間が協力して連続するGenerationを通じてアプリケーションを段階的に進化させる開発パイプラインです。各AIセッションを独立したタスクとして扱うのではなく、REAPは構造化されたライフサイクルとGenomeと呼ばれる生きたナレッジベースを通じて継続性を維持します。",
    threeLayer: "3-Layerモデル",
    layerItems: [
      { label: "Genome", sub: "設計 & ナレッジ", path: ".reap/genome/" },
      { label: "Evolution", sub: "世代プロセス", path: ".reap/life/ → .reap/lineage/" },
      { label: "Civilization", sub: "ソースコード", path: "your codebase/" },
    ],
    layerDescs: [
      "アプリケーション構築のための設計とナレッジ。アーキテクチャ原則、ビジネスルール、コンベンション、技術制約、ソースマップ（C4 Container/Component Mermaidダイアグラム）。.reap/genome/に保存。",
      "Generationを繰り返してGenomeを進化させ、Civilizationを成長させるプロセス。",
      "ソースコード。.reap/以外のプロジェクト全体のコードベース。",
    ],
    whyReap: "なぜREAPか？",
    problemHeader: "問題",
    solutionHeader: "REAPの解決策",
    problems: [
      ["コンテキスト喪失 — エージェントが毎セッションでプロジェクトコンテキストを忘れる", "SessionStart Hook — 毎セッションでGenome全体 + Generation状態を自動注入"],
      ["散発的開発 — 明確な目標なくコードを変更", "Generationモデル — 各Generationが構造化されたライフサイクルを通じて一つの目標に集中"],
      ["設計とコードの乖離 — ドキュメントがコードと異なる", "Backlogを通じたGenome変異 — 実装中に発見された設計欠陥が記録されCompletionで適用"],
      ["忘れられた教訓 — 過去の作業のインサイトが消える", "Lineage & レトロスペクティブ — 教訓がGenomeに蓄積、Generationが保管・圧縮"],
      ["コラボレーションの混乱 — 並行作業が競合する変更を引き起こす", "Distributed Workflow — Genomeファーストのマージがコードの前に設計を調整、DAG lineageが並行ブランチを追跡"],
    ],
    fourAxis: "Four-Axis構造",
    fourAxisDesc: "REAPは.reap/配下のすべてを4つの軸で構成します：",
    axes: [
      { axis: "Genome", path: ".reap/genome/", desc: "遺伝情報。原則、ルール、アーキテクチャ決定、ソースマップ（C4 Container/Component Mermaidダイアグラム）。" },
      { axis: "Environment", path: ".reap/environment/", desc: "外部コンテキスト。APIドキュメント、インフラ、ビジネス制約。" },
      { axis: "Life", path: ".reap/life/", desc: "現在のGenerationのライフサイクル。進捗状態と成果物。" },
      { axis: "Lineage", path: ".reap/lineage/", desc: "完了したGenerationのアーカイブ。" },
    ],
    projectStructure: "プロジェクト構造",
  },

  // Quick Start Page
  quickstart: {
    title: "クイックスタート",
    breadcrumb: "はじめに",
    prerequisites: "前提条件",
    prerequisiteItems: [
      { name: "Node.js", desc: "v18以上", required: true },
      { name: "npm", desc: "Node.jsに同梱", required: true },
      { name: "Claude CodeまたはOpenCode", desc: "AIエージェントCLI（いずれか1つ以上必要）", required: true },
      { name: "Bun", desc: "代替パッケージマネージャ", required: false },
    ],
    required: "必須",
    optional: "任意",
    install: "インストール",
    initProject: "プロジェクトの初期化",
    runFirst: "最初のGenerationを実行",
    runFirstDesc: "プロジェクトディレクトリでClaude Codeを起動してください：",
    evolveTitle: "/reap.evolveが主要コマンドです",
    evolveDesc: "Generationライフサイクル全体（Objective、Planning、Implementation、Validation、Completion）を対話的に実行します。AIエージェントが各ステージで質問し、承認後に次へ進みます。日常の開発で最も多く使うコマンドです。",
    manualControl: "手動ステージ制御",
    manualControlDesc: "各ステージを個別に制御することもできます：",
    whatHappens: "Generation中に起こること",
    stageHeaders: ["ステージ", "内容", "成果物"],
    stages: [
      ["Objective", "構造化ブレインストーミングによる目標・設計定義", "01-objective.md"],
      ["Planning", "タスク分解、アプローチ選択、依存関係マッピング", "02-planning.md"],
      ["Implementation", "AI + 人間の協力で実装", "03-implementation.md"],
      ["Validation", "テスト実行、完了基準の検証", "04-validation.md"],
      ["Completion", "レトロスペクティブ + Genome変更適用 + 保管", "05-completion.md"],
    ],
  },

  // Core Concepts Page
  concepts: {
    title: "コアコンセプト",
    breadcrumb: "ガイド",
    genomeTitle: "Genome",
    genomeDesc: "Genomeはアプリケーションの遺伝情報です — アーキテクチャ原則、ビジネスルール、コンベンション、技術制約、ソースマップ。",
    principles: "原則",
    genomeImmutability: "Genome不変原則",
    genomeImmutabilityDesc: "現在のGeneration進行中はGenomeを直接変更しません。問題はbacklogに記録され、Completionステージでのみ適用されます。",
    envImmutability: "Environment不変原則",
    envImmutabilityDesc: "現在のGeneration進行中はEnvironmentを直接変更しません。外部変更はbacklogに記録され、Completionステージで適用されます。",
    lifecycle: "ライフサイクル",
    lifecycleDesc: "各Generationは5つのステージに従います：",
    stageHeaders: ["ステージ", "内容", "成果物"],
    stages: [
      ["Objective", "構造化ブレインストーミングによる目標・設計定義", "01-objective.md"],
      ["Planning", "タスク分解、アプローチ選択、依存関係マッピング", "02-planning.md"],
      ["Implementation", "AI + 人間の協力で実装", "03-implementation.md"],
      ["Validation", "テスト実行、完了基準の検証", "04-validation.md"],
      ["Completion", "レトロスペクティブ + Genome変更適用 + 保管", "05-completion.md"],
    ],
    backlog: "Backlog & Deferral",
    backlogDesc: "すべてのbacklog項目は.reap/life/backlog/にfrontmatter付きのマークダウンファイルとして保存されます：",
    backlogHeaders: ["タイプ", "説明"],
    backlogTypes: [
      { type: "genome-change", desc: "CompletionステージでGenomeに適用。" },
      { type: "environment-change", desc: "CompletionステージでEnvironmentに適用。" },
      { type: "task", desc: "次のObjectiveの目標候補。" },
    ],
    statusField: "各項目はstatusフィールドも持ちます：",
    statusHeaders: ["ステータス", "説明"],
    statuses: [
      { type: "pending", desc: "未処理。デフォルト値 — フィールドがなければpendingとみなす。" },
      { type: "consumed", desc: "現在のGenerationで処理完了。consumedBy: gen-XXX-{hash}必須。" },
    ],
    archivingNote: "アーカイブ時、consumed項目はlineageに移動します。pending項目は次のGenerationのbacklogに繰り越されます。",
    deferralNote: "部分完了は正常です — Genome変更に依存するタスクは[deferred]とマークされ、次のGenerationに引き継がれます。",
    evolutionFlow: "Evolutionフローの例",
  },

  // Workflow Page
  workflow: {
    title: "ワークフロー",
    breadcrumb: "ガイド",
    intro: "Generationは REAPの基本作業単位です。各Generationは一つの目標を5つのステージを通じて遂行し、その過程で成果物を生成します。各ステージで何が起こり、どう接続されるかを見ていきます。",
    evolveTitle: "/reap.evolve — 主要な作業方法",
    evolveDesc: "ほとんどの場合、/reap.evolveを実行するとAIエージェントが全ステージを自律的に実行します。Generationの開始、各ステージの実行、ステージ間の前進、最後のアーカイブまで処理します。日常的なステージごとの確認はスキップし、エージェントが本当に行き詰まった場合（あいまいな目標、重要なトレードオフ決定、Genome衝突、予期しないエラー）にのみ停止します。",
    evolveNote: "細かい制御が必要な場合は、個別のステージコマンドを実行できます。詳細はコマンドリファレンスを参照してください。",
    stageWalkthrough: "ステージ別詳細",
    stageDetails: [
      {
        title: "1. Objective",
        desc: "構造化ブレインストーミングでこのGenerationの目標を定義します。AIエージェントがコンテキストをスキャンした後、明確化質問（一度に一つずつ）を案内し、2-3個のアプローチ代案をトレードオフ付きで提示し、セクション別設計承認を行い、オプションでビジュアルコンパニオンでモックアップやダイアグラムを表示し、自動Specレビューを実行します。",
        output: "01-objective.md — 目標、完了基準（最大7個、検証可能）、機能要件（最大10個）、設計（アプローチ比較、選択された設計）、スコープ、Genomeギャップ分析。",
      },
      {
        title: "2. Planning",
        desc: "目標を実行可能なタスクに分解します。AIが要件を読み、Genomeコンベンションと制約を参照してアーキテクチャ決定を含む実装計画を提案します。",
        output: "02-planning.md — フェーズ別タスクリスト（フェーズ当たり最大20個）、依存関係、並列可能タスクは[P]でマーク。",
      },
      {
        title: "3. Implementation",
        desc: "コードを記述します。タスクは順次実行され、各完了は即座に記録されます。GenomeやEnvironmentの欠陥が発見されたらbacklogに記録します — 直接適用しません。保留中のGenome変更に依存するタスクは[deferred]とマークされます。",
        output: "03-implementation.md — 完了タスクテーブル、未完了タスク、genome-change backlog項目。",
      },
      {
        title: "4. Validation",
        desc: "作業を検証します。constraints.mdの検証コマンド（テスト、リント、ビルド、型チェック）を実行し、完了基準を確認し、軽微な修正（5分以内、設計変更なし）を適用します。判定はpass、partial（一部基準未完）、failです。",
        output: "04-validation.md — 実際のコマンド出力を含むテスト結果、基準チェックテーブル、判定。",
      },
      {
        title: "5. Completion",
        desc: 'レトロスペクティブを行い進化します。教訓の抽出（最大5個）、genome-change backlog項目をGenomeファイルに適用、技術的負債の整理、未完了タスクを次のGenerationのbacklogに引き継ぎ。Phase 5（Hook Suggestion）ではGeneration間の繰り返しパターンを検出し、ユーザー確認のもとhook作成を提案します。単独実行時はGenome変更に人間の確認が必要；/reap.evolve経由時はエージェントが自律的に進行。',
        output: "05-completion.md — サマリー、レトロスペクティブ、Genome変更ログ。その後/reap.nextがすべてをlineageに保管。",
      },
    ],
    microLoop: "Micro Loop（回帰）",
    microLoopDesc: "どのステージからでも前のステージに戻ることができます。これは一般的なことです — Validationが失敗してImplementationに戻ったり、Implementation中にPlanningの欠陥が見つかってPlanningに戻ったりします。回帰理由はタイムラインと対象成果物に記録されます。",
    artifactHandling: "回帰時の成果物処理：",
    artifactRules: [
      { label: "対象ステージ以前：", desc: "そのまま保持" },
      { label: "対象ステージ：", desc: "上書き（Implementationのみappend）" },
      { label: "対象ステージ以後：", desc: "保持、再突入時に上書き" },
    ],
    minorFix: "Minor Fix",
    minorFixDesc: "軽微な問題（タイポ、リントエラーなど）は、5分以内に解決可能で設計変更が不要であれば、回帰なしに現在のステージで直接修正できます。修正内容はステージ成果物に記録されます。",
    roleSeparation: "役割分担",
    roleHeaders: ["誰が", "役割"],
    roles: [
      ["CLI (reap)", "プロジェクトのセットアップと保守 — init、status、update、fix"],
      ["AI Agent", "ワークフロー実行者 — スラッシュコマンドで各ステージの作業を実行"],
      ["Human", "意思決定者 — 目標設定、成果物レビュー、ステージ遷移の承認"],
    ],
  },

  // CLI Page
  cli: {
    title: "CLIリファレンス",
    breadcrumb: "リファレンス",
    initTitle: "reap init",
    initDesc: "新しいREAPプロジェクトを初期化します。.reap/構造を作成し、検出されたエージェント（Claude Code、OpenCode）にスラッシュコマンドとhooksをインストールします。",
    initHeaders: ["オプション", "値", "説明"],
    initOptions: [
      ["--mode", "greenfield | migration | adoption", "プロジェクトentryモード"],
      ["--preset", "例：bun-hono-react", "事前設定されたスタックでGenomeを初期化"],
    ],
    statusTitle: "reap status",
    statusDesc: "現在のプロジェクトとGeneration状態を表示します。",
    statusNote: "プロジェクト名、entryモード、アクティブGeneration（id、目標、ステージ）、完了Generation総数を表示します。",
    updateTitle: "reap update",
    updateDesc: "コマンド、テンプレート、hooksを最新バージョンに同期します。",
    dryRunDesc: "変更を適用せずに更新される内容を表示します。",
    fixTitle: "reap fix",
    fixDesc: ".reap/ディレクトリ構造を診断し修復します。",
    fixNote: "不足ディレクトリの確認、config.ymlの存在検証、current.ymlステージの検証、不足構造の再作成を行います。",
    helpTitle: "reap help",
    helpDesc: "CLIコマンド、スラッシュコマンド、ワークフロー概要を出力します。",
    helpNote: "~/.claude/settings.jsonからユーザーの言語設定を読み取り、その言語でヘルプテキストを出力します（現在enとkoに対応）。言語ファイルが見つからない場合は英語にフォールバックします。",
  },

  // Command Reference Page
  commands: {
    title: "コマンドリファレンス",
    breadcrumb: "リファレンス",
    intro: "REAPには2種類のコマンドがあります：CLIコマンドとスラッシュコマンド。",
    cliCommandsDesc: "CLIコマンド（reap ...）はターミナルで実行されます。プロジェクトのセットアップと保守を担当します — init、status、update、fix、help。AIエージェントとは対話しません。",
    slashCommandsDesc: "スラッシュコマンド（/reap.*）はAIエージェントCLI（Claude Code、OpenCode）内で実行されます。開発ワークフローを主導します — AIエージェントがプロンプトを読み、ユーザーと対話的に作業を実行します。",
    slashTitle: "スラッシュコマンド",
    slashIntro: "reap initで検出された各エージェントにインストールされます。AIエージェントセッション（Claude Code、OpenCode）内で使用します。",
    commandHeaders: ["コマンド", "説明"],
    normalTitle: "Normal Generation",
    normalCommands: [
      ["/reap.evolve", "Generation全体を最初から最後まで実行。日常開発の主要コマンド。全ステージを自律的にループ — 日常的な確認はスキップし、本当に行き詰まった時のみ停止。"],
      ["/reap.start", "新しいGenerationを開始。backlogで待機項目をスキャン、目標を要求、current.ymlを作成、ステージをobjectiveに設定。"],
      ["/reap.objective", "構造化ブレインストーミングで目標定義：明確化質問、アプローチ代案、セクション別設計、ビジュアルコンパニオン、Specレビューループ。"],
      ["/reap.planning", "目標を依存関係のあるタスクに分解。実装計画を作成。"],
      ["/reap.implementation", "計画のタスクを実行。完了/未完了タスクとGenome発見事項を成果物に記録。"],
      ["/reap.validation", "constraints.mdの検証コマンドを実行。完了基準を確認。判定：pass / partial / fail。"],
      ["/reap.completion", "レトロスペクティブ、backlogのGenome変更を適用、整理、最終化。"],
      ["/reap.next", "次のライフサイクルステージに前進。テンプレートから次の成果物を作成。完了時にアーカイブ。"],
      ["/reap.back", "前のステージに回帰（micro loop）。回帰理由をタイムラインと成果物に記録。"],
    ],
    mergeTitle: "Merge Generation",
    mergeCommands: [
      ["/reap.pull <branch>", "リモートを取得し、新しいGenerationを検出し、完全なマージGenerationライフサイクルを実行。/reap.evolveの分散版。"],
      ["/reap.merge <branch>", "ローカルブランチの完全なmerge generationを実行します。fetchなし — worktreeベースの並行開発に最適。/reap.pullのローカル版。"],
      ["/reap.push", "REAP状態を検証（進行中のGenerationがあれば警告）し、現在のブランチをリモートにプッシュ。"],
      ["/reap.merge.start", "分岐したブランチを統合するマージGenerationを開始。マージGenerationを作成しdetectを実行。"],
      ["/reap.merge.detect", "git refsを通じて現在のブランチとターゲットブランチ間の分岐を分析。"],
      ["/reap.merge.mate", "ソースマージ前にGenome衝突（WRITE-WRITE、CROSS-FILE）を解決。人間が判断。"],
      ["/reap.merge.merge", "git merge --no-commitを実行し、確定したGenomeに基づいてソース衝突を解決。"],
      ["/reap.merge.sync", "AIがGenomeとソースの整合性を比較。不整合があればユーザーが確認。"],
      ["/reap.merge.validation", "機械的テストコマンド（bun test、tsc、build）を実行 — 通常のGenerationと同様。"],
      ["/reap.merge.evolve", "現在のステージから完了までマージライフサイクルを実行。自律モードが適用。"],
    ],
    generalTitle: "一般",
    generalCommands: [
      ["/reap.status", "現在のGeneration状態、ステージ進捗、backlog概要、タイムライン、Genome状態を表示。"],
      ["/reap.sync", "ソースコードを分析してGenomeを同期。アクティブGenerationがなければ直接更新；あればbacklogに記録。"],
      ["/reap.help", "24+トピックの状況別ヘルプを提供。REAP紹介、詳細説明（workflow、genome、backlog、strict、agents、hooks、config、evolve、regression、minor-fix、compression、authorおよび全コマンド名）。"],
      ["/reap.update", "REAPのアップデートを確認し最新バージョンにアップグレード。インストール済みバージョンと公開バージョンを比較し、npmパッケージを更新し、コマンド/テンプレート/hooksを同期。"],
    ],
    lifecycleFlow: "ライフサイクルフロー",
    lifecycleFlowDesc: "/reap.evolve使用時の一般的なフロー：",
    commandStructure: "各コマンドの構造",
    commandStructureDesc: "すべてのスラッシュコマンドは同じパターンに従います：Gate（前提条件チェック — ステージが正しいか、前の成果物が存在するか） → Steps（人間との対話で作業実行） → Artifact（.reap/life/に段階的に記録）。",
  },

  // Configuration Page
  config: {
    title: "設定",
    breadcrumb: "リファレンス",
    intro: "REAPプロジェクトは.reap/config.ymlを通じて設定します。このファイルはreap init中に作成され、プロジェクト設定、strictモード、ライフサイクルhooksを制御します。",
    structure: "設定ファイル構造",
    fields: "フィールド",
    fieldHeaders: ["フィールド", "説明"],
    fieldItems: [
      ["version", "設定スキーマバージョン"],
      ["project", "プロジェクト名（init時に設定）"],
      ["entryMode", "REAPの初期化方式：greenfield、migration、またはadoption"],
      ["strict", "Strictモード：boolean（省略形）または { edit, merge } で細かく制御（下記参照）"],
      ["language", "成果物とユーザーインタラクションの言語（例：korean、english、japanese）"],
      ["autoUpdate", "セッション開始時の自動アップデート（デフォルト：false）"],
      ["agents", "検出されたAIエージェント、reap init/updateで管理（例：claude-code、opencode）"],
      ["hooks", "ライフサイクルhooks（Hookリファレンス参照）"],
    ],
    strictMode: "Strictモード",
    strictModeDesc: "StrictモードはAIエージェントが許可される操作を制御します。2つの形式をサポートします：",
    strictConfigExample: `# Shorthand — enables both edit and merge restrictions
strict: true

# Granular control
strict:
  edit: true    # Restrict code changes to REAP lifecycle
  merge: false  # Restrict raw git pull/push/merge`,
    strictEditTitle: "strict.edit — コード変更制御",
    strictEditDesc: "有効にすると、AIエージェントはREAPワークフロー外でコードを変更できなくなります。",
    strictHeaders: ["状況", "動作"],
    strictRules: [
      ["アクティブGenerationなし / Implementationステージ以外", "コード変更は完全にブロック"],
      ["Implementationステージ", "02-planning.mdの範囲内の変更のみ許可"],
      ["エスケープハッチ", "ユーザーが明示的に「override」または「bypass strict」を要求すると変更許可"],
    ],
    strictMergeTitle: "strict.merge — Gitコマンド制御",
    strictMergeDesc: "有効にすると、直接的なgit pull、git push、git mergeコマンドが制限されます。エージェントはユーザーにREAPスラッシュコマンド（/reap.pull、/reap.push、/reap.merge）の使用を案内します。",
    strictNote: "どちらもデフォルトで無効です。strict: trueは両方を有効にします。ファイルの読み取り、コード分析、質問への回答はstrictモードに関係なく常に許可されます。",
    entryModes: "Entryモード",
    entryModeHeaders: ["モード", "用途"],
    entryModeItems: [
      ["greenfield", "ゼロから新しいプロジェクトを開始"],
      ["adoption", "既存のコードベースにREAPを適用"],
      ["migration", "既存システムから新しいアーキテクチャへ移行"],
    ],
  },

  // Hook Reference Page
  hooks: {
    title: "Hookリファレンス",
    breadcrumb: "リファレンス",
    intro: "REAP hooksは主要なライフサイクルイベントで自動化を実行できるようにします。Hookは.reap/hooks/に個別ファイルとして保存され、AIエージェントが適切なタイミングで実行します。",
    hookTypes: "Hookタイプ",
    hookTypesIntro: "各hookファイルは拡張子に基づいて2つのタイプのいずれかをサポートします：",
    commandType: "command (.sh)",
    commandTypeDesc: "シェルスクリプト。AIエージェントがプロジェクトルートディレクトリで実行します。スクリプト、CLIツール、ビルドコマンドに使用。",
    promptType: "prompt (.md)",
    promptTypeDesc: "Markdown形式のAIエージェントへの指示。エージェントがプロンプトを読み、コード分析、ファイル変更、ドキュメント更新などの作業を実行します。判断が必要な作業に使用。",
    hookTypeNote: "各hookは単一のファイルです。同じイベントに複数のhookがある場合、frontmatterで指定された順序で実行されます。",
    fileNaming: "ファイル命名",
    fileNamingDesc: "Hookファイルは次のパターンに従います: .reap/hooks/{event}.{name}.{md|sh}",
    fileNamingFrontmatter: "各hookファイルはオプションのYAML frontmatterをサポートします：",
    frontmatterHeaders: ["フィールド", "説明"],
    frontmatterItems: [
      ["condition", "hookが実行されるために真でなければならない式（例: stage == 'implementation'）"],
      ["order", "同じイベントに複数のhookがある場合の実行順序（デフォルト: 0）"],
    ],
    events: "Events",
    eventHeaders: ["Event", "発火タイミング"],
    eventItems: [
      ["onGenerationStart", "/reap.startが新しいGenerationを作成しcurrent.ymlを書き込んだ後"],
      ["onStageTransition", "/reap.nextが次のステージに前進し新しい成果物を作成した後"],
      ["onGenerationComplete", "/reap.nextが完了したGenerationをアーカイブした後。git commit後に実行されるため、hooksの変更はuncommitted"],
      ["onRegression", "/reap.backが前のステージに回帰した後"],
      ["onMergeStart", "/reap.merge.startがマージGenerationを作成した後"],
      ["onGenomeResolved", "マージGenerationでGenome衝突が解決された後"],
      ["onMergeComplete", "マージGenerationがアーカイブされた後"],
    ],
    configuration: "設定",
    configExample: `# .reap/hooks/ ディレクトリ構造
#
# .reap/hooks/
# ├── onGenerationStart.notify.sh
# ├── onStageTransition.lint.sh
# ├── onGenerationComplete.update.sh
# ├── onGenerationComplete.docs-review.md
# └── onRegression.log.md
#
# 例: onGenerationComplete.docs-review.md
# ---
# condition: stage == 'completion'
# order: 10
# ---
# 今回のGenerationで変更された内容を確認せよ。
# 機能、CLIコマンド、スラッシュコマンドが追加または
# 変更された場合はREADME.mdとdocsを更新せよ。
# ドキュメント更新が不要ならスキップせよ。
#
# 例: onStageTransition.lint.sh
# ---
# order: 0
# ---
# #!/bin/bash
# npm run lint`,
    hookSuggestion: "自動Hook提案",
    hookSuggestionDesc: "Completionステージ（Phase 5: Hook Suggestion）で、REAPはGeneration間の繰り返しパターン（繰り返される手動ステップ、繰り返されるコマンド、一貫したステージ後アクションなど）を検出します。パターンが検出されると、REAPはそれを自動化するhookの作成を提案します。Hookの作成は適用前に必ずユーザーの確認が必要です。",
    sessionStart: "SessionStart Hook",
    sessionStartDesc1: "REAPプロジェクトhooksとは別に、SessionStart hookは毎AIセッション開始時に実行されるエージェントメカニズムです。reap init中に検出された各エージェント（Claude Code、OpenCode）に登録されます。",
    sessionStartDesc2: "REAPワークフローガイド全体、現在のGeneration状態、ライフサイクルルールをAIエージェントに注入します — 新しいセッションでもエージェントがプロジェクトコンテキストを理解することを保証します。",
    sessionStartNote: "エージェントの設定に登録されます（例：Claude Codeは~/.claude/settings.json、OpenCodeは~/.config/opencode/）。hookスクリプトはREAPパッケージ内にあり、プロジェクトの.reap/ディレクトリから読み取ります。",
    executionNotes: "実行に関する注意事項",
    executionItems: [
      "HooksはCLIではなくAIエージェントが実行します。エージェントが設定を読み、各hookを実行します。",
      "command hooksはプロジェクトルートディレクトリで実行されます。",
      "prompt hooksは現在のセッションコンテキストでAIエージェントが解釈します。",
      "同じイベント内のhooksは定義順に順次実行されます。",
      "onGenerationComplete hooksはgit commit後に実行されます — hooksのファイル変更はuncommitted状態です。",
    ],
  },

  // Advanced Page
  advanced: {
    title: "上級",
    breadcrumb: "ガイド",
    compressionTitle: "Lineage圧縮",
    compressionDesc: "Generationが蓄積されると、lineageアーカイブはサイズ管理のために自動的に圧縮されます。",
    compressionHeaders: ["レベル", "入力", "出力", "最大行数", "トリガー"],
    compressionItems: [
      ["Level 1", "Generationフォルダ（成果物5個）", "gen-XXX-{hash}.md", "40", "lineage > 5,000行 + 5個以上のGeneration"],
      ["Level 2", "Level 1ファイル5個", "epoch-XXX.md", "60", "Level 1ファイルが5個以上存在"],
    ],
    compressionProtection: "最新の3世代は常に圧縮から保護され、最近のコンテキストの完全な詳細が維持されます。",
    presetsTitle: "プリセット",
    presetsDesc: "プリセットは一般的な技術スタック向けに事前設定されたGenomeとプロジェクトスキャフォールディングを提供します。",
    presetsNote: "bun-hono-reactプリセットはBun + Hono + Reactスタック向けのアーキテクチャ原則、コンベンション、制約を含めてGenomeを構成します。",
    entryModes: "Entryモード",
    entryModesDesc: "reap init --modeで指定します。Genomeが初期にどのように構成されるかを制御します。",
    entryModeHeaders: ["モード", "説明"],
    entryModeItems: [
      ["greenfield", "ゼロから新しいプロジェクトを開始します。デフォルトモード。Genomeが空の状態から成長します。"],
      ["migration", "既存システムを参照しながら新しく構築します。既存システムの分析でGenomeが初期化されます。"],
      ["adoption", "既存のコードベースにREAPを適用します。Genomeがテンプレートから開始し、最初のGenerationのObjectiveステージで埋められます。"],
    ],
  },

  // Distributed Workflow - Overview
  collaboration: {
    title: "分散ワークフロー",
    breadcrumb: "コラボレーション",
    intro: "REAPは複数の開発者やAIエージェントが同じプロジェクトで並行して作業する分散コラボレーションをサポートします — 中央サーバー不要。Gitが唯一のトランスポート層です。",
    caution: "分散ワークフローは現在初期段階であり、さらなるテストが必要です。本番環境でのご使用にはご注意ください。ユーザーフィードバックを積極的に収集しています — 問題や提案は以下からお寄せください：",
    cautionLink: "GitHub Issues",
    cautionUrl: "https://github.com/c-d-cc/reap/issues",
    howItWorks: "仕組み",
    howItWorksDesc: "各開発者やエージェントは自分のブランチとGenerationで独立して作業します。統合する時が来たら、REAPがGenomeファースト戦略でマージを調整します。",
    flowSteps: [
      "Machine Aがbranch-aでgen-046-aを完了 → /reap.push",
      "Machine Bがbranch-bでgen-046-bを完了 → /reap.push",
      "Machine Aが/reap.pull branch-bを実行 → fetch + 完全なマージGenerationライフサイクル",
    ],
    principles: "主要原則",
    principleItems: [
      { label: "Opt-in", desc: "git pull/pushは常に正常に動作します。REAPコマンドは付加的です — 分散ワークフローを使うタイミングを自分で選びます。" },
      { label: "Genomeファースト", desc: "ソースマージの前にGenome衝突を解決します。法律を更新する前に憲法を改正するようなものです。" },
      { label: "サーバー不要", desc: "すべてがローカル + Git。外部サービスも、中央調整もありません。" },
      { label: "DAG lineage", desc: "各Generationはハッシュベースのid(gen-046-a3f8c2)で親を参照し、並行作業を自然にサポートする有向非巡回グラフを形成します。" },
    ],
    scenarios: "利用シナリオ",
    scenarioItems: [
      { label: "リモートブランチ（マルチマシン）", desc: "異なる開発者やエージェントが別々のマシンで作業し、リモートブランチにプッシュします。/reap.pushで公開し、/reap.pull <branch>で取得してマージします。", example: "/reap.push → /reap.pull branch-b" },
      { label: "ローカルworktree（マルチエージェント）", desc: "複数のAIエージェントがgit worktreeを使用して同じマシンで並行して作業します。各worktreeは独自のブランチとGenerationを持ちます。/reap.merge.startで直接統合します — fetch不要。", example: "/reap.merge.start worktree-branch" },
      { label: "混合", desc: "一部はローカル（worktree）、一部はリモート（他のマシン）で作業します。リモートブランチには/reap.pullを、ローカルブランチには/reap.merge.startを必要に応じて組み合わせます。" },
    ],
    pullPush: "Pull & Push（リモート）",
    pullDesc: "/reap.pull <branch>は/reap.evolveの分散版です。リモートを取得し、新しいGenerationを検出し、DetectからCompletionまでの完全なマージGenerationライフサイクルを実行します。",
    pushDesc: "/reap.pushは現在のREAP状態を検証（進行中のGenerationがあれば警告）し、現在のブランチをリモートにプッシュします。",
    merge: "Merge（ローカル / Worktree）",
    mergeDesc: "/reap.merge.start <branch>はローカルブランチから直接マージGenerationを作成します — fetchが不要なworktreeベースの並行開発に最適です。/reap.merge.evolveで完全なマージライフサイクルを実行するか、各ステージを手動で進めることができます。",
    gitRefReading: "Git Refベースの読み取り",
    gitRefDesc: "マージ前に、ターゲットブランチのGenomeとlineageをgit refs（git show、git ls-tree）経由で読み取ります — チェックアウト不要。ワーキングツリーを変更せずにGenome変更を比較できます。",
  },

  // Distributed Workflow - Merge Lifecycle
  mergeGeneration: {
    title: "マージGeneration",
    breadcrumb: "コラボレーション",
    intro: "分岐したブランチをマージする必要がある場合、REAPは通常のGenerationライフサイクルとは別の、Merge Generationと呼ばれる特化した6ステージライフサイクルを実行します。核心原則：まずGenomeを整合させてから、ソースコードをマージします。",
    whyLonger: "Merge Generationは通常のgit mergeとどう違うのか？",
    whyLongerDesc: "通常のgit mergeはソースコードの衝突のみを解決します。しかし、2つのブランチが独立して進化した場合 — それぞれ独自のGeneration、Genome変更、設計決定を持つ — ソースコードだけをマージするのでは不十分です。Genome（アーキテクチャ原則、コンベンション、制約、ビジネスルール）も分岐している可能性があります。Merge Generationはソースマージの前に3つの重要なステップを追加します：Genome分岐の検出、Mating（Genome衝突の解決）、マージ後のGenome-ソース整合性の検証。これにより、マージされたコードベースが単にコンパイルが通るだけでなく、設計的にも一貫性を保つことが保証されます。",
    whyGenomeFirst: "なぜGenomeの整合が先なのか",
    whyGenomeFirstDesc: "ソースコードの衝突を解決しても、セマンティック衝突がないことは保証されません。2つのコードがgit衝突なしにきれいにマージできても、意図、アーキテクチャ、ビジネスロジックで互いに矛盾する可能性があります。Genomeベースの推論だけがこれらの見えない衝突を検出できます：マージされたコードはまだアーキテクチャ原則に従っているか？コンベンションは一貫しているか？ビジネスルールは整合しているか？これがREAPがソースコードに触れる前にGenomeを先に整合させる理由です。Genomeが確定すると、それがソース衝突を解決するための権威あるガイドとなります — 構文的にだけでなく、意味的にも。",
    whyLongerPoints: [
      { label: "通常のgit merge", desc: "ソース衝突 → 解決 → コミット。設計の一貫性未チェック。セマンティック衝突は未検出。" },
      { label: "Merge Generation", desc: "Genome整合優先 → Genomeベースのソースマージ → Genome-ソース整合性の検証 → バリデーション → コミット。見えないセマンティック衝突を捕捉。" },
    ],
    stageOrder: "ステージ順序",
    stages: [
      { name: "Detect", desc: "git refs経由でターゲットブランチをスキャン。DAG BFSで共通祖先を特定。Genomediffを抽出。衝突をWRITE-WRITEまたはCROSS-FILEに分類。", artifact: "01-detect.md" },
      { name: "Mate", desc: "すべてのGenome衝突を人間に提示。WRITE-WRITE: A選択、B選択、または手動マージ。CROSS-FILE: 論理的互換性を確認。進行前にGenomeが完全に解決されている必要があります。", artifact: "02-mate.md" },
      { name: "Merge", desc: "ターゲットブランチとgit merge --no-commitを実行。確定したGenomeに基づいてソース衝突を解決。セマンティック衝突（コンパイルはできるがGenomeと矛盾するコード）を確認。", artifact: "03-merge.md" },
      { name: "Sync", desc: "AIがGenomeとソースコードの整合性を比較。不整合が発見された場合、ユーザーが確認。問題があればMergeまたはMateに回帰。", artifact: "04-sync.md" },
      { name: "Validation", desc: "constraints.mdのすべての機械的テストコマンド（bun test、tsc、build）を実行。失敗した場合、MergeまたはMateに回帰。", artifact: "05-validation.md" },
      { name: "Completion", desc: "マージ結果をコミット。meta.ymlにtype: mergeと両親を記録。lineageにアーカイブ。", artifact: "06-completion.md" },
    ],
    stageHeaders: ["ステージ", "内容", "成果物"],
    conflictTypes: "衝突タイプ",
    conflictHeaders: ["タイプ", "説明", "解決"],
    conflicts: [
      ["WRITE-WRITE", "両ブランチで同じGenomeファイルを変更", "人間が決定: A維持、B維持、またはマージ"],
      ["CROSS-FILE", "異なるGenomeファイルを変更したが、両ブランチともGenomeを変更", "人間が論理的互換性をレビュー"],
      ["ソース衝突", "Gitマージ衝突がソースコードで発生", "確定したGenomeに基づいて解決"],
      ["セマンティック衝突", "コードはきれいにマージされるがGenome（アーキテクチャ、コンベンション、ビジネスルール）と矛盾", "Syncステージで検出 — AIがGenomeとソースを比較、ユーザーが解決方法を確認"],
      ["衝突なし", "Genomeまたはソース衝突なし", "自動的に進行"],
    ],
    regression: "マージ回帰",
    regressionDesc: "ValidationまたはSync失敗はMergeまたはMateに回帰できます。MergeでGenome問題が発見された場合、Mateに回帰できます。回帰ルールは通常のGenerationと同じパターンに従います — 理由がタイムラインと成果物に記録されます。",
    currentYml: "current.yml構造（マージ）",
  },

  // Distributed Workflow - Merge Commands
  mergeCommands: {
    title: "マージコマンド",
    breadcrumb: "コラボレーション",
    intro: "すべての分散ワークフロー操作はAIエージェントが実行するスラッシュコマンドです。マージ用のCLIコマンドはありません — Genome衝突解決とソースマージガイダンスにAIエージェントが不可欠です。",
    primaryCommands: "プライマリコマンド",
    primaryItems: [
      { cmd: "/reap.pull <branch>", desc: "分散マージのワンストップコマンド。リモートを取得し、ターゲットブランチの新しいGenerationを検出し、マージGenerationを作成し、完全なマージライフサイクルを実行します。/reap.evolveの分散版です。" },
      { cmd: "/reap.merge <branch>", desc: "ローカルブランチの完全なmerge generationを実行します。fetchなし — worktreeベースの並行開発に最適。/reap.pullのローカル版。" },
      { cmd: "/reap.push", desc: "REAP状態を検証（進行中のGenerationがあれば警告）し、現在のブランチをプッシュします。Generation完了後に使用します。" },
    ],
    stageCommands: "ステージコマンド（細かい制御）",
    stageItems: [
      { cmd: "/reap.merge.start", desc: "ターゲットブランチ用のマージGenerationを作成。detectを実行し01-detect.mdを生成。" },
      { cmd: "/reap.merge.detect", desc: "分岐レポートを確認。必要に応じて再実行。" },
      { cmd: "/reap.merge.mate", desc: "人間と対話的にGenome衝突を解決。" },
      { cmd: "/reap.merge.merge", desc: "git merge --no-commitを実行しソース衝突を解決。" },
      { cmd: "/reap.merge.sync", desc: "AIがGenomeとソースの整合性を比較。不整合があればユーザーが確認。" },
      { cmd: "/reap.merge.validation", desc: "機械的テスト（bun test、tsc、build）を実行。失敗時に回帰。" },
      { cmd: "/reap.merge.completion", desc: "マージGenerationをコミットしアーカイブ。" },
      { cmd: "/reap.merge.evolve", desc: "現在のステージから完了までマージライフサイクルを実行。" },
    ],
    mergeHooks: "マージHooks",
    mergeHookHeaders: ["Event", "発火タイミング"],
    mergeHookItems: [
      ["onMergeStart", "/reap.merge.startがマージGenerationを作成した後"],
      ["onGenomeResolved", "Genome衝突が解決された後（mate → merge遷移）"],
      ["onMergeComplete", "マージGenerationがアーカイブされた後"],
    ],
    mergeHookNote: "通常のhooks（onStageTransition、onRegression）もマージステージ遷移時に発火します。",
  },

  // Comparison Page
  comparison: {
    title: "比較",
    breadcrumb: "はじめに",
    heading: "Spec Kitとの比較",
    desc: "Spec Kitはコード作成前に仕様を記述するスペック駆動開発方式を開拓しました。REAPはこのコンセプトを発展させ、主要な制限を解決します：",
    items: [
      { title: "静的スペック vs 生きたGenome", desc: "既存ツールはスペックを静的ドキュメントとして扱います。REAPのGenomeは生きたシステムです — 実装中に発見された欠陥がbacklogを通じてフィードバックされ、Completionで適用されます。設計がコードとともに進化します。" },
      { title: "セッション間メモリなし", desc: "ほとんどのAI開発ツールはセッション間でコンテキストを失います。REAPのSessionStart Hookはプロジェクト全体のコンテキスト（Genome、Generation状態、ワークフロールール）を毎新セッションに自動注入します。" },
      { title: "線形ワークフロー vs Micro loops", desc: "既存ツールは線形フロー（スペック → 計画 → 実装）に従います。REAPは構造化された回帰をサポートします — 成果物を保持しながらどのステージでも前に戻ることができます。" },
      { title: "独立タスク vs 世代別進化", desc: "既存ツールの各タスクは独立しています。REAPではGenerationが互いを基盤に発展します。知識がLineage保管とGenome進化を通じて複利で蓄積されます。" },
      { title: "ライフサイクルhooksなし", desc: "REAPは自動化のためのプロジェクトレベルhooks（onGenerationStart、onStageTransition、onGenerationComplete、onRegression）を提供します。" },
    ],
  },
};

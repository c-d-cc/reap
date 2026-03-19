import type { Translations } from "./en";

export const ja: Translations = {
  // Nav & Sidebar
  nav: {
    getStarted: "はじめる",
    groups: {
      gettingStarted: "はじめに",
      guide: "ガイド",
      reference: "リファレンス",
      other: "その他",
    },
    items: {
      introduction: "紹介",
      quickStart: "クイックスタート",
      coreConcepts: "コアコンセプト",
      workflow: "ワークフロー",
      advanced: "上級",
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
      ["Objective", "目標、要件、完了基準の定義", "01-objective.md"],
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
      { label: "Lineage", desc: "完了したGenerationは.reap/lineage/に保管されます。レトロスペクティブがそこに蓄積されます。時間とともに圧縮されます（Level 1 → gen-XXX.md、Level 2 → epoch-XXX.md）。" },
      { label: "Four-Axis Structure", desc: ".reap/配下のすべてが4つの軸にマッピングされます：Genome（設計）、Environment（外部コンテキスト）、Life（現在のGeneration）、Lineage（過去のGeneration保管）。" },
    ],
    documentation: "ドキュメント",
    docLinks: [
      { href: "/docs/introduction", title: "紹介", desc: "REAPとは、なぜ使うのか、3-Layerモデル、Four-Axis構造。" },
      { href: "/docs/quick-start", title: "クイックスタート", desc: "インストールして最初のGenerationをステップバイステップで実行。" },
      { href: "/docs/core-concepts", title: "コアコンセプト", desc: "Genome、ライフサイクル、Backlog & Deferralの詳細。" },
      { href: "/docs/workflow", title: "ワークフロー", desc: "/reap.evolve、ステージコマンド、micro loop、hooks。" },
      { href: "/docs/cli", title: "CLIリファレンス", desc: "reap init、status、update、fixの全オプション。" },
      { href: "/docs/commands", title: "コマンドリファレンス", desc: "/reap.evolve、ステージコマンド、/reap.status — 全スラッシュコマンド。" },
      { href: "/docs/hooks", title: "Hookリファレンス", desc: "ライフサイクルhooks：commandとpromptタイプ、events、SessionStart。" },
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
      ["Objective", "目標、要件、完了基準の定義", "01-objective.md"],
      ["Planning", "タスク分解、アプローチ選択、依存関係マッピング", "02-planning.md"],
      ["Implementation", "AI + 人間の協力で実装", "03-implementation.md"],
      ["Validation", "テスト実行、完了基準の検証", "04-validation.md"],
      ["Completion", "レトロスペクティブ + Genome変更適用 + 保管", "05-completion.md"],
    ],
  },

  // Core Concepts Page
  concepts: {
    title: "コアコンセプト",
    breadcrumb: "コンセプト",
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
      ["Objective", "目標、要件、完了基準の定義", "01-objective.md"],
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
      { type: "consumed", desc: "現在のGenerationで処理完了。consumedBy: gen-XXX必須。" },
    ],
    archivingNote: "アーカイブ時、consumed項目はlineageに移動します。pending項目は次のGenerationのbacklogに繰り越されます。",
    deferralNote: "部分完了は正常です — Genome変更に依存するタスクは[deferred]とマークされ、次のGenerationに引き継がれます。",
    evolutionFlow: "Evolutionフローの例",
  },

  // Workflow Page
  workflow: {
    title: "ワークフロー",
    breadcrumb: "ワークフロー",
    intro: "Generationは REAPの基本作業単位です。各Generationは一つの目標を5つのステージを通じて遂行し、その過程で成果物を生成します。各ステージで何が起こり、どう接続されるかを見ていきます。",
    evolveTitle: "/reap.evolve — 主要な作業方法",
    evolveDesc: "ほとんどの場合、/reap.evolveを実行するとAIエージェントが全ステージを自律的に実行します。Generationの開始、各ステージの実行、ステージ間の前進、最後のアーカイブまで処理します。日常的なステージごとの確認はスキップし、エージェントが本当に行き詰まった場合（あいまいな目標、重要なトレードオフ決定、Genome衝突、予期しないエラー）にのみ停止します。",
    evolveNote: "細かい制御が必要な場合は、個別のステージコマンドを実行できます。詳細はコマンドリファレンスを参照してください。",
    stageWalkthrough: "ステージ別詳細",
    stageDetails: [
      {
        title: "1. Objective",
        desc: "このGenerationが達成する目標を定義します。AIエージェントが外部コンテキストのためにenvironmentをスキャンし、backlogで待機項目を確認し、Genome状態をチェックした後、目標を一緒に具体化します。",
        output: "01-objective.md — 目標、完了基準（最大7個、検証可能）、機能要件（最大10個）、スコープ、Genomeギャップ分析。",
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
    commands: [
      ["/reap.evolve", "Generation全体を最初から最後まで実行。日常開発の主要コマンド。全ステージを自律的にループ — 日常的な確認はスキップし、本当に行き詰まった時のみ停止。"],
      ["/reap.start", "新しいGenerationを開始。backlogで待機項目をスキャン、目標を要求、current.ymlを作成、ステージをobjectiveに設定。"],
      ["/reap.objective", "Generationの目標、要件、完了基準を定義。Environmentスキャン、backlog確認、Genome状態チェック。"],
      ["/reap.planning", "目標を依存関係のあるタスクに分解。実装計画を作成。"],
      ["/reap.implementation", "計画のタスクを実行。完了/未完了タスクとGenome発見事項を成果物に記録。"],
      ["/reap.validation", "constraints.mdの検証コマンドを実行。完了基準を確認。判定：pass / partial / fail。"],
      ["/reap.completion", "レトロスペクティブ、backlogのGenome変更を適用、整理、最終化。"],
      ["/reap.next", "次のライフサイクルステージに前進。テンプレートから次の成果物を作成。完了時にアーカイブ。"],
      ["/reap.back", "前のステージに回帰（micro loop）。回帰理由をタイムラインと成果物に記録。"],
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
      ["strict", "Strictモードを有効にしてコード変更を制限（下記参照）"],
      ["language", "成果物とユーザーインタラクションの言語（例：korean、english、japanese）"],
      ["autoUpdate", "セッション開始時の自動アップデート（デフォルト：false）"],
      ["agents", "検出されたAIエージェント、reap init/updateで管理（例：claude-code、opencode）"],
      ["hooks", "ライフサイクルhooks（Hookリファレンス参照）"],
    ],
    strictMode: "Strictモード",
    strictModeDesc: "strict: trueに設定すると、AIエージェントはREAPワークフロー外でコードを変更できなくなります。これにより、すべての変更が構造化されたライフサイクルを経ることが保証されます。",
    strictHeaders: ["状況", "動作"],
    strictRules: [
      ["アクティブGenerationなし / Implementationステージ以外", "コード変更は完全にブロック"],
      ["Implementationステージ", "02-planning.mdの範囲内の変更のみ許可"],
      ["エスケープハッチ", "ユーザーが明示的に「override」または「bypass strict」を要求すると変更許可"],
    ],
    strictNote: "Strictモードはデフォルトで無効です。ファイルの読み取り、コード分析、質問への回答はstrictモードに関係なく常に許可されます。",
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
      ["Level 1", "Generationフォルダ（成果物5個）", "gen-XXX.md", "40", "lineage > 5,000行 + 5個以上のGeneration"],
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

  // Comparison Page
  comparison: {
    title: "比較",
    breadcrumb: "リファレンス",
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

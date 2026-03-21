import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { readTextFile } from "../../../core/fs";
import { emitOutput } from "../../../core/run-output";
import { formatVersionLine } from "../../../core/version";

const SUPPORTED_LANGUAGES = ["en", "ko", "ja", "zh-CN"] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const REAP_INTRO: Record<SupportedLanguage, string> = {
  en: "REAP (Recursive Evolutionary Autonomous Pipeline) — A development pipeline that evolves software generation by generation through AI+Human collaboration.",
  ko: "REAP (Recursive Evolutionary Autonomous Pipeline) — AI+Human 협업으로 소프트웨어를 세대 단위로 진화시키는 개발 파이프라인.",
  ja: "REAP (Recursive Evolutionary Autonomous Pipeline) — AI+Humanの協業でソフトウェアを世代単位で進化させる開発パイプライン。",
  "zh-CN":
    "REAP (Recursive Evolutionary Autonomous Pipeline) — 通过AI+Human协作，以世代为单位进化软件的开发管道。",
};

const COMMAND_DESCRIPTIONS: Record<string, Record<SupportedLanguage, string>> = {
  "/reap.start": {
    en: "Start a new Generation and set the goal",
    ko: "새 Generation을 시작하고 goal을 설정",
    ja: "新しいGenerationを開始し、ゴールを設定",
    "zh-CN": "开始新的Generation并设定目标",
  },
  "/reap.evolve": {
    en: "Run the entire lifecycle autonomously",
    ko: "전체 lifecycle을 자율적으로 실행",
    ja: "ライフサイクル全体を自律的に実行",
    "zh-CN": "自主运行整个生命周期",
  },
  "/reap.objective": {
    en: "Define goals, requirements, and completion criteria",
    ko: "목표, 요구사항, 완료 기준을 정의",
    ja: "目標、要件、完了基準を定義",
    "zh-CN": "定义目标、需求和完成标准",
  },
  "/reap.planning": {
    en: "Decompose tasks and create an implementation plan",
    ko: "태스크를 분해하고 구현 계획을 수립",
    ja: "タスクを分解し、実装計画を策定",
    "zh-CN": "分解任务并制定实施计划",
  },
  "/reap.implementation": {
    en: "Implement code according to the plan",
    ko: "계획에 따라 코드를 구현",
    ja: "計画に従ってコードを実装",
    "zh-CN": "按照计划实现代码",
  },
  "/reap.validation": {
    en: "Run tests and verify completion criteria are met",
    ko: "테스트 실행, 완료 기준 충족 여부를 검증",
    ja: "テストを実行し、完了基準の充足を検証",
    "zh-CN": "运行测试，验证是否满足完成标准",
  },
  "/reap.completion": {
    en: "Retrospective, apply Genome changes, finalize Generation",
    ko: "회고, Genome 변경 반영, Generation 마무리",
    ja: "振り返り、Genome変更を反映、Generationを完了",
    "zh-CN": "回顾，应用Genome变更，完成Generation",
  },
  "/reap.next": {
    en: "Advance to the next stage",
    ko: "다음 stage로 전진",
    ja: "次のステージへ進む",
    "zh-CN": "进入下一阶段",
  },
  "/reap.back": {
    en: "Return to the previous stage",
    ko: "이전 stage로 회귀",
    ja: "前のステージへ戻る",
    "zh-CN": "返回上一阶段",
  },
  "/reap.status": {
    en: "Show project status",
    ko: "프로젝트 상태 표시",
    ja: "プロジェクトの状態を表示",
    "zh-CN": "显示项目状态",
  },
  "/reap.config": {
    en: "Show current project settings",
    ko: "현재 프로젝트 설정 표시",
    ja: "現在のプロジェクト設定を表示",
    "zh-CN": "显示当前项目设置",
  },
  "/reap.sync": {
    en: "Synchronize Genome/Environment",
    ko: "Genome/Environment 동기화",
    ja: "Genome/Environmentを同期",
    "zh-CN": "同步Genome/Environment",
  },
  "/reap.update": {
    en: "Check for latest REAP version and upgrade",
    ko: "REAP 최신 버전 확인 및 업그레이드",
    ja: "REAP最新バージョンの確認とアップグレード",
    "zh-CN": "检查REAP最新版本并升级",
  },
  "/reap.help": {
    en: "Help",
    ko: "도움말",
    ja: "ヘルプ",
    "zh-CN": "帮助",
  },
  "/reap.push": {
    en: "Validate REAP state + git push",
    ko: "REAP 상태 검증 + git push",
    ja: "REAP状態検証 + git push",
    "zh-CN": "验证REAP状态 + git push",
  },
  "/reap.report": {
    en: "Bug/issue report",
    ko: "버그/이슈 리포트",
    ja: "バグ/イシューレポート",
    "zh-CN": "Bug/问题报告",
  },
};

const TOPICS_LINE: Record<SupportedLanguage, string> = {
  en: "Topics: workflow, lifecycle, genome, backlog, strict, agents, hooks, config, evolve, regression, minor-fix, compression, merge, collaboration, start, objective, planning, implementation, validation, completion, next, back, sync, status, update, help, pull, push, abort, report",
  ko: "Topics: workflow, lifecycle, genome, backlog, strict, agents, hooks, config, evolve, regression, minor-fix, compression, merge, collaboration, start, objective, planning, implementation, validation, completion, next, back, sync, status, update, help, pull, push, abort, report",
  ja: "Topics: workflow, lifecycle, genome, backlog, strict, agents, hooks, config, evolve, regression, minor-fix, compression, merge, collaboration, start, objective, planning, implementation, validation, completion, next, back, sync, status, update, help, pull, push, abort, report",
  "zh-CN":
    "Topics: workflow, lifecycle, genome, backlog, strict, agents, hooks, config, evolve, regression, minor-fix, compression, merge, collaboration, start, objective, planning, implementation, validation, completion, next, back, sync, status, update, help, pull, push, abort, report",
};

const CONFIG_LINE: Record<SupportedLanguage, string> = {
  en: "Settings: /reap.config",
  ko: "설정 확인: /reap.config",
  ja: "設定確認: /reap.config",
  "zh-CN": "查看设置: /reap.config",
};

const LANGUAGE_ALIASES: Record<string, SupportedLanguage> = {
  korean: "ko", english: "en", japanese: "ja", chinese: "zh-CN",
};

function detectLanguage(configContent: string | null): string | null {
  const raw = configContent?.match(/language:\s*(\S+)/)?.[1] ?? null;
  if (raw && raw in LANGUAGE_ALIASES) return LANGUAGE_ALIASES[raw];
  return raw;
}

function isSupportedLanguage(lang: string | null): lang is SupportedLanguage {
  return lang !== null && (SUPPORTED_LANGUAGES as readonly string[]).includes(lang);
}

function buildCommandTable(lang: SupportedLanguage): string[] {
  return [
    "| Command | Description |",
    "|---------|-------------|",
    ...Object.entries(COMMAND_DESCRIPTIONS).map(
      ([cmd, descs]) => `| \`${cmd}\` | ${descs[lang]} |`,
    ),
  ];
}

function buildLines(
  versionDisplay: string,
  lang: SupportedLanguage,
  stateDisplay: string,
): string[] {
  return [
    versionDisplay,
    REAP_INTRO[lang],
    "",
    stateDisplay,
    "",
    ...buildCommandTable(lang),
    "",
    TOPICS_LINE[lang],
    "Usage: REAP_HELP_TOPIC=<topic> reap run help",
    CONFIG_LINE[lang],
  ];
}

export async function execute(paths: ReapPaths): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  // Read config
  const configContent = await readTextFile(paths.config);
  const configVersion = configContent?.match(/version:\s*([\d.]+)/)?.[1] ?? "0.0.0";
  const autoUpdate = configContent?.match(/autoUpdate:\s*(true|false)/)?.[1] === "true";
  const versionDisplay = formatVersionLine(configVersion, !autoUpdate);

  // Determine language from config
  const rawLang = detectLanguage(configContent);
  const supported = isSupportedLanguage(rawLang);
  const lang: SupportedLanguage = supported ? rawLang : "en";

  // Determine topic from REAP_HELP_TOPIC env var
  const topic = process.env.REAP_HELP_TOPIC;

  const stateDisplay = state?.id
    ? `Active: **${state.id}** — ${state.goal} (Stage: ${state.stage})`
    : "No active Generation → `/reap.start` or `/reap.evolve`";

  const lines = buildLines(versionDisplay, lang, stateDisplay);

  if (topic) {
    // Topic mode: AI needs to look up and explain the topic
    emitOutput({
      status: "prompt",
      command: "help",
      phase: "respond",
      completed: ["gate", "context-collect"],
      context: { topic },
      message: lines.join("\n"),
      prompt: [
        `Topic requested: "${topic}".`,
        "Look up from known topics: workflow/lifecycle, genome, backlog, strict, agents, hooks, config, evolve, regression, minor-fix, compression, merge/collaboration.",
        "Command topics: read `reap.{name}.md` from `~/.reap/commands/` or template commands directory, then explain.",
        "If the topic is NOT known: respond 'Unknown topic'.",
      ].join("\n"),
    });
  } else if (!supported && rawLang !== null) {
    // Unsupported language: delegate translation to AI
    emitOutput({
      status: "prompt",
      command: "help",
      phase: "respond",
      completed: ["gate", "context-collect"],
      message: lines.join("\n"),
      prompt: [
        `The user's configured language is "${rawLang}", which is not natively supported.`,
        "Below is the help message in English. Translate the descriptions and intro text to the target language.",
        "Keep command names (e.g. /reap.start) and topic names in English.",
        `Target language: ${rawLang}`,
      ].join("\n"),
    });
  } else {
    // Supported language (or default en): just print the message
    emitOutput({
      status: "ok",
      command: "help",
      phase: "respond",
      completed: ["gate", "context-collect"],
      message: lines.join("\n"),
    });
  }
}

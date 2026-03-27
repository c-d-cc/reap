import { join } from "path";
import { createPaths } from "../../core/paths.js";
import { GenerationManager } from "../../core/generation.js";
import { readTextFile } from "../../core/fs.js";
import { emitOutput } from "../../core/output.js";

// ── Supported Languages ────────────────────────────────────

export const SUPPORTED_LANGUAGES = ["en", "ko", "ja", "zh-CN"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_ALIASES: Record<string, SupportedLanguage> = {
  korean: "ko",
  english: "en",
  japanese: "ja",
  chinese: "zh-CN",
};

// ── Multilingual Maps ──────────────────────────────────────

export const REAP_INTRO: Record<SupportedLanguage, string> = {
  en: "REAP (Recursive Evolutionary Autonomous Pipeline) — A development pipeline that evolves software generation by generation through AI+Human collaboration.",
  ko: "REAP (Recursive Evolutionary Autonomous Pipeline) — AI+Human 협업으로 소프트웨어를 세대 단위로 진화시키는 개발 파이프라인.",
  ja: "REAP (Recursive Evolutionary Autonomous Pipeline) — AI+Humanの協業でソフトウェアを世代単位で進化させる開発パイプライン。",
  "zh-CN": "REAP (Recursive Evolutionary Autonomous Pipeline) — 通过AI+Human协作，以世代为单位进化软件的开发管道。",
};

export const COMMAND_DESCRIPTIONS: Record<string, Record<SupportedLanguage, string>> = {
  "/reap.evolve": {
    en: "Run the entire lifecycle autonomously (recommended)",
    ko: "전체 lifecycle을 자율적으로 실행 (권장)",
    ja: "ライフサイクル全体を自律的に実行（推奨）",
    "zh-CN": "自主运行整个生命周期（推荐）",
  },
  "/reap.start": {
    en: "Start a new Generation and set the goal",
    ko: "새 Generation을 시작하고 goal을 설정",
    ja: "新しいGenerationを開始し、ゴールを設定",
    "zh-CN": "开始新的Generation并设定目标",
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
  "/reap.abort": {
    en: "Abort current generation (2-phase)",
    ko: "현재 generation 중단 (2단계)",
    ja: "現在のGenerationを中止（2段階）",
    "zh-CN": "中止当前Generation（两阶段）",
  },
  "/reap.knowledge": {
    en: "Manage genome, environment, context",
    ko: "Genome, environment, context 관리",
    ja: "Genome、environment、contextを管理",
    "zh-CN": "管理Genome、environment、context",
  },
  "/reap.init": {
    en: "Initialize REAP in a project",
    ko: "프로젝트에 REAP 초기화",
    ja: "プロジェクトにREAPを初期化",
    "zh-CN": "在项目中初始化REAP",
  },
  "/reap.config": {
    en: "View/edit project configuration",
    ko: "프로젝트 설정 조회/편집",
    ja: "プロジェクト設定の表示/編集",
    "zh-CN": "查看/编辑项目设置",
  },
  "/reap.status": {
    en: "Check current generation state",
    ko: "현재 generation 상태 확인",
    ja: "現在のGeneration状態を確認",
    "zh-CN": "查看当前Generation状态",
  },
  "/reap.merge": {
    en: "Merge lifecycle for parallel branches",
    ko: "병렬 브랜치 merge lifecycle",
    ja: "並列ブランチのmergeライフサイクル",
    "zh-CN": "并行分支的merge生命周期",
  },
  "/reap.pull": {
    en: "Fetch remote + detect merge opportunities",
    ko: "원격 fetch + merge 기회 감지",
    ja: "リモートfetch + mergeの機会を検出",
    "zh-CN": "获取远程 + 检测merge机会",
  },
  "/reap.push": {
    en: "Validate state + push to remote",
    ko: "상태 검증 + 원격 push",
    ja: "状態検証 + リモートpush",
    "zh-CN": "验证状态 + 推送到远程",
  },
  "/reap.update": {
    en: "Upgrade project structure",
    ko: "프로젝트 구조 업그레이드",
    ja: "プロジェクト構造をアップグレード",
    "zh-CN": "升级项目结构",
  },
  "/reap.help": {
    en: "Show help and topics",
    ko: "도움말 및 토픽 표시",
    ja: "ヘルプとトピックを表示",
    "zh-CN": "显示帮助和主题",
  },
};

const TOPICS_LABEL: Record<SupportedLanguage, string> = {
  en: "Topics",
  ko: "Topics",
  ja: "Topics",
  "zh-CN": "Topics",
};

const TOPICS_LIST = "workflow, lifecycle, genome, backlog, agents, hooks, config, evolve, regression, minor-fix, compression, merge, collaboration, maturity, memory, vision";

const TOPICS_USAGE: Record<SupportedLanguage, string> = {
  en: "Usage: /reap.help <topic>",
  ko: "사용법: /reap.help <topic>",
  ja: "使い方: /reap.help <topic>",
  "zh-CN": "用法: /reap.help <topic>",
};

const CONFIG_LINE: Record<SupportedLanguage, string> = {
  en: "Settings: /reap.config",
  ko: "설정 확인: /reap.config",
  ja: "設定確認: /reap.config",
  "zh-CN": "查看设置: /reap.config",
};

const NO_ACTIVE_GEN: Record<SupportedLanguage, string> = {
  en: "No active Generation → `/reap.start` or `/reap.evolve`",
  ko: "활성 Generation 없음 → `/reap.start` 또는 `/reap.evolve`",
  ja: "アクティブなGenerationなし → `/reap.start` または `/reap.evolve`",
  "zh-CN": "无活跃的Generation → `/reap.start` 或 `/reap.evolve`",
};

// ── Helper Functions (exported for testing) ────────────────

export function detectLanguage(configContent: string | null): string | null {
  const raw = configContent?.match(/language:\s*(\S+)/)?.[1] ?? null;
  if (raw && raw in LANGUAGE_ALIASES) return LANGUAGE_ALIASES[raw];
  return raw;
}

export function isSupportedLanguage(lang: string | null): lang is SupportedLanguage {
  return lang !== null && (SUPPORTED_LANGUAGES as readonly string[]).includes(lang);
}

export function buildCommandTable(lang: SupportedLanguage): string[] {
  return [
    "| Command | Description |",
    "|---------|-------------|",
    ...Object.entries(COMMAND_DESCRIPTIONS).map(
      ([cmd, descs]) => `| \`${cmd}\` | ${descs[lang]} |`,
    ),
  ];
}

export function buildStateDisplay(
  state: { id: string; goal: string; stage: string } | null,
  lang: SupportedLanguage,
): string {
  if (state?.id) {
    return `Active: **${state.id}** — ${state.goal} (Stage: ${state.stage})`;
  }
  return NO_ACTIVE_GEN[lang];
}

export function buildHelpLines(
  lang: SupportedLanguage,
  stateDisplay: string,
): string[] {
  return [
    REAP_INTRO[lang],
    "",
    stateDisplay,
    "",
    ...buildCommandTable(lang),
    "",
    `${TOPICS_LABEL[lang]}: ${TOPICS_LIST}`,
    TOPICS_USAGE[lang],
    CONFIG_LINE[lang],
  ];
}

// ── Main Execute ───────────────────────────────────────────

export async function execute(topic?: string): Promise<void> {
  const paths = createPaths(process.cwd());

  // Read config for language
  const configContent = await readTextFile(paths.config);
  const rawLang = detectLanguage(configContent);
  const supported = isSupportedLanguage(rawLang);
  const lang: SupportedLanguage = supported ? rawLang : "en";

  // Read current generation state
  const gm = new GenerationManager(paths);
  const state = await gm.current();
  const stateDisplay = buildStateDisplay(state, lang);

  const lines = buildHelpLines(lang, stateDisplay);

  if (topic) {
    // Topic mode: read reap-guide.md for REAP knowledge context
    const reapGuidePath = join(paths.reap, "reap-guide.md");
    const reapGuide = await readTextFile(reapGuidePath) ?? "";

    emitOutput({
      status: "prompt",
      command: "help",
      context: { topic, reapGuide, language: lang },
      message: lines.join("\n"),
      prompt: [
        `Topic requested: "${topic}".`,
        `Explain the topic using the reapGuide content in context as the primary knowledge source.`,
        `If the topic is not found in the guide, respond with 'Unknown topic: ${topic}'.`,
        `Respond in ${rawLang ?? "English"}.`,
      ].join("\n"),
    });
  } else if (!supported && rawLang !== null) {
    // Unsupported language: delegate translation to AI
    emitOutput({
      status: "prompt",
      command: "help",
      context: { language: rawLang },
      message: lines.join("\n"),
      prompt: [
        `The user's configured language is "${rawLang}", which is not natively supported.`,
        "Below is the help message in English. Translate the descriptions and intro text to the target language.",
        "Keep command names (e.g. /reap.start) and topic names in English.",
        `Target language: ${rawLang}`,
      ].join("\n"),
    });
  } else {
    // Supported language: just output
    emitOutput({
      status: "ok",
      command: "help",
      context: {},
      message: lines.join("\n"),
    });
  }
}

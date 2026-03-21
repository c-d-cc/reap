import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { readTextFile } from "../../../core/fs";
import { emitOutput } from "../../../core/run-output";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  // Read config
  const configContent = await readTextFile(paths.config);

  // Parse config values
  const strict = configContent?.match(/strict:\s*(true|false)/)?.[1] === "true" ? "on" : "off";
  const autoUpdate = configContent?.match(/autoUpdate:\s*(true|false)/)?.[1] === "true" ? "on" : "off";
  const language = configContent?.match(/language:\s*(\w+)/)?.[1] ?? "ko";

  // Determine topic from REAP_HELP_TOPIC env var (set by AI before calling)
  const topic = process.env.REAP_HELP_TOPIC;

  emitOutput({
    status: "prompt",
    command: "help",
    phase: "respond",
    completed: ["gate", "context-collect"],
    context: {
      hasActiveGeneration: !!(state && state.id),
      generationId: state?.id,
      goal: state?.goal,
      stage: state?.stage,
      config: { strict, autoUpdate, language },
      topic: topic || null,
    },
    prompt: [
      "## Help — Contextual Help",
      "",
      topic
        ? `Topic requested: "${topic}". Look up the topic from the known topics list below.`
        : "No specific topic. Show the basic help overview.",
      "",
      "### Basic Help (no topic)",
      "Show REAP overview, current state, and command table.",
      state?.id
        ? `> Current: **${state.id}** — ${state.goal} (Stage: ${state.stage})`
        : "> No active Generation -> `/reap.start` or `/reap.evolve`",
      "",
      "### Command Table",
      "| Command | Description |",
      "|---------|-------------|",
      "| `/reap.start` | 새 Generation을 시작하고 goal을 설정 |",
      "| `/reap.evolve` | 전체 lifecycle을 자율적으로 실행 |",
      "| `/reap.objective` | 목표, 요구사항, 완료 기준을 정의 |",
      "| `/reap.planning` | 태스크를 분해하고 구현 계획을 수립 |",
      "| `/reap.implementation` | 계획에 따라 코드를 구현 |",
      "| `/reap.validation` | 테스트 실행, 완료 기준 충족 여부를 검증 |",
      "| `/reap.completion` | 회고, Genome 변경 반영, Generation 마무리 |",
      "| `/reap.next` | 다음 stage로 전진 |",
      "| `/reap.back` | 이전 stage로 회귀 |",
      "| `/reap.status` | 프로젝트 상태 표시 |",
      "| `/reap.sync` | Genome/Environment 동기화 |",
      "| `/reap.update` | REAP 최신 버전 확인 및 업그레이드 |",
      "| `/reap.help` | 도움말 |",
      "| `/reap.push` | REAP 상태 검증 + git push |",
      "| `/reap.report` | 버그/이슈 리포트 |",
      "",
      `Config: Strict: ${strict} | Auto-Update: ${autoUpdate} | Language: ${language}`,
      "",
      "### Topic Help",
      "If a topic is provided, look up from these known topics:",
      "- workflow/lifecycle, genome, backlog, strict, agents, hooks, config, evolve, regression, minor-fix, compression, merge/collaboration, author",
      "- Command topics: start, objective, planning, implementation, validation, completion, next, back, sync, status, update, help, pull, push, merge.*",
      "",
      "For command-name topics: read `reap.{name}.md` from `~/.reap/commands/` or the template commands directory, then explain.",
      "If the topic is NOT in the list: respond 'Unknown topic'.",
    ].join("\n"),
  });
}

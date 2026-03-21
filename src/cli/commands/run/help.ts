import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { readTextFile } from "../../../core/fs";
import { emitOutput } from "../../../core/run-output";
import { formatVersionLine } from "../../../core/version";

export async function execute(paths: ReapPaths): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  // Read config
  const configContent = await readTextFile(paths.config);
  const configVersion = configContent?.match(/version:\s*([\d.]+)/)?.[1] ?? "0.0.0";
  const autoUpdate = configContent?.match(/autoUpdate:\s*(true|false)/)?.[1] === "true";
  const versionDisplay = formatVersionLine(configVersion, !autoUpdate);

  // Determine topic from REAP_HELP_TOPIC env var
  const topic = process.env.REAP_HELP_TOPIC;

  // Build display message (shown directly to user, no AI interpretation needed)
  const lines: string[] = [
    versionDisplay,
    "REAP (Recursive Evolutionary Autonomous Pipeline) — AI+Human 협업으로 소프트웨어를 세대 단위로 진화시키는 개발 파이프라인.",
    "",
    state?.id
      ? `Active: **${state.id}** — ${state.goal} (Stage: ${state.stage})`
      : "No active Generation → `/reap.start` or `/reap.evolve`",
    "",
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
    "| `/reap.config` | 현재 프로젝트 설정 표시 |",
    "| `/reap.sync` | Genome/Environment 동기화 |",
    "| `/reap.update` | REAP 최신 버전 확인 및 업그레이드 |",
    "| `/reap.help` | 도움말 |",
    "| `/reap.push` | REAP 상태 검증 + git push |",
    "| `/reap.report` | 버그/이슈 리포트 |",
    "",
    "Topics: workflow, lifecycle, genome, backlog, strict, agents, hooks, config, evolve, regression, minor-fix, compression, merge, collaboration, start, objective, planning, implementation, validation, completion, next, back, sync, status, update, help, pull, push, abort, report",
    "Usage: REAP_HELP_TOPIC=<topic> reap run help",
  ];

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
  } else {
    // No topic: just print the message, no AI work needed
    emitOutput({
      status: "ok",
      command: "help",
      phase: "respond",
      completed: ["gate", "context-collect"],
      message: lines.join("\n"),
    });
  }
}

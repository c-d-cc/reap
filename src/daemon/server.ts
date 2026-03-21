/**
 * Daemon Server — Unix Domain Socket 기반 lifecycle 오케스트레이터
 *
 * 기능:
 * - UDS 서버 시작/종료
 * - 클라이언트 연결 수락
 * - Stage prompt 전송 → 클라이언트 응답 수신 → stage 전환
 * - current.yml 기반 idempotent resume
 * - Graceful shutdown (SIGTERM/SIGINT, onCompleted auto-stop)
 * - Parent PID 모니터링 (orphan 방지)
 * - Idle timeout (클라이언트 0개 시 자동 종료)
 */

import { createServer, type Server, type Socket } from "net";
import type { LifeCycleStage } from "../types";
import { LIFECYCLE_ORDER } from "../types";
import {
  type DaemonMessage,
  type ClientMessage,
  encodeMessage,
  MessageParser,
} from "./protocol";
import {
  getDaemonPaths,
  writePidFile,
  removePidFile,
  cleanupStaleSock,
  isDaemonRunning,
  type DaemonPaths,
} from "./pid";

// ── Stage Prompts ───────────────────────────────────────────

const STAGE_PROMPTS: Record<LifeCycleStage, string> = {
  objective:
    "01-objective.md 아티팩트를 작성하세요. Goal, Completion Criteria, Requirements를 정의한 후 stage-done 메시지를 보내세요.",
  planning:
    "02-planning.md 아티팩트를 작성하세요. Summary, Tasks, Dependencies를 정의한 후 stage-done 메시지를 보내세요.",
  implementation:
    "계획에 따라 구현하세요. 완료 후 stage-done 메시지를 보내세요.",
  validation:
    "구현 결과를 검증하세요 (bun test, bunx tsc --noEmit). 검증 완료 후 stage-done 메시지를 보내세요.",
  completion:
    "05-completion.md 아티팩트를 작성하세요. Summary, Retrospective, Genome Changes를 기록한 후 stage-done 메시지를 보내세요.",
};

// ── Server Options ──────────────────────────────────────────

export interface DaemonServerOptions {
  lifeDir: string;           // .reap/life/ 경로
  initialStage?: LifeCycleStage;  // resume 시 시작 stage
  parentPid?: number;        // 부모 프로세스 PID (orphan 방지)
  idleTimeoutMs?: number;    // 클라이언트 0개 시 자동 종료 타임아웃 (ms)
  onStageAdvanced?: (from: LifeCycleStage, to: LifeCycleStage) => void;
  onCompleted?: () => void;
  onError?: (err: Error) => void;
  onStopped?: () => void;    // stop 완료 후 콜백 (테스트용)
}

// ── Server State ────────────────────────────────────────────

export interface DaemonServerState {
  currentStage: LifeCycleStage;
  isRunning: boolean;
  connectedClients: number;
}

// ── Daemon Server ───────────────────────────────────────────

export class DaemonServer {
  private server: Server | null = null;
  private clients: Set<Socket> = new Set();
  private currentStage: LifeCycleStage;
  private daemonPaths: DaemonPaths;
  private isRunning = false;
  private opts: DaemonServerOptions;

  // Graceful shutdown
  private signalHandler: (() => void) | null = null;

  // Parent PID monitoring
  private parentPidInterval: ReturnType<typeof setInterval> | null = null;

  // Idle timeout
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(opts: DaemonServerOptions) {
    this.opts = opts;
    this.currentStage = opts.initialStage ?? "objective";
    this.daemonPaths = getDaemonPaths(opts.lifeDir);
  }

  /** 서버 시작 */
  async start(): Promise<void> {
    // 이미 실행 중인 daemon 확인
    if (await isDaemonRunning(this.daemonPaths)) {
      throw new Error("Daemon is already running for this generation.");
    }

    // Stale 소켓 정리
    await cleanupStaleSock(this.daemonPaths.sockFile);

    return new Promise((resolve, reject) => {
      this.server = createServer((socket) => this.handleConnection(socket));

      this.server.on("error", (err) => {
        this.opts.onError?.(err);
        reject(err);
      });

      this.server.listen(this.daemonPaths.sockFile, async () => {
        this.isRunning = true;
        await writePidFile(this.daemonPaths.pidFile, process.pid);

        // SIGTERM/SIGINT 핸들러 등록
        this.registerSignalHandlers();

        // Parent PID 모니터링 시작
        this.startParentPidMonitor();

        // 초기 idle timeout 시작 (클라이언트 0개 상태)
        this.resetIdleTimer();

        resolve();
      });
    });
  }

  /** 서버 종료 */
  async stop(): Promise<void> {
    if (!this.isRunning) return;
    this.isRunning = false;

    // Signal 핸들러 해제
    this.removeSignalHandlers();

    // Parent PID 모니터 해제
    this.stopParentPidMonitor();

    // Idle timer 해제
    this.clearIdleTimer();

    // 모든 클라이언트 연결 종료
    for (const client of this.clients) {
      client.destroy();
    }
    this.clients.clear();

    // 서버 종료
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => resolve());
      });
      this.server = null;
    }

    // PID/sock 파일 정리
    await removePidFile(this.daemonPaths.pidFile);
    await cleanupStaleSock(this.daemonPaths.sockFile);

    // stop 완료 콜백
    this.opts.onStopped?.();
  }

  /** 현재 상태 조회 */
  getState(): DaemonServerState {
    return {
      currentStage: this.currentStage,
      isRunning: this.isRunning,
      connectedClients: this.clients.size,
    };
  }

  // ── Signal Handlers ─────────────────────────────────────

  private registerSignalHandlers(): void {
    this.signalHandler = () => {
      this.stop().catch(() => {});
    };
    process.on("SIGTERM", this.signalHandler);
    process.on("SIGINT", this.signalHandler);
  }

  private removeSignalHandlers(): void {
    if (this.signalHandler) {
      process.removeListener("SIGTERM", this.signalHandler);
      process.removeListener("SIGINT", this.signalHandler);
      this.signalHandler = null;
    }
  }

  // ── Parent PID Monitoring ───────────────────────────────

  private startParentPidMonitor(): void {
    const parentPid = this.opts.parentPid;
    if (parentPid == null) return;

    this.parentPidInterval = setInterval(() => {
      if (!this.isParentAlive(parentPid)) {
        this.stop().catch(() => {});
      }
    }, 5000);

    // interval이 프로세스 종료를 막지 않도록 unref
    this.parentPidInterval.unref();
  }

  private stopParentPidMonitor(): void {
    if (this.parentPidInterval) {
      clearInterval(this.parentPidInterval);
      this.parentPidInterval = null;
    }
  }

  /** 부모 프로세스 생존 확인 — 테스트에서 override 가능하도록 분리 */
  protected isParentAlive(pid: number): boolean {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }

  // ── Idle Timeout ────────────────────────────────────────

  private resetIdleTimer(): void {
    this.clearIdleTimer();

    const timeoutMs = this.opts.idleTimeoutMs;
    if (timeoutMs == null || timeoutMs <= 0) return;

    // 클라이언트가 있으면 타이머 시작하지 않음
    if (this.clients.size > 0) return;

    this.idleTimer = setTimeout(() => {
      if (this.isRunning && this.clients.size === 0) {
        this.stop().catch(() => {});
      }
    }, timeoutMs);

    // timer가 프로세스 종료를 막지 않도록 unref
    this.idleTimer.unref();
  }

  private clearIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  // ── Connection Handling ─────────────────────────────────

  /** 클라이언트 연결 핸들러 */
  private handleConnection(socket: Socket): void {
    this.clients.add(socket);
    const parser = new MessageParser();

    // 새 클라이언트 연결 시 idle timer 취소
    this.clearIdleTimer();

    // 연결 즉시 현재 stage prompt 전송
    this.sendStagePrompt(socket);

    socket.on("data", (data) => {
      const messages = parser.feed(data.toString());
      for (const msg of messages) {
        this.handleClientMessage(socket, msg as ClientMessage);
      }
    });

    socket.on("close", () => {
      this.clients.delete(socket);
      // 클라이언트가 0이 되면 idle timer 시작
      if (this.clients.size === 0) {
        this.resetIdleTimer();
      }
    });

    socket.on("error", () => {
      this.clients.delete(socket);
      if (this.clients.size === 0) {
        this.resetIdleTimer();
      }
    });
  }

  /** 클라이언트 메시지 처리 */
  private handleClientMessage(socket: Socket, msg: ClientMessage): void {
    switch (msg.type) {
      case "stage-done":
        this.handleStageDone(socket);
        break;

      case "heartbeat":
        // heartbeat 응답 — 현재 상태 전송
        this.sendMessage(socket, {
          type: "stage-prompt",
          stage: this.currentStage,
          context: { heartbeat: true },
        });
        break;

      case "request-back":
        this.handleRequestBack(socket);
        break;

      case "register":
        // PoC에서는 등록만 확인하고 stage prompt 재전송
        this.sendStagePrompt(socket);
        break;

      default:
        this.sendMessage(socket, {
          type: "error",
          error: `Unknown message type: ${msg.type}`,
        });
    }
  }

  /** Stage 완료 처리 → 다음 stage로 전환 */
  private handleStageDone(socket: Socket): void {
    const currentIdx = LIFECYCLE_ORDER.indexOf(this.currentStage);

    if (this.currentStage === "completion") {
      // Generation 완료
      this.broadcastMessage({ type: "completed", stage: "completion" });
      this.opts.onCompleted?.();
      // Auto-stop after completion
      this.stop().catch(() => {});
      return;
    }

    const nextStage = LIFECYCLE_ORDER[currentIdx + 1];
    if (!nextStage) {
      this.sendMessage(socket, {
        type: "error",
        error: `Cannot advance from ${this.currentStage}`,
      });
      return;
    }

    const prevStage = this.currentStage;
    this.currentStage = nextStage;

    // 전환 알림
    this.broadcastMessage({
      type: "stage-advanced",
      stage: nextStage,
      context: { from: prevStage },
    });

    this.opts.onStageAdvanced?.(prevStage, nextStage);

    // 새 stage prompt 전송
    this.broadcastStagePrompt();
  }

  /** 회귀 요청 처리 */
  private handleRequestBack(socket: Socket): void {
    const currentIdx = LIFECYCLE_ORDER.indexOf(this.currentStage);
    if (currentIdx <= 0) {
      this.sendMessage(socket, {
        type: "error",
        error: "Cannot go back from objective stage.",
      });
      return;
    }

    const prevStage = LIFECYCLE_ORDER[currentIdx - 1];
    const fromStage = this.currentStage;
    this.currentStage = prevStage;

    this.broadcastMessage({
      type: "stage-advanced",
      stage: prevStage,
      context: { from: fromStage, regression: true },
    });

    this.broadcastStagePrompt();
  }

  /** 특정 클라이언트에 stage prompt 전송 */
  private sendStagePrompt(socket: Socket): void {
    this.sendMessage(socket, {
      type: "stage-prompt",
      stage: this.currentStage,
      prompt: STAGE_PROMPTS[this.currentStage],
    });
  }

  /** 모든 클라이언트에 stage prompt 전송 */
  private broadcastStagePrompt(): void {
    this.broadcastMessage({
      type: "stage-prompt",
      stage: this.currentStage,
      prompt: STAGE_PROMPTS[this.currentStage],
    });
  }

  /** 특정 클라이언트에 메시지 전송 */
  private sendMessage(socket: Socket, msg: DaemonMessage): void {
    if (!socket.destroyed) {
      socket.write(encodeMessage(msg));
    }
  }

  /** 모든 클라이언트에 메시지 브로드캐스트 */
  private broadcastMessage(msg: DaemonMessage): void {
    const encoded = encodeMessage(msg);
    for (const client of this.clients) {
      if (!client.destroyed) {
        client.write(encoded);
      }
    }
  }
}

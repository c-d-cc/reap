/**
 * Daemon Client — UDS 소켓을 통해 daemon과 통신하는 클라이언트
 *
 * PoC 범위:
 * - daemon에 연결
 * - stage prompt 수신
 * - stage 완료 보고
 * - heartbeat
 */

import { connect, type Socket } from "net";
import type { LifeCycleStage } from "../types";
import {
  type DaemonMessage,
  type ClientMessage,
  type ClientMessageType,
  encodeMessage,
  MessageParser,
} from "./protocol";
import { getDaemonPaths, isDaemonRunning } from "./pid";

// ── Client Options ──────────────────────────────────────────

export interface DaemonClientOptions {
  lifeDir: string;        // .reap/life/ 경로
  clientId?: string;      // 클라이언트 식별자
  role?: string;          // multi-subagent 역할
  onPrompt?: (stage: LifeCycleStage, prompt: string) => void;
  onStageAdvanced?: (stage: LifeCycleStage, context?: Record<string, unknown>) => void;
  onCompleted?: () => void;
  onError?: (err: Error) => void;
}

// ── Daemon Client ───────────────────────────────────────────

export class DaemonClient {
  private socket: Socket | null = null;
  private parser = new MessageParser();
  private opts: DaemonClientOptions;
  private connected = false;

  constructor(opts: DaemonClientOptions) {
    this.opts = opts;
  }

  /** Daemon에 연결 */
  async connect(): Promise<void> {
    const daemonPaths = getDaemonPaths(this.opts.lifeDir);

    // Daemon 실행 확인
    if (!(await isDaemonRunning(daemonPaths))) {
      throw new Error("Daemon is not running. Start it with `reap run start`.");
    }

    return new Promise((resolve, reject) => {
      this.socket = connect(daemonPaths.sockFile, () => {
        this.connected = true;

        // 클라이언트 등록
        if (this.opts.clientId || this.opts.role) {
          this.send({
            type: "register",
            clientId: this.opts.clientId,
            role: this.opts.role,
          });
        }

        resolve();
      });

      this.socket.on("data", (data) => {
        const messages = this.parser.feed(data.toString());
        for (const msg of messages) {
          this.handleDaemonMessage(msg as DaemonMessage);
        }
      });

      this.socket.on("close", () => {
        this.connected = false;
      });

      this.socket.on("error", (err) => {
        this.connected = false;
        this.opts.onError?.(err);
        reject(err);
      });
    });
  }

  /** 연결 해제 */
  disconnect(): void {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
      this.connected = false;
    }
  }

  /** 연결 상태 확인 */
  isConnected(): boolean {
    return this.connected;
  }

  /** Stage 완료 보고 */
  reportStageDone(stage?: LifeCycleStage): void {
    this.send({ type: "stage-done", stage });
  }

  /** Artifact 작성 완료 보고 */
  reportArtifactWritten(stage?: LifeCycleStage, data?: Record<string, unknown>): void {
    this.send({ type: "artifact-written", stage, data });
  }

  /** 회귀 요청 */
  requestBack(): void {
    this.send({ type: "request-back" });
  }

  /** Heartbeat 전송 */
  sendHeartbeat(): void {
    this.send({ type: "heartbeat" });
  }

  /** Daemon 메시지 처리 */
  private handleDaemonMessage(msg: DaemonMessage): void {
    switch (msg.type) {
      case "stage-prompt":
        if (msg.stage && msg.prompt) {
          this.opts.onPrompt?.(msg.stage, msg.prompt);
        }
        break;

      case "stage-advanced":
        if (msg.stage) {
          this.opts.onStageAdvanced?.(msg.stage, msg.context);
        }
        break;

      case "completed":
        this.opts.onCompleted?.();
        break;

      case "error":
        this.opts.onError?.(new Error(msg.error ?? "Unknown daemon error"));
        break;
    }
  }

  /** 메시지 전송 */
  private send(msg: ClientMessage): void {
    if (!this.socket || this.socket.destroyed) {
      throw new Error("Not connected to daemon.");
    }
    this.socket.write(encodeMessage(msg));
  }
}

// ── 편의 함수 ───────────────────────────────────────────────

/**
 * Daemon에 연결하여 단일 메시지를 보내고 첫 응답을 받는 one-shot 패턴.
 * 슬래시 커맨드에서 사용하기 적합.
 */
export async function sendOneShot(
  lifeDir: string,
  message: ClientMessage,
  timeoutMs = 5000,
): Promise<DaemonMessage> {
  return new Promise(async (resolve, reject) => {
    const timer = setTimeout(() => {
      client.disconnect();
      reject(new Error("Daemon response timeout"));
    }, timeoutMs);

    const client = new DaemonClient({
      lifeDir,
      onPrompt: (stage, prompt) => {
        clearTimeout(timer);
        client.disconnect();
        resolve({ type: "stage-prompt", stage, prompt });
      },
      onStageAdvanced: (stage, context) => {
        clearTimeout(timer);
        client.disconnect();
        resolve({ type: "stage-advanced", stage, context });
      },
      onCompleted: () => {
        clearTimeout(timer);
        client.disconnect();
        resolve({ type: "completed" });
      },
      onError: (err) => {
        clearTimeout(timer);
        client.disconnect();
        reject(err);
      },
    });

    try {
      await client.connect();
      // send를 직접 호출 대신 public 메서드 사용
      // connect 후 daemon이 자동으로 stage-prompt를 보내므로
      // 별도 메시지 전송 불필요 — 응답을 기다리면 됨
      if (message.type === "stage-done") {
        client.reportStageDone(message.stage);
      } else if (message.type === "heartbeat") {
        client.sendHeartbeat();
      } else if (message.type === "request-back") {
        client.requestBack();
      }
    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });
}

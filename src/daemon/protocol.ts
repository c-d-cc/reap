/**
 * Daemon-Client 통신 프로토콜 정의
 *
 * JSON-line 기반: 각 메시지는 JSON 문자열 + "\n"
 */

import type { LifeCycleStage } from "../types";

// ── Daemon → Client 메시지 ──────────────────────────────────

export type DaemonMessageType =
  | "stage-prompt"    // 현재 stage의 prompt를 클라이언트에게 전달
  | "stage-advanced"  // stage 전환 완료 알림
  | "hook-result"     // hook 실행 결과
  | "completed"       // generation 완료
  | "error";          // 에러

export interface DaemonMessage {
  type: DaemonMessageType;
  stage?: LifeCycleStage;
  prompt?: string;
  context?: Record<string, unknown>;
  error?: string;
}

// ── Client → Daemon 메시지 ──────────────────────────────────

export type ClientMessageType =
  | "stage-done"        // stage 작업 완료 (artifact 작성 포함)
  | "artifact-written"  // artifact 파일 작성 완료 보고
  | "request-back"      // regression 요청
  | "heartbeat"         // 연결 유지
  | "register";         // 클라이언트 등록 (multi-subagent용)

export interface ClientMessage {
  type: ClientMessageType;
  stage?: LifeCycleStage;
  clientId?: string;
  role?: string;          // multi-subagent: "main" | "coder" | "reviewer"
  data?: Record<string, unknown>;
}

// ── 메시지 직렬화/역직렬화 ──────────────────────────────────

export function encodeMessage(msg: DaemonMessage | ClientMessage): string {
  return JSON.stringify(msg) + "\n";
}

export function decodeMessage(line: string): DaemonMessage | ClientMessage {
  const trimmed = line.trim();
  if (!trimmed) throw new Error("Empty message");
  return JSON.parse(trimmed);
}

/**
 * 스트림 데이터에서 완전한 JSON-line 메시지들을 추출하는 파서.
 * 불완전한 데이터는 buffer에 유지.
 */
export class MessageParser {
  private buffer = "";

  /**
   * 새 데이터를 추가하고, 완전한 메시지들을 반환
   */
  feed(data: string): Array<DaemonMessage | ClientMessage> {
    this.buffer += data;
    const messages: Array<DaemonMessage | ClientMessage> = [];

    let newlineIdx: number;
    while ((newlineIdx = this.buffer.indexOf("\n")) !== -1) {
      const line = this.buffer.slice(0, newlineIdx);
      this.buffer = this.buffer.slice(newlineIdx + 1);

      if (line.trim()) {
        try {
          messages.push(decodeMessage(line));
        } catch {
          // 파싱 실패 — 무시 (로깅 추가 가능)
        }
      }
    }

    return messages;
  }
}

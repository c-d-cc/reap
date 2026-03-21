/**
 * Daemon 모듈 — Lifecycle Orchestration PoC
 *
 * Unix Domain Socket 기반 daemon-client 아키텍처.
 * Daemon이 lifecycle stage 전환을 제어하고,
 * AI 에이전트는 client로 접속하여 creative 작업을 수행.
 */

export { DaemonServer, type DaemonServerOptions, type DaemonServerState } from "./server";
export { DaemonClient, type DaemonClientOptions, sendOneShot } from "./client";
export {
  type DaemonMessage,
  type ClientMessage,
  type DaemonMessageType,
  type ClientMessageType,
  encodeMessage,
  decodeMessage,
  MessageParser,
} from "./protocol";
export {
  getDaemonPaths,
  writePidFile,
  readPidFile,
  removePidFile,
  isProcessAlive,
  isDaemonRunning,
  type DaemonPaths,
} from "./pid";

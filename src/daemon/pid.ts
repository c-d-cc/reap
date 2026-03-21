/**
 * PID 파일 관리 — daemon 중복 실행 방지 및 상태 확인
 */

import { readFile, writeFile, unlink, stat } from "fs/promises";
import { join } from "path";

const PID_FILENAME = "daemon.pid";
const SOCK_FILENAME = "daemon.sock";

export interface DaemonPaths {
  pidFile: string;
  sockFile: string;
}

/** .reap/life/ 기반 daemon 경로 계산 */
export function getDaemonPaths(lifeDir: string): DaemonPaths {
  return {
    pidFile: join(lifeDir, PID_FILENAME),
    sockFile: join(lifeDir, SOCK_FILENAME),
  };
}

/** PID 파일 작성 */
export async function writePidFile(pidFile: string, pid: number): Promise<void> {
  await writeFile(pidFile, String(pid), "utf-8");
}

/** PID 파일 읽기 (없으면 null) */
export async function readPidFile(pidFile: string): Promise<number | null> {
  try {
    const content = await readFile(pidFile, "utf-8");
    const pid = parseInt(content.trim(), 10);
    return isNaN(pid) ? null : pid;
  } catch {
    return null;
  }
}

/** PID 파일 삭제 */
export async function removePidFile(pidFile: string): Promise<void> {
  try {
    await unlink(pidFile);
  } catch {
    // 이미 없으면 무시
  }
}

/** 프로세스가 살아있는지 확인 (signal 0) */
export function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/** 소켓 파일이 존재하는지 확인 */
export async function sockFileExists(sockFile: string): Promise<boolean> {
  try {
    await stat(sockFile);
    return true;
  } catch {
    return false;
  }
}

/** Stale 소켓 파일 정리 (프로세스가 죽었는데 소켓이 남은 경우) */
export async function cleanupStaleSock(sockFile: string): Promise<boolean> {
  if (await sockFileExists(sockFile)) {
    try {
      await unlink(sockFile);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Daemon이 이미 실행 중인지 확인.
 * PID 파일이 존재하고 해당 프로세스가 살아있으면 true.
 * PID 파일이 존재하지만 프로세스가 죽었으면 정리 후 false.
 */
export async function isDaemonRunning(daemonPaths: DaemonPaths): Promise<boolean> {
  const pid = await readPidFile(daemonPaths.pidFile);
  if (pid === null) return false;

  if (isProcessAlive(pid)) {
    return true;
  }

  // Stale PID — 정리
  await removePidFile(daemonPaths.pidFile);
  await cleanupStaleSock(daemonPaths.sockFile);
  return false;
}

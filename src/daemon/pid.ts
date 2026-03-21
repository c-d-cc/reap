/**
 * PID 파일 관리 — daemon 중복 실행 방지 및 상태 확인
 */

import { readFile, writeFile, unlink, stat } from "fs/promises";
import { join } from "path";
import { connect } from "net";

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
 * UDS 소켓 연결을 시도하여 daemon liveness를 확인.
 * 연결 성공 = alive (즉시 disconnect), ECONNREFUSED/ENOENT = dead.
 * timeoutMs 내에 연결되지 않으면 dead 판정.
 */
export function probeDaemonSocket(sockFile: string, timeoutMs = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect(sockFile);

    const timer = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, timeoutMs);

    socket.on("connect", () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(true);
    });

    socket.on("error", () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(false);
    });
  });
}

/**
 * Daemon이 이미 실행 중인지 확인.
 * 1차: UDS 소켓 connect probe (가장 정확)
 * 2차: PID 파일 + 프로세스 생존 확인 (보조)
 * Stale 상태면 정리 후 false 반환.
 */
export async function isDaemonRunning(daemonPaths: DaemonPaths): Promise<boolean> {
  // 소켓 파일이 존재하면 connect probe 시도
  if (await sockFileExists(daemonPaths.sockFile)) {
    const alive = await probeDaemonSocket(daemonPaths.sockFile);
    if (alive) return true;

    // 소켓 파일은 있지만 연결 불가 — stale
    await cleanupStaleSock(daemonPaths.sockFile);
    await removePidFile(daemonPaths.pidFile);
    return false;
  }

  // 소켓 파일 없음 — PID 파일 보조 확인
  const pid = await readPidFile(daemonPaths.pidFile);
  if (pid === null) return false;

  if (isProcessAlive(pid)) {
    // PID는 살아있지만 소켓이 없는 비정상 상태 — alive로 판단
    return true;
  }

  // Stale PID — 정리
  await removePidFile(daemonPaths.pidFile);
  return false;
}

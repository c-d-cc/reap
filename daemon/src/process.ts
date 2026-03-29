import { readFileSync, writeFileSync, unlinkSync, mkdirSync } from "fs";
import { dirname } from "path";

export function writePid(pidPath: string): void {
  mkdirSync(dirname(pidPath), { recursive: true });
  writeFileSync(pidPath, String(process.pid));
}

export function readPid(pidPath: string): number | null {
  try {
    const content = readFileSync(pidPath, "utf-8").trim();
    const pid = parseInt(content, 10);
    return isNaN(pid) ? null : pid;
  } catch {
    return null;
  }
}

export function removePid(pidPath: string): void {
  try {
    unlinkSync(pidPath);
  } catch {}
}

export function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export class IdleTimer {
  private lastActivity: number;
  private readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    this.timeoutMs = timeoutMs;
    this.lastActivity = Date.now();
  }

  touch(): void {
    this.lastActivity = Date.now();
  }

  idleMs(): number {
    return Date.now() - this.lastActivity;
  }

  isExpired(): boolean {
    return this.idleMs() >= this.timeoutMs;
  }
}

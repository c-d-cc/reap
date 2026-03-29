import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { writeFileSync, readFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

// We'll test process management with a temp directory
const TEST_DIR = join(tmpdir(), "reap-daemon-test-process");
const TEST_PID_PATH = join(TEST_DIR, "daemon.pid");

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("PID file management", () => {
  test("writePid creates PID file with current process ID", async () => {
    const { writePid } = await import("../src/process.js");
    writePid(TEST_PID_PATH);
    const content = readFileSync(TEST_PID_PATH, "utf-8").trim();
    expect(content).toBe(String(process.pid));
  });

  test("readPid returns PID from file", async () => {
    const { readPid } = await import("../src/process.js");
    writeFileSync(TEST_PID_PATH, "12345");
    expect(readPid(TEST_PID_PATH)).toBe(12345);
  });

  test("readPid returns null when file missing", async () => {
    const { readPid } = await import("../src/process.js");
    expect(readPid(join(TEST_DIR, "nonexistent.pid"))).toBeNull();
  });

  test("removePid deletes PID file", async () => {
    const { writePid, removePid } = await import("../src/process.js");
    writePid(TEST_PID_PATH);
    removePid(TEST_PID_PATH);
    expect(existsSync(TEST_PID_PATH)).toBe(false);
  });

  test("isProcessRunning returns true for current process", async () => {
    const { isProcessRunning } = await import("../src/process.js");
    expect(isProcessRunning(process.pid)).toBe(true);
  });

  test("isProcessRunning returns false for nonexistent PID", async () => {
    const { isProcessRunning } = await import("../src/process.js");
    expect(isProcessRunning(999999)).toBe(false);
  });
});

describe("IdleTimer", () => {
  test("touch resets idle time", async () => {
    const { IdleTimer } = await import("../src/process.js");
    const timer = new IdleTimer(60_000);
    const before = timer.idleMs();
    await new Promise((r) => setTimeout(r, 50));
    timer.touch();
    expect(timer.idleMs()).toBeLessThan(before + 50);
  });

  test("isExpired returns false before timeout", async () => {
    const { IdleTimer } = await import("../src/process.js");
    const timer = new IdleTimer(60_000);
    expect(timer.isExpired()).toBe(false);
  });

  test("isExpired returns true after timeout", async () => {
    const { IdleTimer } = await import("../src/process.js");
    const timer = new IdleTimer(10); // 10ms timeout
    await new Promise((r) => setTimeout(r, 50));
    expect(timer.isExpired()).toBe(true);
  });
});

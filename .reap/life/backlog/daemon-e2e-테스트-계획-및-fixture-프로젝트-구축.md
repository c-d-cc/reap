---
type: task
status: pending
priority: medium
createdAt: 2026-06-27T02:21:29.561Z
dependsOn: daemon-mcp-server-interface-추가-ai-agent가-코드-지식-직접-쿼리-가능.md
---

# daemon e2e 테스트 계획 및 fixture 프로젝트 구축

## Problem

daemon 통합 강화(config opt-in, agent 지시문, 인덱스 갱신, 생명주기)를 구현하더라도 검증 수단이 없다.
기존 e2e 패턴(`setupProject()` → CLI 호출 → JSON 검증)은 daemon에 직접 적용이 안 된다:

- daemon은 별도 프로세스 + HTTP 서버 + 실제 소스 파싱이 필요
- `setupProject()`가 만드는 빈 temp dir에는 tree-sitter가 파싱할 코드가 없음
- git history가 없으면 `lastCommit` / incremental indexing이 동작하지 않음
- 실제 사용자 daemon(포트 17224)과 테스트 daemon이 충돌할 수 있음

## Solution

### 1. Fixture 프로젝트 구축

`tests/fixtures/daemon-sample/` — 테스트 전용 소형 TypeScript 프로젝트를 fixture로 고정.

```
tests/fixtures/daemon-sample/
├── package.json          — name: "daemon-sample", type: "module"
├── .gitignore
├── src/
│   ├── index.ts          — main() 함수, utils 호출 (callee 관계 테스트용)
│   ├── utils.ts          — helper 함수들 (caller 관계 테스트용), types import
│   └── types.ts          — interface / type 정의
└── (git initialized + 1 initial commit — fixture로 고정)
```

**fixture 설계 원칙**:
- 심볼 관계가 명확한 최소 코드 (callee가 확정적으로 추적되어야 함)
- git history 1개 commit으로 고정 (테스트 간 재현성 보장)
- tree-sitter TypeScript 파서가 파싱 가능한 파일 3개로 충분
- fixture는 `tests/fixtures/`에 커밋. 테스트에서 tmpdir에 복사해 사용 (fixture 원본 오염 방지)

**fixture 심볼 설계 (callee/caller 관계가 명확해야 함)**:
```ts
// types.ts
export interface User { id: string; name: string; }

// utils.ts
import type { User } from "./types.js";
export function formatUser(user: User): string { return `${user.id}:${user.name}`; }
export function validateId(id: string): boolean { return id.length > 0; }

// index.ts
import { formatUser, validateId } from "./utils.js";
export function main(id: string, name: string): string {
  if (!validateId(id)) throw new Error("invalid");
  return formatUser({ id, name });
}
```

→ `main` → `formatUser`, `validateId` callee 관계 명확. `formatUser`의 caller로 `main` 추적 가능.

### 2. 테스트 격리 전략

- **테스트 전용 포트**: 환경변수 `REAP_DAEMON_PORT=17225` (실제 사용자 daemon 17224와 충돌 방지)
- daemon binary는 `dist/` 빌드 기반 — `tests/helpers/daemon.ts` helper에서 spawn/kill 관리
- `beforeAll()`에서 fixture 복사 + daemon 기동, `afterAll()`에서 daemon 종료 + tmpdir 정리
- daemon 의존 없이 `IndexManager`를 직접 호출 가능한 로직은 unit test로 분리

### 3. 테스트 파일 구조

```
tests/e2e/
├── daemon-config.test.ts       — config opt-in (daemon: true/false) → prompt 분기
├── daemon-lifecycle.test.ts    — daemon 시작/종료/stale PID 처리
├── daemon-indexing.test.ts     — 인덱싱 갱신 시점 (learning/impl/completion 자동 호출)
└── daemon-query.test.ts        — HTTP API 기능 (symbols, callers, impact, stale check)

tests/fixtures/
└── daemon-sample/              — fixture TypeScript 프로젝트 (git 포함)

tests/helpers/
└── daemon.ts                   — daemon spawn/kill/wait helper (신설)
```

### 4. 테스트 케이스 명세

#### `daemon-config.test.ts` (5 cases)

| # | 케이스 | 검증 |
|---|--------|------|
| 1 | `daemon: false` | learning work prompt에 daemon 절 없음 |
| 2 | `daemon: false` | `context.daemonEnabled === false` |
| 3 | `daemon: true` | learning work prompt에 daemon 활용 절 포함 |
| 4 | `daemon: true` | `context.daemonEnabled === true`, `context.daemonReady` 존재 |
| 5 | config 없음 | false 처리 (회귀 안전) |

#### `daemon-lifecycle.test.ts` (4 cases)

| # | 케이스 | 검증 |
|---|--------|------|
| 1 | daemon 기동 | `/health` 응답 정상 (pid, uptime 포함) |
| 2 | `reap daemon stop` | 프로세스 종료, PID 파일 삭제 |
| 3 | PID 파일만 있고 프로세스 없음 | 재기동 후 정상 응답 (stale PID 자동 정리) |
| 4 | daemon 미기동 + `triggerIndexing()` | silent fail, CLI exit code 0 유지 |

#### `daemon-indexing.test.ts` (6 cases, fixture 프로젝트 사용)

| # | 케이스 | 검증 |
|---|--------|------|
| 1 | fixture 등록 + full index | `lastIndexedCommit` == fixture HEAD |
| 2 | `git commit` 후 `triggerIndexing()` | `lastIndexedCommit` 새 HEAD로 갱신 |
| 3 | HEAD == `lastIndexedCommit` | staleness check pass → 재인덱싱 skip |
| 4 | HEAD != `lastIndexedCommit` | staleness check fail → 인덱싱 자동 트리거 |
| 5 | `reap run implementation --phase complete` | `triggerIndexing()` 자동 호출됨 (lastIndexedCommit 갱신 확인) |
| 6 | `reap run completion --phase commit` 후 | `triggerIndexing()` 자동 호출됨 |

#### `daemon-query.test.ts` (6 cases, fixture 프로젝트 사용)

| # | 케이스 | 검증 |
|---|--------|------|
| 1 | `/symbols?q=main` | fixture의 `main` 함수 심볼 반환 |
| 2 | `/symbols/:id/callers` (formatUser) | `main`이 caller로 반환됨 |
| 3 | `/symbols/:id/callees` (main) | `formatUser`, `validateId`가 callee로 반환됨 |
| 4 | `/impact?file=src/utils.ts` | `src/index.ts`가 indirect impact에 포함됨 |
| 5 | `/projects/:id/status` | `lastIndexedCommit` 필드 포함 (string) |
| 6 | 미등록 project ID | `{ status: "error" }` 정상 반환 |

### 5. `tests/helpers/daemon.ts` 설계

```ts
export async function spawnTestDaemon(port?: number): Promise<ChildProcess>
export async function stopTestDaemon(proc: ChildProcess): Promise<void>
export async function waitForDaemon(port: number, timeoutMs?: number): Promise<void>
export async function registerFixture(port: number, fixturePath: string): Promise<string>  // returns projectId
export async function copyFixture(fixtureName: string): Promise<string>  // returns tmpdir path
```

## Files to Change

- `tests/fixtures/daemon-sample/` — fixture 프로젝트 신설 (git init + commit 포함)
- `tests/fixtures/daemon-sample/src/index.ts`
- `tests/fixtures/daemon-sample/src/utils.ts`
- `tests/fixtures/daemon-sample/src/types.ts`
- `tests/fixtures/daemon-sample/package.json`
- `tests/helpers/daemon.ts` — daemon spawn/kill/wait/register helper 신설
- `tests/e2e/daemon-config.test.ts` — 신설 (5 cases)
- `tests/e2e/daemon-lifecycle.test.ts` — 신설 (4 cases)
- `tests/e2e/daemon-indexing.test.ts` — 신설 (6 cases)
- `tests/e2e/daemon-query.test.ts` — 신설 (6 cases)

## 완료 기준

- `bun test tests/e2e/daemon-*.test.ts` — 21 cases all pass
- fixture 프로젝트가 `tests/fixtures/daemon-sample/`에 커밋됨
- 테스트 실행이 실제 사용자 daemon(포트 17224)에 영향을 주지 않음
- daemon 미기동 환경에서도 기존 e2e 전체(daemon 외) 회귀 없음

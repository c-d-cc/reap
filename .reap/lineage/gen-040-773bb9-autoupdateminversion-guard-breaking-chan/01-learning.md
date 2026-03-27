# Learning

## Project Overview

REAP v0.16.0. v0.15에서 v0.16으로 rewrite하면서 `autoUpdateMinVersion` guard가 누락됨. 이 guard는 npm registry의 package.json에 `reap.autoUpdateMinVersion` 필드를 게시하고, 설치된 버전이 이 minimum보다 낮으면 자동 업데이트를 차단하는 기능.

## Key Findings

### v0.15 구현 분석

`~/cdws/reap_v15/src/cli/commands/update.ts`에서 핵심 로직 확인:

1. **`queryAutoUpdateMinVersion()`** -- `npm view @c-d-cc/reap reap.autoUpdateMinVersion`으로 npm registry에서 최신 패키지의 custom 필드를 조회
2. **`selfUpgrade()`** -- 설치된 버전 vs latest 비교 후, `autoUpdateMinVersion` guard 체크. `installed < minVersion`이면 `blocked: true` 반환
3. **`semverGte(a, b)`** -- 간단한 inline semver 비교 (major.minor.patch)
4. **session-start.cjs** -- SessionStart hook에서 동일한 guard 체크 수행

### v0.16 현재 상태

- `check-version.ts` -- 현재는 legacy v0.15 cleanup만 수행 (hooks, project skills). 버전 체크 로직 없음
- `install.ts` -- postinstall에서 `registerCleanupHook()`으로 `reap check-version` 명령을 SessionStart hook에 등록. 이미 hook이 매 세션마다 실행되는 인프라가 갖춰져 있음
- `package.json` -- `reap.autoUpdateMinVersion` 필드 없음
- `postinstall.sh` -- `reap check-version`을 실행하는 라인이 이미 존재

### 구현 경로

가장 자연스러운 접점: `check-version.ts`의 `execute()`에 guard 로직 추가. 이미 SessionStart hook과 postinstall에서 호출되고 있으므로, 여기에 로직을 넣으면 두 경로 모두에서 동작.

### 주요 파일

| 파일 | 역할 | 변경 필요 |
|------|------|----------|
| `package.json` | `reap.autoUpdateMinVersion` 필드 추가 | O |
| `src/cli/commands/check-version.ts` | guard 로직 구현 | O |
| `src/adapters/claude-code/install.ts` | hook 등록 (이미 완료) | X (기존 인프라 활용) |

## Backlog Review

이번 generation의 대상인 `autoUpdateMinVersion guard` 외 pending backlog 없음.

## Technical Deep-Dive

### 설계 결정 포인트

1. **npm view 호출 타이밍** -- SessionStart에서 `npm view` 호출은 네트워크 의존. 타임아웃(10s) 필수, 실패 시 silent skip.
2. **출력 방식** -- `check-version`은 현재 `execute()`가 void 반환. `emitOutput`/`emitError` 사용하지 않음 (postinstall 컨텍스트에서는 npm이 출력 억제). SessionStart hook에서는 stderr가 표시될 수 있으므로 `console.error`로 경고 출력이 적절.
3. **semver 비교** -- v0.15의 `semverGte` 그대로 가져오면 됨. 외부 의존성 불필요.
4. **`process.exit(0)`** -- check-version은 postinstall에서 호출되므로 non-zero exit은 npm install을 실패시킬 수 있음. 항상 정상 종료 필요.

### 주의사항

- `check-version`은 `emitOutput`을 사용하지 않음 (호출하면 `process.exit(0)` 발생). 기존 cleanup 로직이 void 반환이므로, guard 로직도 side-effect(stderr 경고)만 수행하고 void 반환해야 함.
- v0.15에서는 guard가 blocked 상태를 반환해서 호출자가 UI를 처리했지만, v0.16에서는 check-version 자체가 최종 실행점이므로 직접 경고 메시지를 출력해야 함.

## Context for This Generation

- Clarity: **HIGH** -- backlog에 구체적 task, v0.15 참조 코드 존재, 변경 파일 명확
- Generation type: embryo -- genome 수정 자유
- 변경 범위 소규모 -- check-version.ts에 ~40 lines 추가, package.json에 1 필드 추가

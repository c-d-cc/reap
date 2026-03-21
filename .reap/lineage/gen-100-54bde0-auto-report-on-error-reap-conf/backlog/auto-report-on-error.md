---
type: task
status: consumed
consumedBy: gen-100-54bde0
---

# reap run 에러 시 자동 issue report

## 현상
- `reap run <cmd>`에서 에러 발생 시 `emitError`로 JSON 출력만 하고 자동 report 없음
- 자동 report는 `reap update` migration 실패 시에만 동작

## 기대 동작

### 1. Script 레벨 (emitError 또는 catch)
- `reap run <cmd>` 실행 중 예상치 못한 에러 발생 시 자동으로 `gh issue create` 실행
- `autoIssueReport: true`일 때만 (기본값)
- 의도된 에러(gate 실패, validation 에러 등)는 제외 — 예상치 못한 런타임 에러만
- privacy gate 적용: 코드, 환경변수, 경로 등 민감 정보 제거

### 2. reap-guide.md 레벨 (AI 감지)
- script에서 못 잡은 에러도 AI가 감지할 수 있도록 reap-guide.md에 규칙 추가:
  - "reap run 명령이 예상치 못한 에러를 반환하거나, 기본 의도된 동작이 실패하면 /reap.report 실행을 제안하라"
  - "반복적인 실패 패턴(같은 command 2회 이상 연속 실패)은 자동으로 report 하라"

### 3. 구분: 의도된 에러 vs 예상치 못한 에러
- 의도된: gate 실패("No active generation"), wrong stage, missing artifact → report 하지 않음
- 예상치 못한: uncaught exception, 파일 I/O 실패, YAML 파싱 에러 → report

## 관련 코드
- `src/core/run-output.ts:8` — emitError
- `src/cli/commands/run/index.ts` — runCommand catch
- `src/templates/hooks/reap-guide.md` — AI 가이드라인

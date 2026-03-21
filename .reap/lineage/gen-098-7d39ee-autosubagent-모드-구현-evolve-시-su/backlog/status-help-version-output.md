---
type: task
status: pending
---

# reap status / reap help 에 REAP 버전 출력 추가

## 현상
- `reap status`와 `reap run help` 출력에 REAP 버전 정보가 없음
- `config.yml`에 `version` 필드가 있지만 활용되지 않음

## 기대 동작
- `reap status` 출력에 `Version: 0.10.x` 포함
- `reap run help` context/prompt에 버전 정보 포함

## 관련 코드
- `src/cli/commands/status.ts` — ProjectStatus에 version 필드 추가
- `src/cli/commands/run/help.ts` — config에서 version 읽어서 포함
- `src/cli/index.ts:73-74` — status 출력 포맷

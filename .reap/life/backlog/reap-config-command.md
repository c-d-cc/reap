---
type: task
status: consumed
consumedBy: gen-100-54bde0
---

# /reap.config 커맨드 신규 추가

## 목적
- help에서 하단 config 상태 표시를 분리
- `/reap.config`로 현재 설정 확인 + 변경 가능

## 기대 동작
- `reap run config` → 현재 config.yml 설정 표시 (strict, autoUpdate, autoSubagent, language, autoIssueReport 등)
- `reap run config --set key=value` → 설정 변경 (선택적)
- help에서는 config 라인 제거, 대신 "설정 확인: /reap.config" 안내만

## 관련 코드
- `src/cli/commands/run/config.ts` 신규
- `src/cli/commands/run/index.ts` dispatcher 등록
- `src/templates/commands/reap.config.md` 신규
- `src/cli/commands/run/help.ts` — config 라인 제거

---
type: task
status: pending
priority: high
---

# reap.sync를 sync / sync.genome / sync.environment로 분리

## 현재
- reap.sync는 genome만 동기화
- environment는 스캔/업데이트 대상이 아님
- init 후 environment가 비어있는 문제

## 변경

### 커맨드 구조
- `/reap.sync` — genome + environment 모두 실행 (init 직후 또는 전체 동기화 시)
- `/reap.sync.genome` — genome만 동기화 (기존 sync 로직)
- `/reap.sync.environment` — environment만 동기화 (신규)

### sync.environment 동작
- 소스 코드에서 외부 의존성 힌트 추출 (package.json, config 파일, API 클라이언트 등)
- 감지된 외부 서비스/API/인프라를 목록으로 제시
- 각 항목별 유저 확인 후 `.reap/environment/` 파일 생성
- 자동 적용이 아닌 "감지 + 질문" 방식

### init 연동
- `reap init` 완료 후 `/reap.sync` 안내 (genome + environment 모두)

### 수정 대상
- `src/templates/commands/reap.sync.md` → orchestrator로 변경
- `src/templates/commands/reap.sync.genome.md` — 기존 sync 로직 이동
- `src/templates/commands/reap.sync.environment.md` — 신규 작성
- `src/cli/commands/init.ts` COMMAND_NAMES 업데이트
- `constraints.md` slash command 수 업데이트

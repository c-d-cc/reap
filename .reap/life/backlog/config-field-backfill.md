---
type: task
status: consumed
consumedBy: gen-100-54bde0
---

# config.yml 필드 누락 수정 — init 전체 기본값 + update backfill + migration

## 현상
- `reap init`에서 `strict`, `language`, `autoSubagent` 필드 누락
- `reap update`에서 기존 config에 새 필드를 채워넣는 로직 없음
- 구 버전에서 업그레이드한 사용자의 config에 신규 필드가 없음

## 기대 동작

### 1. init 시 모든 필드 명시
```yaml
version: 0.11.0
project: my-project
entryMode: adoption
strict: false
language: (agent에서 감지 또는 기본값)
autoUpdate: true
autoSubagent: true
autoIssueReport: true  # gh CLI 있으면
```

### 2. update 시 backfill
- config.yml 읽기 → ReapConfig 인터페이스의 모든 필드 확인
- 누락된 필드는 기본값으로 채워넣기
- 기존 값은 유지
- backfill 발생 시 로그 출력

### 3. migration: 0.10.3-to-0.11.0.ts
- config에 누락된 strict/autoSubagent 필드 backfill
- `src/core/migrations/0.10.3-to-0.11.0.ts` 신규
- `src/core/migrations/index.ts`에 등록

## 관련 코드
- `src/cli/commands/init.ts:68-78` — config 생성
- `src/cli/commands/update.ts` — config backfill 로직 추가
- `src/core/config.ts` — ConfigManager에 backfill 유틸 추가
- `src/core/migrations/` — migration 추가

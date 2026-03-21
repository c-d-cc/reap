---
type: task
status: pending
---

# reap init: 기존 프로젝트 감지 시 자동 adoption 모드 전환

## 현재 동작
- 기존 프로젝트 시그널(package.json 등) 감지 시 경고만 출력하고 greenfield로 진행
- genome이 빈 템플릿으로만 설치됨
- 유저가 수동으로 `-m adoption`을 지정해야 `syncGenomeFromProject` 실행

## 기대 동작
- 기존 프로젝트 감지 시 자동으로 adoption 모드로 전환 (또는 interactive prompt로 확인)
- adoption 모드에서 genome이 프로젝트 소스 스캔 결과로 채워짐
- 최소한 `reap init` 완료 후 `/reap.sync` 실행을 안내해야 함

## 관련 코드
- `src/cli/index.ts:31-39` — 감지 로직 (suggest만 함)
- `src/cli/commands/init.ts:92-97` — adoption/migration일 때만 syncGenomeFromProject 실행

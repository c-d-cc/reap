# Planning

## Tasks

### Task 1: frontmatter hard-gate
- artifact 템플릿(01~05)에 REAP MANAGED 주석 frontmatter 추가
- current.yml 생성 시(start.ts) 주석 포함
- next.ts에서 artifact 생성 시 주석 포함
- session-start hook(reap-guide.md)에 직접 수정 금지 규칙 강화

### Task 2: status/help 버전 출력
- status.ts — ProjectStatus에 version 필드 추가 + CLI 출력에 포함
- help.ts — context에 version 포함
- 버전 최신 여부: npm registry에서 latest 확인 (config.autoUpdate=true일 때만)
- 테스트 업데이트

### Task 3: completion auto-archive
- completion.ts — genome phase 완료 후 consume → archive → commit 자동 실행
- 4개 phase → 2개 phase (retrospective, genome) + 자동 (consume+archive+commit)
- 테스트 업데이트

## Dependencies
3개 독립, 병렬 실행 가능

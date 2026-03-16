# reap update 명령 구현

## 목표
기존 REAP 프로젝트의 슬래시 커맨드, genome 템플릿, domain 가이드를 최신 reap-wf 버전으로 동기화하는 `reap update` 명령 구현

## 배경
- reap-wf의 템플릿/커맨드가 업데이트되면 기존 프로젝트에 수동 복사 필요
- Gen-004에서 커맨드 3개 + domain/README.md 변경 시 selfview에 수동 복사 수행
- 프로젝트가 늘어나면 수동 동기화는 유지보수 부담

## 예상 범위
- `src/cli/commands/update.ts` 신규
- 동기화 대상: `.reap/commands/`, `.claude/commands/`, `.reap/genome/domain/README.md`
- genome 본문(principles, conventions, constraints)은 프로젝트별 고유이므로 동기화 대상 아님
- `--dry-run` 옵션으로 변경 사항 미리보기

## 출처
Gen-004 adaptation에서 발견된 문제

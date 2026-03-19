# Generation Goal — Gen-002

## 목표
invenio(인벤토리 관리 시스템)를 REAP 워크플로우 전 단계(conception→legacy)로 개발하고, 각 단계에서 발견된 워크플로우 개선점을 reap-wf에 반영한다.

## 완료 조건
- [ ] invenio Gen-001이 전체 라이프사이클(8단계)을 1회 완주
- [ ] invenio에서 물품 CRUD + 인증이 동작 (UI + API + SQLite)
- [ ] 각 단계에서 발견된 reap-wf 개선점이 mutation으로 기록됨
- [ ] 발견된 개선점 중 최소 1건이 reap-wf 코드/템플릿에 반영됨
- [ ] backlog의 01-first-generation-bootstrap 개선이 설계 또는 구현됨

## 범위
- **관련 Genome 영역**: constraints.md, conventions.md, 슬래시 커맨드 템플릿 전체
- **예상 변경 범위**: src/templates/commands/, src/templates/genome/, src/cli/commands/init.ts
- **실전 검증 위치**: examples/invenio/ (reap-wf repo 내)
- **제외 사항**: reap-wf 대규모 아키텍처 변경, CLI 명령어 추가/삭제

## 배경
- Gen-001에서 REAP 라이프사이클 시스템을 구현했으나, 실전 프로젝트 없이 설계된 상태
- invenio conception 시도에서 "첫 세대 부트스트랩 부담" 문제를 즉시 발견 (backlog/01)
- 실전 개발을 통해 각 단계(특히 conception, growth, validation)의 실용성을 검증해야 함
- dog-fooding: reap-wf 자체가 REAP으로 관리되므로, 개선 사항이 즉시 자기 자신에게 적용됨

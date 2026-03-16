# Gen-004 Planning: 구현 계획

## 구현 요약

문서/템플릿 변경만 수행. CLI 코드 변경 없음.

## 태스크 목록

### Phase 1: 템플릿 생성

- [x] T001 `src/templates/genome/domain/README.md` 작성 (이미 완료)

### Phase 2: 슬래시 커맨드 업데이트

- [ ] T002 `src/templates/commands/reap.conception.md` — domain health check 보강
- [ ] T003 `src/templates/commands/reap.formation.md` — domain 갭 분석 시 README 참조 추가
- [ ] T004 `src/templates/commands/reap.birth.md` — domain 작성 시 README 규칙 준수 지시

### Phase 3: Genome 업데이트

- [ ] T005 `.reap/genome/principles.md` — domain 관련 Core Belief 추가

### Phase 4: init 코드 확인

- [ ] T006 init 시 domain/README.md가 복사되는지 확인 (기존 로직이 디렉토리 복사를 지원하는지)

### Phase 5: 검증

- [ ] T007 `bun test` 전체 통과 확인
- [ ] T008 `bunx tsc --noEmit` 통과 확인

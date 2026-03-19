# Formation Spec

## 요구사항

### FR-001: `/reap.evolve` 슬래쉬 커맨드
- `current.yml`을 직접 읽고 써서 단계 전환을 수행하는 슬래쉬 커맨드
- 기능: 새 Generation 시작 (goal 입력), 다음 단계로 advance, 이전 단계로 back (Validation→Growth)
- CLI `reap evolve`와 동일한 로직을 에이전트가 직접 수행
- 기존 7개 커맨드의 "완료" 섹션을 `/reap.evolve` 안내로 업데이트
- `init.ts`의 `COMMAND_NAMES`에 `reap.evolve` 추가

### FR-002: `reap update` 명령
- 기존 REAP 프로젝트의 슬래시 커맨드, 산출물 템플릿, domain 가이드를 reap-wf 최신 버전으로 동기화
- 동기화 대상: `.reap/commands/`, `.claude/commands/`, `.reap/templates/`, `.reap/genome/domain/README.md`
- genome 본문(principles, conventions, constraints)은 프로젝트 고유이므로 동기화 제외
- `--dry-run` 옵션: 변경 사항만 출력, 실제 반영 안 함
- `src/cli/commands/update.ts` 신규, `src/cli/index.ts`에 서브커맨드 등록

### FR-003: git 커밋 타이밍 규칙
- `src/templates/commands/reap.growth.md`의 Gate에 git 상태(working tree clean) 확인 추가
- conventions.md에 커밋 타이밍 규칙 추가 → Birth에서 genome 반영
- 규칙: Growth 진입 전 clean state, 태스크/Phase 완료 시 커밋, stage 전환 전 커밋

### FR-004: init preset bootstrap
- `reap init <name> --preset <preset-name>` 옵션 추가
- 프리셋 지정 시 해당 genome 파일(principles, conventions, constraints)을 복사
- 프리셋 미지정 시 기존 placeholder 복사 (현재 동작 유지)
- 프리셋 저장소: `src/templates/presets/<preset-name>/`
- 최소 1개 프리셋 포함: `bun-hono-react`
- `ReapConfig`에 `preset` 필드 추가 (어떤 프리셋으로 초기화했는지 기록)

### 비기능 요구사항
- 기존 테스트 깨지지 않아야 함
- 새 기능에 대한 테스트 추가
- TypeScript strict mode 컴파일 통과

## Genome 참조
- **ADR-004**: 슬래시 커맨드 = .claude/commands 복사 → evolve도 동일 패턴
- **Template Conventions**: 새 템플릿 추가 시 init.ts 복사 로직 동기화 필수
- **Layer Map**: cli/ → core/ → types/ 단방향 의존

## 수용 기준
- [ ] `/reap.evolve` 슬래쉬 커맨드로 새 Generation 시작, advance, back 가능
- [ ] 기존 7개 커맨드 "완료" 섹션이 `/reap.evolve` 안내로 변경됨
- [ ] `reap update`로 commands/templates/domain 가이드 동기화 가능
- [ ] `reap update --dry-run`으로 변경 사항 미리보기 가능
- [ ] Growth Gate에 git clean 상태 확인 포함됨
- [ ] `reap init test --preset bun-hono-react`로 채워진 genome 생성됨
- [ ] `reap init test` (프리셋 없음) 기존 동작 유지
- [ ] `bun test` 전체 통과
- [ ] `bunx tsc --noEmit` 통과

## Mutations (발견된 genome 수정 필요 사항)
- conventions.md에 git 커밋 타이밍 규칙 추가 필요 → Birth에서 반영

# Formation Spec — Gen-002

## 요구사항

### 기능 요구사항

invenio(인벤토리 관리 시스템)를 `examples/invenio/`에서 REAP 워크플로우로 개발하고,
그 과정에서 발견되는 reap-wf 파이프라인 문제를 개선한다.

- **FR-001**: invenio를 REAP 8단계(conception→legacy)로 1회 완주
- **FR-002**: 각 단계에서 발견된 워크플로우 문제를 mutation으로 기록
- **FR-003**: 발견된 개선점 중 최소 1건을 reap-wf 코드/템플릿에 반영
- **FR-004**: backlog/01 (첫 세대 부트스트랩 부담 경감) 설계 또는 구현

### 비기능 요구사항
- reap-wf 기존 62개 테스트 깨지지 않음
- 각 REAP 단계의 산출물이 invenio `.reap/life/`에 정상 생성됨
- examples/invenio는 reap-wf repo 안에서 관리 (별도 git repo 아님)

## Genome 참조
- **principles.md**: 세대 단위 진화, dog-fooding 원칙
- **conventions.md**: Enforced Rules (bun test, tsc)
- **constraints.md**: Bun + TypeScript 스택, Validation Commands

## Genome 갭 분석
- conventions.md에 "워크플로우 문제 발견 시 mutation 기록 기준"이 없음

## 수용 기준
- [ ] invenio `.reap/life/`에 01~07 산출물이 모두 존재
- [ ] invenio에서 회원가입 → 로그인 → 물품 CRUD 시나리오 동작
- [ ] reap-wf `.reap/life/mutations/`에 1건 이상 mutation 기록
- [ ] reap-wf 코드 또는 템플릿에 1건 이상 개선 반영
- [ ] backlog/01에 대한 설계안 확정

## Mutations (발견된 genome 수정 필요 사항)
- mutation 기록 기준이 conventions.md에 없음 — Birth 시 반영 검토

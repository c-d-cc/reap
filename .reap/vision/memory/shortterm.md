# Shortterm Memory

## 세션 요약 (gen-072, 2026-07-26)

### gen-072: issue #21 — pruning policy carrier 동기화 (v0.17.2)

reflect prompt / evolution 템플릿이 v0.17.1 의 content-type + pruning 규칙을 반영하지 않아 발생한 이슈. 조사 중 **템플릿이 `initCommon` 단 1곳에서만 소비되어 기존 프로젝트에 도달하지 않는다**는 것이 확인되어, migration note `v0.17.2.md` 를 추가해 도달 채널을 만들었다.

주요 변경: `completion.ts`(reflect prompt) / `templates/evolution.md` / `templates/migration/v0.17.2.md`(신규) / `integrity.ts`(크기 warning) / 0.17.2 bump.

결과: typecheck pass / unit 454-0 / e2e 263-1 / scenario 35-5 (뒤 둘은 pre-existing).

### 다음 세션 — 3건 orchestrate 중 1건 완료

유저가 3건 순차 진행을 지시했고 gen-072 가 그 첫 번째다. 남은 순서:

1. **다음**: `release-직전-문서-버전-일치-검증-reapcc-문서-갱신` — 0.17.2 를 깨끗이 릴리즈 가능한 상태로 만드는 것이 목적. **gen-072 가 `RELEASE_NOTES.md` / `docs/` 를 의도적으로 건드리지 않았으므로 그 몫이 여기 있다**
2. 그 다음: `backlog 작성 시 interview 기능` — 0.18.0 예정
3. daemon 2건은 유저 판단으로 보류

### 미결 사항

- **0.17.2 는 아직 커밋/푸시/릴리즈 전.** gen-072 completion commit 이 커밋까지 수행하며, npm publish 는 태그 push 트리거
- Scope C(dog-fooding 대응표에 prompt 코드 추가)를 adapt phase 에서 처리해야 함 — 본 이슈의 근본 원인 대책이라 누락 금지
- issue #21 은 릴리즈 후 코멘트 + close 필요

### Backlog 상태

pending 6건 — 문서검증 / interview / daemon 배포결함 / daemon SCIP / genome threshold(신규) / scenario 복구(신규).
consumed: `resolve-21-...` (gen-072).

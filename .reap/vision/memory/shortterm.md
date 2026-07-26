# Shortterm Memory

## 세션 요약 (gen-074, 2026-07-26)

### gen-074: scenario 테스트 복구

`tests/scenario/multi-generation.test.ts` 를 gen-065 backlog gate 동작에 맞게 갱신. **scenario 35-5 → 44-0.**

우회(`--no-backlog` 한 줄 추가) 대신 gate 흐름을 시나리오에 편입 — "막힘 → 판단 → 재호출" 실제 사용자 경로를 따라가고, `--no-backlog` 출구도 별도 describe 로 커버. gen-065 gate 가 처음으로 scenario 커버리지를 얻었다. 소스 변경 없음.

### 다음 세션 — 유저 지시 순서

1. **다음**: `genome-line-threshold100-...` backlog — threshold(100) < 배포 템플릿(evolution.md 193줄) 이라 `reap init` 직후 warning. **0.17.2 에 포함**
2. **그 다음 0.17.2 릴리즈** — 유저 결정: 2건 마치고 함께 배포. 태그 push 는 최종 배포 시 (**유저 확인 필수**)
3. interview 는 0.18.0, daemon 2건은 유저 보류

### 반드시 기억할 것 — 릴리즈 노트 보강

`RELEASE_NOTICE.md` / `RELEASE_NOTES.md` / 5 로케일 changelog 의 0.17.2 내용은 **gen-072 시점 기준으로만 작성돼 있다.** gen-073(문서 게이트) / gen-074(scenario) / 다음 세대(genome threshold) 내용이 빠져 있으므로 릴리즈 전에 추가해야 한다.

`check-docs-version.sh` 는 **버전 일치만 검사하고 내용 완전성은 못 잡는다.** 수동 확인 필요.

### 미결 사항

- e2e `init-repair` 1 fail — 3세대째 pre-existing. backlog 화 검토 필요
- issue #21 코멘트 + close 는 릴리즈 후

### Backlog 상태

pending 3건 — genome threshold / interview / daemon 2건(보류).
consumed: `scenario-multi-generation-...` (gen-074).

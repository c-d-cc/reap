# Shortterm Memory

## 세션 요약 (gen-073, 2026-07-26)

### gen-073: 릴리즈 문서 정합성 + reap.cc 갱신

`scripts/check-docs-version.sh` 신설(검사 5종, 특히 **로케일 집합 동일성**) + release.yml publish 전 게이트 + versionBump skill Step 5-1. 5 로케일 changelog 에 0.17.2/0.17.1 추가 + 0.16.5 누락 보정(20 항목 정렬). reap.cc 가 가르치던 폐기 lifespan 분류를 content-type + pruning 으로 교체(10개 위치).

검증: 스크립트가 수정 전 **8건 fail** → 수정 후 전건 pass. docs vite build 성공. unit 454-0 / e2e 263-1 / scenario 35-5 (뒤 둘 pre-existing, baseline 동일).

### 다음 세션 — 3건 orchestrate 중 2건 완료

1. **다음(마지막)**: `backlog 작성 시 interview 기능` — 0.18.0 예정. **gen-073 교훈이 직접 적용됨**: interview 는 "지시를 자세히 쓰는" 접근이 아니라 "빈칸이 남았는지 검사하는" 접근이어야 한다
2. daemon 2건은 유저 판단으로 보류

### 미결 사항

- **0.17.2 릴리즈 준비 완료** — 문서 정합성 확보됨. `git tag v0.17.2 && git push origin main v0.17.2` 만 하면 됨 (**유저 확인 필수**)
- issue #21 코멘트 + close 는 릴리즈 후
- adapt 에서 genome carrier 목록에 docs 사이트(4번째) 추가 예정

### Backlog 상태

pending 4건 — interview / daemon 배포결함 / daemon SCIP / genome threshold / scenario 복구.
consumed: `release-직전-문서-...` (gen-073).

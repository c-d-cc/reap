# M2 — 호환: 자동 업데이트 차단과 기능 대조

## 자동 업데이트 차단 (이중)

- v0.18의 `package.json`에 `reap.autoUpdateMinVersion: "0.18.0"`이 들어간다
- 배포 정책 — **0.18은 npm latest로 올리지 않는다** — 가 v0.18 브랜치의 릴리스 문서에 명문화된다. 발행 자체는 이 계획의 범위 밖이지만, 정책이 코드보다 먼저 적혀 있어야 발행 세대가 그것을 읽는다
- 0.17.8 다리의 설계 승계: 일일 캐시 + 0.18 안내 + upgrade agent 설치. **main 브랜치의 것**이며 0.18보다 먼저 발행되어야 한다는 순서 제약을 문서가 보존한다

## 기능 대조 — 가져갈 것과 버릴 것

1차 판단은 ps-4f2a91 `08-delivery.md`의 폐기 표가 이미 했고 v0.18에서도 유지된다: 5단계 lifecycle·흐름 제어 명령·maturity/cruise·merge lifecycle·evaluator·lineage 압축·opencode 어댑터 폐기, code index는 이식 완료.

reap에 상당물이 이미 있는 것: `fix --check`→`doctor`, `load-context`→`ctx`, `sequence`→`seq`, 자동 이슈 보고→`report-issue` skill, `install-skills`→플러그인 설치로 대체.

**판정 완료 (2026-08-31, gen-0066 — 사람의 전체 위임 하에 agent가 판정, loop-0003 Dialogue 기록):**

| reap 기능 | 판정 | 근거 |
|---|---|---|
| `check-version`/버전 안내 | **만들지 않는다** | 0.18은 latest 비사용이라 자동 확인의 대상이 없다. brew 경로는 brew가 갱신을 안다. 필요 신호가 실제로 오면 그때 backlog로 |
| `uninstall` | **만들지 않는다** — spec 결정 유지 | 플러그인 제거로 끝. 구 v0.17 자산 제거는 migration skill(M3)의 경계 안이다 |
| `config` 명령 | **만들지 않는다** | config.yml 직접 편집 + `doctor` 검증으로 충분 (YAGNI) |
| `status` 명령 | **만들지 않는다** | `ctx` 상태 줄·`doctor`·`index status`가 이미 그 자리다 (YAGNI) |
| goal 개념 (`vision/goals.md`) | **가져오지 않는다** | plan source가 그 자리를 대체했다. goals.md의 데이터 이주는 M3 매핑이 담당 |
| RELEASE notice · 5로케일 | **틀을 남기지 않는다** | 배포 단계의 일. 0.17.8 다리는 main의 기존 notice 기제를 그대로 쓴다 |

# M2 — 호환: 자동 업데이트 차단과 기능 대조

## 자동 업데이트 차단 (이중)

- v0.18의 `package.json`에 `reap.autoUpdateMinVersion: "0.18.0"`이 들어간다
- 배포 정책 — **0.18은 npm latest로 올리지 않는다** — 가 v0.18 브랜치의 릴리스 문서에 명문화된다. 발행 자체는 이 계획의 범위 밖이지만, 정책이 코드보다 먼저 적혀 있어야 발행 세대가 그것을 읽는다
- 0.17.8 다리의 설계 승계: 일일 캐시 + 0.18 안내 + upgrade agent 설치. **main 브랜치의 것**이며 0.18보다 먼저 발행되어야 한다는 순서 제약을 문서가 보존한다

## 기능 대조 — 가져갈 것과 버릴 것

1차 판단은 ps-4f2a91 `08-delivery.md`의 폐기 표가 이미 했고 v0.18에서도 유지된다: 5단계 lifecycle·흐름 제어 명령·maturity/cruise·merge lifecycle·evaluator·lineage 압축·opencode 어댑터 폐기, code index는 이식 완료.

reap에 상당물이 이미 있는 것: `fix --check`→`doctor`, `load-context`→`ctx`, `sequence`→`seq`, 자동 이슈 보고→`report-issue` skill, `install-skills`→플러그인 설치로 대체.

**미결 — M2에서 사람과 정한다** (결론이 아니라 판단 대상 목록이다):

| reap 기능 | 쟁점 |
|---|---|
| `check-version`/버전 안내 | 바이너리 배포에서 상당물이 필요한가 (brew는 자체 갱신 경로가 있다) |
| `uninstall` | spec은 "플러그인 지우면 끝"으로 결정했으나, migration skill이 구 자산 제거에 gen-088 로직을 승계하므로 경계를 다시 그어야 한다 |
| `config` 명령 | reap는 config.yml을 도구가 읽기만 한다 |
| `status` 명령 | reap는 `index status`뿐, 전반 상태 표시가 없다 |
| goal 개념 (`vision/goals.md`) | reap에는 없다 — plan source가 그 자리를 대체했는가 |
| RELEASE notice · 5로케일 문서 | 배포 밖이지만 v0.18 브랜치에 틀은 남길 것인가 |

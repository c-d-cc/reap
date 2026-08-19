# Shortterm Memory

## 세션 요약 (gen-085, 2026-08-19)

### daemon 버전 판정 3건 — 전부 닫았고, 그중 둘은 이번 세대가 새로 만든 결함이었다

`semverGte` 통합 / `MIN_DAEMON_VERSION` 발행 게이트 / 낡은 daemon 안내. **gen-084 가 미뤄둔 세 번째를 뒤집어 착수했다** — 그 근거(`daemon/package.json` 이 오늘 아침까지 0.1.0, 체크아웃은 발행되지 않는다)는 `git log` 한 번으로 나왔다.

**backlog 이 몰랐던 것**: `semverGte` 구현이 **두 벌**이었고(`check-version.ts` + `core/migration.ts`) SemVer §11 순서 예제 인접쌍 7개에 대해 **둘 다 7/7 오답**이었다.

**근거가 틀렸는데 결론이 맞았던 것**: migration 만 코어로 비교하는 `releaseLineGt`. "되돌리면 3건 red 니 실재하는 회귀다"라고 적었지만 **그 3건은 전부 그 정책을 위해 방금 쓴 테스트**였고 기존 테스트는 0건 깨졌다. 정책은 **유지**됐다 — 진짜 근거는 red 개수가 아니라 **유저가 `reapdev.alphaPublish` 로 실제 alpha 를 내고 그것을 깔아 테스트한다**는 것이었다. 그 조합에서 strict semver 는 `v0.17.6.md` 를 숨긴다.

**상위 지시가 이 항목에서 두 번 바뀌었다**(유지 → 제거 → 유지). 그때마다 implementation 까지 정식 회귀했고 최종은 유지다. 경위는 05-completion.md § 지시 변경 이력 — **세대가 스스로 흔들린 것이 아니다.**

### evaluator 가 낸 것 3건은 내가 만든 결함이었다

- 새 게이트가 **패키지 이름 오타를 fail-open** 으로 흘렸다(`E404` 를 `2>/dev/null` 이 삼킴). 게이트를 만드는 세대가 게이트에 구멍을 남기면 다음 사람은 그 구멍을 신뢰한다
- 착수 근거로 든 `checkout` 경로를 정작 수정에서 빠뜨리고 **테스트로 "옳다"고 못박았다**. 누락은 발견되지만 주장은 설득한다
- `performAutoUpdate` 동작 변경 서술이 **사실이 아니었다** — L108 이 `-alpha` 를 비교 전에 early-return 한다. 코드를 읽는 대신 "이 함수가 semverGte 를 쓴다"에서 결론까지 갔다

### 지금 상태

- unit **545** (523→) / e2e 279 / scenario 44 / daemon 130, 전부 0 fail
- `MIN_DAEMON_VERSION` **0.2.0 유지**, `package.json` **0.17.5 유지** — 둘 다 의도적 무변경
- 게이트 이름이 바뀌었다: `check-daemon-floor.sh` → **`scripts/check-version-floors.sh`** (`autoUpdateMinVersion` 까지 검사)
- **로컬 macOS 에서만 돌았다.** push 하지 않았으므로 reap-test dispatch 미실행 — 리눅스는 표본 밖

### 다음

- **0.17.5 릴리즈 문서 보강이 남았다** — 본 세대 작업이 0.17.5 에 들어가므로 RELEASE_NOTES / NOTICE / 5 로케일에 추가해야 한다. 세대 밖, main agent 소관. 태그는 아직 안 밀었다
- **신설 backlog 4건 중 가장 값어치 있는 것**: `이-저장소의-dog-fooding-은-daemon-checkout-분기를-한-번도-밟지-않는다`. workspaces 심링크가 `package` 로 잡혀 `checkout` 이 죽은 경로다 — gen-083 이 그 분기를 만든 이유가 성립하지 않는다
- gen-086(typecheck·빌드 3건) / gen-087(lifecycle 도구 2건) 은 midterm 참조. **gen-087 의 "validation work phase 재실행 불가"를 본 세대에서 또 겪었다** — evaluator prompt 를 회수할 수 없어 `/tmp` 에 저장해야 했다

### 열려 있는 갭

- **낡은 daemon 검증은 조작된 `package.json` 을 쓴다.** 진짜 낡은 발행본이 존재한 적이 없다. 0.3.0 을 내는 날 실물로 바꿀 수 있다
- **autoUpdate guard 자체는 테스트되지 않는다** — 비교식만. 두 guard 가 `execSync`/`npm view` 를 주입 없이 부른다
- environment 272줄 / midterm·longterm 도 가이드라인 부근. **근본 정리는 처방적 서술(설계 근거)을 genome 으로 옮기는 작업**이며 여전히 미완 — adapt 후보로 완료 artifact 에 적었다

# 02 Planning — gen-094-61a545

**Goal**: daemon 서술을 사용자 대면 문서에서 전부 제거한다 — 폐기된 기능의 설치 안내와 회고가 남아 있다

**Clarity: HIGH** → brainstorming 생략, 판단 3건만 근거와 함께 확정하고 task 분해로 직행.

## Spec

**daemon 이 없던 것처럼 서술한다.** 사용자 대면 텍스트에서 daemon 을 지우되, "폐기됐다"는 회고도 남기지 않는다.

경계:
- **지우는 것**: 사용자가 읽는 산문·CLI 출력에서 daemon 을 지목하는 서술
- **남기는 것**: 동작하는 코드·경로·식별자·라우트, 개발자 대면 주석, 역사 기록(lineage), 실행 지시(migration note)

## 확정된 판단

### 판단 1 — 과거 버전 changelog: **daemon 서술을 지운다. 항목 자체는 남긴다.**

`RELEASE_NOTICE.md` v0.17.5/v0.17.0, 5개 로케일 `releaseNotes` 의 같은 두 항목, `RELEASE_NOTES.md` `## v0.17.5` / `## v0.17.0`.

**결정: 버전 항목은 유지하고, 그 안의 daemon 서술만 제거한다.** 항목을 통째로 삭제하지 않는다.

근거 — 두 논거가 실제로 충돌하지 않기 때문이다:

| 논거 | 무엇을 요구하는가 |
|---|---|
| "changelog 는 역사 기록이다" | **버전 항목이 존재할 것.** v0.17.5 를 쓰던 사람이 자기 릴리즈를 찾을 수 있어야 한다 |
| 사용자 지시 + genome *"낡은 서술은 제거한다"* | **daemon 서술이 없을 것** |

항목을 남기고 내용에서 daemon 을 빼면 둘 다 만족한다. v0.17.5 는 daemon 외에도 `reap run push` 오류 보고, `reap help` 목록, npm 12 install script 대응을 담고 있고 v0.17.0 은 evaluator fitness 통합을 담고 있다 — **daemon 을 빼도 항목이 비지 않는다.**

결정적 근거는 **실행 가능성**이다. 회고는 읽히고 끝나지만 `npm i -g @c-d-cc/reap-daemon` 과 `reap daemon start` 는 **따라 할 수 있고 실패한다.** changelog 의 목적("그 릴리즈가 무엇을 했는가")은 이미 없는 기능을 지목하지 않고도 서술 가능하다.

`RELEASE_NOTES.md` 의 `## Daemon Setup` 절만은 **통째로 삭제**한다. 버전 항목이 아니라 "지금 이렇게 설정하라"는 살아있는 설치 안내이고, 존재하지 않는 명령을 지시한다.

### 판단 2 — migration note: **파일별로 갈린다** (validation 후 정정)

> **정정 (validation 회귀, evaluator 지적).** 처음에 `v0.17.5.md` 와 `v0.17.6.md` 를 **한 줄에 묶어 하나의 근거로** 제외했다. 그 근거는 v0.17.6 에만 참이었다. **두 파일을 하나로 검증했고, 검증한 쪽이 무고한 쪽이었다.**

**`v0.17.6.md` — 범위 밖 (유지).** 내용 전체가 *제거 지시*다. `detectPendingMigrations` 가 `(lastMigratedVersion, packageVersion]` 에서 골라 agent 에게 실행시키며, 지우면 `daemon: true` 와 `~/.reap/daemon/` 을 가진 프로젝트에 아무것도 도달하지 않는다.

**`v0.17.5.md` — 범위 안 (`## Also in v0.17.5 — action only if you use the daemon` 절 삭제).** 내용이 정반대다:

```
:72  **If and only if your project sets `daemon: true`**, install it once:
:75  npm i -g @c-d-cc/reap-daemon
:78  ... `reap daemon status` reports where it resolved from.
```

- 실측 [실행]: `reap daemon status` → **출력 없음, exit 0**. 존재하지 않는 명령을 가리킨다
- 실측 [실행]: `src/core/migration.ts:113` 이 `lastMigratedVersion` 미설정 시 `"0.0.0"` 으로 fallback 하고, `reap init` 은 그 필드를 쓰지 않는다 → **신규 프로젝트에도 이 note 가 surface 한다.** 업그레이드 사용자만의 문제가 아니다
- `scripts/build.sh` 가 `src/templates` 를 통째로 `dist/` 에 복사하므로 **배포된다**
- 매 SessionStart `reap load-context` 가 pending migration 을 컨텍스트에 주입한다

**이것은 `RELEASE_NOTES.md` 의 `## Daemon Setup` 과 같은 결함 종류다** — 존재하지 않는 명령에 대한 살아있는 설치 안내. 그것은 삭제했으면서 이것은 남긴 것은 일관되지 않고, **도달 범위는 이쪽이 더 넓다.**

삭제해도 안전한 이유:
- 각 발행 버전이 자기 note 스냅샷을 함께 배포한다 → 0.17.5 에 고정된 사용자는 0.17.5 tarball 을 읽으므로 영향 없음
- 0.17.6+ 사본을 읽는 사람은 `v0.17.6.md` 도 함께 받고, 그것이 *제거하라*고 말한다
- `check-docs-version.sh` § 5 는 **파일명만** 본다 (내용 무관, 파일은 유지)
- `grep -rn "0\.17\.5" tests/` — 그 파일의 내용을 assert 하는 테스트 없음

### 판단 3 — CLI 출력 문자열: **범위 안**

`reap update` / `reap uninstall` 이 화면에 찍는 "retired daemon" 은 문서가 아니지만 **사용자가 읽는 회고 서술**이다. 경로 `~/.reap/daemon/` 은 실제 삭제 대상이므로 이름을 유지하고, 옆의 회고 문구만 제거한다.

동반 필수: `tests/e2e/update.test.ts:349` 가 `not.toContain("retired daemon")` 으로 부재를 검사한다. 문구를 지우면 **그 assertion 이 무엇을 해도 통과하는 공허한 검사가 된다** — 새 문구 기준으로 고친다.

## Requirements

**FR1** `RELEASE_NOTES.md` 에서 `## Daemon Setup` 절을 삭제하고, What's New·v0.17.5·v0.17.0 의 daemon 서술을 제거한다.
**FR2** `RELEASE_NOTICE.md` 의 v0.17.6·v0.17.5·v0.17.0 en/ko 6개 본문에서 daemon 서술을 제거한다.
**FR3** README 5개 각각에서 `Replacing the daemon` 문단을 삭제하고 uninstall 설명의 daemon 회고를 제거한다.
**FR4** `src/templates/reap-guide.md` 에서 `### There used to be a daemon` 절과 나머지 3건을 제거하고, `.reap/reap-guide.md` 를 byte-identical 로 동기화한다.
**FR5** 5개 로케일에서 `retiredTitle`/`retiredDesc`/`retiredCode`/`retiredNote` 4키를 삭제하고, `uninstallNote` 와 changelog 3항목의 daemon 서술을 제거한다. **라우트·`daemonPage` 키·`nav.items.daemon` 은 유지**한다.
**FR6** `DaemonPage.tsx` 에서 `retired*` 렌더링 블록과 회고 주석을 제거한다. 라우트 `/docs/daemon` 과 페이지는 유지한다.
**FR7** `uninstall.ts` / `update.ts` 의 사용자 출력 문자열에서 회고 문구를 제거한다(경로는 유지).
**FR8** `tests/unit/shipped-docs-no-daemon.test.ts` 를 새 정책(guide 에 daemon 산문 불허)으로 강화하고, 두 `reap-guide.md` 사본의 byte-identity 검사를 신설한다.
**FR9** 영향받는 기존 테스트(`tests/e2e/update.test.ts`)를 새 문구에 맞게 수정한다.
**FR10** 범위 밖 발견 2건을 backlog 로 등록한다.
**FR11** (validation 후 추가) `src/templates/migration/v0.17.5.md` 의 daemon 설치 지시 절을 삭제한다 — 배포되고 SessionStart 마다 agent 에게 주입되는 살아있는 오지시.
**FR12** (validation 후 추가) README 5개의 uninstall 설명에서 `~/.reap/` 항목 열거를 없앤다 — 열거는 `REAP_HOME_ENTRIES` 와 다시 어긋난다.

## Completion Criteria

1. 사용자 대면 집합에 대해 `grep -ri daemon` 이 **0건** — 제외 경로를 명시적으로 나열하고, 검사 대상 파일 목록이 비지 않았음을 함께 보인다
2. `bash scripts/check-docs-version.sh` 통과
3. `cd docs && npx vite build` 통과 + `/docs/daemon` 라우트 유지 확인
4. `.reap/reap-guide.md` == `src/templates/reap-guide.md` (byte)
5. 세 스위트 baseline 유지 — unit ≥627 / e2e 331 / scenario 44, 0 fail
6. FR8 의 새 검사가 **수정 전 상태에서 fail** 하는 것을 먼저 확인 (negative)
7. `npm run build` 성공 + `reap fix --check` 0 error / 2 warning 유지
8. **격리된 신규 프로젝트에서 `reap load-context` 가 agent 에게 주입하는 daemon 줄이 v0.17.6 note 분만 남는다** (validation 후 추가). C1 의 `grep` 은 *파일이 무엇을 담는가*를 답하고, 이것은 *사용자에게 무엇이 도달하는가*를 답한다 — 제외 집합이 틀리면 전자는 조용히 통과한다

## 수정 대상 파일 — strictEdit 화이트리스트

이 목록에 없는 파일은 수정하지 않는다.

**문서 (사용자 대면)**
1. `RELEASE_NOTES.md`
2. `RELEASE_NOTICE.md`
3. `README.md`
4. `README.ko.md`
5. `README.ja.md`
6. `README.de.md`
7. `README.zh-CN.md`
8. `src/templates/reap-guide.md`
9. `.reap/reap-guide.md`

**docs 사이트**
10. `docs/src/i18n/translations/en.ts`
11. `docs/src/i18n/translations/ko.ts`
12. `docs/src/i18n/translations/ja.ts`
13. `docs/src/i18n/translations/de.ts`
14. `docs/src/i18n/translations/zh-CN.ts`
15. `docs/src/pages/DaemonPage.tsx`

**CLI 출력**
16. `src/cli/commands/uninstall.ts`
17. `src/cli/commands/update.ts`

**배포되는 실행 지시 (validation 후 추가)**
18. `src/templates/migration/v0.17.5.md` — `## Also in v0.17.5 — action only if you use the daemon` 절만 삭제. 나머지 절과 파일은 유지

**테스트 (submodule)**
19. `tests/unit/shipped-docs-no-daemon.test.ts`
20. `tests/e2e/update.test.ts`

**reflect/adapt phase 에서만**
21. `.reap/environment/summary.md` (reflect)
22. `.reap/environment/source-map.md` (reflect)
23. `.reap/genome/evolution.md` (adapt)
24. `.reap/vision/memory/*.md` (reflect, 의무 pruning)

## Task 분해

- [ ] **T001** 검사부터 만든다 — `tests/unit/shipped-docs-no-daemon.test.ts` 를 새 정책으로 재작성. (a) guide 는 `daemon` 문자열 0건(blanket ban), (b) agent 정의 기존 assertion 유지, (c) 자기증명 항목(대상 파일이 존재함) 유지. **수정 전 상태에서 red 를 확인한다.**
  - 검증: `bun test --isolate tests/unit/shipped-docs-no-daemon.test.ts` → **fail 기대** [negative]
- [ ] **T002** 두 `reap-guide.md` 사본 byte-identity 검사 신설 (T001 과 같은 파일에 추가). 한쪽만 고치면 red. **한쪽을 일부러 어긋내 red 를 확인**한다.
  - 검증: 같은 명령 + 일부러 어긋낸 상태 [negative]
- [ ] **T003** `src/templates/reap-guide.md` 수정 — `### There used to be a daemon` 절 삭제, `:392` uninstall 설명, `:470` "retired daemon also carried", `:479` 명령 제거
- [ ] **T004** `.reap/reap-guide.md` 를 T003 결과로 동기화 (`cp`)
  - 검증: T001+T002 → green [실행]
- [ ] **T005** `RELEASE_NOTES.md` — `## Daemon Setup` 절 삭제 + What's New 5건 + v0.17.5 3건 + v0.17.0 1건 재작성
- [ ] **T006** `RELEASE_NOTICE.md` — v0.17.6·v0.17.5·v0.17.0 의 en/ko 6개 본문 재작성
  - 검증: `bash scripts/check-docs-version.sh` [실행]
- [ ] **T007** README 5개 — `Replacing the daemon` 문단 삭제 + uninstall 설명 수정. **5개를 한 묶음으로 처리**하고 건별로 대조
- [ ] **T008** 로케일 5개 — `retired*` 4키 삭제 + `uninstallNote` 수정 + changelog 3항목(v0.17.6/v0.17.5/v0.17.0) 재작성. **5개 완전 대칭**
- [ ] **T009** `DaemonPage.tsx` — `retired*` 렌더링 4줄 + 회고 주석 제거. 라우트·페이지 유지
  - 검증: `cd docs && npx vite build` [실행] + 라우트 유지 grep
- [ ] **T010** `uninstall.ts:100` / `update.ts:289` 사용자 출력 문자열 수정
- [ ] **T011** `tests/e2e/update.test.ts` — 새 문구 기준으로 assertion 수정 (특히 `:349` 의 부재 검사를 공허하지 않게)
  - 검증: `npm run build && npm run test:e2e` [실행]
- [ ] **T012** 전수 확인 — 사용자 대면 집합에 `grep -ri daemon` 0건. 대상 목록이 비지 않았음을 먼저 출력
- [ ] **T013** 세 스위트 + `check-docs-version.sh` + `npm run build` + `reap fix --check` 전체 실행
- [ ] **T014** backlog 2건 등록 — `package-lock.json` daemon workspace 잔존, `vision/design/reap-tree.md` 의 daemon 현재형 서술

### validation 회귀 후 추가 (T015~T018)

- [ ] **T015** `src/templates/migration/v0.17.5.md` — `## Also in v0.17.5 — action only if you use the daemon` 절 삭제
  - 검증: **격리된 신규 프로젝트에서 `reap load-context` 의 daemon 줄 수를 측정**한다. 지금은 19줄. 목표는 v0.17.6 note 가 필연적으로 갖는 줄만 남는 것 [실행]
  - 이 측정이 애초에 완결성 주장이 서 있었어야 할 자리다. `grep` 은 *어떤 파일이 무엇을 담는가*를 답하고, 이 검사는 *사용자에게 무엇이 도달하는가*를 답한다
- [ ] **T016** `README*.md` ×5 — uninstall 설명에서 `~/.reap/` 항목 **열거를 제거**한다
  - 이유: `REAP_HOME_ENTRIES` 는 `["reap-guide.md", ".install-stamp", "daemon"]` 3개인데 daemon 을 뺀 결과 README 가 2개만 적어 **"나머지는 그대로 둔다"는 약속이 거짓**이 됐다. 열거하면 다시 어긋난다 — genome 의 *"표식보다 공유가 낫다"* 를 산문에 적용하면 **아예 열거하지 않는 것**이다
  - `uninstall.ts:100` 의 화면 목록은 **유지**한다. 그것은 지금 지워질 실제 경로를 사용자에게 보여주는 자리이고, 회고 문구는 이미 뺐다
- [ ] **T017** `tests/unit/shipped-docs-no-daemon.test.ts` — 새로 쓴 주석의 과장 수정. `.reap/reap-guide.md` 는 `integrity.ts:170` 이 **에러를 낼지 말지 판정할 때만** 쓴다. "agent 가 읽는 두 번째 답"이 아니다 (`claude-md-section.md:21` 은 `@~/.reap/reap-guide.md` 고 fallback 이 없다). 진짜 근거는 dog-fooding 동기화이며 `genome/application.md` 가 이미 소유한다
- [ ] **T018** `04-validation.md` C3 근거 수정 — `vite build` 는 **타입 검사를 하지 않는다** (`docs/package.json` 의 build 는 `vite build` 단독, esbuild 는 transpile only). "빌드 통과 = dangling reference 부재"는 거짓이다. 사실 자체는 grep 으로 확인하고 근거를 그것으로 바꾼다

의존: T001·T002 → T003 → T004. T005~T010 병렬 가능. T010 → T011. 전부 → T012 → T013.
T015~T018 은 validation 회귀분 — T015 → 재검증, T016~T018 은 독립.

## validation 회귀에서 배운 것 — 계획에 남긴다

**한 줄에 두 파일을 묶으면 하나만 검증하게 된다.** 제외 표의 `src/templates/migration/v0.17.{5,6}.md` 는 한 행이었고 근거도 하나였다. 그 근거는 v0.17.6 에만 참이었고, v0.17.5 는 정반대 내용을 담고 있었다. **검증한 쪽이 무고한 쪽이었다.**

교훈은 "더 꼼꼼히 보자"가 아니다 — 그것은 이미 실패한 방법이다. **글롭으로 묶은 제외는 항목마다 근거를 따로 적을 수 없으므로, 묶는 순간 검증이 하나로 줄어든다.** 제외는 파일 단위로 적고 근거도 파일 단위로 적는다.

**그리고 완결성의 근거를 `grep` 에 둔 것이 이 누락을 가능하게 했다.** `grep` 은 "이 파일 집합에 문자열이 없다"를 답하지, "사용자에게 무엇이 도달하는가"를 답하지 않는다. 제외 집합이 틀리면 grep 은 조용히 통과한다. T015 의 `reap load-context` 측정이 그 자리를 메운다.

## 테스트 전략

| 변경 | 레벨 | 근거 (genome 표) |
|---|---|---|
| 배포 문서(guide/agents) | **unit** — T001/T002 | 파일 내용 검사, 외부 의존 없음 |
| CLI 출력 문자열 | **e2e** — T011 | CLI command 수정 → JSON output 검증 |
| README·RELEASE_*·로케일 | **스크립트 게이트** — `check-docs-version.sh` + `vite build` + T012 grep | 산문. 기능적 영향 없음 |

**새 검사는 먼저 실패시킨다** (genome: *"검사를 만들 때 — 먼저 실패시켜라"*). T001·T002 를 T003 앞에 두는 이유가 이것이다.

## Additional Findings

### 기존 검사의 정책이 사용자 지시와 충돌한다

`tests/unit/shipped-docs-no-daemon.test.ts` 는 guide 의 daemon 회고를 **명시적으로 허용**하고 그 완화를 주석으로 길게 정당화한다. 사용자가 그 전제를 무른 이상 완화의 근거가 사라졌다. blanket ban 이 이제 옳고, 주석의 정당화도 함께 바뀌어야 한다 — 남겨두면 다음 사람이 "회고는 허용"으로 읽는다.

부수 확인: 현재 금지 패턴 `npm (i|install) -g @c-d-cc/reap-daemon` 은 guide 가 실제로 갖고 있는 **`npm uninstall -g @c-d-cc/reap-daemon` 을 잡지 못한다.** 실행 가능한 명령인데 통과하고 있었다 — 완화가 구멍까지 낳은 사례다.

### 두 guide 사본 동기화에 검사가 없다 (확인됨)

`grep -rn "templates.*reap-guide" tests/ scripts/ .github/` → 0건 [실행]. 지금까지 손으로 맞춰 왔다. 본 세대가 정확히 그 위험을 지므로 T002 로 만든다 — genome 의 *"인과로 묶인 검증 동작 fix 는 본 generation 에서 처리"*.

### `ja.ts` 의 `retiredTitle` 은 grep -i daemon 에 잡히지 않는다

`かつてはデーモンがありました` — "daemon" 이 가타카나다. **완결성 근거를 `grep -i daemon` 하나에만 두면 안 된다**는 실증. T012 는 daemon 외에 `retired` / `17224` / `데몬` / `デーモン` / `Daemon` 도 함께 본다.

## Risks

1. **로케일 부분 수정** — T008 을 5개 한 묶음으로 처리하고 `check-docs-version.sh` § 4 로 검증
2. **guide 한쪽만 수정** — T002 가 막는다
3. **키 삭제로 빌드 파손** — `retired*` 를 지우면 `DaemonPage.tsx` 참조가 깨진다. T009 를 T008 과 같은 커밋에서 처리하고 `vite build` 로 확인
4. **`check-docs-version.sh` § 2 위반** — What's New 에 `- ` 항목이 남아야 한다. daemon 항목 2개를 빼도 8개가 남는다 (확인함)
5. **부재 검사가 공허해짐** — T011 이 다루는 정확한 문제

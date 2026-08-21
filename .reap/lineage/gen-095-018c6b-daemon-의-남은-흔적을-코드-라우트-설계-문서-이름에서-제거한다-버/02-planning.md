# 02 Planning — gen-095-018c6b

**Goal**: daemon 의 남은 흔적을 코드·라우트·설계 문서·이름에서 제거한다 — 버전업 경로의 청소 코드는 남긴다

## 접근

승계된 워킹트리가 `src/` 와 `docs/src/` 를 이미 닫았고, **승계된 검사가 남은 일을 스스로 지목한다**
(`shipped-docs-no-daemon.test.ts` 3 fail). 따라서 계획은 "검사를 green 으로 만든다"가 아니라
**"검사가 red 인 지점 + 검사가 보지 못하는 지점"** 둘을 다룬다. 후자를 놓치면 검사 범위를 기준으로
착각하게 된다 — 통과는 "검사 범위 안에서 문제없음"일 뿐이다.

## 판단 기준 — D 를 어떻게 적용하는가

사용자 지시: *"D 역시 굳이 근거를 남길 필요가 없다. **왜 그렇게 생겼는지 라는 이유를 자꾸 작성하지 마라.**"*

- **삭제** — 폐기된 것과 대조하는 서술. "the daemon did X" · "이전에는 Y였다" · "그래서 이렇게 됐다"
- **유지** — 지금 코드의 동작을 이해하는 데 필요한 사실: 제약 · 불변식 · 외부 도구의 실측된 행동
- 애매하면 **지운다**

승계분의 `src/indexer/graph.ts` 처리(8줄 회고 → 지금 참인 3줄)를 기준형으로 삼고, 나머지도 같은
기준인지 통독으로 확인했다 — §Task 0.

## Tasks

### T0. 승계분 재검토 — D 기준 일관성 `[통독]`
- [x] `git diff -- src/ .github/ package.json` 전량 통독 (learning 에서 수행)
- [x] D 기준으로 과잉 잔존한 문장 재판정. 후보: `src/indexer/index.ts` 의
      *"so there is nothing a warm cache would buy"* — 사라진 대안에 대한 반론이다.
      측정치(단일 자릿수 ms vs 40-70ms)는 **지금 코드의 성질**이므로 남기고, 반론 절만 지운다.

### T1. `scripts/build.sh` — 회고 삭제 + 매달린 문장 재작성
- [x] `:14~18` better-sqlite3 회고 문단 삭제
- [x] "web-tree-sitter is not that" 의 지시 대상이 사라지므로 남는 절을 **자립하는 문장**으로 재작성
- [x] **제약**: `environment/summary.md` 가 이 주석을 지목하며 *"인라인하면 깨진다는 것은 입증되지
      않았다 — gen-089 가 시험했고 통과했다"* 라고 적는다. 재작성 후에도 그 사실이 주석에 남아야 한다
- [x] carrier `zero-native-dependency` 를 grep 해 다른 보유처와 어긋나지 않는지 확인

### T2. `scripts/check-version-floors.sh:10` — `MIN_DAEMON_VERSION` 회고 삭제
- [x] 첫 문장 삭제. 남길 것: "floor 가 하나여도 게이트할 가치가 있고, 다음에 추가되는 floor 는
      검사를 물려받는다" — 이것은 지금 참인 설계 사실이다

### T3. `.github/workflows/release.yml:69` — 회고 절 삭제
- [x] *"— the daemon entry that used to sit in this list was not, and stayed false for five generations."*
      삭제. 남길 것: *"Both were reproduced against the broken state before being claimed here."*
- [x] carrier `self-diagnosis-covered-incidents` 공유처(`check-self-diagnosis.sh`)와 함께 고친다

### T4. `scripts/check-self-diagnosis.sh` — 산문 삭제 · 기능 유지 · 죽은 코드 제거
- [x] **(나) 산문 삭제**: `:19~23` · `:253~258` · `:259~268` · `:401~402` · `:407~410` · `:448` · `:453~455`
      (+ `:264` NodeNext fixture 주석 — 라운드 1 에서 추가로 발견. 총 8곳)
- [x] **(가) 기능 유지**: `:762~763` 심기 · `:791` 사전조건 · `:841` 제거 단언. 주석만 회고 제거
- [x] **(다) 죽은 코드 삭제**: `:474~483` `lsof 17224` 블록 · `:797~801` `REAP_DAEMON_PORT=17288`
- [x] `:486` ok 문구의 `no process` 표현을 실제 단언 집합과 일치시킨다 (게이트가 더 이상 검사하지
      않는 것을 성공 문구가 주장하면 그것이 곧 과약속이다)

### T5. `.reap/genome/evolution.md:140` — 낡은 규칙 교체
- [x] `| 외부 도구 / subprocess / daemon 통합 |` → daemon 을 뺀 현재형 표현으로 **교체**
- [x] **줄 수를 늘리지 않는다** — 파일 299줄, 가이드라인 ~300
- [x] `src/templates/evolution.md` 는 **해당 없음** (측정: 그 표가 없다). 배포 템플릿 무변경

### T6. `tests/` 의 죽은 이름 2건 (F)
- [x] `tests/fixtures/indexer-sample/` — **개명이 아니라 디렉토리 삭제로 바뀌었다.** 재확인 결과
      `package.json` 만이 아니라 **디렉토리 전체를 읽는 코드가 0건**이다 (`03-implementation.md` § T6)
- [x] `tests/unit/semver.test.ts:45` 주석의 `MIN_DAEMON_VERSION` 삭제 — `src/` 에 없는 심볼이다

### T7. `tests/` 의 포트·명령 단언 삭제 (판단 — team lead 에 보고 후 진행)
- [x] `tests/e2e/index-command.test.ts` 의 `describe("e2e: reap index — no resident process")` 2 test 삭제
- [x] `tests/unit/prompt-code-intelligence.test.ts` 의 `"nothing about a daemon, a port, or curl survives"` 삭제
- [x] **삭제 후 무엇이 검증되지 않게 되는지 명시**한다. 대체되는 곳: `src/core/prompt.ts` 는
      `shipped-docs-no-daemon` 의 `src` sweep 이 덮는다. `reap daemon` 이 명령이 아니라는 것은
      **아무 미지의 단어와 구분되지 않으므로 애초에 검증된 적이 없다**

### T8. `shipped-docs-no-daemon.test.ts` — `tests/` 로 sweep 확장
- [x] `git ls-files` 를 `cwd = <REPO>/tests` 로 돌리는 `trackedInTests()` 추가
- [x] 제외는 **경로 하나에 근거 하나**. 묶지 않는다 — 중괄호·와일드카드·"등"·"계열"·
      "재생성했고 깨끗하다" 같은 한 문장 전부 금지
- [x] 예상 제외: `unit/uninstall.ts` 계열 · `e2e/uninstall.test.ts` · `e2e/update.test.ts` ·
      `unit/shipped-docs-no-daemon.test.ts` (각각 개별 근거)
- [x] **self-proving 바닥**: 파일 수 하한을 걸어 빈 목록이 통과하지 못하게 한다

### T9. backlog 1건 신설 (범위 밖 결함)
- [x] `reap make backlog --type task` — `https://reap.cc/docs/*` 전부 HTTP 404
- [x] 본문: 재현 명령·결과 / 원인(`docs.yml` 의 `cp index.html 404.html` + GitHub Pages 동작) /
      영향(README 5개 링크 10+ · npm 페이지 · 검색 색인 부재) /
      해법 후보(Pages 이탈 · 라우트별 프리렌더 · hash 라우팅) /
      **어떤 게이트도 배포된 사이트에 HTTP 요청을 보내지 않아 5개월 이상 안 걸린 것**
- [x] implementation 단계에서 생성. adapt 아님

## 검증 계획 — 항목마다 근거 종류를 미리 못 박는다

`[실행]` 은 **그 항목을 실제로 판정하는 명령을 지목할 수 있을 때만** 붙인다. 지목할 수 없으면 `[독해]` 다.

| # | 검증 항목 | 근거 종류 | 판정 명령 |
|---|---|---|---|
| V1 | 잔여 daemon 흔적 0 (src·docs/src·scripts·.github·genome) | `[실행]` + `[negative]` | `bun test tests/unit/shipped-docs-no-daemon.test.ts` — **지금 3 fail 이며 그것이 유효성 근거다** |
| V2 | `tests/` 에도 흔적 0 | `[실행]` + `[negative]` | 같은 파일의 신규 sweep. 신설 직후 red 를 먼저 본다 (F 2건이 살아있는 상태에서) |
| V3 | 제외 목록에 죽은 경로 없음 | `[실행]` | 같은 파일의 `existsSync(e.path)` 단언 |
| V4 | 로케일 개명 누락 감지 | `[negative]` | 한 로케일만 되돌려 `npm run typecheck:docs` red 확인 → 복원 |
| V5 | docs 라우트 문자열 일치 감지 | `[negative]` | `App.tsx` path 를 한 글자 깨뜨려 `tests/unit/docs-wiring.test.ts` red 확인 → 복원 |
| V6 | docs typecheck 가 CI 에서 실제로 도는가 | `[독해]` | `.github/workflows/docs.yml` 배선 확인. **워크플로를 이 세대에서 돌리지 않으므로 `[실행]` 이 아니다** |
| V7 | A(보존 대상) 무손상 | `[실행]` | `bun test tests/unit/uninstall.test.ts tests/e2e/uninstall.test.ts tests/e2e/update.test.ts` |
| V8 | 자기진단 게이트 전 절 | `[실행]` | `bash scripts/check-self-diagnosis.sh` — §8 이 daemon 디렉토리 심기·제거를 실제로 돈다 |
| V9 | 타입·빌드 | `[실행]` | `npm run typecheck` · `npm run typecheck:docs` · `npm run build` · `cd docs && npx vite build` |
| V10 | 세 스위트 | `[실행]` | `npm run test:unit` · `test:e2e` · `test:scenario`. baseline unit 629 / e2e 331 / scenario 44 — **T7 로 3 감소, T8 로 증가**. 증감을 근거와 함께 보고 |
| V11 | 문서 정합성 | `[실행]` | `bash scripts/check-docs-version.sh` |
| V12 | carrier 정합성 | `[실행]` | `bash scripts/list-carriers.sh --orphans` — 기존 1건 외 증가 없음 |
| V13 | `.reap/` 구조 | `[실행]` | `reap fix --check` — 현재 0 error / 2 warning 유지. **evolution.md 가 299줄이므로 300 을 넘기면 warning 이 늘어난다** |
| V14 | 값을 바꾼 뒤 carrier 재-grep | `[실행]` | 바꾼 값마다 `grep -rn "reap:carrier(<id>)" .` 재실행 |

### 검증이 **못 하는 것** — 미리 적는다

- **배포된 사이트에 HTTP 요청을 보내는 게이트가 없다.** V4·V5 는 소스의 정합성만 본다.
  `/docs/*` 가 404 라는 사실은 어떤 검사도 잡지 못하며 그것이 T9 backlog 의 내용이다.
- **`.github/workflows/docs.yml` 의 신규 step 은 이 세대에서 실행되지 않는다.** push 하지 않으므로
  V6 는 `[독해]` 다. `npm run typecheck:docs` 를 로컬에서 도는 것은 **같은 명령이지 같은 실행이 아니다.**
- **제3자 링크는 측정하지 못했다.** 블로그·SNS·사설 북마크가 `/docs/daemon` 을 가리킬 수 있다.
  저장소 안에는 0건이지만 밖은 모른다. 복구 수단은 completion artifact 에 적는다.
- **`tests/` sweep 은 submodule 의 tracked 파일만 본다.** 커밋되지 않은 파일은 안 보인다.

## 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 게이트 산문을 지우다 기능 단언까지 지운다 | §4.2 의 (가)/(나)/(다) 분류를 편집 전에 확정했다. 편집 후 `bash scripts/check-self-diagnosis.sh` 전 절 통과로 확인 |
| `build.sh` 재작성이 `summary.md` 의 지목을 무효화한다 | T1 에 명시적 제약으로 걸었다. 편집 후 그 문장을 다시 읽어 대조 |
| `evolution.md` 가 300줄을 넘어 새 warning | 교체만 하고 추가하지 않는다. V13 로 확인 |
| 테스트 삭제로 baseline 이 내려가 회귀로 오인된다 | 증감을 **근거와 함께** 보고하고 `environment/summary.md` baseline 을 reflect 에서 갱신 |
| 값을 바꾼 뒤 carrier 주석이 낡는다 (gen-091 재발) | V14 를 별도 항목으로 세웠다 |

## 완료 기준

1. `shipped-docs-no-daemon.test.ts` 전 test green (신규 `tests/` sweep 포함)
2. A 보존 4건 무손상 — 코드·테스트 양쪽
3. 게이트 전종 통과, `reap fix --check` 0 error / 2 warning 유지
4. backlog 1건 생성
5. 검증 근거 표기에 `[실행]` 이 붙은 항목마다 그것을 판정하는 명령을 지목할 수 있음

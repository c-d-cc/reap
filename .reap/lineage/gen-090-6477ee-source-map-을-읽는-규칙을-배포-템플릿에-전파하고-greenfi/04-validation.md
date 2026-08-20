# Validation

모든 명령을 이 stage 에서 **새로 실행**했다. 이전 실행 결과를 재사용하지 않았다.
아래 수치는 **evaluator 라운드 1 + 라운드 2 의 수정을 전부 반영한 최종 재실행 값**이다
(라운드 1 시점에는 582 / 328 이었다).

## 실행 결과

| 명령 | 결과 |
|---|---|
| `npm run typecheck` | 통과 (출력 없음) |
| `npm run build` | 통과 — `index.js 0.63 MB`, grammars 15 |
| `npm run test:unit` | **583 pass / 0 fail** (48 파일, 1526 expect) |
| `npm run test:e2e` | **329 pass / 0 fail** (35 파일, 1101 expect) |
| `npm run test:scenario` | **44 pass / 0 fail** (4 파일, 82 expect) |
| `bash scripts/check-self-diagnosis.sh` | **전 절 통과** (opencode 1.3.16) |
| `bash scripts/check-docs-version.sh` | 통과 (로케일 24항목 parity) |
| `cd docs && npx vite build` | 통과 (`built in 1.88s`) |
| `node dist/cli/index.js fix --check` | **0 error / 3 warning** — 전부 상속분 |

baseline 대비: unit 575 → **583**, e2e 326 → **329**, scenario 44 → **44**. 감소 없음.

`fix --check` 의 3 warning: lineage gen-052 의 parent 미발견 2건(압축 epoch, 상속),
`genome/evolution.md: 302 lines`(상속). **본 세대가 추가한 findings 는 0.**

## 완료 기준 검증

### C1 — e2e 신규 케이스가 수정 전 RED / 수정 후 GREEN `[negative]` `[실행]`

- RED: `bun test tests/e2e/init-basic.test.ts` → `9 pass / 2 fail`,
  실패 사유 `ENOENT ... /.reap/environment/source-map.md`. **수정 전 상태에서 실제로 돌렸다.**
- GREEN: 같은 명령 → 최종 `12 pass / 0 fail`.
- negative 2건 추가: 스텁을 heading 만으로 축소 → 실질 라인 케이스만 fail (`10 pass / 1 fail`).
  PHASE 6 의 source-map step 삭제 → prompt 케이스만 fail (`11 pass / 1 fail`). 둘 다 복원 후 GREEN.

### C2 — unit 신규 케이스가 수정 전 RED / 수정 후 GREEN `[negative]` `[실행]`

- RED: `bun test --isolate tests/unit/shipped-source-map-rule.test.ts` → `1 pass / 6 fail`.
  통과한 1개는 self-proving 케이스(대상 파일이 실재하고 절을 추출할 수 있는가)로 **의도대로**
  나머지보다 먼저 성립했다.
- GREEN: 같은 명령 → 최종 `8 pass / 0 fail`.
- negative 5건: N1(템플릿 한 글자) · N5(두 블록 교환) · N6(블록 삭제) ·
  **N7(설치 블록의 닫는 fence 제거 → 2개 red)** ·
  **N8(세 번째 블록을 두 블록보다 *앞*에 삽입 → 2개 red)**.

  **N8 은 삽입 위치를 적어야 한다.** 같은 변형을 **파일 끝에 덧붙이면 1개만 red 다**
  (`[negative]` 실측: 끝 → `7 pass / 1 fail`, 앞 → `6 pass / 2 fail`). 인덱스 0·1 이 그대로라
  equality 와 원본 검사가 둘 다 통과하기 때문이다. 그리고 **새 절을 파일 끝에 붙이는 쪽이
  다음 세대가 실제로 할 일**이다 — 즉 가장 그럴듯한 변형에서는 판별하는 단언이 **하나뿐**이다.

  적어둘 규율: **보고한 fail 개수는 판별력 있는 단언의 개수와 같아야 하고, 그 개수는 변형을
  어디에 넣었는지에 달렸다.** 위치를 적지 않으면 검사를 실제보다 강하게 읽게 된다.

### C3 — 세 스위트 0 fail, baseline 이상 `[실행]`

583 / 329 / 44, 전부 0 fail. 위 § 실행 결과.

### C4 — 자기진단 게이트, §3 신규 assertion 이 수정 전 fail `[negative]` `[실행]`

- 존재 분기: 수정 전 `FAIL greenfield init wrote no environment/source-map.md` — §3 에서 멈췄다.
- 실질 라인 분기: 스텁을 heading 만으로 축소 후 게이트 재실행 →
  `FAIL environment/source-map.md is scaffolding only (0 content lines)`.
- **두 분기 모두 red 를 봤다.** 수정 후 `ok source-map.md written (5 content lines)` + 전 절 통과.

### C5 — `check-docs-version.sh` 통과 `[실행]`

`All document checks passed for v0.17.6.` 5개 로케일 최신 0.17.6, parity 24항목,
migration note 최신 v0.17.6 ≤ v0.17.6.

### C6 — typecheck / build / docs build `[실행]`

셋 다 통과. `vite build` 는 5개 로케일 TS 편집 이후 이 stage 에서 다시 돌렸다 — 구문 오류가 있으면
여기서 깨진다.

### C7 — `fix --check` 에 새 findings 없음 `[실행]`

0 error / 3 warning, 전부 상속분. 스텁이 어떤 검사에도 걸리지 않는다.

## FR 대조

| FR | 상태 | 근거 |
|---|---|---|
| FR1 템플릿에 규칙 | 충족 | `[실행]` unit `the shipped genome template states the rule` |
| FR2 greenfield 이 파일 생성 | 충족 | `[실행]` e2e 2케이스 + 게이트 §3 |
| FR3 PHASE 6 지시 | 충족 | `[실행]` `[negative]` e2e `the greenfield conversation prompt tells the agent to fill source-map in` — **라운드 1 이전에는 `[독해]` 였다** |
| FR4 migration note §6 | 충족 (내용만) | `[실행]` unit 5케이스. **note 를 따르는 동작은 미검증** |
| FR5 REAP 자신의 genome 정렬 | **adapt phase 로 이월** | 03-implementation.md § 계획 조정 |
| FR6 영어 carrier 둘의 동일성 | 충족 | `[negative]` N1·N5·N6 |
| FR7 릴리즈 문서 0.17.6 확장 | 충족 | `[실행]` docs 게이트 + `[독해]` 내용 자체 (evaluator 가 diff 로 재확인) |

## Evaluator 검토

### 라운드 1

evaluator 가 typecheck / build / 세 스위트 / 두 게이트 / docs build / `fix --check` 를 **직접
재실행**해 같은 결과를 얻었고, 게이트가 확인하지 않는 것 네 가지를 추가로 조사했다:

- **migration 도달 범위** — `npm view @c-d-cc/reap versions` 로 `latest: 0.17.5` 확인.
  0.17.6 은 아직 발행되지 않았으므로 업그레이드하는 **모든** 프로젝트가 `lastMigratedVersion <
  0.17.6` 이고 §6 을 받는다. 0.17.6 인 프로젝트는 REAP 자신뿐이며 no-op 이 맞다.
- **note 의 "원본" 블록이 진짜 원본인가** — `git show v0.17.5:src/templates/evolution.md` 로
  대조해 verbatim 일치 확인. **어떤 CI 도 이것을 고정하지 않는다.**
- **릴리즈 문서가 실제로 반영됐는가** — diff 를 읽어 3종 전부 확인 (게이트는 버전 집합만 본다).
- **blast radius** — `reap index impact greenfield.ts` → `init/index.ts` 직접, `cli/index.ts` 간접.
  둘 다 이번에 돌린 init e2e 가 덮는다. `index status` 307/307 해석.

**제기된 concern 6건, 전부 low severity. 그중 4건을 수정했다.**

| # | concern | 조치 |
|---|---|---|
| 1 | **FR3 을 실행하는 것이 없다** — 한 줄이면 닫히는데 공시를 택했다. gen-084 가 바로 이 자리에서 어긋났고 genome 이 그 형태를 명시한다. PHASE 6 은 이번 diff 에서 6→7 단계로 재번호됐으므로 다음 재번호가 조용히 지울 수 있다 | **수정.** `expect(result.prompt).toContain("environment/source-map.md")` 추가 + negative(N4) |
| 2 | **동일성 검사가 위치가 아니라 포함을 본다** — 현재 텍스트를 *원본* 블록에 붙여넣으면 설치 블록이 낡고 대조 블록도 틀린 채 초록 | **수정.** fenced block 2개를 추출해 **두 번째와 equality**, 첫 번째는 "source-map 미언급" 고정. evaluator 의 공격을 N5 로 재현해 red 확인 |
| 3 | **게이트 assertion 의 fail-open 없음 (negative 결과 보고)** — headings-only / empty / whitespace / fenced 4종을 넣어 전부 FAIL 분기로 감. `${SUBSTANTIVE:-0}` 이 fail-closed 를 만든다. **BSD grep(macOS)에서만 측정**했고 CI 의 GNU grep 이 두 번째 표본 | 조치 없음 — 한계로 기록 |
| 4 | **FR5 이월을 추적하는 것이 없다** — carrier 표식이 지금 2개 파일뿐이고 `--orphans` 는 **표시되지 않은 세 번째**를 탐지할 수 없다 (#21/#22 의 상태) | adapt 체크리스트에 명시. 아래 § adapt 로 넘기는 것 |
| 5 | **artifact 표기 정확도 2건** — 04 의 "모두 이 stage 에서 실행" vs 표의 vite build 출처, 03 의 e2e "신규 3" | **수정.** vite build 를 이 stage 에서 재실행, 개수 표기 정정 |
| 6 | **스텁 문구가 작은 코드베이스를 전제** ("as the codebase grows") + 회귀 guard 가 문장 하나만 고정 | **수정.** 전제 없는 문구로 재작성, guard 를 참인 문구 고정(`(not recorded yet)`)으로 전환 |

evaluator 의 조언 판정: **pass**, 단 concern 1 은 completion 전에 닫을 것. 닫았다.

**추가로 지적한 것** — 배포되는 규칙 문장의 부재 절은 planning 이 선언한 무조건형보다 **약하다**
(조건부다). evaluator 는 결함이 아니라고 봤고(무조건형은 migration note 가 갖는다) 동의한다.
03-implementation.md 의 서술을 그에 맞게 정정했다.

### evaluatorConcerns 채널에 무엇을 남겼는가

`reap run validation --phase report-evaluator --severity low` 로 **1건 기록했다**
(`current.yml` 의 `evaluatorConcerns`). 전부 해소했음에도 `none` 으로 낮추지 않았다 —
genome § "해소된 concern 도 `--severity none` 으로 낮추지 마라. 그 채널은 '미해결'이 아니라
**fitness 를 보는 사람이 알아야 할 것**을 나른다".

`high` 가 아니라 `low` 인 이유: 라운드 1 의 6건이 전부 low 였고, 그중 blocking 은 없었으며,
`high` 는 cruise mode 자동 중단 트리거다 — 본 세대는 cruise 가 아니지만 **severity 는 그 의미로
읽혀야 한다**. 요약문에 라운드 2 의 서면 판정 미수신도 함께 담아, fitness 를 보는 사람이 그
사실을 채널에서도 보게 했다.

### 라운드 2 — 요청했고, 서면 판정은 받지 못했다

genome § "독립 검토는 한 번으로 수렴하지 않는다" 에 따라 **라운드 1 의 수정 자체를 검토 대상으로**
라운드 2 를 요청했다 (gen-089 는 3라운드가 필요했고 2·3라운드의 결함은 전부 직전 수정 안에 있었다).
공격 대상 6가지를 지목했다: fencedMarkdown 의 파싱, `toBe(2)` 의 트레이드, `dir2` 공유,
문자열 guard 쌍의 실효, 전체 재실행, artifact 의 미획득 주장.

**서면 답신은 도착하지 않았다.** 다만 evaluator 가 자기 memory
(`.claude/agent-memory/reap-evaluate/feedback_negative_test_discrimination.md`)에 남긴 발견 1건은
확인해 반영했다. 그 외 4건은 **내가 직접 측정해 닫았다.** 근거 없이 "라운드 2 통과"라고 쓰지 않는다 —
아래는 각 항목을 무엇으로 판단했는지다.

| 항목 | 판단 근거 | 결과 |
|---|---|---|
| **fencedMarkdown 이 fail-soft 인가** | `[실행]` 임시 스크립트로 3종 입력 측정. 닫는 fence 가 없으면 `indexOf` 가 -1 → `slice(0,-1)` 이 **마지막 글자를 조용히 버리고 그럴듯한 블록을 반환**했다 (`"line one\nline two"` → `"line one\nline tw"`) | **수정.** -1 이면 `""` 반환 → fail-closed. N7 로 확인 |
| **evaluator memory 의 발견** | 그 fail-closed 가 `toContain("- **Pattern-first**")` 루프 **하나에만** 의존했다 — 블록 수와 equality 는 빈 블록에서도 통과했다 | **수정.** equality 에 `not.toBe("")`, 원본 검사에 존재 선단언 추가. 이제 N7 이 **2개**를 red 로 만든다 |
| **`toBe(2)` vs `>= 2`** | `[negative]` N8. 두 블록을 **인덱스로** 지목하므로 `>= 2` 면 세 번째 블록이 끼었을 때 "원본"과 "설치본"이 **조용히 어긋난다** | **`toBe(2)` 유지.** 이유를 테스트 주석에 적었다 — red 가 나면 산문 기준 재식별로 다시 쓰라는 뜻이다 |
| **`dir2` 공유의 위험** | `[실행]` `bun test ... -t "prompt tells the agent"` → **fail**. `dir2` 가 undefined 라 CLI 가 작업 디렉토리를 향했다. 이 저장소는 이미 REAP 프로젝트라 error 로 끝났고 `git status` 로 아무것도 쓰이지 않았음을 확인했지만, **필터 실행에서는 영원히 통과할 수 없는 테스트**였다 | **수정.** 자기 test 안에서 생성. 필터 실행 통과 확인 |
| **문자열 guard 쌍이 더 강한가** | 아니다 — **다른 문자열 하나를 고른 것에 가깝다.** 두 문자열이 대리하던 성질은 "스텁이 트리를 보지 않고 쓰인다"였다 | **강화.** `legacy-init` 이 스텁에 `package.json` / `src/` / `index.ts` 가 **없음**을 요구한다. 표현이 바뀌어도 트리를 서술하면 걸린다 |
| **전체 재실행** | `[실행]` 위 § 실행 결과. 라운드 1 의 독립 재실행은 evaluator 가 직접 했다 | 라운드 2 분은 **내 실행이다** |

**이것이 라운드 2 의 한계다.** 라운드 1 은 독립 검토였고 라운드 2 는 **자기 검토**다 — 내가 만든
검사를 내가 공격했으므로, 내가 상상하지 못한 공격은 여전히 덮이지 않는다. 라운드 1 이 정확히 그
자리에서 위치 구멍(N5)을 찾았다는 사실이 이 한계가 실재함을 보여준다.

**뒤늦게 도착한 라운드 2·3 — 팀 리드를 경유해서.** evaluator 세션에 SendMessage 가 없어 응답이
직접 오지 않았고, 팀 리드가 전문을 전달했다. 판정은 **pass, 코드 변경 불필요**이며 수치
(583 / 329 / 44, 두 게이트, `fix --check` 0/3)가 전부 독립 재현됐다. 내가 자기 검토로 닫은 항목
2건(fail-soft, `dir2`)도 수정 후 상태에서 재확인됐고, **`toContain` 루프를 지운 채 공격 매트릭스를
재실행해** item-4 의 구조적 강화가 실효함을 확인했다.

**그리고 내가 틀린 것을 하나 잡았다 — N8 의 개수다** (위 C2 참조). 자기 검토로는 나오지 않았을
종류다: 내가 고른 삽입 위치에서는 2 red 가 맞았지만, **위치를 적지 않아** 검사를 실제보다 강하게
읽히게 했다. 라운드 1 의 위치 구멍(N5)과 **같은 종류의 실수를 그 구멍을 고치면서 저질렀다** —
longterm 의 "결함을 고치는 세대가 그것을 반복할 가능성이 가장 높다"가 또 한 번 맞았다.

## 검사가 못 잡는 것

정직하게 적는다. 통과는 **검사 범위 안에서 문제없음**일 뿐이다.

1. **migration note 의 3분기 판정이 실제로 옳게 수행되는지 미검증.** unit 은 note **안에**
   원본·설치본·확인 지시가 있는지만 본다. agent 가 그것을 읽고 사용자 genome 을 올바르게 고치는지는
   층2 (`check-agent-integration.sh`) 영역이고, **그쪽에도 migration 시나리오가 없다.**
2. **note 의 "원본" 블록이 v0.17.5 가 배포한 것이라는 보장이 CI 에 없다.** 검사는 "source-map
   미언급"만 고정한다. git 태그를 읽는 테스트는 checkout 의 태그 유무에 의존해 CI 에서 신뢰할 수 없다.
   본 세대에서는 evaluator 가 **v0.16.0~v0.17.5 태그 12개 전부**에 대해 대조해 byte-identical
   임을 확인했다 — 그 대조는 다음 사람이 반복해야 한다.
3. **`toContain("- **Pattern-first**")` 루프는 한때 fail-closed 성질의 유일한 버팀목이었다.**
   `fencedMarkdown` 이 닫는 fence 없는 입력에 `""` 를 돌려주게 고친 뒤에도, 그 빈 문자열을 거부한
   것은 그 루프 하나였다 — 블록 수도 equality 도 빈 블록에서 통과했다. 지금은 각 단언이 스스로
   비어있음을 거부하므로 그 루프를 지워도 공격이 red 로 남는다(evaluator 가 루프를 지운 채 매트릭스를
   재실행해 확인). **이력을 남기는 이유**: 다음 사람이 그 루프를 "equality 와 중복"이라 판단할 때,
   그것이 한때 유일한 버팀목이었다는 사실을 알아야 같은 구멍을 다시 열지 않는다.
4. **`toBe(2)` 는 의도된 트레이드다 — 완화하지 말 것.** `>= 2` + 마지막 블록 지목으로 바꾸면
   블록이 **사이에** 끼었을 때 equality 대상이 조용히 갈아타 **구조가 바뀐 채 green** 이 된다.
   `toBe(2)` 는 그 경우 red 를 내서 "산문 기준으로 재식별하라"고 강제한다. 기록해두지 않으면
   다음 세대가 이것을 불필요한 엄격함으로 읽는다.
5. **스텁의 tree-agnostic 성질은 구조가 아니라 문구·이름으로 고정돼 있다.**
   `toContain("(not recorded yet)")` 는 진짜 개선이지만 `not.toContain("no source files")` 와
   fixture 이름 열거(`package.json` / `src/` / `index.ts`)는 **여전히 열거형 부정**이다 —
   "the tree is currently empty" 나 **집합적 서술**("모듈 하나, 파일 둘")은 통과한다.
   **이 부류를 닫았다고 읽지 말 것.** 구조적 형태는 있다: `buildSourceMapStub` 이 `projectName`
   하나만 받으므로 두 스텁은 이름만 다르고, **이름을 제외한 동등성**을 걸면 문구 없이 고정된다.
   다음 세대 몫으로 적어둔다.
6. **`$.cwd(undefined)` 는 throw 하지 않고 조용히 `process.cwd()` 를 쓴다.**
   `dir2` 를 자기 test 안에서 만들도록 고쳤지만, 그 결함이 **여기서** 무해했던 이유는
   `init/index.ts:78` 이 쓰기 전에 `emitError` 하기 때문이다 — **일반화되지 않는다.**
   REAP 프로젝트가 아닌 cwd 에서 같은 실수를 하면 adoption 으로 빠져 그 디렉토리에 `.reap/` 를
   만든다. `tests/` 는 private submodule 이므로 거기 생긴 변경은 pointer 커밋으로 조용히 따라갈 수
   있었다. "안전했다"가 아니라 "여기서만 안전하다"가 맞는 기록이다.
7. **릴리즈 문서에 이 변경이 실렸는지 게이트가 보지 않는다.** `check-docs-version.sh` 는 버전
   집합만 비교한다. 사람이 읽어야 한다 (이번엔 evaluator 가 3종 diff 를 읽어 확인했다).
8. **한국어 genome 은 동일성 검사 밖이고, 지금은 carrier 표식조차 없다** (adapt 이월).
   `list-carriers.sh --orphans` 는 **애초에 표시되지 않은 세 번째 carrier 를 탐지하지 못한다** —
   체크리스트 말고 이것을 추적하는 것이 없다.
9. **게이트 assertion 은 BSD grep(macOS)에서만 측정됐다.** CI 의 GNU grep 이 두 번째 표본이다.
10. **층2 미실행.** `check-agent-integration.sh` (~$0.25) 는 릴리즈 직전 항목이다.
11. **리눅스 미검증.** 전부 로컬 macOS. CI 는 push 시점에 돈다 (본 세대는 push 없음).

## adapt 로 넘기는 것 (FR5)

- `.reap/genome/evolution.md` 의 `Read source-map first` 문구를 배포 규칙과 같은 의미로 정렬
  (부재 절 추가) + `<!-- reap:carrier(source-map-read-rule) -->` 표식.
- 302줄 초과 경고를 **잘못 놓인 내용을 옮겨서** 해소. 손으로 지워 경고를 끄는 것은 guide 가 금한다.
- 표식 추가 후 `bash scripts/list-carriers.sh` 로 3개 파일 확인.

## Verdict

**pass**

세 스위트 0 fail (baseline 이상), 두 게이트 통과, 완료 기준 C1~C7 충족, FR1~FR4·FR6·FR7 충족.
FR5 는 본 세대 안(adapt)에서 이행한다 — 미완이 아니라 이월이다.
라운드 1 의 concern 6건 중 4건 수정, 2건은 한계로 기록. 라운드 2 는 지목한 6항목 중 5건을
측정으로 닫았고 (2건은 실제 결함이었다), **서면 독립 판정을 받지 못한 것을 한계 8로 기록했다.**
**미해결 blocking 없음.**

---

# 2차 검증 — 결정 B 이후

fitness 에서 발견된 "읽기 의무만 있고 쓰기 의무가 없다"를 사용자 결정 **B** 로 본 세대에서 닫았고,
implementation 으로 두 번 회귀한 뒤 **전부 새로 실행**했다.

## 실행 결과 — 2차

| 명령 | 1차 | 2차 |
|---|---|---|
| `npm run typecheck` | 통과 | **통과** |
| `npm run build` | 통과 | **통과** (grammars 15) |
| `npm run test:unit` | 583 | **585 / 0 fail** (1534 expect) |
| `npm run test:e2e` | 329 | **329 / 0 fail** (1101 expect) |
| `npm run test:scenario` | 44 | **44 / 0 fail** |
| `check-self-diagnosis.sh` | 전 절 통과 | **전 절 통과** |
| `check-docs-version.sh` | 통과 | **통과** |
| `docs vite build` | 통과 | **통과** (`built in 1.93s`) |
| `fix --check` | 0 error / 3 warning | **0 error / 3 warning** (동일, 전부 상속분) |

## 추가 완료 기준

### C8 — carrier 집합이 통째로 잡히는가 `[실행]`

`bash scripts/list-carriers.sh` → **`environment-refresh-targets (4 files)`**:
`src/templates/evolution.md` · `src/templates/migration/v0.17.6.md` ·
`src/cli/commands/run/completion.ts` · `tests/unit/shipped-source-map-rule.test.ts`.

**`.reap/genome/evolution.md` 는 아직 없다** — adapt 에서 합류해 5가 된다.
그때까지는 `--orphans` 도 이것을 보지 못한다(표시되지 않은 carrier 는 탐지 불가). adapt 체크리스트에 있다.

### C9 — 규칙 문구가 한쪽만 바뀌면 red 인가 `[negative]` `[실행]`

**확인.** 템플릿의 absence clause 를 고치고 note 를 그대로 둔 상태에서
`the install block is exactly the Code Quality section the template ships` **1개만** red.
그 red 를 보고 note 를 동기화했다 — **검사가 실제로 작업을 지시한 사례**다.

### C10 — 세 스위트 0 fail, 두 게이트, `fix --check` 새 findings 0 `[실행]`

위 표. `fix --check` 는 1차와 **완전히 동일**하다.

## 2차 negative — 5건, 각각 정확히 1개씩 red

| # | 변형 | red 케이스 |
|---|---|---|
| C9 | 템플릿 규칙 문구만 변경 | install block equality |
| N9 | 템플릿 refresh bullet 한 단어 | note↔template 설치 텍스트 |
| N10 | 템플릿 boundary bullet 한 단어 | 같음 |
| N11 | note 에서 `environment-refresh-targets` 표식 제거 | markers present |
| N12 | note 의 앵커 문장 변경 | note↔template 설치 텍스트 |

**전부 1개씩이다** — L5 가 요구한 "보고한 개수 == 판별력 있는 단언의 개수"를 이번엔 지켰고,
각 변형의 **위치도 표에 있다**. 다섯 다 복원 후 GREEN, `git diff --stat` 으로 잔해 0 확인.

## `toBe(2)` 가 자기 재작성을 요구했다 — 한계 4의 갱신

1차의 한계 4는 *"`toBe(2)` 는 의도된 트레이드다 — 완화하지 말 것"* 이었다.
**2차에서 실제로 발동했다**: §7 이 블록 4개를 더하자 `Received: 6` 으로 red.

`>= 2` + 마지막 블록 지목이었다면 equality 대상이 **조용히 §7 의 블록으로 갈아타고 초록**이 됐을
것이다. red 가 주석의 지시("산문 기준 재식별")를 집행했고, 인덱스 기반 `fencedMarkdown` 을
**앵커 기반 `blockAfter`** 로 교체했다. 인덱스 산술이 사라져 블록 수 단언 자체가 불필요해졌다.

**따라서 한계 4는 해소됐다** — note 가 더 자라도 이 검사는 깨지지 않는다.
대신 새 한계가 생겼다: **앵커 문장이 검사의 일부가 됐다** (N12 가 그것을 보여준다).
note 의 산문을 고치는 사람은 앵커를 함께 봐야 하며, 그 사실이 주석에 있다.

## 2차에서 새로 생긴 한계

1. **`completion.ts` 의 prompt 변경을 실행하는 테스트가 없다.** genome § 테스트 레벨 기준의
   *"prompt 변경 — 기능적 영향 있으면 e2e, 없으면 skip"* 에 따른 의도적 skip 이며 `[독해]` 다.
   greenfield PHASE 6 은 e2e 로 덮었지만(FR3), reflect prompt 는 덮지 않았다 — **같은 종류의
   자리를 하나 남긴 것**이므로 그렇게 적는다.
2. **§7 이 지시하는 genome 편집이 실제로 옳게 수행되는지 미검증** — §6 과 같은 한계(위 한계 1).
   §7 은 §6 보다 어렵다: 한 줄을 두 줄로 바꾸고 **그 위 문장도 함께** 고쳐야 한다.
3. **소유 모델은 정하지 않았다.** "갖고 있는 쪽을 갱신하라"까지만 말한다. 어느 파일이 구조를
   **소유해야 하는가**는 05-completion.md hint 2 그대로 다음 세대 몫이다.

1차의 한계 1~3, 5~11 은 **전부 그대로 유효하다**.

## Verdict — 2차

**pass**

세 스위트 0 fail(1차 이상), 두 게이트 통과, C1~C10 충족, FR1~FR4·FR6~FR12 충족.
FR5 와 T106(한국어 genome + 표식)은 **adapt 에서 이행한다** — 미완이 아니라 이월이다.

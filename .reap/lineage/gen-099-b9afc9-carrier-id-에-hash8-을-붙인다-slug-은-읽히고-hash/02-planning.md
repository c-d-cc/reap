# 02 Planning — gen-099-b9afc9

> Clarity: **HIGH** (01-learning.md § Clarity Level) → 선택지 나열 없이 사양·분해로 직행.
> 열려 있던 판정 3개는 아래 § 판정에서 근거와 함께 닫는다.

## Goal

carrier 표식의 ID 를 **`<slug>-<hash8>`** 로 바꾸고, 그 형식을 **검사가 강제**하게 한다.
같은 세대에서 `list-carriers.sh` 의 **산문 오탐**을 제거한다.

## 판정 — backlog 가 남긴 4개 + 함께 처리 건

### P1. 레지스트리는 두지 않는다

근거(01-learning F4): 레지스트리의 유일한 기능은 "지워진 항목의 번호를 다시 내주지 않는 것"인데
**carrier ID 를 가리키는 것이 아무것도 없다.** 재사용돼도 낡은 참조가 다른 것을 가리키는 일이
없으므로 append-only 대장이 방어하는 위험이 존재하지 않는다. 중복은 **표식 전수 스캔 자체**에서
판정된다(같은 hash·다른 slug / 같은 slug·다른 hash). 대장을 두면 **파일과 따로 관리되는 목록**이
생기는데 그것이 gen-078 이 폐기한 형태다.

재사용하는 것은 gen-098 의 **설계**다 — 난수(제목·slug 파생 금지) · hashed 계열은 레지스트리 없음.
`makeHashedId()` 를 코드로 부르지는 않는다: carrier 는 `SequenceType` 이 아니고(prefix 없음,
`<slug>-<hash>` 형태), 폭도 6이 아니라 8이며, 소비자가 TS 가 아니라 bash 스크립트다.

### P2. 형식을 강제하는 것 — `list-carriers.sh --check` + CI

스크립트가 표식을 **관대한 패턴**(`reap:carrier([^)]*)`)으로 걷은 뒤 셋으로 가른다:

| 판정 | 조건 | 처리 |
|---|---|---|
| 유효 | `^[a-z0-9]+(-[a-z0-9]+)*-[0-9a-f]{8}$` | carrier 로 집계 |
| 자리표시자 | `[a-z0-9-]` 밖의 문자를 포함 (`<`, `>`, 공백, 한글 …) | **완전 무시** |
| 형식 위반 | 그 외 (해시 없음 / 폭 불일치 / 대문자 …) | **보고 + exit 1** |

`--check` 를 `.github/workflows/ci.yml` 에 붙인다. 검사를 아무도 안 돌리면 아무것도 강제하지
않는다 — genome § 반복 누락은 지시가 아니라 검사로 막는다.

### P3. 산문 오탐 — 자리표시자는 **구조적으로 무효**하게 만든다 (잔여 backlog 해소)

잔여 backlog 가 제시한 A(무시 목록) / B(인라인 코드 배제) / C(문장 수정) 중 **어느 것도 아니다**.

- A 는 목록이 자란다. B 는 **틀린다** — 01-learning F3: `docs/**/*.ts` 의 표식은 TS 문자열
  안이지만 **진짜 carrier** 이고 바로 아래 줄이 값을 쓴다. "코드/인라인 안이면 예시"가 성립하지 않는다.
- 대신 **모양으로 가른다**: 문서 예시는 `reap:carrier(<slug>-<hash8>)` 처럼 꺾쇠를 쓰고,
  꺾쇠는 ID charclass 밖이라 스캐너가 애초에 세지 않는다. 지금도 `<사실-id>` 형태는 안 잡힌다 —
  **이미 있는 성질을 규칙으로 굳히는 것**이지 새 예외가 아니다.
- 남는 것은 `RELEASE_NOTES.md:35` 의 `` `reap:carrier(id)` `` 하나. `<id>` 로 바꾼다.
  자리표시자의 표기 교정이며 **버전 항목의 내용을 바꾸지 않는다**(midterm § 발행 문서 수정 규칙:
  기준은 역사성이 아니라 실행 가능성).

### P4. 해시 오타 힌트 — 반쪽 일치로 찾는다

Levenshtein 을 쓰지 않는다. 한 글자 오타는 **반드시 한쪽 절반을 온전히 남긴다** —
해시를 틀리면 slug 이 같고, slug 을 틀리면 hash 가 같다. 그래서 orphan 을 보고할 때
**같은 slug 을 가진 다른 ID / 같은 hash 를 가진 다른 ID** 를 함께 출력한다.
지목한 실패("한 글자 틀리면 고아가 되는데 눈으로 차이를 못 본다")를 정확히 덮으면서
편집거리 구현보다 짧고 오탐이 없다.

### P5. 문서 예시 — backlog 의 파일 목록이 실제와 다르다

01-learning F2/F6 실측:

- **예시를 가진 파일은 3개뿐**이다 — `.reap/genome/application.md`, `.reap/reap-guide.md`,
  `src/templates/reap-guide.md`. `README*.md` 와 5개 로케일은 **예시가 아니라 진짜 표식**이고,
  `src/templates/evolution.md` 에는 문법 설명도 예시도 없다.
- 더 나쁜 것을 함께 고친다: **그 3파일의 표식이 값 옆이 아니라 예시 옆에 붙어 있다.**
  세 파일 다 그 값을 다른 절에서 실제로 서술하므로(application.md § Adapter Layer,
  reap-guide § AI Client Support 표) **진짜 표식을 값 옆으로 옮긴다.** genome 이 표식을
  택한 이유 자체가 "값 바로 옆에 있으므로 그 값을 다루는 사람이 본다"이다.

### P6. migration note 는 이 세대가 쓰지 않는다

기존 프로젝트에 도달하는 유일한 채널은 `src/templates/migration/vX.Y.Z.md` 이고 그것은
**버전 bump 를 동반해야** 한다. 사용자 프로젝트에는 `list-carriers.sh` 자체가 없어(F7)
낡은 형식 표식이 아무것도 깨뜨리지 않는다 — 즉 **긴급하지 않다.** gen-098 이 ID 경고를
v0.18 릴리즈 세대로 넘긴 것과 같은 판단이며, 05-completion 의 hints 에 남긴다.

## Requirements (FR)

- **FR1** 표식 ID 는 `<slug>-<hash8>` 이며 hash8 은 `[0-9a-f]{8}` 난수다.
- **FR2** `list-carriers.sh` 는 형식 위반 ID 를 **파일·줄과 함께** 보고하고 exit 1 한다.
- **FR3** 꺾쇠를 포함한 자리표시자 언급은 출력에 **일절 나타나지 않는다**(orphan 으로도, 위반으로도).
- **FR4** orphan 보고 시 slug 또는 hash 절반이 일치하는 다른 ID 를 힌트로 출력한다.
- **FR5** 같은 hash 가 서로 다른 slug 에 붙었으면 충돌로 보고하고 exit 1 한다.
- **FR6** `--root <dir>` 로 임의 트리를 스캔할 수 있다(테스트가 이것을 쓴다).
- **FR7** `--new <slug>` 이 기존 표식과 충돌하지 않는 hash8 을 뽑아 표식 한 줄을 출력한다.
- **FR8** 저장소의 표식 14개 전부가 새 형식이며 `--orphans` 가 비어 있다.
- **FR9** 문서 3파일의 예시는 자리표시자이고, 진짜 표식은 값 옆에 있다.
- **FR10** `--check` 가 CI 의 우회 불가능한 경로에서 돈다.

## Completion Criteria

1. `bash scripts/list-carriers.sh --orphans` 출력이 비어 있다 (backlog 의 완료 조건).
2. `bash scripts/list-carriers.sh --check` 가 exit 0 이고, **이관 전 상태에서는 14개를
   위반으로 보고하며 exit 1 했다** — `[negative]` 로 기록한다.
3. `tests/unit/list-carriers.test.ts` 6 케이스 통과. 각 케이스마다 **일부러 깨뜨려 red 를 확인**한다.
4. unit / e2e / scenario 세 스위트가 baseline(773 / 379 / 62) 이상, 0 fail.
5. `npm run build` · `npm run typecheck` · `bash scripts/check-self-diagnosis.sh` 통과.
6. `reap fix --check` 의 error 0, warning 이 baseline(2) 을 넘지 않는다.

## Implementation Plan

- [ ] **T001** `scripts/list-carriers.sh` 재작성 — 3분기 판정 · `--check` · `--root` · `--new`
      · orphan 힌트 · hash 충돌. 테스트: T002·T008
- [ ] **T002** `[negative]` 이관 **전** 상태에서 `--check` 실행 → 14 위반 + exit 1 확인.
      이 실행 결과를 04-validation.md 에 그대로 싣는다
- [ ] **T003** 14개 ID 의 hash8 을 `--new` 로 뽑아 표를 만든다 (04 에 기록)
- [ ] **T004** in-scope 전 파일 일괄 치환 (`lineage/`·`life/`·`dist/` 제외).
      `.reap/environment/*` 도 포함 — **ID 개명은 원자적이어야 하므로 reflect 로 미룰 수 없다**.
      서술 갱신만 reflect 로 미룬다. 테스트: T009 의 `--orphans`
- [ ] **T005** 예시 3파일 정리 — 예시를 `<slug>-<hash8>` 자리표시자로, 진짜 표식은 값 옆으로 이동
      (`application.md` § Adapter Layer, `reap-guide.md` ×2 § AI Client Support)
- [ ] **T006** orphan 2개 해소 — `gate-writing-discipline` / `evidence-tagging` 의 나머지
      carrier(`.reap/genome/evolution.md`, `src/templates/evolution.md` 의 해당 절)에 표식을 심는다.
      **표식이 불필요한 게 아니라 다른 곳을 안 표시한 것**이었다
- [ ] **T007** `RELEASE_NOTES.md:35` `reap:carrier(id)` → `reap:carrier(<id>)`
- [ ] **T008** 잔여 backlog 해소 — `backlogs_v0.17_residual/list-carrierssh-…md` 삭제 +
      README 의 해당 항목을 "gen-099 에서 해소"로 갱신 (건수 9 → 8)
- [ ] **T009** 문법 서술 갱신 — `src/templates/reap-guide.md` · `.reap/reap-guide.md`
      § Carrier Markers, `.reap/genome/application.md` § 여러 곳이 아는 사실.
      **줄 수 중립 이하** (genome 여유: evolution 296/300, application 249/250)
- [ ] **T010** `tests/unit/list-carriers.test.ts` 신규 — 6 케이스:
      (a) 정상 2파일 집계 (b) 해시 없는 ID → 위반+exit1 (c) 7자/대문자 해시 → 위반
      (d) `<...>` 자리표시자 → **출력에 없음** (e) orphan 힌트가 같은 slug 형제를 지목
      (f) 같은 hash·다른 slug → 충돌+exit1. 각각 negative 실행
- [ ] **T011** `tests/unit/shipped-source-map-rule.test.ts` 의 표식 리터럴 2개 갱신
- [ ] **T012** `.github/workflows/ci.yml` 에 `bash scripts/list-carriers.sh --check` 추가
- [ ] **T013** `npm run build` → 전체 검증 (typecheck · 3 스위트 · self-diagnosis · fix --check)

의존: T001 → T002 → T003 → T004 → (T005·T006·T007·T008 병렬) → T009 → T010/T011 → T012 → T013.
T002 는 **반드시 T004 앞**이다 — 이관 후에 돌리면 검사가 무엇을 잡는지 관측할 기회가 사라진다.

## 영향받는 기존 테스트

- `tests/unit/shipped-source-map-rule.test.ts` — 표식 문자열 리터럴 2개를 하드코딩한다 (T011)
- `tests/unit/shipped-docs-no-daemon.test.ts` — 트리 전수 스캔이지만 대상은 "daemon" 문자열.
  carrier ID 변경과 무관. **[독해]** 로 판단하고 T013 의 실행으로 확인한다

## Out of Scope

- `reap make carrier` **신규 CLI 명령** — 배포 표면을 늘린다. 형식을 검사하는 것(`list-carriers.sh`)이
  저장소 전용인데 생성만 shipped CLI 로 두면 절반만 사용자에게 간다. 생성은 같은 스크립트의
  `--new` 가 갖는다(FR7) — 형식을 아는 곳을 하나로 유지한다
- **사용자 프로젝트에 carrier 도구를 배포하는 것** (01-learning F7 의 갭). shipped reap-guide 가
  존재하지 않는 스크립트를 가리키는 문제는 실재하지만 이 세대의 goal 은 형식이지 배포가 아니다 →
  05-completion hints
- `migration/v0.18.0.md` 작성 (P6)
- `backlogs_v0.17_residual/` 의 나머지 8건

## Additional Findings

- `.reap/genome/evolution.md` 실측 **296**줄 (environment/summary.md 는 298 이라 적고 있다 —
  gen-098 이후 갱신되지 않았거나 세는 시점이 달랐다). reflect 에서 실측값으로 고친다.
- `list-carriers.sh` 는 지금 **어떤 CI·게이트에도 없다.** 형식 검사를 넣어도 T012 없이는
  "만들고 아무도 안 돌리는 검사"가 된다.

## Human Confirmation

**승인 (2026-08-21).** 6개 판정 그대로. 추가 주문 셋:

1. negative 관측은 `[negative]` 태그로 **돌린 명령과 함께** artifact 에 남길 것.
   근거 종류 구분(`[실행]`/`[negative]`/`[독해]`)을 지킬 것.
2. 범위 밖 (b) — shipped reap-guide 가 사용자 프로젝트에 없는 스크립트를 가리키는 갭 —
   을 05-completion 의 Next Generation Hints 에 명시할 것. adapt 에서 `reap make backlog` 는 금지.
3. **값을 바꾼 뒤 자기 표식을 다시 grep 할 것.** 이 세대는 표식 형식 자체를 바꾸므로
   genome 이 경고한 함정(gen-091)에 정확히 놓여 있다.

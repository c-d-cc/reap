# 04 Validation — gen-099-b9afc9

> 전부 이 stage 에서 **fresh 실행**. 이전 실행 결과를 재사용하지 않았다.
> 근거 종류는 genome § 검증 근거는 종류를 구분해 적는다 를 따른다.

## 명령별 결과 — 전부 `[실행]`

| 명령 | 결과 |
|---|---|
| `npm run typecheck` | 통과 (출력 없음) |
| `npm run typecheck:docs` | 통과 (출력 없음) |
| `npm run build` | `index.js 0.67 MB` + `grammars bundled: 15` |
| `npm run test:unit` | **791 pass / 0 fail** (baseline 773 + 이 세대 18) |
| `npm run test:e2e` | **379 pass / 0 fail** (baseline 유지) |
| `npm run test:scenario` | **62 pass / 0 fail** (baseline 유지) |
| `bash scripts/check-self-diagnosis.sh` | **8개 절 전부 ok**, `Self-diagnosis passed for v0.17.7.` |
| `bash scripts/list-carriers.sh --check` | `75 marker(s), 13 id(s) — all well-formed, no hash collisions.` exit 0 |
| `bash scripts/list-carriers.sh --orphans` | `No orphaned carrier markers. (13 id(s) scanned.)` exit 0 |
| `node dist/cli/index.js fix --check` | error **0** / warning **2** (gen-052 상속분 — 이 세대와 무관) |

genome 줄 수: `application.md` **249**/250 · `evolution.md` **298**/300 · `src/templates/evolution.md` 240.
`fix --check` 가 경고를 내지 않았으므로 둘 다 기준 안이다 `[실행]`.

## Completion Criteria — 02-planning.md 의 6개

### 1. `--orphans` 출력이 비어 있다 — **충족** `[실행]`

```
$ bash scripts/list-carriers.sh --orphans ; echo "exit=$?"
No orphaned carrier markers. (13 id(s) scanned.)
exit=0
```

세대 시작 시점에는 orphan 이 **3개**였다(`evidence-tagging`, `gate-writing-discipline`, 그리고
가짜 `id` 는 3파일이라 orphan 으로도 안 잡혔다). 앞의 둘은 **다른 carrier 를 표시**해서,
셋째는 **애초에 표식이 아니었음을 규칙으로 표현**해서 해소됐다 — 검사를 약하게 만들어서가 아니다.

### 2. 형식 위반을 검사가 보고한다 — **충족** `[negative]`

이관 **전** 저장소 전체(구 형식)에서:

```
$ bash scripts/list-carriers.sh --check ; echo "EXIT=$?"
Malformed carrier ids (14) — expected <slug>-<hash8>:
    agent-frontmatter-schema
        src/adapters/opencode/install.ts:425
    ... (14개 ID · 85개 사이트를 파일:줄과 함께)
EXIT=1
```

**검사를 만든 직후 통과를 보지 않았다.** 저장소가 통째로 red 인 상태를 먼저 관측했고,
그것이 이 검사가 무력하지 않다는 유일한 근거다.

### 3. 신규 테스트 18 케이스 + 각각의 negative — **충족** `[negative]`

`npx bun test tests/unit/list-carriers.test.ts` → 18 pass / 0 fail / 62 assertion.

**negative 13회**를 돌렸고 전부 의도한 케이스만 red 가 됐다 (03-implementation.md § negative 전수).
그중 **여섯이 결함을 실제로 잡았다** — 로케일 collation(D1) · 통과 문구의 과대 집계(D2) ·
힌트의 잘못된 구현을 받아들이던 픽스처(D5) · fail-open 둘(D6) · 그 D6 수정 안의 결함 하나(N13).

가장 중요한 것은 N1: **스캔 패턴을 well-formed ID 로 좁히면 "해시 없는 표식"이 아예 매치되지
않아 검사가 침묵한다.** 관대한 패턴이 이 검사의 전부이며, 그 성질을 관측하는 것은 N1 뿐이다.

### 4. 3 스위트 baseline 이상 0 fail — **충족** `[실행]`
791 / 379 / 62. unit 만 +18 (이 세대의 신규).

### 5. build · typecheck · self-diagnosis — **충족** `[실행]` (위 표)

### 6. `fix --check` error 0, warning ≤ baseline(2) — **충족** `[실행]`
두 warning 은 `lineage/gen-052-…` 의 parent 미해소로 gen-052 부터 있던 것이다.

## 이관이 표식을 삼키지 않았는가 — HEAD 와 집합 대조 `[실행]`

"13 ID / 75 marker / orphan 0" 은 새 스크립트가 낸 숫자다. **그 스크립트가 판정 규칙을 바꿨으므로
자기 출력으로 자기를 검증할 수 없다.** HEAD 의 (ID, 파일) 집합을 직접 떠서 비교했다:

```bash
git -c core.quotePath=false grep -o -E "reap:carrier\([^)]*\)" HEAD -- . \
  | sed 's/^HEAD://' | grep -v -e '^\.reap/lineage/' -e '^\.reap/life/' \
  | sed 's/^\(.*\):reap:carrier(\(.*\))$/\2\t\1/' | grep -v '[<> ]' | sort -u
```

**`core.quotePath=false` 가 필요하다** — 이 저장소의 backlog 파일명이 한글이라 git 이 C-quote 하고,
그러면 경로 필터가 조용히 빗나간다(첫 시도가 실제로 그랬다. `git ls-files` 의 `-z` 문제와 같은 것).

실제 차이는 **셋뿐이고 전부 의도한 것**이다:

| 변화 | 무엇 |
|---|---|
| `+evidence-tagging` ×2 · `+gate-writing-discipline` ×2 | orphan 해소 — 나머지 carrier 를 표시 |
| `-id` ×3 파일 | 가짜 carrier 소멸 |
| `-memory-tier-classification` @ `genome/application.md` | 그 파일은 tier 규칙을 서술하지 않는다 |

**`claude-code-commands-path` 는 12파일 그대로다** — 표식이 파일 *안에서* 예시 옆에서 값 옆으로
옮겨갔을 뿐이므로 파일 집합이 바뀌지 않는 것이 맞다.

대조에서 `tests/unit/shipped-source-map-rule.test.ts` 가 "추가"로 보이는데 **거짓 차이**다.
`tests/` 는 submodule 이라 부모 저장소의 `git grep HEAD` 가 들여다보지 않는다 —
before 집합에 애초에 없었다. 그 파일의 표식 2개는 일괄 치환으로 정상 갱신됐다
(`shipped-source-map-rule.test.ts` 가 green 인 것이 그 증거다).

## 보고할 것 — e2e 가 **한 번 1 fail** 을 냈고 재현되지 않았다

마지막 수정(D6) 직후 e2e 한 회차가 `378 pass / 1 fail` 을 냈다. **실패한 테스트 이름을 잡지
못했다** — 출력에서 개수 줄만 걸러내고 있었다. 곧바로 **4회 연속 재실행에서 `379 pass / 0 fail`**
이며, 그중 2회는 전체 로그를 파일로 남겼다(`e2e-3.log` / `e2e-4.log`, 둘 다 `(fail)` 0줄).

**workaround 로 넘기지 않는다** — 재현을 4회 시도했고 실패했으므로, "고쳤다"가 아니라
**"재현되지 않는 관측이 하나 있다"** 로 기록한다. 다음 세대가 e2e 에서 산발적 실패를 보면
이 항목이 첫 단서다. 이 세대의 변경(`list-carriers.sh` · 신규 unit 테스트 · reap-guide 문구)은
e2e 가 건드리는 표면이 아니지만, **그것은 `[독해]` 이지 `[실행]` 이 아니다.**

## 이 검증이 **못 보는 것**

genome § 게이트에 대해 쓰는 문장의 규율 — 통과는 "검사 범위 안에서 문제없음"일 뿐이다.

- **CI 스텝이 실제로 도는 것은 관측하지 않았다** `[독해]`. `ci.yml` 에 스텝을 넣고 YAML 파싱만
  확인했다(`yaml.safe_load` 통과). GitHub 러너에서의 실행은 push 후에만 관측된다 —
  이 저장소의 다른 게이트 3종도 같은 상태다(bash 게이트용 하네스 부재, 잔여 backlog).
- **`--new` 의 고유성 보장은 관측되지 않는다** — 난수 draw 라 검사 없는 구현도 사실상 통과한다.
  테스트 docblock 에 그대로 적었다.
- **사용자 프로젝트에는 이 검사가 아예 없다.** `list-carriers.sh` 는 배포되지 않는데
  shipped `reap-guide.md` 는 그것을 실행하라고 지시한다 — 01-learning F7 의 갭이며 범위 밖이다.
- **`--exclude='list-carriers.*'` 로 가려진 파일 안의 진짜 표식은 영원히 안 잡힌다.** 지금 그 두
  파일에는 진짜 표식이 없다 `[실행]` — `--check` 가 13개를 세고 orphan 이 0이다.
- **가장 중요한 한계: 표식을 복사해 붙인 것은 잡히지 않는다** `[독해]`. 같은 slug + 같은 hash 는
  "한 사실이 두 파일에 있다"와 **구분 불가능**하며 그것이 정상 경우다. hash8 이 막는 것은
  *우연한* 충돌이고, 그 방어의 실제 지점은 `--new` 가 이미 쓰인 slug 을 거부하는 것이다.
  누가 기존 표식 줄을 복사해 다른 사실 옆에 붙이면 어떤 검사도 알 수 없다 — **표식을 손으로
  짓지 말고 `--new` 를 쓰라**가 그래서 규칙이다.
- **CI 는 `tests/` 를 보지 않는다** `[독해]`. `actions/checkout@v4` 는 기본적으로 submodule 을
  받지 않으므로 러너의 `tests/` 는 비어 있다. `--check` 는 orphan 을 보지 않으니 **거짓 red 는
  생기지 않지만**, tests/ 안에만 있는 형식 위반은 러너가 못 본다 — 로컬 실행과 reap-test 의
  스위트가 그쪽을 덮는다.
- **`--root` 없이 임의 트리를 스캔하는 경로**(저장소 자신)는 테스트가 아니라 CI 와 이 stage 의
  수동 실행만 지난다.

## 독립 검토 (evaluator) — **응답 없음**

`evaluator: true` 이므로 `reap-evaluate` 를 validation 초입에 띄웠고, 진행 확인 2회 + 부분 보고
요청 1회를 보냈으나 **한 건도 회신하지 않았다.** genome longterm 이 "subagent 호출을 lifecycle
게이트로 삼지 마라 — 항상 advisor + fallback"이라 규정하므로 기다리지 않고 진행한다.

**그래서 이 세대의 적대적 검토는 전부 builder 자신이 했다.** 그것이 독립 검토를 대신하지 못한다는
것을 그대로 적어 둔다 — genome longterm 은 gen-089·093 에서 **매 라운드의 결함이 직전 라운드의
수정 안에 있었다**고 기록하며, 이 세대에서도 실제로 그랬다(D6 의 수정 안에 N13 이 있었다).
**다음 라운드가 있었다면 무엇을 찾았을지 알 수 없다.** fitness 를 보는 사람이 알아야 할 사항이라
`--severity low` 로 기록한다.

builder 가 스스로 돌린 적대적 항목:
- "어떤 입력이 `--check` 를 fail-open 시키는가" → 셋 발견(D1 로케일 · D6-a 미종료 · D6-b slug 분열)
- "이 단언을 만족시키면서 틀린 구현" → 둘 발견(D5 힌트 픽스처 · N13 집합 대 개수)
- "값을 바꾼 뒤 낡은 산문" → 넷 발견(스크립트 헤더 · 성공 문구 · 가이드에서 사라진 grep 지시 ·
  artifact 가 주장하는데 문서에 없던 규칙 "손으로 짓지 마라")
- HEAD 대조로 이관이 표식을 삼키지 않았음을 **스크립트 출력과 무관하게** 확인

## Verdict

**pass** — 완료 조건 6개 모두 충족, 전 검사 green, negative 9회로 검사의 유효성을 확보.

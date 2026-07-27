# Implementation Log

## Completed Tasks

| # | 파일 | 내용 |
|---|---|---|
| T001 | `tests/e2e/init-repair.test.ts` | marker 최신 → `skipped` (두 번 실행 방식) |
| T002 | 동 | legacy 헤딩 → `repaired` |
| T003 | 동 | 참조만 있음 → `repaired` (append 가 정상임을 고정) + 반복 실행 무해 case |
| **T003-1** | `src/cli/commands/init/repair.ts` | **계획에 없던 구현 수정** — `"updated"` 오분류. 아래 참조 |
| T004 | `src/cli/commands/init/common.ts` | `detectLegacyReapSection` 에 엄격 판정 근거 주석 |
| T005 | `src/core/integrity.ts` | 느슨 판정 근거 + 비대칭이 의도임을 주석 (상호 참조) |
| T006 | — | `bun test tests/e2e/` **272 pass / 0 fail** |
| T007 | — | typecheck 0 / build / unit 470-0 / scenario 44-0 |
| T008 | — | environment baseline → reflect phase |

## Verification Results

| 기준 | 결과 |
|---|---|
| 1. e2e 0 fail | **pass** — 272/0. 6세대 만에 전 스위트 green |
| 2. 수정 근거 기록 | **pass** — 아래 Discovered Issues |
| 3. 반복 실행 무해 확인 | **pass** — 3회 실행 test 로 고정 |
| 4. 비대칭 근거 주석 | **pass** — `common.ts` / `integrity.ts` 상호 참조 |
| 5. 3가지 경로 커버 | **pass** — marker / legacy heading / 참조만 (+ 반복) |
| 6. environment baseline | reflect 에서 |
| 7. unit/scenario 회귀 | **pass** — 470-0 / 44-0 |

## Discovered Issues

### 계획을 벗어난 발견 — `repair.ts` 가 `"updated"` 를 오분류하고 있었다

learning 단계에서 "(a) 테스트가 낡았다"로 판정했고 planning 도 그 전제였다. 그러나 legacy-heading test 를 작성하자 `repaired` 가 비어 있었다.

```ts
// 수정 전
if (claudeMdAction === "created" || claudeMdAction === "appended") {
  repaired.push(...);
} else {
  skipped.push("CLAUDE.md (REAP section already present)");
}
```

`ensureClaudeMd` 의 반환값은 4종(`created` / `appended` / `skipped` / `updated`)인데 분기는 2종만 다룬다. **`"updated"` — 실제로 파일을 갈아엎은 경우 — 가 else 로 떨어져 "이미 있어서 건너뜀"으로 보고**된다.

사용자 관점: `init --repair` 를 돌렸더니 "REAP section already present" 라는데 파일은 바뀌어 있다. **출력만 보고는 무슨 일이 일어났는지 알 수 없다.**

수정:

```ts
if (claudeMdAction === "skipped") {
  skipped.push(...);
} else {
  repaired.push(`CLAUDE.md (${claudeMdAction})`);
}
```

`"skipped"` 만 skipped 이고 나머지는 전부 실제 수정이다. 열거가 아니라 **부정형**으로 쓰면 반환값이 늘어도 자동으로 올바른 쪽에 들어간다.

**이것도 같은 유형이다.** gen-054 가 `ensureClaudeMd` 반환 타입에 `"updated"` 를 추가했으나 호출부 분기를 갱신하지 않았다 — #21(규칙 텍스트), #22(설치 경로)에 이어 **세 번째로 "한쪽만 갱신됨"** 이다.

### learning 판정의 정정

learning §3 은 "(b) 도 부분적으로 맞으나 실사용 영향이 경미해 구현 변경은 과하다"고 썼다. 그 판단은 **`detectLegacyReapSection` 의 엄격함**에 대한 것이었고 여전히 유효하다.

그러나 **다른 지점에 실제 구현 결함이 있었다.** "테스트가 낡았다"로 결론내고 테스트만 고쳤다면 이 오분류는 그대로 남았을 것이다. 테스트를 실제 코드 경로마다 나눠 쓰면서 드러났다 — 1 case 를 4 case 로 쪼갠 것이 결과적으로 진단 도구가 됐다.

## Architecture Decisions

### 두 판정을 통합하지 않았다

`integrity` 와 `ensureClaudeMd` 는 표면상 같은 질문("REAP 섹션이 있는가")을 하지만 목적이 다르다:

| | 오판의 대가 |
|---|---|
| `integrity` (느슨) | 불필요한 경고 |
| `ensureClaudeMd` (엄격) | **사용자 문단을 덮어씀** |

느슨/엄격의 비대칭이 **의도적으로 옳다.** 통합하면 한쪽이 반드시 부적절해진다.

**gen-076 의 DI 처방을 여기 그대로 적용하면 퇴행이다.** #22 는 두 곳이 *같은 값*(설치 경로)을 알아야 했고, 여기는 *다른 판단*을 한다. 표면이 닮았다고 같은 해법을 쓰면 안 된다. 대신 왜 다른지를 양쪽 주석에 상호 참조로 남겼다 — 설명이 없어서 본 세대가 조사에 시간을 썼다.

### 테스트에 marker 를 하드코딩하지 않고 두 번 실행

marker 는 템플릿 내용의 해시를 포함한다. fixture 에 해시를 박으면 템플릿이 바뀔 때마다 테스트가 깨진다. **첫 실행이 마커를 만들고 두 번째가 그것을 인식**하게 하면 템플릿 변경과 무관해진다.

### "참조만 있음 → append" 를 테스트로 고정

이 동작은 버그처럼 보일 수 있다. 나중에 누가 "왜 이미 REAP 참조가 있는데 또 붙이지?"로 고치려 할 때, 테스트와 주석이 **의도임을 알려준다** — 헤딩이 없으면 덮어쓸 대상이 없고, 주변 산문을 갈아엎는 것보다 붙이는 편이 안전하다.

## Deferred Items

- `ensureClaudeMd` 반환값을 union 으로 좁혀 호출부에서 exhaustive check 를 강제하는 것 — 본 건의 근본 예방책이나 타입 설계 변경이라 범위 밖. 부정형 분기로 실질적 재발은 막았다

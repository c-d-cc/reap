# Completion

## Summary

**Goal**: e2e `init-repair` 1건 실패 해소. 6세대 방치된 항목이며 0.17.3 묶음의 첫 번째.

**결과**: 완료. **e2e 268-1 → 272-0.** gen-072 이래 처음으로 세 스위트가 모두 green.

**핵심 변경**:
- `tests/e2e/init-repair.test.ts` — 1 case → 4 case (marker / legacy heading / 참조만 / 반복)
- `src/cli/commands/init/repair.ts` — **`"updated"` 오분류 수정** (계획 밖 발견)
- `init/common.ts` + `core/integrity.ts` — 판정 비대칭이 의도임을 상호 참조 주석

**검증**: typecheck 0 / build / 문서 게이트 pass / unit 470-0 / e2e **272-0** / scenario 44-0

## Lessons Learned

### 잘 된 것 — 테스트를 코드 경로별로 쪼갠 것이 진단이 됐다

learning 에서 "(a) 테스트가 낡았다"로 판정했고 planning 도 그 전제였다. 그대로 fixture 만 고쳤다면 **실제 결함을 덮은 채 green 을 만들었을 것이다.**

1 case 를 4 case 로 나누면서 legacy-heading 경로에서 `repaired` 가 비어 있는 것이 드러났다 — `ensureClaudeMd` 가 파일을 갈아엎고 `"updated"` 를 반환하는데 `repair.ts` 는 그것을 `skipped` 로 분류하고 있었다. 사용자는 "이미 있어서 건너뜀"이라는 출력을 받으면서 파일이 바뀌는 것을 본다.

**"테스트가 틀렸다"는 결론에 도달했더라도, 고칠 때는 실제 동작을 경로별로 확인하며 고쳐야 한다.** 결론을 믿고 최소 수정만 하면 그 결론의 사각지대가 그대로 남는다.

### 잘 된 것 — 표면이 닮았다고 같은 처방을 쓰지 않았다

`integrity` 와 `ensureClaudeMd` 가 "REAP 섹션이 있는가"를 다르게 판정한다. gen-076 이 #22 에서 **같은 값을 두 곳이 하드코딩한 문제를 DI 로 푼** 직후라, 같은 처방이 떠오르기 쉬웠다.

그러나 둘은 *같은 값*이 아니라 *다른 판단*을 한다:

| | 오판의 대가 |
|---|---|
| `integrity` (느슨) | 불필요한 경고 |
| `ensureClaudeMd` (엄격) | **사용자 문단을 덮어씀** |

비대칭이 의도적으로 옳다. 통합했다면 한쪽이 반드시 부적절해졌다. **직전 세대의 성공한 처방일수록 다음 문제에 무비판적으로 적용할 유인이 크다.**

대신 왜 다른지를 양쪽에 상호 참조 주석으로 남겼다 — 설명이 없어서 본 세대가 조사에 시간을 썼다.

### 개선점 — 세 번째 "한쪽만 갱신됨"이다

| 이슈 | 늘린 것 | 안 고친 것 |
|---|---|---|
| #21 | memory 분류 규칙 | reflect prompt, evolution 템플릿 |
| #22 | 설치 경로(v0.15→v0.16) | integrity checker |
| 본 건 | `ensureClaudeMd` 반환값에 `"updated"` (gen-054) | `repair.ts` 호출부 분기 |

**세 번 다 "값/타입은 늘렸는데 소비하는 쪽은 그대로"다.** 다음 세대의 canary token 설계에 이 종류를 반영해야 한다 — 반환값 union 확장도 "여러 곳이 아는 사실"의 한 형태다.

즉효 처방으로는 **부정형 분기**를 썼다. `=== "skipped"` 만 skipped 로 보내고 나머지를 전부 repaired 로 보내면, 반환값이 또 늘어도 자동으로 올바른 쪽에 들어간다. 열거는 늘어날 때마다 고쳐야 하지만 부정형은 그렇지 않다.

### 개선점 — 6세대 방치의 구조적 원인은 CI 였다

`.github/workflows/ci.yml` 은 `npm ci` + `npm run build` 만 돌린다. **테스트를 돌리지 않는다.**

e2e 1 fail 이 아무것도 막지 않았고, 사람이 로컬에서 봐야만 보였으며, 봐도 "pre-existing" 으로 넘길 수 있었다. gen-076 이 longterm 에 남긴 "Hints are not backlog" 는 증상을 짚었고, **CI 부재가 그 증상을 가능하게 한 조건**이다.

본 세대가 0 fail 을 만들었으므로 다음 세대에서 테스트를 CI 게이트에 넣을 수 있다.

## Next Generation Hints

1. **`릴리즈-자기진단-게이트-...` backlog** — 0.17.3 묶음의 두 번째. 두 선행 조건이 모두 충족됐다:
   - `fix --check` 경고 0 (gen-076)
   - **테스트 0 fail (본 세대)** → 테스트를 CI 에 넣을 수 있다
   - canary token 설계에 **"반환값 union 확장"** 종류를 포함할 것 (위 Lessons)
2. `agent-관점-검증-층2-...` — 0.17.3 묶음의 세 번째. 설계 세대라 코드 변경이 없을 수 있음
3. **0.17.3 릴리즈** — 3건 완료 후 릴리즈 노트 일괄 보강 → 태그
4. interview 재설계 / daemon 2건은 이번 묶음 제외

## Change Proposals

### genome 변경 없음

본 세대 교훈("결론을 믿되 경로별로 확인", "직전 처방의 무비판적 재사용 경계")은 다음 세대의 carrier 절 전면 재작성에 함께 넣는다. `evolution.md` 는 270줄/임계 300 으로 여유 30줄이라 한 번에 정리하는 편이 낫다 (gen-076 과 같은 판단).

### 신규 backlog 없음

`ensureClaudeMd` 반환값의 exhaustive check 강제는 타입 설계 변경이라 범위 밖이나, 부정형 분기로 실질적 재발은 막았다. 별도 backlog 로 뺄 만큼의 건이 아니다.

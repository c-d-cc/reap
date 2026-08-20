# Planning

> gen-093 — `config.autoUpdate` 를 실제로 읽어서 false 인 사용자의 설치가 바뀌지 않게 하고,
> 그 값이 어디서 읽히는지 검사로 고정한다.
>
> Clarity: **High**. brainstorming 을 생략하고 바로 spec 으로 간다 — goal·해법·파일이 모두
> 지목돼 있고, 남은 것은 team lead 가 *"물려받지 말고 직접 하라"* 고 위임한 판단 둘뿐이다.

## 결정 1 — 플래그를 어디서 읽는가

### 고른 것: `performAutoUpdate` **안**, floor 경고(5단계) **뒤**, 전역 설치 검사(6단계) **앞**

```
1 버전 불명 → skipped
2 dev/alpha → skipped
3 네트워크   → skipped
4 최신       → skipped
5 floor 미달 → blocked + 경고 출력          ← 메시지. 살아남는다
6 autoUpdate: false → skipped (조용)        ← 신설
7 전역 설치 아님 → skipped (조용)
8 설치
```

### 근거

**(a) `autoUpdate: false` 는 "내 설치를 바꾸지 마라"이지 "나에게 아무 말도 하지 마라"가 아니다.**
5단계는 설치가 아니라 **메시지**다 — *"당신의 버전이 하한 미만이고 REAP 이 자동으로 고칠 수
없으니 직접 올리세요"*. 자동 업데이트를 끈 사람일수록 그 사실을 스스로 알아야 하므로, 이
경고는 플래그와 무관하게 남아야 한다. team lead 가 지목한 *"사용자에게 필요한 경고를
침묵시키는 플래그는 한 칸 옆의 다른 결함"* 이 정확히 이 자리다.

**(b) 호출부 게이트(`execute()`)를 고르면 (a)를 지킬 수 없다.** `execute()` 에서 조기 반환하면
5단계에 도달하지 못한다. 경고만 살리려면 `execute()` 가 floor 판정을 따로 하게 되는데, 그러면
같은 판정이 두 곳에 생긴다 — genome 이 금하는 중복이고, 실제로 그 모양의 함수
(`checkAutoUpdateGuard`)가 이미 이 파일에 죽은 채로 있다.

**(c) "올릴 것인가"는 이미 한 함수가 소유한다.** 거절 세 개가 그 안에 살고, 각각 왜 그 순서에
있는지 주석이 붙어 있다. 네 번째만 다른 파일에 두면 하나의 질문이 두 파일로 쪼개진다.

**(d) 순서 — 6단계를 7단계 앞에 둔다.** 둘 다 조용한 거절이므로 **싼 것 먼저**: config 읽기는
파일 하나, `npm root -g` 는 프로세스 spawn. 7단계 주석이 이미 "비용 때문에 늦게 묻는다"고
적고 있으므로 같은 논리의 연장이다.

### 포기하는 것 (명시)

`autoUpdate: false` 인 사용자도 `npm view` 를 **여전히 부른다** (3단계, 그리고 4단계를
통과하면 5단계에서 한 번 더). 끈 사용자에게 네트워크를 아껴주려면 3단계 앞에 놓아야 하는데,
그러면 (a)의 경고가 사라진다. **경고를 택하고 네트워크를 포기했다.** 다만 이것은 회귀가
아니다 — 지금 모든 사용자가 내는 비용 그대로이며, 이 세대가 늘리는 것은 없다.

## 결정 2 — config 를 읽을 수 없을 때

### 고른 것: **fail open** — 명시적인 boolean `false` 만 끈다

| 상황 | 판정 |
|---|---|
| `autoUpdate: false` (boolean) | **끔** |
| `autoUpdate: true` | 켬 |
| 필드 없음 | 켬 |
| `.reap/config.yml` 없음 | 켬 |
| YAML 파싱 실패 | 켬 |
| 값이 boolean 이 아님 (`"false"`, `0`, …) | 켬 |

### 근거

**(a) fail closed 는 postinstall 경로를 통째로 죽인다.** `execute()` 의 root 는
`process.cwd()` 이고, npm postinstall 의 cwd 는 **패키지 디렉토리**다 — 거기에
`.reap/config.yml` 은 없다. "설정을 못 읽으면 하지 않는다"를 고르면 auto-update 가 사실상
SessionStart 전용이 된다. **보수적으로 보이는 선택이 실제로는 이 세대에서 가장 큰 동작
변경**이고, 이 세대의 goal 은 *끈 사용자*의 설치를 지키는 것이지 나머지 사용자의 동작을 바꾸는
것이 아니다.

**(b) 기본값이 이미 `true` 다.** `init/common.ts` 가 `true` 로 생성하고 `update.ts` 의
`CONFIG_DEFAULTS` 가 `true` 로 backfill 한다. "설정 없음 = 기본값" 이 그 둘과 일관된다.

**(c) boolean 이 아닌 값을 켬으로 두는 것은 침묵이 아니다.** `integrity.ts:269` 가
*"config.yml: 'autoUpdate' should be boolean"* 을 이미 경고한다. 여기서 조용히 끄면 사용자는
`reap config` 에서 그 값을 보면서 왜 안 되는지 알 수 없다 — 이 세대가 없애려는 바로 그 모양이다.

**(d) 회귀 0.** 명시적으로 끈 사람 외에는 아무도 동작이 바뀌지 않는다.

## 결정 3 — `reap update` 와 사용자의 직접 설치

**코드 변경 없음.** `reap update` 는 `performAutoUpdate` 를 부르지 않는다 (`grep -rn
"performAutoUpdate" src` → 정의 1 + 호출 1, 둘 다 `check-version.ts`). `reap update` 는
**프로젝트 구조 동기화**이지 설치를 바꾸지 않으므로 이 플래그의 대상이 아니다. 사용자가 직접
치는 `npm install -g @c-d-cc/reap@latest` 도 마찬가지다.

즉 **이 플래그가 끄는 것은 REAP 이 스스로 하는 설치 하나**이며, 사용자가 명시적으로 요청하는
경로는 어느 것도 막지 않는다. 이 문장을 `execute()` 주석에 남긴다 — 다음 사람이 "왜
`reap update` 는 안 막나"를 다시 묻지 않도록.

## Requirements

### FR (기능 요구)

- **FR1** `.reap/config.yml` 의 `autoUpdate: false` 인 프로젝트에서 `performAutoUpdate` 는
  `npm install -g` 를 실행하지 않는다.
- **FR2** `autoUpdate: false` 여도 hard floor 미달 경고(5단계)는 그대로 출력된다.
- **FR3** config 를 읽을 수 없는 모든 경우(파일 없음 / 파싱 실패 / 필드 없음 / 비-boolean)는
  **켜짐**으로 판정한다.
- **FR4** 판정은 seam 으로 주입 가능하며, 미주입 시 `root` 의 실제 `config.yml` 을 읽는다.
- **FR5** `check-version.ts:365-368` 의 *"Attempted unconditionally — `config.autoUpdate` is
  never read"* 주석이 **같은 편집에서** 새 동작을 서술하도록 바뀐다.
- **FR6** 재배치된 빌드 산출물이 **자기 `package.json` 의 버전**을 보고하는지 상시 검사가
  존재한다 (gen-092 가 남긴 숙제 — 1회성 측정을 자산으로 승격).
- **FR7** 0.17.6 릴리즈 문서(`RELEASE_NOTES.md` / `RELEASE_NOTICE.md` en+ko / 5 로케일)의
  **기존 항목이 보강**된다. 버전 bump 없음, 0.17.5 이하 무변경.

### 완료 기준 (검증 가능)

- **AC1** `autoUpdate: false` + 업그레이드 가능 상황 → `installLatestGlobally` 미호출,
  결과 `{action:"skipped", reason:"auto-update-disabled"}`. [unit]
- **AC2** `autoUpdate: false` + floor 미달 → 경고 1줄 출력 + `{action:"blocked"}`. [unit]
- **AC3** seam 미주입 시 임시 디렉토리 3종(false / true / config 없음)에서 각각
  false / true / true 로 판정. [unit]
- **AC4** 빌드 산출물을 `version: "3.2.1"` 인 임시 패키지 루트로 옮겨 실행하면 `3.2.1` 을
  보고한다 (`+dev.<hash>` 접미사 허용). [e2e]
- **AC5** 세 스위트 0 fail, 기준선 이상 (unit 620+ / e2e 329+ / scenario 44).
- **AC6** `bash scripts/check-docs-version.sh` 전 항목 통과 + `cd docs && npx vite build` 성공.
- **AC7** 위 네 검사 각각을 **먼저 실패시키고** 어디를 깨뜨렸는지 artifact 에 기록.

## Implementation Plan

- [ ] **T001** `AutoUpdateDeps` 에 `autoUpdateEnabled?: (root: string) => boolean` seam 추가
      — `src/cli/commands/check-version.ts`
- [ ] **T002** `readAutoUpdateSetting(root: string): boolean` 구현 (동기, fail open).
      패턴은 `core/dump-state-sync.ts:44-58` 을 따른다 — `existsSync` → `readFileSync` →
      `YAML.parse`, 전 구간 try/catch. `check-version.ts` 로컬에 둔다 (아래 Additional
      Findings 의 "왜 core 로 올리지 않는가" 참조) — `src/cli/commands/check-version.ts`
- [ ] **T003** `performAutoUpdate` 에 6단계 신설 (5단계 뒤, 전역 설치 검사 앞).
      `{action:"skipped", from, to, reason:"auto-update-disabled"}` 반환.
      기존 6→7, 7→8 번호와 주석 갱신 — `src/cli/commands/check-version.ts`
- [ ] **T004** `performAutoUpdate` doc comment 의 조건 목록(1~4)을 5개로 갱신 —
      `src/cli/commands/check-version.ts`
- [ ] **T005** **FR5** — `execute()` 의 호출부 주석 재작성. *"never read"* 를 지우고
      새 동작 + `reap update`/직접 설치가 대상이 아닌 이유(결정 3)를 적는다.
      `execute()` doc comment 의 *"Auto-update (skips …)"* 줄도 함께 —
      `src/cli/commands/check-version.ts`
- [ ] **T006** unit — AC1/AC2 (`autoUpdate` 거절과 경고 생존) — `tests/unit/check-version.test.ts`
- [ ] **T007** unit — AC3 (seam default 가 실제 config 를 읽는다, 3종) —
      `tests/unit/check-version.test.ts`
- [ ] **T008** e2e — AC4 (재배치된 산출물의 버전 보고, HOME+XDG 격리) —
      `tests/e2e/check-version.test.ts`
- [ ] **T009** `npm run build` + `npm run typecheck`
- [ ] **T010** negative — T006/T007/T008 각각을 먼저 실패시키고 기록 (AC7)
- [ ] **T011** 세 스위트 실행 (AC5)
- [ ] **T012** 릴리즈 문서 보강 — `RELEASE_NOTES.md`, `RELEASE_NOTICE.md`(en/ko),
      `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` 의 **기존 0.17.6 항목**
- [ ] **T013** `bash scripts/check-docs-version.sh` + `cd docs && npx vite build` (AC6)
- [ ] **T014** `bash scripts/list-carriers.sh --orphans` 로 새 고아 표식 없음 확인

### 의존 관계

```
T001 → T002 → T003 → T004,T005      (같은 파일, 순차)
T003 → T006, T007                    (동작이 있어야 고정 가능)
T009 → T008, T011                    (e2e 는 dist 를 실행한다)
T006,T007,T008 → T010                (검사가 있어야 깨뜨릴 수 있다)
T012 → T013
```

### 테스트 방법 (task 별)

| Task | 검증 |
|---|---|
| T001~T005 | `npm run typecheck` + 아래 unit |
| T006 | `npx bun test --isolate tests/unit/check-version.test.ts` |
| T007 | 동일 |
| T008 | `npx bun test tests/e2e/check-version.test.ts` (T009 선행) |
| T010 | 각 검사를 깨뜨린 상태에서 위 명령이 **red** 인 것을 확인 후 복원 |
| T011 | `npm run test:unit` / `test:e2e` / `test:scenario` |
| T012 | T013 |

### 영향받는 기존 테스트

- `tests/unit/check-version.test.ts` — **기존 케이스 다수가 `performAutoUpdate` 를 seam
  주입으로 호출하지만 `autoUpdateEnabled` 는 주입하지 않는다.** default 가 `process.cwd()`
  기준 실제 config 를 읽게 되면, **저장소 루트에서 테스트를 돌릴 때 `.reap/config.yml` 의
  `autoUpdate: true` 를 읽어** 통과한다. 그러나 그것은 우연이다 — `root` 인자가 `/tmp` 인
  케이스들은 `/tmp/.reap/config.yml` 을 찾고 없으므로 **fail open → 켜짐**으로 통과한다.
  둘 다 기존 기대와 일치하므로 **본문 수정 없이 통과해야 하며, 통과하지 않으면 그것이 신호다.**
  (이 예측 자체를 T011 에서 확인한다.)
- `tests/e2e/check-version.test.ts` — 기존 1케이스 유지, 추가만 한다.
- 그 밖의 스위트 — `performAutoUpdate` 를 부르지 않으므로 무영향.

## Additional Findings

### 왜 config 읽기를 `core` 로 올리지 않는가

`core/dump-state-sync.ts` 가 이미 동기 config 읽기를 갖고 있어 "공통화" 후보로 보인다. 올리지
않는 이유:

- 두 곳이 **다른 것을 원한다**. dump-state 는 config 전체를 표시용으로 읽고 부분 실패를
  허용한다(필드가 비면 그 줄을 비운다). 여기는 **boolean 하나**를 원하고, 실패는
  *"켜짐"* 이라는 **결정**으로 귀결된다 — 표시가 아니라 머신을 바꿀지 말지다.
- longterm 의 *"직전 세대의 처방을 닮은꼴에 재사용하지 마라"* 가 겨냥하는 모양이다
  (gen-085: 두 함수가 같은 질문에 다르게 답하는 것이 옳았던 사례).
- strictEdit 범위이기도 하다.

**공유할 값이 아니라 판정이므로 carrier 표식도 달지 않는다.** 값(`autoUpdate` 라는 키 이름)은
`types/index.ts` 가 이미 타입으로 소유한다.

### `checkAutoUpdateGuard` (인접 backlog) — 흡수하지 않는다

team lead 의 명시 지시. 다만 이 세대가 그 판단에 재료를 하나 더한다: **`autoUpdate: false` 인
사용자에게도 floor 경고가 살아남게 만들었으므로**, "최신이라 auto-update 가 안 일어나는
사용자에게 하한 경고를 보여줄 것인가"라는 그 backlog 의 판단 기준이 이제 *"auto-update 를 끈
사용자"* 라는 사례를 하나 더 갖는다. `03`/`05` 에 적고 backlog 는 그대로 둔다.

### e2e(T008)가 증명하는 것과 증명하지 못하는 것

- **증명한다**: 산출물이 자기 위치에서 `package.json` 을 **런타임에** 찾아 읽는다. 저장소
  안에서만 재면 이것과 "빌드 시점에 경로가 박혔다"가 구분되지 않는다(버전이 같으므로).
  버전을 `3.2.1` 로 다르게 주는 것이 그 구분을 만든다. 단언은 `startsWith("3.2.1")` —
  크래시·빈 문자열·null 은 이것을 만족시킬 수 없다(longterm: 부재 단언은 스스로 증명하라).
- **증명하지 못한다**: 실제 `npm i -g` 로 설치된 레이아웃, 실제 postinstall 환경,
  Windows. gen-092 가 기록한 한계 그대로이며 이 세대도 물려받는다.

### 이 세대가 닿지 않는 경로 (validation 에 그대로 옮긴다)

- 실제 `npm install -g` 의 실행과 결과
- 실제 `npm view` 네트워크 응답
- 실제 npm postinstall 환경의 `npm root -g` 응답 — 자기진단 게이트조차 `dist/.dev-build`
  때문에 2단계에서 반환하므로 그 아래를 한 번도 실행하지 않는다 (gen-092 기록)
- SessionStart hook 의 실제 발화
- **`autoUpdate: false` 인 실제 사용자의 실제 세션** — unit 이 결정을 고정할 뿐이다

## 편집 허용 파일 (strictEdit)

```
src/cli/commands/check-version.ts
tests/unit/check-version.test.ts
tests/e2e/check-version.test.ts
RELEASE_NOTES.md
RELEASE_NOTICE.md
docs/src/i18n/translations/en.ts
docs/src/i18n/translations/ko.ts
docs/src/i18n/translations/ja.ts
docs/src/i18n/translations/de.ts
docs/src/i18n/translations/zh-CN.ts
.reap/life/*.md            (artifacts)
.reap/vision/memory/*.md   (reflect)
.reap/environment/summary.md (reflect)
```

범위 밖 발견은 `reap make backlog`. **negative test 를 위한 임시 편집은 예외이며, 각각
복원 후 `git diff` 로 확인한다.**

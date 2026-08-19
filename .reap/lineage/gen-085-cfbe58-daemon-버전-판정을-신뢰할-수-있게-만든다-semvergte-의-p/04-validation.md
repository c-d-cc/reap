# Validation

> 모든 명령은 이 단계에서 **fresh 실행**했다. 이전 결과 재사용 없음.
>
> **3회차 validation.** `releaseLineGt` 를 두고 상위 지시가 두 번 바뀌어(유지 → 제거 → 유지) implementation 까지 두 번 회귀했다. **최종 상태는 유지**이며, 아래 수치·증거는 그 상태에서 fresh 실행한 것이다. 경위는 05-completion.md § 지시 변경 이력.

## Verdict: **pass**

evaluator 가 낸 우려 8건 중 **실질 결함 3건(C1/C2/C3)을 본 세대에서 수정**했고, 나머지 5건은 범위 밖으로 backlog 화하거나 기록했다. 수정 후 전 스위트·전 게이트 재실행 green.

## 1. 명령 실행 결과

| 명령 | 결과 |
|---|---|
| `npm run typecheck` | 통과 (출력 없음) |
| `npm run build` | 통과 (152 modules, 0.60 MB) |
| `npm run test:unit` | **545 pass / 0 fail** (42 files) |
| `npm run test:e2e` | **279 pass / 0 fail** (32 files) |
| `npm run test:scenario` | **44 pass / 0 fail** (4 files) |
| `cd daemon && bun test tests/` | **130 pass / 0 fail** (25 files) |
| `bash scripts/check-version-floors.sh` | `All version floors name published releases.` |
| `bash scripts/check-self-diagnosis.sh` | `Self-diagnosis passed for v0.17.5.` |
| `bash scripts/check-docs-version.sh` | `All document checks passed for v0.17.5.` |
| `bash scripts/list-carriers.sh --orphans` | `id (1 file — orphan)` — **오탐, 아래 § 3-bis** |
| `node dist/cli/index.js fix --check` | errors 0 / warnings 5 (전부 기존) |

baseline(523 / 279 / 44 / 130) 대비 **unit +22**, 나머지 동일. 감소 0.

## 2. 완료 기준 대조

| # | 기준 | 판정 | 증거 |
|---|---|---|---|
| 1 | semver 비교가 규격과 일치, 구현은 한 곳 | **충족** | **[negative]** 수정 전 두 구현이 SemVer §11 인접쌍 **7/7 오답**. **[실행]** `bun test tests/unit/semver.test.ts` 13 pass. `grep -rn "split(\"\\.\")" src/` → semver.ts 내부뿐 |
| 2 | alpha 에서 migration note 유지 | **충족** | **[negative]** strict semver 로 되돌리면 3건 red. 그 3건은 이 정책 전용 테스트이며 **기존 테스트는 0건 깨진다** — 근거의 성질을 § 3-ter 에 적었다 |
| 3 | 미발행 하한이면 게이트 red, 값은 소스에서 | **충족(확장)** | **[negative]** 6경로 (아래 표). 게이트는 daemon floor **와 `autoUpdateMinVersion`** 둘 다 검사 |
| 4 | 명시 경로 낡은 daemon 이 경로를 지목 (3소비처) | **충족(확장)** | **[negative]** 3소비처 독립 검출 + `checkout` 까지 4-source. `fix --check` / `daemon status` 실물 실행 |
| 5 | 4 스위트 0 fail, baseline 이상 | **충족** | 위 표 |
| 6 | `MIN_DAEMON_VERSION` / `package.json` 무변경 | **충족** | `git diff` — 값 변경 라인 0. `0.2.0` / `0.17.5` |
| 7 | `fix --check` 경고 증가 없음 | **충족** | 5건, 전부 gen-084 시점과 동일 |

## 3. Evaluator (advisor) — 우려 8건과 처리

`reap-evaluate` 판정: **pass (조건부)**. 두 세대 연속 그랬듯 **모든 검사가 초록인 상태에서** 실질 결함을 냈다. 8건 중 3건은 액면 수용하지 않고 직접 재확인한 뒤 고쳤다.

### C1 [중상] 게이트가 패키지 부재를 잡지 못했다 → **수정함**

**[실행] 직접 확인**: `npm view <없는패키지> versions --json` 은 stderr 로 `E404` 를 내고 exit 1. 내 게이트는 `2>/dev/null` 로 그것을 버리고 **UNREACHABLE(amber SKIP, exit 0)** 로 읽었다.

게이트의 목적이 "reap 이 설치하라는 것이 실재하는가"인데 **버전만 검사하고 패키지는 검사하지 않았다.** 게다가 그 실패가 네트워크 장애와 구분되지 않아 릴리즈 로그에서 한 줄로 흘러간다 — genome § "게이트를 무디게 하는 것을 같이 넣지 마라" 에 정확히 걸린다.

수정: stderr 를 변수로 받아 `E404|404 Not Found` 는 **FAIL**, 그 외만 SKIP.

> **게이트를 처음 만드는 세대가 게이트에 구멍을 남기면 다음 사람은 그 구멍을 신뢰한다.** evaluator 의 표현이며 옳다.

### C2 [중] 착수 근거가 가리킨 경로를 정작 안 고치고, 테스트로 "옳다"고 못박았다 → **수정함**

(3) 착수 판단의 근거 1은 "gen-083 이전 체크아웃은 daemon 0.1.0 이므로 낡은 daemon 이 지금 존재한다"였다. **그런데 그 `checkout` 경로는 `explicitLabel` 이 null 이라 여전히 `npm i -g` 를 받았고**, 나는 그것을 이렇게 고정했다:

```ts
for (const source of ["package", "checkout"] as const) { expect(r.warnings[0]).toContain("npm i -g ..."); }
```

**누락이 아니라 주장이 됐다.** 그리고 그 주장은 틀렸다 — 체크아웃은 npm 설치가 아니므로 전역 설치가 대체하지 못한다.

**[실행] evaluator 의 부수 발견도 확인**: 이 저장소에서 `require.resolve("@c-d-cc/reap-daemon/dist/index.js")` 는 `node_modules/@c-d-cc/reap-daemon -> ../../daemon` (workspaces 심링크) 를 타고 `package` 로 잡힌다. 즉 **dog-fooding 이 `checkout` 분기를 한 번도 밟지 않는다.** 별도 backlog.

수정: `staleDaemonRemedy(source, bin)` 을 client.ts 에 두고 **4-source 3-way** 로 갈랐다.

| source | 안내 |
|---|---|
| `env` / `config` | 경로 + 채널 지목, 전역 명령 없음 |
| `checkout` | "reap 옆의 소스 체크아웃" 지목, 전역 명령 없음 |
| `package` | 전역 명령 **+ 경로** |

`package` 에도 경로를 넣은 이유: 프로젝트 로컬 daemon 이 전역보다 우선하므로 **전역 명령이 항상 옳지는 않고**, reap 은 prefix 를 따져보지 않으면 어느 쪽을 잡았는지 모른다. 경로는 그것과 무관하게 "어느 사본을 말하는가"를 준다.

세 소비처의 문장 조립도 `staleRemedy` 로 값에 실어 **소유자를 하나로** 만들었다 (`installCommand` / `locateHint` 와 같은 gen-076 패턴).

### C3 [중] `performAutoUpdate` 서술이 사실이 아니었다 → **artifact·주석 정정**

**[실행] `grep -n "alpha" src/cli/commands/check-version.ts`**:

```ts
// 2. Skip dev/alpha builds
if (installed.includes("+dev") || installed.includes("-alpha")) return { action: "skipped", reason: "dev-build" };
```

L108 의 early-return 이 L123 의 floor guard 보다 **앞선다.** 즉 alpha 는 `performAutoUpdate` 의 비교에 **도달하지 못한다**. 03-implementation.md 의 D3 가 적은 "전: 자동 업데이트 진행 → 후: blocked" 는 `performAutoUpdate` 에 대해 **일어나지 않는다.**

실제로 달라지는 것은 `checkAutoUpdateGuard`(`+dev` 만 거른다) 하나뿐이고, **[실행] `npm view @c-d-cc/reap reap.autoUpdateMinVersion` = `0.16.0`** 이므로 `0.17.x-alpha >= 0.16.0` 은 수정 전후 모두 true — **지금은 무변화**다. 변화는 floor 를 alpha 가 존재하는 라인으로 올리는 날 나타난다.

정정한 곳: `src/cli/commands/check-version.ts` 상단 주석, `tests/unit/check-version.test.ts` 의 두 주석, 아래 § 4.

evaluator 가 함께 지적한 것 — 내 테스트가 `passesFloor = semverGte` 를 **자체 정의**하면서 "the exact expression at both call sites" 라고 적은 것. 식은 정확하나 **도달 가능성은 재지 않았다**. 두 guard 는 `execSync`/`npm view` 를 주입 없이 부르므로 직접 테스트가 불가능하다. 주석을 "식을 재는 것이지 guard 의 결론을 재는 것이 아니다"로 고쳤다 — 과잉 주장을 없애는 쪽을 택했다.

### C4 [중하] 같은 부류의 미검증 상수 → **게이트에 흡수**

`package.json` 의 `reap.autoUpdateMinVersion` 은 결함 (2) 와 **완전히 같은 형태**다 — 외부 릴리즈를 가리키는 숫자, 전 사용자에게 업그레이드를 지시하는 데 소비, 실재 확인 없음. 그리고 **본 세대가 이 상수의 파급력을 키웠다**(prerelease 가 이제 미달로 떨어진다).

genome § "인과로 묶인 검증 동작 fix 는 본 generation 에서 처리" 에 해당하므로 게이트를 `scripts/check-version-floors.sh` 로 넓혔다(이름도 바꿨다 — 두 floor 를 검사하는데 `check-daemon-floor` 는 거짓말이 된다).

### C5 [낮] `releaseLineGt` 정책은 옳다 — evaluator 가 네 전이(mark 이전 alpha / `--mark-migrated` 직후 / 다음 라인 note)를 다 따져 **숨는 note 도 반복되는 note 도 없음**을 확인. 변경 없음.

### C6 [낮] `sort -V` 가 네 번째 비교기 → backlog `sort-v-는-prerelease-를-역전시킨다-…`

**[실행]** `printf '0.17.5\n0.17.5-alpha.9\n' | sort -V | tail -1` → `0.17.5-alpha.9`. 방금 TS 에서 고친 것과 같은 역전. 게이트가 정식 버전에서만 돌아 실피해 0. **완료 기준 1의 "구현 하나"는 TypeScript 한정**임을 여기 명시한다.

### C7 [낮] 게이트 순서·전파 지연 — fail-closed 라 방향은 옳다. 실패 문구에 "전파를 기다려라"가 없다는 지적은 맞으나, `npm view` 는 발행 직후 반영되므로 실질 위험이 낮다고 판단. 기록만.

### C8 [정보] `DaemonNotInstalledError` 가 `explicitMiss` 무시 → backlog `daemonnotinstallederror-가-명시-경로를-무시한다-…`

### Evaluator 자진 신고

evaluator 가 C1 실측을 위해 `DAEMON_PACKAGE` 를 sed 로 치환했다가 복원했고, **스스로 절차 위반을 보고**했다. **[실행] 확인**: `git diff --stat` 이 builder 상태와 일치하고 typo 문자열 `grep -c` = 0 — 잔여 오염 없음. 판단 근거로서의 가치는 실제로 있었다(C1 은 이 실측 없이는 안 나왔을 것). 다만 read-only 경로(`npm view` 직접 호출)로 같은 결론이 가능했다는 evaluator 자신의 지적도 맞다.

## 3-bis. `--orphans` 오탐 — 내 증거 한 줄이 무효가 됐다

1회차에서 `No orphaned carrier markers.` 를 증거로 적었다. 지금은 `id (1 file — orphan)` 이 나온다. **내 변경이 만든 것이 맞다** — 다만 결함이 아니라 **원래 있던 오탐이 드러난 것**이다.

`scripts/list-carriers.sh` 는 `reap:carrier(<id>)` 를 grep 하는데 **그 문법을 설명하는 산문도 걸린다.** `RELEASE_NOTES.md:27` 이 기능 설명에 `` `reap:carrier(id)` `` 라고 적었고 스크립트가 그것을 `id` 라는 carrier 로 센다. 지금까지는 `longterm.md` 의 교훈 하나가 같은 예시를 갖고 있어 "2 files" 로 조용했고, reflect 에서 그 교훈을(genome 에 명문화됐으므로) 지우자 남은 하나가 고아가 됐다.

**본 세대가 심은 carrier 2건은 직접 확인했다** — `min-daemon-version`, `daemon-package-name` 둘 다 `scripts/check-version-floors.sh` + `src/cli/commands/daemon/client.ts` 2 files 로 정상 짝지어져 있다.

수정은 범위 밖이라 backlog 로 넘겼다(`list-carriers-가-산문-속-예시-문법을-carrier-로-센다-…`). **`--orphans: 0` 이라는 증거는 이 세대에서 더 이상 쓸 수 없다** — 그것을 이 자리에 적어둔다.

## 3-ter. 완료 기준 2의 근거 — 무엇이 증거였고 무엇이 아니었나

1회차 validation 은 기준 2 의 증거로 "strict semver 로 되돌리면 3건 red" 만 적었다. 그 근거의 성질을 확인해 둔다:

- **[실행]** red 3건의 **이름을 읽으면** 전부 이 정책을 위해 이 세대가 새로 쓴 테스트다. **기존 테스트 중 깨지는 것은 0건**이다
- 즉 그 red 는 "실재하는 회귀"가 아니라 **"이 동작을 지키는 테스트가 있다"** 는 사실만 말한다. negative test 가 red 인 것은 결함의 증거가 아니고 **어느 테스트가 red 인지**가 증거다

**그렇다면 이 정책은 왜 필요한가** — red 가 아니라 시나리오가 근거다:

- 유저는 `reapdev.alphaPublish` 로 **실제로 alpha 를 발행하고 그것을 깔아 테스트한다**. `0.17.6-alpha.x` 를 돌리는 사람에게 strict semver 는 `v0.17.6.md` 를 숨긴다
- **alpha 를 테스트하는 사람이 곧 migration note 를 확인할 사람**이다. 그 조합에서만 숨는다
- **[실행]** 현재 발행된 prerelease 는 `0.16.0-alpha.*` 25개, 존재하는 note 는 `v0.17.1`/`v0.17.2`/`v0.17.5` — **오늘 이 조합을 겪는 사용자는 없다.** 다음 alpha 에서 생긴다

동작 보존 관점: 종전 `parseInt` 구현이 우연히 코어 비교와 같은 답을 냈으므로, `releaseLineGt` 는 **기존 동작을 유지하는 쪽**이다.

## 4. Negative test 전수

수정 하나당 하나씩, 좋은 값을 깨뜨려 FAIL 을 확인하고 복원했다.

| 대상 | 조작 | 결과 |
|---|---|---|
| semver 정본 | 기존 두 구현에 새 기대치 적용 | **7/7 오답** (check-version 7, migration 7) |
| `releaseLineGt` | strict semver 로 되돌림 | **3 red** — 전부 이 정책 전용 테스트다(§ 3-ter) |
| 하한 게이트 | `MIN_DAEMON_VERSION = 9.9.9` | **FAIL** exit 1 |
| 하한 게이트 | 선언부 형태 변경 | **FAIL** exit 1 (조용한 통과 아님) |
| 하한 게이트 | 패키지 이름 오타 | **FAIL** exit 1 *(C1 수정 후. 수정 전에는 SKIP exit 0)* |
| 하한 게이트 | `autoUpdateMinVersion = 9.9.9` | **FAIL** exit 1 |
| 하한 게이트 | `autoUpdateMinVersion` 삭제 | **pass** + `--` 표기 (미설정은 정당) |
| 하한 게이트 | npm exit 1 / 비-JSON | **SKIP** exit 0, amber + "아무것도 검증되지 않았다" |
| `integrity.ts` 분기 | 제거 | 게이트 **FAIL** (경고 전문 출력) |
| `daemon/index.ts` 분기 | 제거 | 게이트 **FAIL** |
| `checkout` 분기 | 제거 | unit **1 red** |
| prompt/integrity 분기 | 제거 | unit **2 red** |

## 5. 이 검증이 **잡지 못하는 것**

통과는 "검사 범위 안에서 문제없음"일 뿐이다. 한계를 적어둔다.

- **낡은 daemon 시나리오는 조작된 `package.json` 을 쓴다.** 진짜 낡은 발행본은 존재한 적이 없어 만들 수 없다. 실물과 다른 점은 **버전 문자열의 출처뿐**이고 `resolveDaemonAvailability` 는 그 파일만 읽지만, "실제로 npm 에서 낡은 daemon 을 받은 사용자"는 여전히 미검증이다.
- **`checkout` 분기는 실물에서 실행되지 않았다.** workspaces 심링크 때문에 이 저장소조차 `package` 로 간다(backlog 등록). `checkout` 문구는 unit 주입으로만 확인됐다.
- **autoUpdate guard 자체는 테스트되지 않는다.** 비교식만 잰다(C3). 두 guard 는 network·binary 를 주입 없이 부른다.
- **게이트의 네트워크 SKIP 은 통과다.** registry 장애 중에 릴리즈하면 하한이 검증되지 않은 채 나간다. 출력은 명시적이나 사람이 봐야 한다.
- **한 머신에서만 돌았다.** reap-test dispatch(리눅스)는 push 이후에야 돈다 — 본 세대는 push 하지 않으므로 **리눅스 확인은 미완**이다.
- **Windows 전 경로 미검증** (gen-084 부터 이어지는 상태, 확인 수단 없음).

## 6. 회귀 확인

- `MIN_DAEMON_VERSION` = `0.2.0`, `package.json` = `0.17.5`, `daemon/package.json` = `0.2.0` — **셋 다 무변경**
- 문서 게이트 통과 — 릴리즈 문서 정합성 회귀 없음
- `fix --check` 경고 5건이 gen-084 시점과 동일 — 본 세대가 늘린 것 0

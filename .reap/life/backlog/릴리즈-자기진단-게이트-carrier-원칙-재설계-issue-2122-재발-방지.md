---
type: task
status: pending
priority: high
createdAt: 2026-07-27T11:56:46.032Z
---

# 릴리즈 자기진단 게이트 + carrier 원칙 재설계 — issue 21/22 재발 방지

> 개별 버그 수정이 아니라 **같은 유형이 두 번 연속 외부 제보로 발견된 것**에 대한 대책이다. issue #22 수정(`resolve-22-...`)과 별개이며, 그 수정만으로는 세 번째가 막히지 않는다.

## Problem

### 두 이슈는 같은 유형이다

| | #21 (v0.17.1) | #22 (v0.17.2) |
|---|---|---|
| 사실 | memory tier 분류 규칙 | slash command 설치 위치 |
| 아는 곳 A | `reap-guide.md` ✓ 갱신됨 | `adapters/claude-code/install.ts` ✓ |
| 아는 곳 B | migration note ✓ 갱신됨 | README ✓ |
| **어긋난 곳** | reflect prompt ✗ / evolution 템플릿 ✗ | **`core/integrity.ts` checker ✗** |
| 발견자 | 외부 제보자 | 외부 제보자 |
| 릴리즈 후 경과 | 1개 버전 | 1개 버전 |

**동일 구조: 하나의 사실을 여러 곳이 알고 있는데 일부만 갱신됐다.**

### gen-072/073 의 대책이 왜 #22 를 막지 못했나

gen-072 가 이 유형을 인지하고 genome 에 "carrier 3중 확인"을 넣었고, gen-073 이 docs 를 추가해 4중으로 늘렸다(`application.md:129-141`). 그런데 #22 가 발생했다.

원인: **carrier 목록이 전부 문서·prompt 계열이다.**

```
1. reap-guide.md          ← 문서
2. genome 템플릿           ← 문서
3. phase prompt           ← 코드 안의 문서(문자열)
4. docs 사이트             ← 문서
```

#22 는 **코드 대 코드**다 — installer(`adapters/`)와 checker(`core/integrity.ts`)가 같은 경로를 각자 하드코딩했다. 목록에 그 종류가 없다.

### 더 근본적으로 — 열거는 새로운 종류를 못 잡는다

gen-072: 3개 → gen-073: 4개 → 이번: 5번째(코드 대 코드)를 추가?

**열거를 늘리는 방식은 다음 종류가 나올 때마다 사후에 늘어난다.** 이미 두 번 늘렸고 두 번 다 사고 후였다. 세 번째 종류가 무엇일지 지금 알 수 없으므로 열거로는 원리적으로 선행할 수 없다.

### 왜 5세대 동안 내부에서 못 봤나

부모 에이전트는 gen-072~075 에서 **매 세션 `reap fix --check` 를 실행했다.** 그런데도 19건의 legacy 경고를 보지 못했다.

이유: 경고가 상시 19건이라 **관심 있는 것만 필터링해서 봤다.**

```
gen-072: memory 경고만 grep
gen-075: genome 경고만 조사
```

전형적인 warning fatigue 다. 그리고 이것을 가능하게 한 구조적 조건이 있다:

**`reap fix --check` 는 CI 에도 release workflow 에도 없다.** (`grep -rn "fix" .github/workflows/` → 매치 0)

gen-073 이 문서 정합성은 `check-docs-version.sh` 로 릴리즈 게이트에 넣었지만, **REAP 자신의 구조 진단은 아무 게이트에도 없다.** 사람이 기억해서 돌리고, 기억해서 읽어야 한다. gen-073 이 얻은 교훈("반복 누락은 지시가 아니라 검사로 막는다")이 이 영역에는 적용되지 않았다.

### 외부 제보자가 두 번 다 먼저 발견한 것도 신호다

내부는 코드를 알기 때문에 "원래 그런 것"으로 넘긴다. 외부 사용자는 문서와 실제가 다르면 즉시 본다. **신규 사용자 경로를 실제로 밟아보는 검증 절차가 없다.**

## Solution

세 층위로 나눈다. 아래로 갈수록 근본적이지만 효과는 느리다.

### S1. 릴리즈 자기진단 게이트 — 즉효, 이번 유형 직접 차단

`reap fix --check` 를 릴리즈 게이트에 넣고 **경고 0 을 조건으로** 한다.

```
.github/workflows/release.yml
  npm ci
  → bash scripts/check-docs-version.sh     (gen-073)
  → bash scripts/check-self-diagnosis.sh   (신규)
  → npm run build
  → npm publish

.github/workflows/ci.yml                    (유저 결정: CI 에도 포함)
  → bash scripts/check-self-diagnosis.sh
```

**CI 포함이 문서 게이트와 다른 이유**: gen-073 은 `check-docs-version.sh` 를 ci.yml 에 넣지 않았다 — 개발 중 `package.json` 이 문서보다 앞서는 것이 정상 상태라 상시 red 가 되기 때문이다. 자기진단은 그런 성질이 없다. **경고 0 은 어느 시점에나 참이어야 하는 불변**이므로 오탐 위험이 없고, 매 push 에서 잡는 편이 릴리즈 시점에 몰아서 발견하는 것보다 낫다.

`check-self-diagnosis.sh` 가 하는 일:
1. 깨끗한 HOME 에서 `reap install-skills` 실행
2. 임시 디렉토리에 `reap init`
3. `reap fix --check` → **경고·에러 0 을 요구**
4. 0 이 아니면 항목을 출력하고 non-zero exit

**이것이 #22 를 잡았을 것이다.** 그리고 경고 0 이 유지되면 새 경고가 즉시 눈에 띄어 필터링 습관 자체가 사라진다.

**전제 조건**: 본 repo 의 현재 경고가 0 이어야 한다 → `resolve-22-...` 선행 필수.

**주의**: 게이트를 넣기 전에 "지금 경고가 왜 나는가"를 전부 해소해야 한다. 남겨두고 게이트만 넣으면 게이트를 우회하게 되고, 그건 지금보다 나쁘다.

### S2. carrier 를 열거하지 말고 파일에 표식을 심는다 (유저 결정)

**열거의 근본 문제**: 목록은 "어디를 봐야 하는지"를 사람이 기억해 관리해야 한다. 새 carrier 가 생겨도 목록에 추가되지 않으면 없는 것과 같고, 실제로 #22 는 목록에 없는 종류였다.

**해결: carrier 파일 자신이 "나는 이 사실을 안다"고 선언한다.** 목록을 관리하는 대신 `grep` 으로 찾는다.

#### 표식 형식 — canary token

사실마다 ID 를 부여하고, 그 사실을 아는 모든 파일에 표식을 남긴다.

```ts
// 코드 (주석)
// reap:carrier(claude-code-commands-path)
const targetDir = join(homedir(), ".claude", "commands");
```

```markdown
<!-- 문서 (주석) -->
<!-- reap:carrier(memory-tier-classification) -->

---
# 또는 frontmatter 가 있는 문서
reapCarrier: [memory-tier-classification]
---
```

#### 사용법

값을 바꾸기 전에:

```bash
grep -rn "reap:carrier(claude-code-commands-path)" .
```

→ 그 사실을 아는 **모든** 파일이 나온다. 코드든 문서든 테스트든 로케일 파일이든 종류를 가리지 않는다.

#### 왜 이것이 열거보다 나은가

| | 열거 (기존) | 표식 (신규) |
|---|---|---|
| 관리 위치 | genome 한 곳에 목록 | **각 파일 자신** |
| 새 carrier 추가 | 목록을 고쳐야 함 (잊음) | 파일 만들 때 표식을 넣음 |
| 종류 제한 | 목록에 적힌 것만 | 없음 — grep 이 다 찾음 |
| 검증 | 불가 | **가능** (아래) |

표식은 **값 옆에 붙어 있으므로** 그 값을 다루는 사람이 자연히 본다. 반면 genome 의 목록은 다른 파일에 있어 찾아가야 한다.

#### 초기 대상 (issue 21/22 에서 확인된 것)

| carrier ID | 아는 곳 |
|---|---|
| `claude-code-commands-path` | `adapters/claude-code/install.ts`, `core/integrity.ts`, README, docs 5 로케일 |
| `memory-tier-classification` | `reap-guide.md`, `templates/evolution.md`, `run/completion.ts` reflect prompt, docs 5 로케일, `migration/v0.17.2.md` |

**#22 를 DI 로 풀면 `claude-code-commands-path` 의 코드 쪽 carrier 는 1개로 줄어든다.** 표식과 SSOT 는 대체재가 아니라 보완재다 — 공유 가능하면 공유하고(carrier 수를 줄이고), 남은 것에 표식을 단다.

#### 검증 가능성 (선택 — 범위 판단 필요)

표식이 있으면 스크립트가 다음을 할 수 있다:

- carrier ID 별 파일 목록 출력 (`reap carriers` 같은 명령 또는 스크립트)
- **고아 표식 탐지** — 한 파일에만 있는 carrier ID 는 표식이 불필요하거나 다른 곳을 빠뜨린 것
- 특정 커밋에서 한 carrier 의 일부 파일만 바뀌었는지 경고 (git hook / CI)

마지막 항목이 가장 강력하지만 오탐 위험이 있다(의도적으로 한쪽만 고치는 경우). **1·2 를 먼저 하고 3은 별도 판단**한다.

#### genome 반영

`application.md` 의 § 규칙 변경 시 carrier 확인 절을 다음으로 대체한다:

> 어떤 사실을 바꿀 때 **`grep -rn "reap:carrier(<사실-id>)"` 로 그 사실을 아는 모든 곳을 찾아라.** 목록을 기억하려 하지 마라 — 표식이 목록이다.
>
> 새로 "여러 곳이 알아야 하는 사실"을 만들 때는 **표식을 함께 심는다.** 표식 없는 carrier 는 다음 사람이 찾지 못한다.
>
> 단, **공유할 수 있으면 표식보다 공유가 낫다.** 같은 값을 두 코드가 안다면 DI·상수 export 로 하나로 만들어라. 표식은 공유가 불가능한 경우(문서, 다국어, prompt 문자열)를 위한 것이다.

### S3. 층 1 — 패키지 설치·동작 검증 (본 backlog 범위)

검증에는 두 층이 있고 필요한 격리 수준이 다르다. **본 backlog 는 층 1 만 다룬다.**

| | 검증 대상 | agent | 격리 요구 |
|---|---|---|---|
| **층 1** | tarball 설치, `install-skills` 위치, `fix --check` 경고 0, `init` 산출물 | 불필요 | `HOME`/`prefix` override 로 충분 |
| 층 2 | slash command 가 실제로 뜨는가, SessionStart hook 이 도는가, `@` import 로드 | **필요** | 별도 설계 → 분리 backlog |

#### 왜 격리가 필요한가 — 사용자 전역 상태를 건드린다

이 검증은 실행하는 것만으로 다음을 덮어쓴다:

| 동작 | 건드리는 곳 |
|---|---|
| `npm i -g @c-d-cc/reap` | 전역 node_modules |
| `reap install-skills` | **`~/.claude/commands/`** — 사용자가 실제로 쓰는 slash command |
| postinstall | `~/.reap/`, `~/.claude/settings.json` |

두 번째가 특히 위험하다. 테스트가 사용자의 실제 명령을 날린다.

#### 방식 — HOME/prefix override + CI 별도 job

```bash
# scripts/check-self-diagnosis.sh 개요
FAKE_HOME=$(mktemp -d)
PREFIX=$(mktemp -d)

npm pack                                    # 실제 publish 대상 tarball
HOME="$FAKE_HOME" npm i -g --prefix "$PREFIX" ./c-d-cc-reap-*.tgz

PROJ=$(mktemp -d)
cd "$PROJ" && git init -q
HOME="$FAKE_HOME" "$PREFIX/bin/reap" init selftest
HOME="$FAKE_HOME" "$PREFIX/bin/reap" fix --check   # 경고·에러 0 요구
```

- **`npm pack` 을 쓰는 이유**: publish 후에만 검증되는 순환을 피한다. 실제 배포될 tarball 을 그대로 설치한다. gen-074 가 발견한 daemon 배포 결함(`files` 에 `daemon/` 누락 → 끊긴 심링크)도 이 방식이면 잡힌다
- **`HOME` override**: gen-069 의 daemon e2e 패턴 차용. 사용자 `~/.claude/`, `~/.reap/` 미접촉
- **`--prefix` override**: 전역 node_modules 미오염
- CI 러너는 자체로 깨끗한 VM 이지만, **같은 스크립트가 로컬에서도 안전하게 돌아야** 개발 중 확인이 가능하다

#### 검토했으나 채택하지 않은 것 — NVIDIA OpenShell

유저가 초기에 지목. 커널 레벨(Landlock LSM + seccomp) agent 샌드박스 런타임으로 실재하는 도구이며, agent-agnostic(Claude Code 호환)이라 **층 2 에는 원리적으로 맞다.**

층 1 에 쓰지 않는 이유:
- 층 1 은 agent 를 실행하지 않으므로 커널 격리가 불필요하다 — HOME/prefix override 로 충분
- **alpha, single-player mode** 상태다. `npm publish` 를 막는 게이트의 의존성으로는 불안정 — 검증 도구가 검증 대상보다 불안정하면 안 된다
- **Linux 전용**(Landlock·seccomp 커널 기능). 개발 환경이 Darwin 이라 로컬 재현이 불가능하고, CI 에서만 도는 검사는 실패 시 디버깅이 어렵다

층 2 backlog 에서 다시 후보로 올린다.

## Out of Scope

- **층 2 (agent 관점 검증)** → 별도 backlog `agent-관점-검증-...` 로 분리 (유저 결정 2026-07-27). slash command 가 실제로 뜨는지, hook 이 도는지는 agent 를 띄워야 알 수 있고, 그 자동화는 격리보다 **agent 를 프로그램적으로 실행하고 결과를 판정하는 것**이 난관이라 설계 범위가 다르다. 이번에 끌어들이면 #22 수정이 늦어지고 설계도 덜 익은 채 들어간다
- issue #22 자체의 수정 → `resolve-22-install-skills-...` backlog
- daemon 배포 결함 수정 → `daemon-배포-결함-...` backlog (단, 본 건의 S1/S3 이 그 문제를 **탐지**하게 된다)
- `check-docs-version.sh` 확장 (gen-073 산출물, 잘 동작 중)

## Files to Change

- `scripts/check-self-diagnosis.sh` (신규) — 깨끗한 HOME + tmp 프로젝트에서 install → init → fix --check
- `.github/workflows/release.yml` — publish 앞에 추가
- `.reap/genome/application.md` — § 규칙 변경 시 carrier 확인 재작성 (판정 기준 + SSOT 우선). **genome 수정이므로 adapt phase**
- `src/templates/evolution.md` 또는 `application.md` 대응 — dog-fooding 동기화 대상인지 판단
- `.claude/commands/reapdev.versionBump.md` — 릴리즈 체크리스트에 자기진단 + 신규 사용자 경로 항목

## Acceptance

1. `bash scripts/check-self-diagnosis.sh` — **현재 상태(경고 19건)에서 fail**, `resolve-22` 적용 후 pass (양방향 확인. gen-073 의 "먼저 실패시켜라" 적용)
2. 스크립트가 사용자의 실제 `~/.claude/` 를 **건드리지 않음** (HOME 격리, gen-069 패턴)
3. release.yml 에서 자기진단 실패 시 `npm publish` 미실행
4. genome 의 carrier 절이 "이 사실을 아는 다른 곳이 있는가"를 판정 기준으로 제시하고, 기존 4항목은 예시로 격하됨
5. genome 이 SSOT 우선 원칙과 "검사로 풀 때"의 구분 기준을 담음
6. 본 repo 에서 `reap fix --check` 경고 0

## Open Decisions

- [x] **CI(매 push)에도 자기진단 포함** (유저 결정 2026-07-27). 문서 게이트와 달리 오탐 위험이 없다 — S1 참조
- [x] **carrier 는 열거 대신 파일 내 표식(canary token)** (유저 결정 2026-07-27)
- [x] **격리 방식 = `HOME`/`--prefix` override + `npm pack`** (유저 결정 2026-07-27). OpenShell 은 층 2 backlog 로 이월 — 층 1 은 agent 를 실행하지 않아 커널 격리가 불필요하고, alpha/Linux 전용이라 릴리즈 게이트 의존성으로 부적합
- [x] **층 1 만 이번 범위, 층 2 는 분리** (유저 결정 2026-07-27)
- [ ] carrier 표식의 **검증 수준** — 목록 출력·고아 탐지까지 할지, "일부 파일만 변경됨" 경고까지 갈지. 마지막은 의도적 부분 변경에서 오탐한다
- [ ] carrier ID 명명 규칙 — `kebab-case` 사실 이름으로 충분한지, 네임스페이스가 필요한지
- [ ] 자기진단 스크립트가 `npm pack` 을 매번 수행하면 CI 시간이 늘어난다 — 매 push 에서도 pack 할지, CI 는 소스 트리 검사만 하고 pack 검증은 release 에서만 할지

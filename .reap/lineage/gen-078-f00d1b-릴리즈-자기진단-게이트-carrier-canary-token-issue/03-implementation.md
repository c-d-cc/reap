# Implementation Log

## Completed Tasks

| # | 내용 |
|---|---|
| T001 | `scripts/check-self-diagnosis.sh` 신규 — `npm pack` → 격리 HOME/prefix 설치 → `init` → `fix --check` 경고 0 요구 |
| T002 | 현재 상태 **pass** + 실행 전후 `~/.claude/commands/` 19개 불변 확인 |
| T003 | **negative test — #22 재현 시 19건 검출 + exit 1** (아래 상세) |
| T004 | `release.yml` — `npm publish` 앞 게이트 |
| T005 | `ci.yml` — 매 push. 테스트 미포함 사유를 주석에 명시 |
| T006 | `scripts/list-carriers.sh` 신규 — ID 별 목록 + `--orphans` |
| T007 | carrier `claude-code-commands-path` — 9 files 표식 |
| T008 | carrier `memory-tier-classification` — 10 files 표식 |
| T009 | `list-carriers.sh` 로 2건 전부 추적, **고아 0** |
| T010 | `reap-guide.md` ×3 — § Carrier Markers |
| T011 | backlog `ci-에서-테스트-실행-...` 생성 (분리 결정 기록) |
| T012 | typecheck 0 / build / 자기진단 pass / docs gate pass / unit 470-0 / e2e 272-0 / scenario 44-0 |
| T013 | genome carrier 절 재작성 → **adapt phase** |

## Verification Results

| 기준 | 결과 |
|---|---|
| 1. 스크립트 양방향 (pass ↔ fail) | **pass** — 아래 negative test |
| 2. HOME/전역 미오염 | **pass** — 19 → 19 |
| 3. release publish 앞 | **pass** |
| 4. ci 매 push | **pass** |
| 5. carrier 2건 grep 추적 | **pass** — 9 / 10 files |
| 6. 고아 탐지 동작 | **pass** — 현재 고아 0 |
| 7. genome 재작성 | adapt phase |
| 8. 회귀 없음 | **pass** |

### negative test — 게이트가 #22 를 실제로 잡는가

게이트의 존재 이유가 여기 달려 있으므로, 통과만 보지 않고 **과거 사고를 재현해 확인**했다.

```
1차 시도 (실패):  isCanonical 을 false 로 만들었으나 exit=0
```

원인: gen-076 이 `~/.claude/commands/` 검사 **자체를 제거**했으므로 `isCanonical` 만 바꿔서는 아무 일도 일어나지 않는다. 내 코드 이해가 부정확했다.

```
2차 (정확한 재현):  #22 형태의 checkGlobPattern 을 되살림
  → FAIL  a fresh install reports 19 finding(s) about itself
          WARNING ~/.claude/commands/reap.abort.md: legacy reap command...
  → exit=1
복원 후:  exit=0
```

**19건 검출 + exit 1.** gen-073 의 "먼저 실패시켜라"를 적용했고, 그 과정에서 1차 시도의 오해까지 드러났다 — 통과만 봤다면 게이트가 무력한 줄 몰랐을 것이다.

## Discovered Issues

### 게이트가 첫 실행에서 실제 결함 2건을 잡았다

의도적으로 깨뜨리기 **전에** 이미 fail 했다.

**(1) `invariants.md` 가 placeholder 로 오판됨**

```
WARNING genome/invariants.md: appears to be placeholder-only (no substantive content)
```

placeholder 검사가 `#` / `>` / `-` 로 시작하는 줄을 전부 제외했는데, **`invariants.md` 는 본질적으로 불릿 목록**이라 산문이 하나도 없다. 배포되는 `DEFAULT_INVARIANTS` 자체가 헤딩+인용+불릿 3개다.

즉 **REAP 이 배포하는 파일이 REAP 검사를 통과 못 한다** — gen-075 의 genome threshold(100 < 배포 193줄)와 정확히 같은 유형이다.

수정: 불릿을 내용으로 인정하고 `<!--` 주석만 scaffolding 으로 제외.

게이트와 **인과로 묶여 있다** — 신규 init 이 경고를 내면 게이트가 상시 fail 이라 게이트 자체가 무의미해진다. genome § "인과로 묶인 검증 동작 fix" 적용.

**(2) `application.md` / `goals.md` 는 정당한 경고 — 시나리오를 정제**

수정 후 이번엔 `application.md` 가 걸렸다. 그러나 이건 **옳은 경고**다 — `reap init` 은 뼈대만 만들고 genome 은 agent 와 사용자가 대화로 채우는 것이 설계다.

여기서 판단이 갈렸다: 허용 목록을 만들 것인가, 시나리오를 고칠 것인가.

**시나리오를 골랐다.** 허용 목록은 늘어나면서 게이트를 무력화한다(gen-075 의 "경고 상시 → 신호 가치 0"). 대신 스크립트가 대화 부분을 채운 뒤 진단한다 — 자기진단은 "설치가 건강한가"를 보는 것이지 "프로젝트가 완성됐는가"가 아니다. 이 판단 근거를 스크립트 주석에 남겼다.

### `list-carriers.sh` 가 자기 자신을 carrier 로 셌다

주석의 예시 문자열이 grep 에 걸렸다. `--exclude=list-carriers.sh` 로 제외. 도구는 carrier 가 아니다.

## Architecture Decisions

### 표식과 SSOT 는 보완재

`claude-code-commands-path` 는 gen-076 이 DI 로 코드 쪽 carrier 를 줄였고, 남은 문서 5+2곳에 표식을 달았다. **공유 가능하면 공유해 carrier 수를 줄이고, 남은 것에 표식을 단다** — 이 순서를 `reap-guide.md` 와 genome 서술에 명시했다.

### 고아 탐지가 핵심 기능

carrier 목록 출력만으로는 "빠뜨린 곳"을 알 수 없다. **1개 파일에만 있는 ID** 는 표식이 불필요하거나 다른 carrier 를 못 찾은 것이고, 후자가 정확히 #21/#22 의 상태다.

"일부 파일만 변경됨" 경고(git hook)는 **하지 않았다** — 의도적 부분 변경에서 오탐하고, 오탐하는 검사는 결국 무시된다.

### CI 에 테스트를 넣지 못한 이유를 코드에 남김

`tests/` 가 private submodule 이라 기본 `GITHUB_TOKEN` 으로 접근 불가. 이 사실을 `ci.yml` 주석에 적어, 다음 사람이 "왜 테스트가 없지"로 다시 조사하지 않게 했다. 별도 backlog 로 분리(유저 결정).

## Deferred Items

- **genome carrier 절 재작성** → adapt phase (genome 수정이므로)
- **CI 테스트 실행** → backlog `ci-에서-테스트-실행-private-submodule...`. PAT 발급은 agent 가 대신할 수 없는 사용자 작업
- carrier 표식을 더 많은 사실로 확대 — 초기 2건으로 패턴을 확립했다. 노이즈가 되지 않는지 몇 세대 관찰 후 판단

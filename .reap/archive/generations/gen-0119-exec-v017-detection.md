---
id: gen-0119-exec
slug: v017-detection
type: exec
backlog: bk-9f35e6
title: v0.18이 v0.17 저장소를 알아본다
startedAt: 2026-09-12T04:16:32Z
startCommit: a94ee31
status: closed
closedAt: 2026-09-12T04:33:45Z
endCommit: 8aa7bd6
---

## Intent

bk-9f35e6을 소비한다. v0.18 CLI가 v0.17 저장소를 알아보게 만든다.

probe가 드러낸 것은 "안내가 안 들린다"보다 한 겹 아래다. 0.17 사용자가 안내를 듣고 0.18을 설치해 **도착한 자리가 안전하지 않다.** `ctx`는 정상인 척하고 `doctor`는 건강하다고 하고 쓰기 명령은 그냥 통과한다. 그래서 태그 선택(latest·next)으로는 이 구멍이 안 막힌다 — 손으로 설치한 사람은 어느 쪽이든 같은 자리에 도착한다.

### 끝나는 조건

1. `doctor`가 v0.17 구조를 **결함**으로 보고하고 migrate를 가리킨다
2. `ctx`가 상태 줄을 정상인 것처럼 내지 않는다 — 같은 사실을 먼저 말한다
3. `make`·`mark`가 v0.17 저장소에서 **멈춘다**. 섞임을 사후에 잡는 것이 아니라 애초에 막는다
4. `detect-version.sh`의 v18 마커가 넓어져 이미 섞인 저장소가 `mixed`로 잡힌다
5. 탐지 기준이 CLI와 스크립트 두 곳에 따로 살지 않는다
6. probe 픽스처 시나리오가 회귀 테스트로 남는다

### 경계 밖

- **`release-policy.md` 1단계 정정** — bk-1dcea1로 따로 뺐다. 처방이 사람 결정 대기라 여기서 쓰면 두 번 쓰게 된다
- 0.17 쪽 발행·확성기 패치 — 이 리포의 일이 아니고 결정 대기다
- opencode 사용자 안내 — 받기로 했으나 이 세대의 경계는 아니다. 필요하면 backlog로

### References

- probe: v0.17 형태 픽스처에 v0.18 바이너리를 물린 실측 (2026-09-12)
- 판정 로직 원본: `plugin/skills/migrate/scripts/detect-version.sh`
- migrate 4/8의 `git mv .reap .reap-v0_17` — 섞인 산출물이 함께 끌려가는 경로
- reap_v17 세션(reap-v17-82)과의 합의 — 어느 발행안을 골라도 이 수정이 선행

## Outcome

`store.ts`의 `detectLayout`이 표식으로 판을 가른다 — v017·v018·mixed·none. 소비자 셋:

| 자리 | v0.17 / mixed에서 |
|---|---|
| `ctx` | 상태 줄과 genome 대신 이주 안내만 낸다. 훅 경로는 여전히 exit 0에 유효한 JSON |
| `doctor` | 결함으로 보고한다. 순수 v017이면 거기서 끝내고, mixed면 나머지 검사를 계속한다 |
| `make` · `mark` | `requireV018Root`에서 멈춘다 |
| `init` (`--force` 포함) | 멈춘다. 이주 4/8 뒤에는 `.reap/`이 없으므로 걸리지 않는다 |

읽기는 막지 않는다. 막으면 무엇이 잘못됐는지도 못 듣는다. 양쪽 표식이 없는 `.reap/`은 `unknown`이고, `doctor`가 말하되 쓰기는 막지 않는다 — 섞일 v0.17 데이터가 없는데 막으면 씨앗을 잃은 저장소가 복구 불능이 된다.

`detect-version.sh`의 0.18 표식에 `sequence/flux.md`·`life/flux/`(비어 있지 않을 때)·`plan/sources.yml`을 더했다. 섞인 픽스처가 `v017`에서 `mixed`로 바뀐다 — 그 전에는 migrate 4/8의 `git mv`가 v0.18 항목을 격리 디렉토리로 끌고 갔다.

검증: 단위 259 통과(새것 16), `hook.test.sh`·`migrate-scripts.test.sh`(detect 11케이스)·`plugin-skills.test.sh` 통과, typecheck 통과. 재빌드한 바이너리로 픽스처 왕복 재현 — probe가 짚은 넷이 전부 닫혔고 기존 파일 변동 0.

**독립 검증(fresh subagent) 결과와 처리.** 끝나는 조건 6개는 만족으로 확인됐고, 거짓 양성은 나오지 않았다(새 `init` 프로젝트·이주 직후 모양·빈 `life/flux/`·v0.17 표식 넷 전부 실측). SessionStart 불변식도 여섯 모양에서 exit 0과 유효한 JSON으로 확인됐다. 구멍 셋을 지적받아 **전부 이 세대 안에서 고쳤다**:

1. **`init --force`가 가드 밖이었다** — v0.17 저장소에 `map.md`와 DIRS를 그대로 써서 이 세대가 막으려던 손상을 스스로 만들었다. 유도까지 있었다: 플래그 없는 `init`이 v0.17이라는 말 없이 `--force`를 가리켰다. 가드를 붙였고, 이주 5/8 경로가 안 걸리는 것을 테스트로 못박았다
2. **`unknown` 판정이 CLI에 없었다** — 표식이 하나도 없는 `.reap/`에서 스크립트는 `unknown`, CLI는 `v018`을 냈다. `doctor`가 결함 0을 답하던 자리다. 판정을 더하고 docblock의 틀린 단정("한 가지만 다르다")을 고쳤다
3. **두 판정이 일치하는지 보는 장치가 없었다** — 조건 5가 규약으로만 지켜지고 있었다. 픽스처 14개에서 `detectLayout`과 `detect-version.sh`를 직접 대조하는 테스트를 더했다

**고치지 않고 남긴 것 둘.** `seq`·`plan sources`·`carrier list`가 v0.17 저장소에서 정상인 것처럼 답한다 — 구조 손상은 없고 `ctx`·`doctor`가 사실을 전하므로 그대로 둔다. 스크립트가 `onXxx` 훅 파일 하나로 v0.18 저장소를 `mixed`로 보는 것도 남긴다 — 보수적인 쪽으로 틀리고(사람을 부른다) CLI 쪽은 이미 옳다. 둘 다 docblock에 적었다.

- summary.md: 갱신 (structure — store.ts 책임, 규약 한 줄, 테스트 수 259)
- genome: 해당 없음 — 스택·관례·규범의 자리 어느 것도 안 바뀌었다. 배운 것은 `lessons.md`로

## Dead Ends

**훅 파일명(`onXxx`)을 CLI의 v0.17 표식으로 셌다가 뺐다.** `detect-version.sh`가 그것을 세니 목록을 맞추는 것이 맞다고 보고 넣었는데, 기존 `doctor` 테스트가 깨졌다 — v0.18 프로젝트에 남은 옛 훅 파일 하나가 저장소 전체를 `mixed`로 만들어 다른 결함을 전부 가렸다. 목록을 맞추는 것보다 **각 판정이 무엇을 전제하는지**가 먼저였다. 스크립트는 v0.17로 추정되는 저장소를 보고, CLI는 v0.18로 추정되는 저장소를 본다. 후자에서 남은 훅 파일은 이주 사안이 아니라 훅 결함이고 `doctor.kind.hook_unknown_event`가 이미 맡는다. 표식으로 세면 멀쩡한 프로젝트의 쓰기가 파일 하나 때문에 막힌다. 갈라진 한 곳은 `detectLayout` docblock에 이유와 함께 적었다.

**`doctor`가 v0.17·mixed 양쪽에서 조기 종료하게 했다가 좁혔다.** 같은 테스트가 잡았다. mixed에는 진짜 v0.18 항목이 있어 나머지 검사가 의미를 갖는다. 조기 종료가 옳은 것은 순수 v017뿐이다 — 거기서는 아래 검사가 전부 v0.18 구조를 전제해 결함 0을 내고 사실을 가린다.

## References

- probe(2026-09-12): v0.17 형태 픽스처에 v0.18 바이너리를 물린 실측. `ctx` 정상 출력 · `doctor` 결함 0 · `make` 통과 · 섞인 뒤에도 `v017` 판정
- `plugin/skills/migrate/scripts/detect-version.sh` — 같은 판정의 다른 자리
- migrate `SKILL.md` 4/8의 `git mv .reap .reap-v0_17` — 섞인 산출물이 함께 끌려가는 경로
- reap_v17 세션(reap-v17-82)과의 합의 — 어느 발행안을 골라도 이 수정이 선행

## 이어지는 것

- **bk-1dcea1** — `release-policy.md` "0.17 사용자의 길" 1단계 정정. 처방이 사람 결정 대기라 이 세대의 경계 밖
- **opencode 사용자 안내** — v0.18이 받기로 했으나(reap-v17 세션과 합의) 아직 항목이 없다. 필요해지면 backlog로
- `lessons.md`가 안내선을 넘었다(항목 28 · 24). 이 세대가 만든 것은 아니다 — 졸업은 따로

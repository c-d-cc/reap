# Completion

## Summary

**Goal**: daemon 배포 결함 수정 — `@c-d-cc/reap-daemon` 을 npm 에 독립 발행 가능하게 만들고, 미설치를 사용자가 알 수 있게 하며, 배포 산출물 검사를 추가하고, 자기진단 게이트의 허위 커버리지 주장을 정정한다.

**결과**: 완료. 다만 **발행 자체는 유저 승인 사항이라 실행하지 않았다** — 이것이 0.17.5 릴리즈의 하드 선행조건이다 (아래 § 유저 결정 필요).

### 결함은 backlog 이 파악한 것보다 세 겹 더 깊었다

backlog 은 "발행되지 않은 `file:` 의존 → 끊긴 심링크"를 지적했다. 맞지만, **그것만 고쳤다면 결함의 형태만 바뀌었을 것이다.**

| # | 결함 | 증상 |
|---|---|---|
| 1 | `files` 에 daemon 없음 + npm 미발행 | 끊긴 심링크 (backlog 파악) |
| 2 | 번들이 `queries/` 를 한 단계 위에서 찾음 | 인덱싱 "성공" + **심볼 0개** |
| 3 | 번들이 `better-sqlite3` 를 인라인 | **node 에서 아예 동작 불가** (bun 사용자만 우연히 동작) |
| 4 | `__dirname` 이 번들에 **빌드 시점 리터럴로 박힘** | 배포본이 개발 머신 절대경로를 들고 나감 |

2·3·4 는 전부 이번에 발견했다. 4번은 backlog 이 "폴백 경로가 dev 에서는 맞는다"고 적은 것이 **왜 틀렸는지**에 대한 진짜 답이다.

### 변경

- **daemon 발행 준비** — `files: ["dist/","queries/"]` + 발행 메타. tarball 73KB/전체 → **14.2KB/17파일**. 버전 0.1.0 → 0.2.0
- **daemon 이 실제로 동작** — 네이티브/WASM 의존 external, `package-assets.ts` 신설로 자산 경로를 한 곳이 소유, `/health` 에 `version`
- **reap 에서 분리** — `dependencies` 는 `yaml` 하나. `resolveDaemonBin` 3상태(설치됨/체크아웃/**없음**) + 형제 패키지 신원 확인
- **최소버전 검사** — `MIN_DAEMON_VERSION` 단일 소유. 미설치와 **버전 미달을 다른 메시지로** 보고
- **미설치 UX** — `daemon status` / `fix --check` / **agent prompt** / learning emit 네 채널. **silent-fail 정책과 lifecycle 무차단은 그대로**
- **npm workspaces** — 분리하면서 사라진 daemon 런타임 의존을 CI 워크플로 변경 없이 복구
- **배포 산출물 검사** — 자기진단 게이트에 daemon 절 5단계 신설. tarball → 설치 → **node** → 인덱싱 → **심볼** → **reap 이 찾는가**
- **발행 경로** — `release.yml` 에 `daemon-v*` 태그 전용 job (태그↔버전 일치 + tarball 자산 검사)
- **허위 주장 정정** — 게이트 헤더 / `release.yml` / environment 3곳 + `reap:carrier` 표식
- **문서** — reap-guide 2곳, docs 5개 로케일, README 2종

**검증**: unit 493 / e2e 278 / scenario 44 / daemon 130, 전부 0 fail. 게이트 daemon 절 **6 assertion**, `rm -rf daemon/dist` 후에도 통과.

### evaluator 를 두 라운드 돌렸고, 네 건 모두 "전부 초록인 상태"에서 나왔다

| 라운드 | 판정 | 잡은 것 |
|---|---|---|
| 1 | partial | 게이트가 **빌드되지 않는 `daemon/dist`** 를 pack (다음 push 에서 red) / Verification #2 를 **미검증인 채 충족으로 기록** |
| 2 | pass, conditional | § 5e 의 **parse 실패가 조용히 green** / **bun/node 비대칭**으로 bun 없는 조합 미검증 |

넷 다 테스트·게이트·문서 게이트를 모두 통과한 상태였다. evaluator 는 아무것도 더 실행하지 않고 *"이 검사가 통과한다는 것이 무엇을 증명하는가"* 만 물었다.

## Lessons Learned

### 검사를 고치는 일에도 검사가 필요하다

evaluator 2회차 지시를 이행하며 § 5a-bis(번들에 빌드 머신 경로가 없을 것)를 넣었다. D-1 을 되돌려 negative test 하자 **경로를 출력하면서도 통과**했다:

```bash
if tar -xzOf ... | grep -qF "$ROOT"; then   # 이것이 무력했다
```

`set -o pipefail` 이 걸려 있고 `grep -q` 가 첫 매치에서 종료해 tar 가 SIGPIPE 를 받는다 → 파이프라인이 tar 의 실패를 보고 → `if` 가 false → **매치가 통과가 된다.**

negative test 를 돌리지 않았다면 무력한 검사를 초록으로 확인하고 넘어갔을 것이다. **검사를 추가하는 행위 자체가 검증 대상이다.**

### 부재를 주장하는 assertion 은 스스로를 먼저 증명해야 한다

§ 5b 는 경고의 **존재**를 주장하고 § 5e 는 **부재**를 주장한다. 전자는 자기증명적이다 — 나오지 않은 출력에서 무언가를 찾을 수는 없다. 후자는 크래시·비정상 출력·필드명 변경이 전부 "부재"로 읽힌다.

`try { ... } catch {}` 로 빈 객체를 만들고 거기서 경고를 찾지 못하면 통과하는 구조였다. **이 세대가 고치는 결함이 정확히 그 형태다** — 아무 일도 일어나지 않은 것이 성공과 구별되지 않는 것. 그 결함을 고치는 세대의 핵심 assertion 이 같은 병을 갖고 있었다.

### 검사를 만들 때 "먼저 실패시켜라"는 한 번이 아니라 결함마다다

genome 규칙을 지켜 수정 전 코드에서 fail 을 확인했는데, **세 번 실패했고 매번 원인이 달랐다** — dependency, 네이티브 바인딩, queries 경로. 한 번 fail 을 보고 "검사가 동작한다"고 넘어갔다면 나머지 두 결함을 고치지 못한 채 통과시키는 검사를 만들었을 것이다.

특히 세 번째 실패가 결정적이었다:

```
{"status":"ok","data":{"filesProcessed":1,"nodesCreated":0,...}}
```

**응답은 성공이고 파일도 읽었는데 심볼이 0개다.** 검사가 "인덱싱이 성공했는가"를 물었다면 통과했다. 무엇을 관찰할지가 검사의 존재만큼 중요하다.

### 결함을 재현한다는 것은 그 결함의 형태를 되살리는 것이다

헤더의 세 주장을 검증하면서 **#22 가 첫 두 시도로 재현되지 않았다.** `userLevelDirs()` 를 `[]` 로, 그다음 엉뚱한 경로로 바꿨는데 둘 다 통과했다. "#22 주장도 거짓"이라고 결론지을 뻔했다.

실제 이유는 gen-076 이 그 위치의 **스캔 자체를 제거**했기 때문이다 — checker 가 보지 않는 곳을 가리키게 만들어봐야 아무 일도 일어나지 않는다. gen-076 이전 구조를 복원하자 19개 경고가 그대로 나왔다.

**관련 코드를 아무렇게나 망가뜨리는 것은 재현이 아니다.** 그리고 재현 실패는 "주장이 거짓"이 아니라 "내 변형이 그 결함이 아니다"일 수 있다.

### 번들링은 코드가 자기 위치를 아는 방식을 바꾼다

`__dirname` 이 **빌드 시점 문자열로 치환**된다는 것이 이번 세대의 가장 놀라운 발견이다. 배포된 v0.17.4 번들에는 `/Users/hichoi/cdws/reap/src/cli/commands/daemon` 이 리터럴로 들어 있었다.

이 저장소의 다른 모든 경로 helper 는 `dirname(fileURLToPath(import.meta.url))` 을 쓴다. **전역 `__dirname` 을 쓴 단 한 곳이 정확히 결함이 난 곳이다** — genome 의 *Pattern-first / Consistency over preference* 가 추상적 선호가 아니라는 증거다.

그리고 같은 계열의 다른 답: daemon 의 queries 경로는 dist/dev 분기를 **정확히 쓰는** 대신, helper 를 **양쪽 깊이가 일치하는 위치(`src/` 바로 아래)로 옮겨** 분기 자체를 없앴다. 분기를 잘 쓰는 것보다 분기가 필요 없게 만드는 편이 낫다.

### 의존성을 떼면 그것이 옆으로 흘려주던 것도 함께 끊긴다

`file:./daemon` 을 제거하자 daemon 의 **런타임 의존이 통째로 사라졌다** — npm 이 그것들을 루트로 hoist 해 왔고, daemon 을 소스에서 띄우는 모든 경로(e2e 21개 포함)가 그 부수효과에 의존하고 있었다. 테스트를 돌렸기 때문에 잡혔고, **게이트는 이것을 보지 못한다**(tarball 경로만 본다).

두 검증이 서로 다른 것을 본다는 사실이 여기서 드러났다. 하나로 다른 하나를 대신할 수 없다.

### 게이트가 결함을 잡는 것이 우연일 수 있다

팀 리드 지시로 D-1 수정을 되돌려 게이트가 fail 하는지 확인했다. fail 했지만 **§ 5b 에서** 걸렸고, 뜯어보니 **이 머신에서만** 그렇다 — 박힌 리터럴이 여기 실존해 격리 설치본이 개발자의 daemon 을 찾았기 때문이다. 다른 머신이면 그 경로가 없어 5b 는 통과하고, 5e 는 daemon 을 정식 설치하므로 `require.resolve` 가 성공해 역시 통과한다.

**즉 게이트가 D-1 을 잡은 것은 우연이었다.** "되돌렸더니 fail 했다"만 보고 만족했으면 그 우연을 근거로 삼았을 것이다. 원인을 직접 보는 assertion(번들에 빌드 경로가 없을 것)을 따로 넣어야 했다.

**fail 했다는 사실만으로는 부족하다 — 어디서 왜 fail 했는지까지 봐야 한다.**

### 독립 검토자가 "모든 검사가 초록인 상태"에서 blocking 결함 4건을 찾았다

두 라운드 모두 그랬다. 1회차에서 evaluator 는 **아무것도 더 실행하지 않고** 두 가지를 물었다:

1. *"이 검사가 pack 하는 `daemon/dist` 는 누가 만드는가?"* → **아무도 만들지 않는다.** gitignore 되어 있고 CI 는 빌드하지 않는다. 내 로컬에서 통과한 이유는 손으로 빌드해둔 dist 가 남아 있었기 때문. **다음 push 에서 red 가 됐을 것이다**
2. *"5c/5d 가 통과하면 무엇이 증명되는가?"* → reap 을 호출하지 않으므로 **두 패키지를 잇는 고리는 증명되지 않는다.** 사용자가 둘 다 설치하고도 아무것도 못 얻는 세계에서 전부 초록이다

1번이 특히 아프다: **"내 트리에서만 동작"을 끝내려고 만든 검사 자신이 그 상태였다.** 헤더에는 "소스 트리를 아예 보지 않는다"고 적어놓고, 빌드 입력에 대해서는 정확히 소스 트리를 보고 있었다.

2회차는 게이트 assertion 자신을 겨눴다 — parse 실패의 조용한 green, bun/node 비대칭.

longterm 의 *"A passing check is not a verified goal"* 이 **이번엔 나에게 적용됐다.** gen-078 이 커버 범위를 잘못 적은 것을 정정하는 세대에서, 같은 종류의 실수를 **네 번** 했다.

### 정정하는 세대는 정정 대상과 같은 실수를 하기 쉽다

이번 세대가 고친 결함들과 evaluator 가 찾은 결함들이 **같은 형태**였다.

| 고친 것 | 내가 만든 것 |
|---|---|
| 게이트가 잡지 못하면서 잡는다고 주장 | Verification #2 를 충족으로 오기재 |
| 값을 두 곳이 알고 어긋남 (`__dirname`) | `daemon/package.json` 의 build 명령이 옛 것 그대로 |
| 문서가 사실과 다름 (reap-guide) | README 2종은 손대지 않음 |
| 아무 일도 없음이 성공과 구별되지 않음 | § 5e 의 parse 실패가 조용히 green |
| bun 만 되는 것을 아무도 눈치채지 못함 | 새 assertion 도 bun 으로만 연결을 증명 |

**"이 결함의 형태를 나 자신이 반복하고 있지 않은가"** 를 별도로 물어야 한다. 고치는 중이라는 사실이 면역을 주지 않는다.

## 유저 결정 필요 — 릴리즈 전 하드 선행조건

**`@c-d-cc/reap-daemon` 을 0.17.5 보다 먼저 발행해야 한다.** reap-guide, docs 5개 로케일, README 2종이 모두 `npm i -g @c-d-cc/reap-daemon` 을 안내하는데 현재 이 패키지는 **404** 다. 발행하지 않고 0.17.5 를 내면 결함을 다른 결함으로 바꾸는 것이다.

발행 경로는 준비됐다 — `daemon-v0.2.0` 태그를 밀면 `release.yml` 의 `publish-daemon` job 이 처리한다. **본 세대는 publish 를 실행하지 않았다.**

**fitness 에서 유저가 3건을 결정했다:**
- **`REAP_SKIP_DAEMON_CHECK` 제거** — longterm § *"a gate you add must not come with something that blunts it"*. 아직 발생하지 않은 비용을 위해 새 게이트를 미리 무디게 하지 않는다. minor fix 로 처리하고 게이트를 재실행해 확인 (03-implementation.md § 마무리)
- **daemon 0.2.0 유지** — 배포 구조가 통째로 바뀌고 처음 발행되는 버전이므로 minor bump 가 맞다
- **strict resolver 우회를 0.17.5 에 포함** (priority high) — 이번 수정이 그 사용자들에게는 상황을 **더 나쁘게** 만들므로 그 상태로 릴리즈하지 않는다

## 알려진 파손 — "미검증"이 아니다

**strict resolver(pnpm 기본 store, Yarn PnP)에서 daemon 은 원리적으로 찾아지지 않는다.** daemon 이 **의도적으로** dependency 가 아니므로 — 그것이 이번 수정의 요점이므로 — 선언되지 않은 패키지 접근을 차단하는 해석기와 정면 충돌한다.

**원래보다 엄밀히 더 나쁘다.** 그 사용자는 daemon 을 정상 설치하고도 **영구히 "설치하라"는 안내**를 받고, 게이트 § 5e 는 seam 이 건강하다고 보고한다. 이전 결함(끊긴 심링크)은 최소한 조용했다.

| 조합 | 무엇이 깨지는가 |
|---|---|
| pnpm 기본 store / Yarn PnP | resolve 원리적 실패 → 이미 설치한 것을 설치하라는 영구 안내 |
| reap 전역 + daemon 을 프로젝트 로컬 의존으로 | 전역 번들의 조회 경로에 프로젝트 `node_modules` 가 없어 미설치 판정 |
| reap 과 daemon 을 다른 매니저·prefix 로 설치 | 조회 경로가 갈려 미설치 판정 |
| nvm 등으로 node 버전 전환 후 prefix 변경 | daemon 만 사라지거나 그 반대. 판정은 정확하나 사용자에게는 갑작스럽다 |
| Windows | 전 경로 미검증. 경로 구분자와 전역 prefix 구조가 다르다 |

우회(`REAP_DAEMON_BIN` / `config.daemonBin`)는 범위 확장이라 backlog 로 넘겼다.

## Reflect — 알려진 잔여 상태

pruning 후에도 `fix --check` 가 두 건을 경고한다. **숫자를 맞추려고 사실인 서술을 지우지 않았다** (genome § *"do not hand-delete to silence a warning"*).

- **게이트 비용 — `better-sqlite3` 이중 설치**: § 5c(`DM_INSTALL`)와 § 5e(`PREFIX`)가 각각 설치한다. 리눅스 러너가 prebuilt 를 받지 못하면 **소스 컴파일이 두 번** 일어난다. D4 결정에 따라 측정하지 않았으므로, 후퇴 판단이 필요해질 때의 근거로 적어둔다
- **`environment/summary.md` 275줄 (가이드라인 250)** — 이번에 한 정리: 처방적 내용(Key Design Decisions 5항목)을 genome 소유로 넘김, generation별 changelog 서술을 현재형으로 접음, 낡아진 서술 수정(daemon helper 의 "dist queries path 문제 회피"는 이제 거짓), gen-081 의 일회성 디버깅 절 축약. 278 → 273 으로 줄인 뒤, evaluator 2회차 결과(게이트가 무엇을 보고 무엇을 못 보는지)를 추가해 275 가 됐다. **남은 근본 원인은 Source Structure 트리의 인라인 주석이 처방적 규칙을 다수 담고 있다는 것**이다 — 그건 genome 으로 옮길 일이고 adapt 에서 제안한다
- **`vision/memory/longterm.md` 53줄 (가이드라인 50)** — 새 교훈 6건을 **대부분 행을 늘리지 않고 기존 항목에 접어 넣었고**, 2건을 삭제했다 (genome 이 이미 담은 "Bias analysis", 그리고 evolution.md 의 테스트 레벨 표에 흡수된 "Disk-multi-file functions → e2e"). 남은 것은 전부 지금도 행동을 바꾸는 교훈이다
- lineage parent 경고 2건은 gen-052(브랜치 작업)의 사전 상태이며 본 세대와 무관하다

## Adapt — genome 이관 제안 (적용하지 않음, 인간 판단)

> adapt 단계 규칙에 따라 backlog 을 만들지 않는다. 아래는 제안이며 채택 여부는 인간이 정한다.

### 제안 1 — `environment/summary.md` 의 Source Structure 주석이 처방적 규칙을 담고 있다

reflect 에서 pruning 을 했는데도 275줄(가이드라인 250)이 남았고, **근본 원인은 줄 수가 아니라 배치**다. Source Structure 트리의 인라인 주석이 서술이 아니라 **규칙**을 담고 있다:

- *"빌드는 `daemon/scripts/build.sh` 하나가 소유한다 — 두 곳이 알면 어긋난다"*
- *"미주입(undefined)은 '모름'이며 기존 동작을 유지한다"*
- *"`core` 는 `cli` 를 import 하지 않는다"*
- *"warnings only, `fixProject` 에 대응 코드 없음이 auto-delete 방지 장치"*

genome § *genome vs environment 경계* 의 판단 기준(*"이 정보가 바뀌면 genome 을 수정해야 하나?"*)으로는 전부 genome 쪽이다. environment 는 *"지금 이런 상태다"* 를 말해야 하는데 이것들은 *"이렇게 해야 한다"* 다.

**제안**: `application.md` 에 § *모듈 간 경계와 소유권* 같은 절을 만들어 위 계열을 옮기고, Source Structure 는 **무엇이 어디 있는가**만 남긴다. 그러면 environment 가 250 아래로 자연스럽게 내려가고, 규칙이 immutable 한 자리에 놓인다.

**하지 않은 이유**: 대상 판별에 판단이 많이 들어가고(어느 주석이 규칙이고 어느 것이 서술인가), 잘못 옮기면 genome 이 descriptive 해진다. 별도 세대로 다루는 편이 낫다고 본다.

### 제안 2 — `evolution.md` 의 "검사를 만들 때 — 먼저 실패시켜라" 를 보강할 것인가

본 세대가 그 규칙의 부족한 지점을 세 번 만났다:
- **결함마다** 실패시켜야 한다 (한 번 보고 넘어가면 나머지를 못 잡는 검사를 만든다)
- **어디서 fail 했는지 읽어야 한다** (D-1 되돌리기는 fail 했지만 이 머신에서만 성립하는 우연이었다)
- **검사를 고치는 일에도 검사가 필요하다** (새 assertion 의 첫 구현이 `pipefail` 때문에 무력했다)

**하지 않은 이유**: 이미 longterm memory 에 담았고 memory 는 매 세션 로드된다. genome 에도 넣으면 중복이며, genome § *"memory 에 쓰지 않을 것 — genome 에 이미 있는 원칙"* 의 반대 방향 위반이 된다. **어느 쪽이 정본이어야 하는지는 인간 판단이 필요하다** — 행동 규칙이므로 genome 이 맞다면 longterm 에서 빼야 한다.

## Next Generation Hints

- **다음 세대: strict resolver 우회** (`REAP_DAEMON_BIN` / `config.daemonBin`) — **0.17.5 릴리즈 하드 선행조건** (유저 결정). backlog priority high. 본 세대가 pnpm/Yarn PnP 사용자에게 상황을 더 나쁘게 만들었으므로 그 상태로 릴리즈하지 않는다
- **0.17.5 순서**: gen-083(완료) → strict resolver 우회 → `daemon-v0.2.0` 발행(유저가 태그 push) → 0.17.5 릴리즈
- **gen-084 SCIP 설계는 릴리즈와 순서 무관** — 코드를 내지 않는 설계 세대이므로 앞뒤 어디든 가능하다. 본 세대가 선행조건이었고 충족됐으므로 **"분리된 daemon"을 전제로 설계할 수 있다.** 이번에 daemon 이 `queries/` 를 런타임 자산으로 들고 다닌다는 점이 드러났으므로, SCIP 인덱서를 붙이면 그 자산 구조와 패키지 크기가 어떻게 되는지가 설계 항목이다
- **daemon 의 e2e 가 소스 트리만 본다** — gen-069 의 21개는 `bun src/index.ts` 를 spawn 한다. 배포 산출물 검증은 이제 게이트가 하지만, 두 경로가 갈라져 있다는 사실 자체는 남아 있다. daemon e2e 를 dist 기준으로 옮길지 검토
- **`__dirname` 의 다른 사용처가 없는지는 확인했으나, 번들링이 바꾸는 다른 것들은 확인하지 않았다** — `import.meta.dir`, `process.argv[1]`, `require.main` 등 위치·신원에 관한 값들이 번들에서 어떻게 되는지 한 번 훑어볼 가치가 있다
- **이미 등록한 backlog 4건** — daemon typecheck 상시 red / `semverGte` prerelease 미구분 / `MIN_DAEMON_VERSION` 발행 검사 / **strict resolver 우회 경로**. 넷 다 이번 작업이 만든 인접 위험이며, 마지막 것만 "알려진 파손"이라 성격이 다르다
- **부재를 주장하는 assertion 을 게이트 전체에서 훑어볼 가치가 있다** — § 5e 에서 하나 나왔다. `grep -q` 로 무언가 **없음**을 확인하는 자리는 전부 같은 취약성을 갖는다 (명령이 실제로 돌았는지 먼저 증명하지 않으면)
- **evaluator 를 validation 에서 계속 쓸 것인가** — 이번에 두 blocking 결함을 잡았다. 비용 대비 효과가 명확했던 첫 사례로 기록해둘 만하다

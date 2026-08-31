# Plugin 배포 형태 — 설계

> **상태**: 리서치·실측 완료 (2026-08-19~22). 결정 9건 전부 닫힘. **구현만 남았다.**
> 이 문서 하나가 산출물이다 — 리서치를 별도 generation 으로 두지 않는다 (사용자, 2026-08-22).
> milestone: `v018-배포-형태를-plugin-으로` (ms-001, goal-004)

## 1. 무엇을 만드는가

npm 패키지 안에 plugin 디렉토리를 하나 두고, 사용자 홈에 흩어져 있던 21개를 그리로 옮긴다.

```
@c-d-cc/reap 패키지
└── plugin/
    ├── .claude-plugin/plugin.json
    ├── commands/          ← ~/.claude/commands/reap.*.md  19개
    ├── agents/            ← ~/.claude/agents/reap-*.md     2개
    └── hooks/hooks.json   ← ~/.claude/settings.json 의 SessionStart 항목
```

배포 경로는 **작은 github marketplace + `command` plugin source + `mode: "link"`**:

```json
// marketplace.json (별도 소형 repo)
{ "name": "reap", "owner": { "name": "c-d-cc" },
  "plugins": [
    { "name": "reap",
      "source": { "source": "command", "command": "reap plugin-root", "mode": "link" } }
  ] }
```

`reap plugin-root` 가 설치된 패키지의 `plugin/` 절대경로를 stdout 한다. Claude Code 는 캐시
디렉토리를 만들되 **내용은 그 자리로 symlink** 한다. 따라서 `npm i -g @c-d-cc/reap` 한 번으로
CLI 와 plugin 이 **동시에** 갱신되고 사본이 존재하지 않는다.

**남는 것**: `~/.reap/reap-guide.md` 1개 (§ 3 결정 1). **OpenCode 는 이 전환의 바깥이다** (§ 3 결정 4).

## 2. 확정 사실 — 전부 실측 (Claude Code 2.1.239)

| | 사실 |
|---|---|
| F1 | **plugin SessionStart hook 은 발화한다.** github · directory · command source 전부. `${CLAUDE_PLUGIN_ROOT}` 는 hook command 안에서 전개된다 |
| F2 | **issue #11509 은 해소됐다** — 로컬 directory source 에서도 발화한다 |
| F3 | **`command` 는 marketplace source 가 아니라 *plugin* source 다.** marketplace 로 선언하면 스키마가 거부한다 |
| F4 | **`mode` 는 `link` 와 `copy` 둘.** `link` 는 원본을 그 자리에서 쓴다(내용 디렉토리가 전부 symlink). **Windows 미지원** |
| F5 | **`npm` marketplace source 는 미구현이다** (`NPM marketplace sources not yet implemented`) |
| F6 | **`command` source 는 대화형 승인이 필수다.** 비대화형에서는 명령이 표시만 되고 실행되지 않는다 |
| F7 | **settings.json 검증은 all-or-nothing.** 값 하나가 틀리면 그 파일 전체가 무시된다 |
| F8 | **`${CLAUDE_PLUGIN_ROOT}` 는 CLAUDE.md 의 `@` import 에서 전개되지 않는다.** 문자 그대로 남는다 |
| F9 | 이름 규칙이 셋이다 — command `plugin:command`(**축약 없음**) · agent `plugin:agent`(동명 공존) · skill **bare**(동명 shadowing) |
| F10 | **OpenCode 의 npm plugin 은 agent 도 command 도 기여하지 못한다.** 런타임 훅 전용 |
| F11 | plugin cache 는 marketplace 제거 직후에는 남는다. 클라이언트에 수명 관리 기제가 있다(`.in_use/{pid}` · `.last_inuse_sweep` · `.parked` · `claude plugin prune`) |
| F12 | `claude plugin list` 는 **project scope 를 못 읽는다** — 활성화돼 있어도 `disabled` 로 표시하고 `details` 는 "not found" |

## 3. 결정 — 9건 전부 닫힘

| # | 결정 | 근거 |
|---|---|---|
| 1 | **`reap-guide.md` 는 `~/.reap/` 에 그대로 둔다** | SessionStart `additionalContext` 의 길이 상한이 낮다(사용자). guide 는 52KB 라 주입 불가. F8 이 "plugin 안을 `@` 로 가리키기"도 막는다 |
| 2 | **marketplace 는 github, plugin source 는 `command`+`link`** | F5 로 A/B 가 성립하지 않는다. 문서가 세운 A/B 축은 marketplace source 와 plugin source 를 섞은 것이었다 |
| 3 | **이름 변경을 받아들이고 전수 갱신** | F9 — 축약이 없으므로 콜론형으로 통일. `/reap.start`→`/reap:start`, `reap-evolve`→`reap:reap-evolve` |
| 4 | **OpenCode 는 런타임 훅만 npm 화** | F10. command 19 + agent 2 는 파일로 남는다. 조사 부족이 아니라 클라이언트의 구조 |
| 5 | **REAP 이 사용자 `settings.json` 에 marketplace 를 쓴다** | 이미 SessionStart hook 을 쓰고 있다. payload 교체이지 새 침습이 아니다. **단 F7 이 전제 조건을 붙인다 — § 4** |
| 6 | **설치 scope 는 user** | REAP 은 프로젝트마다 쓰인다. project scope 면 F6 승인을 프로젝트마다 반복하고 F12 까지 겹친다 |
| 7 | **REAP 은 plugin cache 를 건드리지 않는다** | F11 — 클라이언트가 수명을 관리한다. `reap uninstall` 은 `/plugin uninstall` 을 **안내**하는 데서 멈춘다 |
| 8 | **REAP 은 skill 을 내지 않는다** | F9 의 shadowing. 지금도 내지 않으므로 비용 0. command·agent 는 네임스페이스가 붙어 충돌 개념이 없다 |
| 9 | **순서**: gen-088 머지 이후 → 구현(별도 브랜치) → 릴리즈 | § 5 |

## 4. 구현 세대가 반드시 지킬 것

1. **`settings.json` 은 쓰기 전에 검증한다.** F7 때문이다. 모양 하나가 틀리면 사용자의
   model·permissions·hooks 가 **전부** 무효화된다. 이 리서치가 실제로 그것을 밟았다.
   "쓰고 나서 사용자가 발견"은 허용되지 않는 실패 양상이다.
2. **구 경로 21개를 지우는 주체와 시점을 코드로 정한다.** gen-088 의 `removeUserLevelAssets` 가
   그 자리다 — 사용자 것은 남기고 REAP 것만 빼는 수술 로직이 이미 있다.
3. **`extraKnownMarketplaces` 항목을 처음부터 uninstall 대상에 넣는다.** 넣지 않으면
   REAP 이 사라진 뒤에도 매 세션 없는 명령(`reap plugin-root`)을 부른다 —
   **gen-088 이 없앤 것과 정확히 같은 모양이 자리만 옮긴 것**이다.
4. **plugin 을 disable 한 상태의 CLI 동작을 사용자에게 알린다.** F12 가 지금 거짓을 말한다.
5. **Windows 는 `link` 를 못 쓴다** (F4). `copy` 폴백을 둘지, Windows 를 미지원으로 둘지 정한다.
   `copy` 로 떨어지면 갱신 비대칭이 되살아난다 — 그때 무엇이 갱신을 유발하는지 답해야 한다.
6. **`claude plugin validate --strict` 를 CI 게이트로 건다.** manifest 오류를 사용자가 아니라
   CI 가 먼저 만나야 한다.

## 5. gen-087 / gen-088 과의 관계

**gen-087 `ensureUserLevelAssets` 는 죽지 않는다.** claude-code 의 파일 21개 복사는 사라지지만
**OpenCode 몫이 통째로 남고**(결정 4), `~/.reap/reap-guide.md` 도 남고(결정 1),
`extraKnownMarketplaces`/`enabledPlugins` 를 쓰는 새 책임이 생긴다. 계약 구조
(`syncUserLevelAssets` / `UserLevelSyncResult.complete` / `.install-stamp`)는 유지된다.

**gen-088 `reap uninstall` 은 전환의 전제다.** `/plugin uninstall` 은 `~/.reap/` 도 npm 패키지도
모른다 — `reap uninstall` 은 전환 후에도 **유일한 완전 제거 경로**다. 4단계 중 바뀌는 것은
3단계(홈 자산 제거)의 payload 하나이며, claude-code 쪽이
*"파일 21개 제거"* → *"`settings.json` 에서 REAP 항목만 빼기"* 가 된다.

**따라서 전환 세대는 gen-088 머지 이후여야 한다. 순서가 고정된다.**

`~/.reap/` 밑 구 상주-인덱스 기제의 산출물 정리는 그 기제를 폐기한 generation 의 migration note 가 갖는다 —
plugin 전환과 독립이며, `uninstall` allowlist 에서는 **항목을 빼지 않는다**(migration 을 돌리지
않은 사용자를 위한 안전망. 비용 0).

## 6. 남은 미측정

착수 전에 필요하면 잰다. **부재를 증명으로 읽지 않는다.**

- `npm` marketplace source 의 런타임 동작 — F5 는 `[독해]` 근거 둘(에러 문자열의 위치,
  판별자 1회 vs `command` 15회)이며 실제로 시도하지는 않았다
- SessionStart `additionalContext` 의 정확한 길이 상한 — 사용자 제공. 관측된 값은
  superpowers 3,321자 / `reap load-context` 2,026자로 둘 다 상한에 닿지 않는다
- plugin cache sweep 의 발동 조건·임계값 (F11)
- skill 의 네임스페이스 우회(`plugin:skill`)가 가능한지 — 결정 8이 이 미측정 위에 서지 않도록
  skill 을 아예 쓰지 않는 쪽으로 닫았다
- 동명 command 의 정식 호출(`/reap:reap`) — 축약(`/reap`)이 실패하는 것만 확인했다
- `${CLAUDE_PLUGIN_ROOT}` 가 CLAUDE.md 외의 `@` import 에서 전개되는지

## 7. 기각한 안

- **"원격에만 두고 로컬에는 두지 않는다"** — plugin 도 버전별 캐시로 전부 내려받는다. 그런 형태는 없다
- **plugin `bin/` 으로 CLI 까지 배포** — reap 이 두 벌 존재해 없애려던 버전 어긋남을 자초한다
- **`postuninstall` 훅으로 정리** — npm 이 `preuninstall`/`postuninstall` 을 실행하지 않는다
  (npm 10.9.4 전역·로컬, 12.0.2 에서 격리 probe 로 측정)
- **`reap-guide.md` 를 plugin skill 로 옮기기** — 동작이 "항상 로드"에서 "필요할 때 로드"로 바뀐다
- **SessionStart 로 guide 본문 주입** — 길이 상한(결정 1)

## 8. 근거 — 어떻게 알아냈는가

**실측 방법.** 일회용 marketplace 1개 + plugin 2개(`reapdir` = directory source,
`reapcmd` = command source + `mode:link`)를 만들어 임시 프로젝트에 `--scope project` 로 설치하고,
대화형 세션에서 관측했다. plugin 로딩·hook 발화·`@` import 전개는 **세션 시작 시점**에
일어나므로 실행 중인 세션에서는 관측할 수 없다.

**대조군을 세웠다.** 부재를 주장하려면 부재가 스스로 증명돼야 한다:
- F8(전개 안 됨)은 같은 파일의 평범한 `@./control.md` 가 **전개됨**을 먼저 확인한 뒤에야 유효하다
- F10(OpenCode)은 셋을 세웠다 — plugin 이 실제로 로드되는가(sentinel 파일: **양성**) ·
  agent 파일이 정상인가(`.opencode/agent/` 에 두면 목록에 **나타남**) ·
  plugin 설정만 두면(**안 나타남**)

**F1 은 probe 없이 나왔다.** `superpowers`(plugin, github source)의 `hooks/hooks.json` 이
SessionStart 를 `${CLAUDE_PLUGIN_ROOT}` 경유로 등록하고, 그 hook 을 직접 실행한 출력이
세션 컨텍스트에 **바이트 동일하게** 들어와 있었다. *"측정 불가"라고 적는 것보다 재는 것이 쌌다.*

**틀렸던 것 하나.** 세션 시작 알림(`[GPTAKU 플러그인 업데이트 있음]`)을 plugin hook 의 증거로
읽을 뻔했다. 실제로는 `~/.claude/settings.json` → `~/.claude/scripts/` 의 **사본**이었다 —
REAP 이 지금 하는 것과 같은 패턴이며, plugin hook 의 증거가 아니라 그 반대의 증거였다.

**F3·F7 은 실패에서 나왔다.** 문서의 표대로 `command` 를 marketplace source 로 선언했더니
`extraKnownMarketplaces.…source.source: Invalid input` 으로 거부됐고, 그 한 줄이
**같은 파일의 유효한 항목까지 전부 무효화**해 probe 가 통째로 안 실렸다.
gen-079 가 OpenCode 에서 겪은 실패 양상이 Claude Code 에도 있다.

## 9. 업그레이드 경로 — 0.18 은 자동으로 도달하지 않는다 (사용자, 2026-08-22)

**결정: 0.18 로의 이행은 자동 갱신으로 하지 않는다.** 사용자가 명시적으로 시작하고,
전용 upgrade agent 가 수행한다.

근거는 § 2 의 F6 이다 — `command` plugin source 는 대화형 승인을 요구한다. 자동 갱신은
세션 도중에 일어나므로, 승인할 사람이 없는 시점에 구 슬래시 커맨드 19개가 사라진다.
**자동 갱신을 막으면 그 구간이 구조적으로 사라진다**: 사용자가 셸에서 의도적으로 올리고,
다음 세션에서 승인 창과 새 커맨드를 함께 받는다.

### 차단 기제는 이미 있다

`performAutoUpdate` 5단계의 `autoUpdateMinVersion` 하한. 0.18 을 floor `"0.18.0"` 으로
발행하면 그 아래 버전은 전부 `blocked` 가 되고 설치 대신 안내만 나간다. **코드 변경 없이
`package.json` 값 하나**이며, `scripts/check-version-floors.sh` 가 그 버전이 실제로
발행됐는지 릴리즈 전에 검사한다.

### 발행 — `latest` 를 0.17.8 에 두고 0.18 은 `next` 태그로

`queryLatestVersion` 도 `queryAutoUpdateMinVersion` 도 `npm view` 로 **dist-tag `latest`** 를
읽는다 `[실행]`: 이 패키지에는 `alpha` 태그가 따로 있는데도 `npm view @c-d-cc/reap version` 은
latest 를 낸다. **어느 버전이 `latest` 인지는 우리가 정한다.**

| 사용자 | 결과 |
|---|---|
| 0.17.7 | latest=0.17.8, floor=0.16.0 → 하한 통과 → **자동으로 0.17.8 로 올라간다** |
| 0.17.8 | latest 가 자기 자신 → 자동 갱신 없음. 일일 확인이 "0.18 이 `next` 에 있다"를 안내 |
| 안내를 따름 | `reap update` → upgrade agent → `npm i -g @c-d-cc/reap@next` |

**"창"이 경쟁이 아니라 우리가 정하는 기간이 된다.** 며칠을 기다릴 필요가 없고, 늦게 켠
사용자도 놓치지 않는다 — 0.17.7 사용자는 **언제 켜든** 0.17.8 을 받는다.

이 방식에서는 **floor 가 이행에 필요하지 않다.** 0.18 이 `latest` 가 아니므로 아무도 자동으로
거기 가지 않는다. `autoUpdateMinVersion: "0.18.0"` 은 나중에 0.18 을 `latest` 로 승격할 때를
위한 안전장치로 남긴다.

**대가**: 승격 전까지 `npm i -g @c-d-cc/reap` 는 0.17.8 을 준다. 이행할 것이 없는 **신규
사용자도 구버전을 받는다** — 이 방식에서 유일하게 어색한 지점이며, 승격 시점을 정하는 것이
그 답이다.

*(초안은 "0.17.7 사용자는 구제할 수 없다"라고 적었다. dist-tag 를 계산에 넣지 않은 결과였고,
넣으면 구제된다.)*

### 0.17.8 이 하는 일

1. **0.18 출시 안내** — latest 가 0.18 이상이면 "자동으로 올라가지 않는다, `/reap.update` 를
   쳐라"를 출력한다
2. **하루 한 번만 확인한다.** 지금 `check-version` 은 SessionStart hook 이면서
   `npm view` 를 **매 세션** 친다 — 실측 **0.34~1.2초**가 모든 세션 시작에 붙는다.
   일일 캐시는 새 검사만이 아니라 **이미 있는 이 비용**을 함께 없앤다
3. **`reap update` 가 upgrade agent 를 설치하고 넘긴다**

### upgrade agent

정의 파일은 **reap github repo** 에 둔다. `reap update` 가 받아서 사용자 레벨 agent 로 설치한다.

**네트워크 실패 시 중단하고 수동 안내** (사용자 결정) — 절반만 된 상태를 만들지 않는다.

수행 범위: **npm 설치 → 승인 안내 → 검증 → 0.18 구조로 migration.**
즉 사용자가 하는 일은 agent 를 부르는 것 하나다.

### 브랜치가 다르다

0.17.8 은 **main** 의 작업이다. 이 문서가 서술하는 0.18 전환은 별도 브랜치이고,
`/reap.update` 라는 이름 자체가 0.17 의 것이다(0.18 에서는 `/reap:update`).
**milestone 에 별도 generation 으로 세운다.**

## 10. 설치 스크립트를 현관으로 둔다 (사용자, 2026-08-22)

**결정: `curl | bash` 설치 스크립트를 만들되, npm 을 대체하지 않고 감싼다.**

스크립트가 하는 일: node 확인 → `npm i -g @c-d-cc/reap` → **plugin 등록·승인을 대화형으로**
→ 검증. npm 절차가 사용자에게 보이지 않고, 설치의 앞단을 우리가 통제한다.

### 이것이 F6 을 해결한다

`command` plugin source 는 **대화형 터미널**을 요구한다(§ 2 F6). 설치 스크립트가 바로
그것이다 — 스크립트가 `claude plugin install reap@c-d-cc` 를 실행하면 사용자가 그 자리에서
승인한다. **"설치 → 재시작 → 승인" 세 단계가 한 단계로 접힌다.**

주의: `curl | bash` 는 stdin 이 파이프라 프롬프트가 막힌다. `< /dev/tty` 로 열어야 하며,
**그것이 실제로 `claude plugin install` 의 승인에 통하는지는 미측정**이다.

### 그래서 plugin source 는 `command` 를 유지한다

승인 마찰이 스크립트로 해소되고, Windows 는 `mode: "copy"` 로 이미 처리했다. 남는 대가는
조직의 `disableCommandPluginSources` 하나인데, **스크립트가 그 실패를 관측해 사용자에게
말할 수 있다** — 보이지 않던 실패가 보이는 실패가 된다.

`github` source(내용 벤더링)를 택하지 않은 이유는 **매 릴리즈마다 marketplace repo 에
발행하는 단계가 늘어나기 때문**이다. genome 이 가장 경계하는 형태 — 여러 곳이 아는 사실이고
사람이 기억해야 하는 절차다. `command` 는 plugin 내용이 npm 패키지 안에 있으므로
어긋날 자리가 없다.

### npm 을 바이너리로 대체하는 것은 별도 축이다

검토했고 **이 milestone 에 넣지 않는다.** 실측: `bun build --compile` 이 **62MB 바이너리를
184ms 에** 만들고 실제로 돈다. 이웃 도구들이 그 길을 간다(opencode 126MB, claude 325MB).
`web-tree-sitter` 인라인도 gen-089 가 이미 시험해 통과시켰다.

그런데 컴파일된 바이너리는 **즉시 `--version` 이 `0.0.0`** 이었다 `[실행]` —
`ownPackageRoot()` 가 디스크의 `package.json` 을 찾는데 바이너리 안에는 없다.
같은 이유로 `detectInstallKind` · `pluginDir` · grammar 경로가 전부 걸린다.
**`package-info.ts` 가 "다섯 곳이 알던 값을 하나로 모은" 파일인데, 컴파일 주입이라는
새 형태로 그 문제가 돌아온다.**

그 밖에 따라오는 것: 플랫폼별 CI 매트릭스(현재 전무) · 자체 업데이터 ·
`npx @c-d-cc/reap uninstall` 복구 경로 소멸 · Windows 용 PowerShell 스크립트.

**그리고 "postinstall 문제가 해결된다"는 이유로는 부족하다** — 그 문제는 gen-087 이
이미 해결했다(사용자 레벨 설치가 CLI 진입 훅으로 옮겨졌고 npm 과 무관하게 동작한다).
바이너리 전환의 이득은 중복 경로 제거이지 살아있는 결함의 수정이 아니다.

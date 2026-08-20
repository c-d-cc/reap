# Learning

## Goal

층2 게이트(`scripts/check-agent-integration.sh`)가 권한 거부를 슬래시 커맨드 미노출로 오진하는
가짜 음성을 없애고, `current.yml` 부재를 하나의 원인으로 단정하지 않도록 판정을 고친다.

## Source Backlog

`층2-게이트가-권한-거부를-슬래시-커맨드-미노출로-오진한다-가짜-음성.md` (130줄, 전문 정독).

요지 — 0.17.6 릴리즈 직전 게이트가 FAIL 을 냈고 **그 진단이 틀렸다**:

```
ok    agent completed (subtype: success, cost: $0.2582815)
FAIL  no generation was created
      ".reap/life/current.yml is absent, so /reap.start never ran.
       The files are in place — the client did not surface them as a
       slash command. This is the gen-063 failure exactly."
```

agent 가 한 말은 정반대였다 — 슬래시 커맨드는 **정상 로드**됐고, 그 안의 `reap run start` 가
**auto mode 권한 분류기에 차단**됐다. 권한만 열고 손으로 재현하니 통과했다
(`permission_denials: []`, `gen-001-1be3ff`, goal 일치, $0.2760).

즉 슬래시 커맨드·`@` import·SessionStart hook·CLI 는 전부 정상이었고 원인은 오직 권한이었다.
이번 릴리즈에서 **$0.534 가 들었고 그중 $0.258 은 이 결함 때문에 버려졌다.**

backlog 가 제시한 해법은 둘이며 **함께** 해야 한다:
- **S1** — 원인을 없앤다: 임시 프로젝트에 `Bash(reap:*)` 허용을 심는다.
- **S2** — 판정이 원인을 구분하게 한다: agent 실행 성공을 선단언하고, 권한 거부는
  *검사 실패*가 아니라 **측정 실패(SKIP/amber)** 로 보고하며, `This is the gen-063 failure exactly`
  라는 단정을 제거한다.

**S1 만으로는 부족하다.** S1 은 *알려진 한 원인*만 없앤다. 다음 원인은 다른 얼굴로 온다.
이 세대의 실체는 **"검사가 실패한 것"과 "검사가 아무것도 측정하지 못한 것"의 구분**이다.

## 현재 게이트의 구조 (`scripts/check-agent-integration.sh`, 163줄)

| 절 | 하는 일 |
|---|---|
| § 0 | `claude` / `reap` 존재 확인 → 없으면 amber SKIP + exit 0 |
| § 1 | `mktemp -d` + `git init` + `reap init agentcheck` |
| § 2 | `claude -p "<프롬프트>" --output-format json` → `AGENT_JSON` |
| § 2b | `subtype` / `is_error` 파싱 → `is_error` 면 FAIL |
| § 2c | `SLASH_COMMAND_UNAVAILABLE` 토큰 grep → 있으면 FAIL (gen-063 경로) |
| § 3 | `current.yml` 부재 → **FAIL + 단일 원인 단정** / goal 불일치 → FAIL / 통과 |

결함이 있는 곳은 § 3 의 첫 블록(현재 133~149행)과, 그 앞의 § 1(권한 설정 부재)이다.

### 스크립트 주석이 스스로 적어둔 전제가 틀렸다

> "If the slash command had not been recognised, current.yml simply would not exist."

**한 방향으로만 참이다.** 역은 성립하지 않는다 — `current.yml` 부재는 커맨드 미노출로도,
권한 거부로도, CLI 크래시로도, `reap init` 실패로도 생긴다. longterm 이 이미 적어둔 형태다:
*"부재를 주장하는 assertion 은 스스로 먼저 증명한다."* 여기에 **권한 거부**가 추가된 것이다.

## 이 세대에서 새로 측정한 것 (backlog 에 없던 것)

backlog 는 *허용된* 실행의 `permission_denials: []` 만 기록했다. **거부된 실행에서 그 필드가
실제로 채워지는지는 아무도 확인하지 않았다.** S2 의 핵심 신호이므로 측정했다.

| 시도 | 명령 | 결과 | 비용 |
|---|---|---|---|
| P1 | `--disallowedTools "Bash"` + `echo hello` | `permission_denials: []` — **도구가 아예 제공되지 않아** 시도조차 없음 | $0.1457 |
| P2 | `--permission-mode manual` + `echo hello` | `permission_denials: []` — 헤드리스에서 **거부되지 않고 그냥 실행됨** | $0.1323 |
| P3 | 기본(auto) + `reap run start --goal 'probe goal'` (비-REAP 디렉토리) | `permission_denials: []` — **거부 없이 실행됨** (CLI 가 "Not a reap project" 반환) | $0.1449 |

소계 **$0.4229**. 그리고 이것이 **설계를 바꾼다**:

1. **권한 거부를 on-demand 로 재현할 방법을 찾지 못했다.** 분류기 판정은 문맥 의존이고
   플래그로 강제되지 않는다. 따라서 "거부된 상태"의 **라이브** negative 는 만들 수 없다 —
   canned fixture 로 판정부만 통과시켜야 하며, 그 fixture 가 **실측이 아니라 합성**임을
   artifact 에 명시해야 한다.
2. **`permission_denials` 가 비었다고 해서 거부가 없었다는 뜻이 아니다.**
   오늘의 실패 실행에서 그 필드가 채워졌는지는 **알 수 없다**. 그러므로 S2 를
   그 필드 하나에 얹으면 안 된다 — agent 가 산문으로 보고한 "차단됐다"를 잡을
   **두 번째 경로**(이미 있는 `SLASH_COMMAND_UNAVAILABLE` 과 같은 방식의 지정 토큰)가 필요하다.
3. `~/.claude/settings.json` 의 `permissions.defaultMode` 는 **`"auto"`** — backlog 가 말한
   전제가 이 머신에서 사실임을 확인했다.

## S1 이 만드는 유일한 위험 — 세 번째 negative

`Bash(reap:*)` 를 열면 **agent 가 슬래시 커맨드 없이도 CLI 로 우회해 `current.yml` 을 만들 수 있다.**
그러면 게이트는 진짜 gen-063 결함에도 **통과**한다 — 수정이 검사를 파괴한 것이다.

이것은 가정이 아니라 **이미 일어난 일**이다. longterm:

> gen-079's layer-2 check judged by a file appearing on disk and passed with every slash
> command deleted, because the agent fell back to the CLI and produced the same file.

현재 스크립트의 `SLASH_COMMAND_UNAVAILABLE` 토큰 지시가 그 대응으로 들어간 것이다.
**그러나 그 토큰 지시는 권한이 열린 조건에서 한 번도 재검증되지 않았다** — 지금까지 CLI 우회는
권한 분류기가 우연히 막고 있었을 수도 있다. 그러므로 이 세대는 반드시 라이브로 확인해야 한다.

## 환경 사실

- 전역 `reap` 은 npm 전역 설치 `0.17.5` (`~/.nvm/.../lib/node_modules/@c-d-cc/reap`).
  소스는 `0.17.6` 미발행. 게이트는 **설치된 것**을 검사하므로 이 불일치는 게이트 수정 자체와 무관하다.
- `~/.reap/reap-guide.md` 는 **낡았다** (0.17.5 시점 — daemon 절이 남아 있다).
  `reap install-skills` 를 돌리면 갱신되지만, 그러면 전역 0.17.5 바이너리가 자기 번들 내용을 쓴다.
- 사용자 레벨 자산: slash command 19 / agent 2 / stamp `{"claude-code":"0.17.5"}`.
- `.reap/reap-guide.md` 는 `src/templates/reap-guide.md` 와 **바이트 동일** (dogfooding 쌍).
  § Verifying a Release 표는 세 곳이 안다 — 템플릿 / 프로젝트 사본 / `~/.reap/` 설치본.
- 게이트를 호출하는 곳: `.claude/commands/reapdev.versionBump.md` Step 5-2 (수동, 태그 전).
  CI 에는 없다. 테스트 코드에서 이 스크립트를 부르는 곳은 **0건**.

## Backlog Review

pending 11건. 이번 goal 과 직접 관련된 것은 **없다** — 6건은 0.18 별도 브랜치(plan/idea/milestone/
interview/plugin 전환), 2건은 폐기된 daemon 파생(community detection / process tracing),
나머지는 auto-update 버전 판독 / `list-carriers.sh` orphan 오탐 / source-map 부재 경고 판단.
소비한 것은 source backlog 1건뿐이다.

## Clarity

**High.** 결함이 실측됐고(비용·재현 조건·agent 보고까지), 해법 방향이 backlog 에 확정돼 있고,
검증 항목 4개가 명시돼 있다. 남은 판단은 구현 세부 둘뿐이다:

1. 권한을 `--allowedTools` 로 줄 것인가, `settings.local.json` 으로 줄 것인가, 둘 다인가
   → **둘 다.** 실측으로 통과가 확인된 조합이 그 쌍이고, 하나로 좁히면 "검사 범위를 좁히면
   기준이 통과로 바뀐다"(genome)에 해당한다.
2. SKIP 의 exit code → **0.** 기존 SKIP 2종(`claude` 부재 / `reap` 부재)의 선례를 따른다.
   비-0 은 래퍼에서 FAIL 로 읽힌다. 대신 문구를 기존 SKIP 과 같은 강도로
   ("agent integration was NOT verified") 낸다.

## 제약

- **strictEdit** — `02-planning.md` 의 파일 목록에 있는 파일만 수정.
- **strictMerge** — `git pull/push/merge` 직접 실행 금지.
- 버전 **0.17.6 유지**, bump 없음. 0.17.5 이하 릴리즈 문서 항목은 **건드리지 않는다**.
- push·tag 금지. 현재 main 에 미푸시 커밋 7개.
- baseline: unit 585 / e2e 329 / scenario 44, 전부 0 fail. `fix --check` 0 error / 2 warning.

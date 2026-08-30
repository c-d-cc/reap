---
name: report-issue
description: Submit a bug report or feature request to the REAP project (c-d-cc/reap) from any project that uses REAP. Decides whether the problem is REAP's or this project's, writes an issue the REAP repo can act on (repro, expected, actual, versions, layout facts) without leaking this project's code or paths, and files it with gh - or hands the body to the human when gh is unavailable. Trigger on "REAP 버그", "reap 이슈 올려", "report-issue", "REAP에 기능 요청", or when a REAP tool or skill behaves against its spec.
---

# report-issue — REAP에 버그·기능 요청을 올린다

REAP를 쓰다 마주친 결함이 이 프로젝트의 backlog에 남거나 잊히는 길을 막는다. REAP 리포(`c-d-cc/reap`)까지 가는 통로가 이것이다.

## 먼저: 누구의 문제인가

**REAP의 것인 경우** — `reap` 바이너리가 spec과 다르게 돈다, 플러그인 skill이 서로 모순되거나 없는 것을 가리킨다, `ctx`가 잘못 싣거나 빠뜨린다, 훅이 세션 시작을 막는다(`invariants.md` 위반), 저장 규약이 이 프로젝트에서 성립하지 않는다, 있으면 좋을 명령·skill·규약.

**이 프로젝트의 것인 경우 — issue가 아니다.** genome·milestone·backlog에 무엇을 적을지의 판단, 이 프로젝트의 코드가 깨진 것, plan source의 내용. 그것은 `make backlog`나 loop다.

**헷갈리면 이 프로젝트의 backlog에 먼저 적고, REAP의 것이라 확신될 때 올린다.** 잘못 올린 issue는 REAP 쪽이 "재현 안 됨"으로 닫게 되고 그 왕복이 가장 비싸다.

## 재현부터 확정한다

issue를 쓰기 전에 **명령 한 줄로 재현되는가**를 본다. 재현되면 그 명령과 출력이 issue의 본문이다. 재현이 안 되면 무엇을 봤는지만 적고 **"재현 안 됨"을 숨기지 않는다** — 검증할 수 없는 것을 검증한 척하지 않는다.

기능 요청이면 **무엇이 없어서 무엇을 못 했는가**가 본문이다. 원하는 해법이 아니라 막힌 지점을 적는다.

## 실을 것과 안 실을 것

**싣는다** — 전부 REAP가 소유하는 사실이다.

```bash
reap --version                                  # 바이너리
grep version "$(ls -d ~/.claude/plugins/cache/*/reap/*/ 2>/dev/null | tail -1).claude-plugin/plugin.json"   # 플러그인 (없으면 "플러그인 없음")
ls .reap                                        # 레이아웃 (파일 이름만)
```

여기에 재현 명령·기대·실제, 관련 spec 문서 이름(`04-commands.md` 같은), 그리고 이것이 어느 skill 안에서 일어났는가.

**싣지 않는다** — 이 프로젝트의 소스 코드, 리포 밖 절대경로, genome·milestone·backlog·loop의 **본문**, plan source의 내용, 사람 이름·이메일. 파일 *이름*은 되지만 *내용*은 안 된다. REAP 이슈는 공개 리포에 남는다.

## 올린다

```bash
gh issue create --repo c-d-cc/reap --title "<한 줄>" --body-file <임시파일> [--label bug|enhancement]
```

제목은 **증상**이다 — "`mark loop --closed`가 milestones를 덮어쓴다"이지 "loop 버그"가 아니다. 본문 형식:

```
## 무엇이 (기대 / 실제)
## 재현
## 환경 — reap <버전> · 플러그인 <버전> · 레이아웃
## 어디서 — 어느 skill·명령 안에서, 관련 spec
```

**`gh`가 없거나 인증이 안 됐으면 본문을 그대로 사람에게 낸다** — 제목과 본문을 화면에 내고 어디로 올리면 되는지(`https://github.com/c-d-cc/reap/issues/new`)를 말한다. 조용히 실패하거나 다른 방법을 지어내지 않는다.

## 남긴다

올린 issue의 URL을 **이 프로젝트의 backlog 항목**으로 남긴다 — `make backlog --type reap-issue --title "<제목> (#<번호>)"`. 이유는 둘이다: REAP가 고친 뒤 이 프로젝트가 무엇을 다시 해야 하는지 붙잡아야 하고, 임시로 우회한 것이 있으면 그것을 되돌릴 자리가 필요하다. 우회를 했다면 그 항목에 적는다.

REAP 쪽이 닫았는지는 **추적하지 않는다.** 다음에 `localUpdate`나 플러그인 갱신 뒤 그 항목을 볼 때 확인하면 된다.

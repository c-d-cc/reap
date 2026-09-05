---
name: reapdev.resolveIssue
description: Use when developing REAP itself and a GitHub issue on c-d-cc/reap must be resolved - lists open issues, reads one, opens a REAP generation grounded on it, and after the fix comments on and closes the issue. Trigger on "resolveIssue", "issue 해결", "이슈 처리", "github issue 기반으로 evolve", or an issue number/URL from github.com/c-d-cc/reap.
---

# resolveIssue — GitHub issue를 REAP 세대로 해소한다

REAP를 만드는 사람만 쓴다. 대상 리포는 `c-d-cc/reap`, 도구는 `gh`다. issue를 읽고, 세대를 열어 고치고, 닫는 데까지가 한 번이다.

## 1. 목록

```bash
gh issue list --repo c-d-cc/reap --state open --json number,title,labels,createdAt
```

번호가 인자로 왔으면 목록은 건너뛴다. 없으면 목록을 사람에게 보이고 고르게 한다. **"열린 issue 전부"라고 했으면 전부가 대상이다** — 하나씩 고르지 않는다.

## 2. 읽기

```bash
gh issue view <n> --repo c-d-cc/reap --json title,body,labels,author,comments
```

본문에서 셋을 뽑는다 — **expected/actual**(무엇이 어긋났나), **repro**(어떻게 재현하나), **제안**(작성자가 원하는 모양). label이 `bug`면 복원이고 `enhancement`면 새 의도다. 본문이 여러 항목을 합친 것이면(#26·#27을 여기로 합침 등) 항목마다 따로 센다.

## 3. 방향

원인을 추정하고 고칠 방향을 한 문단으로 적는다. 여기서 갈린다.

- **틀 안의 개선**(스킬 텍스트·스크립트·검사 추가, 옛 동작 복원)이면 사람에게 묻지 않고 4로 간다
- **방향이 바뀌는 개선**(저장 규약·명령 표면·판단 규칙의 뜻이 달라짐)이면 사람 검토를 받는다. 작성자가 사람 자신이고 제안이 본문에 있어도, 제안이 곧 승인은 아니다 — 제안대로 할지 한 줄로 확인한다

## 4. 세대 열기

issue 하나가 경계 하나다. 근거는 issue의 성격으로 정한다.

| issue | 축 | 근거 |
|---|---|---|
| 이미 있는 동작이 spec대로 안 돈다 (`bug`) | fix | 없음 — `References`에 issue를 적는다 |
| 열린 milestone의 가지에 든다 | exec | `--milestone <ms-id>` |
| 새 의도인데 milestone이 없다 | exec | `reap make backlog --type <label> --title "#<n>: <title>"` 로 항목을 만들고 `--backlog` |

```bash
reap make generation --milestone <ms-id> --title "resolve #<n>: <title>" --slug resolve-issue-<n>
```

제목은 **`resolve #<n>: <issue 제목>`** 꼴이다 — 레지스트리에서 issue 번호로 찾을 수 있어야 한다. 기록의 `References`에 issue URL과 인용을, `Intent`에 "끝나는 조건"을 issue의 expected 그대로 적는다.

**같은 파일을 고치는 issue 둘은 한 세대로 연다.** 제목에 번호를 다 적는다(`resolve #25 #30: ...`). 겹치지 않는 issue를 편의로 묶지는 않는다.

나머지는 [evolve](../../../plugin/skills/evolve/SKILL.md)와 같다 — 열린 세대가 있으면 먼저 멈추고, 위임할지는 거기 신호대로.

## 5. 고치기

- 스크립트·바이너리를 고쳤으면 **실패하는 검사를 먼저** `tests/`에 쓴다. `tests/`는 submodule이라 커밋이 따로다 — `git -C tests add ... && git -C tests commit`, 주 트리에서 `git add tests`
- `src/`나 `plugin/`을 고쳤으면 [localUpdate](../reapdev.localUpdate/SKILL.md)로 로컬에 반영한다. 반영 없이 "고쳤다"고 하지 않는다
- `bun test`, `bash tests/migrate-scripts.test.sh`, `bash tests/hook.test.sh`, `reap doctor` — 고친 표면에 해당하는 것 전부

## 6. 닫기

`/reap:complete`로 세대를 닫는다. 그 다음 issue에 코멘트하고 닫는다.

```bash
gh issue comment <n> --repo c-d-cc/reap --body "$(cat <<'MD'
Resolved in `gen-NNNN-exec` (<commit>).

### Changes
- <바뀐 것 1 — 파일과 한 줄 요약>
- <바뀐 것 2>

### Not changed
- <issue의 항목 중 안 한 것과 이유 — 없으면 절을 뺀다>

Available in the next release.
MD
)"
gh issue close <n> --repo c-d-cc/reap
```

issue의 항목 중 하나라도 안 했으면 **닫지 않는다** — 코멘트만 남기고 남은 항목을 적는다. 여러 issue를 한 세대로 했으면 issue마다 따로 코멘트한다.

버전 bump·publish는 여기서 하지 않는다 — 사람의 결정이다([feedback: push 전 확인](../../../docs/release-policy.md)).

## 막히면

- `gh: command not found` → `brew install gh && gh auth login`
- issue가 이미 닫혀 있다 → 다시 열지 않는다. 같은 증상이면 새 issue를 [report-issue](../../../plugin/skills/report-issue/SKILL.md)로
- 원인이 이 리포 밖(Claude Code·npm)에 있다 → 코멘트에 원인과 우회를 적고 label `upstream`을 단다. 닫지 않는다

---
id: gen-0045-plan
slug: 기획-분리
type: plan
title: 기획을 별도 플러그인으로 내보낸다
startedAt: 2026-08-23T07:49:02Z
startCommit: 9e2510c
status: closed
closedAt: 2026-08-23T08:03:08Z
endCommit: 23b6c78
---
## Intent

**REAP가 기획을 만들지 않는다.** 기획은 별도 플러그인 `reap-plan`이 갖고, REAP는 **기획을 어떻게 소비할 것인지에 대한 프로토콜**을 정의한다. 기획단에 provide하는 것은 **고쳐야 할 것을 issue로 발행하는 것**뿐이다.

**이것이 `gen-0044-plan`이 남긴 빈칸의 답이다.** plan 축의 경계를 REAP 안에서 찾으려다 track으로 틀렸는데, **경계가 REAP 밖이었다.**

**끝나는 조건 — 배치**
- 이 리포의 `plugin/.claude-plugin/marketplace.json`을 지운다. 마켓플레이스는 `ctod-plugins` 하나다
- `c-d-cc/reap`에 push한다
- `ctod-plugins`에 `reap`를 submodule로 등록하고 manifest에 항목을 더한다
- `reapdev.localUpdate`가 새 마켓플레이스를 본다

**끝나는 조건 — 경계**
- spec이 **REAP는 기획을 쓰지 않는다**를 말한다. `author-plan`이 약속에서 빠진다
- **소비 프로토콜**이 무엇인지가 정해진다 — plan source를 어떻게 읽고, 무엇을 근거로 인용하고, 어긋난 것을 어떻게 되돌려 보내는가
- **issue 발행**이 그 되돌려 보내는 길이다

## Outcome

### 배치

- **`c-d-cc/reap`에 push했다.** 이 리포의 첫 remote다
- **`plugin/.claude-plugin/marketplace.json`을 지웠다.** 마켓플레이스는 `ctod-plugins` 하나다(규약 §3)
- **`c-d-cc/plugins`에 `reap`를 등록했다** — `plugins/reap` submodule, `source: ./plugins/reap/plugin`, validate 통과, push까지
- **개발 루프를 `reap-dev`로 옮겼다.** `~/.claude/dev-marketplaces/reap-dev`에 작업 트리로 가는 심링크

**`source`는 마켓플레이스 디렉토리 안쪽만 가리킨다.** 절대경로도 `../`도 `source: Invalid input`으로 거부당했다(둘 다 시도했다). 그래서 배포는 submodule, 개발은 심링크다. **submodule은 push된 커밋을 싣기 때문에 개발 루프로 못 쓴다.**

### 경계

**소비 프로토콜 넷**을 `05-knowledge.md`의 `plan source`에 세웠다 — 등록 · 읽기 · 인용 · **되돌려 보내기**.

사람이 정한 것 셋이 그대로 들어갔다.

- **인용은 파일 경로까지다.** 항목 단위로 인용하려면 기획의 계층을 REAP가 알아야 하고, 그러면 **작업의 모양을 결정하게 된다**(`genome/application.md`). 대가는 *"어느 대목에서 나왔는가"*가 milestone 본문의 `Background`에만 남는다는 것 — 검색되지 않는 자리다
- **issue는 plan source root의 `issue/`에 파일로 쓴다.** 소비는 `reap-plan`이 한다. REAP는 **쓰고 잊는다** — 닫혔는지 추적하지 않고 `status`를 고치지도 않는다
- **`ms-005`는 닫고 소비 쪽만 다시 잘랐다** → `ms-011`

**`author-plan`을 spec의 약속에서 내렸다** — `02-flow.md`(skill 표·다이어그램) · `06-agent.md`(skill 표 + 새 절 `REAP는 기획을 쓰지 않는다`) · `08-delivery.md`(레이아웃 + 새 절 `마켓플레이스는 이 리포에 없다`) · `09-roadmap.md` · `summary.md`.

**`conventions/`가 담을 것이 줄었다** — *"이 소스를 읽는 법"*만이고 *"쓰는 법"*은 빠졌다.

### 딸린 답 하나

**`--ref`가 가리키던 경로가 사라지면 그것 자체가 issue다.** `ms-005`가 못 답하고 죽은 물음인데 프로토콜이 답을 줬다 — `doctor`가 보고하고 사람이 `make issue`로 돌려보낸다. **REAP가 `refs`를 조용히 고치지 않는다.** 고치면 어느 근거로 만들었는지가 사라진다.

## Dead Ends

**절대경로·상대경로로 개발 마켓플레이스를 만들려던 것.** `source: "/Users/.../plugin"`도 `"../../../cdws/reap/plugin"`도 `source: Invalid input`이다. `source`는 마켓플레이스 루트 안쪽으로 해석된다. **심링크가 유일하게 통했다.**

## Notes

**이것이 `gen-0044-plan`이 남긴 빈칸의 답이다.** `02-flow.md`의 `plan 축에는 아직 경계가 없다`가 그 빈칸을 갖고 있었는데, **경계가 REAP 밖이었다.** `gen-0040`은 그것을 `track`이라 부르다 철회됐고 `ms-005`는 `author-plan`이라 부르고 있었다 — **둘 다 안에서 찾았다.**

## Open Questions

**전부 `ms-011`이 받았다** — 프로토콜의 범위(넷으로 확정), issue를 어디에 발행하는가(plan source root의 `issue/`), `ms-005`를 어떻게 하는가(닫고 다시 자름). 남은 셋은 `ms-011`의 `Open Questions`에 있다: YAML 파서 · issue의 레지스트리 · `make issue`가 커밋까지 하는가.

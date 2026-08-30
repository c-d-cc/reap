---
name: complete
description: Use when finishing work in a REAP project - verifying the commit rule, writing the outcome, updating the handoff for the next session, and closing the generation record. Trigger on "세대 닫기", "작업 마무리", "완료", or when substantive work in a repo containing .reap/ is done.
---

# complete — 세대를 닫는다

## 먼저: 무엇을 닫는지 안다

세션이 열릴 때 주입된 것은 `genome/`과 `environment/summary.md`, 그리고 **상태 줄**뿐이다. 이 세션에서 세대를 열지 않았다면 `handoff.md`도 세대 기록도 **아직 세션에 없다.**

상태 줄이 알리는 **열린 세대의 기록**을 읽는다. 무엇을 하려던 세대였는지 모르면 결과를 적을 수 없다. 상태 줄이 없으면 `reap ctx`를 직접 부른다.

`handoff.md`는 **교체할 것**이므로 지금 무엇이 적혀 있는지 먼저 본다.

## 그다음: 커밋 규칙을 확인한다

**커밋되지 않은 상태로 세대를 닫지 않는다.** 이것이 REAP의 유일한 규칙이고, **도구는 이것을 검사하지 않는다.** 확인은 여기서 한다.

```bash
git status --porcelain        # 비어 있어야 한다
git log <startCommit>..HEAD --oneline   # 새 커밋이 하나 이상 있어야 한다
```

`startCommit`은 세대 기록의 frontmatter에 있고, 상태 줄에도 나온다.

**커밋은 여러 개로 나눠도 된다.** 오히려 하나의 거대한 커밋보다 낫다 — 나중에 되돌릴 때 단위가 된다.

**규칙이 안 맞으면 여기서 멈춘다.**

- 커밋 안 된 변경이 있다 → 무엇을 커밋하고 무엇을 버릴지 사람과 정리한다. 임의로 커밋하지 않는다
- 새 커밋이 하나도 없다 → 이 세대는 아무것도 바꾸지 않았다. **닫을 게 아니라 abort할 것**인지 사람에게 확인한다

## 기록을 마무리한다

[기록 어휘](../shared/references/record-vocabulary.md)를 참고해 세대 기록의 본문을 정리한다.

최소한 **무엇을 했고 무엇이 남았는지**는 남긴다. 진행 중이던 계획은 지우거나 결과에 녹인다 — 끝난 세대에 살아있는 계획이 남아 있으면 다음 세션이 그것을 할 일로 읽는다.

**접었던 접근이 있으면 적는다.** 다음 세션이 같은 길을 다시 걷지 않게 하는 것이 이 기록의 가장 큰 값이다.

## handoff를 갱신한다 (milestone에 속한 세대만)

**exec 세대만 milestone에 속한다.** fix 세대는 `milestone` 필드가 없으므로 갱신할 `handoff.md`도 milestone의 계획 항목도 없다 — 이 절 전체를 건너뛴다. fix가 대신 남기는 것은 세대 기록 본문(무엇을 했고 무엇이 남았는지)과, 전역 교훈이면 `vision/memory/lessons.md`다. **loop는 이 skill이 닫지 않는다** — [loop](../loop/SKILL.md)가 산출물이 자리를 찾았을 때 `mark loop --closed`로 닫는다.

exec 세대라면, `milestone/handoff.md`는 **다음 세션에 필요한 것만** 담는다. 교체하지 누적하지 않는다.

- 지금 어디까지 왔는가
- 다음에 무엇부터 보면 되는가
- 걸려 있는 것 (미해결 질문, 사람의 답을 기다리는 것)

**필요할지 모르는 것은 여기 넣지 않는다.** 그건 `idea/freememo/`의 자리다. 이 구분이 무너지면 handoff는 아무도 안 읽는 파일이 된다.

milestone의 계획 항목을 진행에 맞춰 갱신한다. 항목이 늘거나 쪼개지거나 없어져도 된다.

## 이월할 것을 옮긴다

이 세대에서 나왔지만 지금 하지 않기로 한 것:
- 할 일 → `backlog/`
- 결론 안 난 조사·관찰 → `idea/`

**정한 것은 이월하지 않는다.** 이 세대가 무언가를 확정했다면 그것이 규율할 자리(plan source·`genome/`·`map.md`)에 **이미 반영되어 있어야 한다.** 안 되어 있으면 닫기 전에 반영하거나, 안 정해진 것으로 둔다. REAP에는 결정 로그가 없다 — 나중에 반영하겠다고 적어둘 곳이 없는 것이 의도다.

## 기록을 닫는다

frontmatter를 갱신한다.

```yaml
status: closed
closedAt: 2026-08-23T13:20:00Z
endCommit: 9f8e7d6        # 현재 HEAD
```

## milestone이 끝났는가

세대를 닫고 나서 **milestone의 종료 조건이 이제 충족됐다고 읽히면 거기서 멈춘다.** 스스로 닫지 않는다.

**종료 절차는 [carve-milestone](../carve-milestone/SKILL.md)의 것이다** — fitness를 어떻게 묻고, 받은 답을 어떻게 읽고, `cleanup`과 `mark milestone --closed`를 어떤 순서로 부르는지가 거기 있다. 여기 옮겨 적지 않는다.

## 도구가 있으면 도구로

`reap` 바이너리가 있으면 frontmatter 갱신은 `reap mark generation <id> --closed`가 한다. **`mark`는 검사하지 않는다** — 커밋 확인은 위에서 이미 했다. 바이너리가 없으면 손으로 한다.

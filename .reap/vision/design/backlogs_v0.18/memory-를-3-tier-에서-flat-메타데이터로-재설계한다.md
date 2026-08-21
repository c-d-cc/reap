---
type: task
status: pending
priority: high
createdAt: 2026-08-21T00:00:00.000Z
---

# memory 를 3-tier 에서 flat + 메타데이터로 재설계한다

> 사용자 결정 (2026-08-21):
> - `memory/` 아래 **flat** — tier 폴더 없이 메모리 하나당 파일 하나
> - 각 메모리가 갖는 것: **status · type · expiration term(만료 기준) · from · to**
>   (`from`/`to` 는 연관되는 개념·문서·항목의 명시)
> - 전체를 prompt 에 올리는 것은 불가능하므로, **살아있는 메모리만 75자 내외로 압축해서** 올린다

## Problem

3-tier(`longterm` / `midterm` / `shortterm`)는 **분류를 사람이 매번 판단해야 하는 구조**다. 그래서 세 가지가 실제로 일어났다.

**1. tier 는 하나의 축인데 메모리는 여러 축을 갖는다.** "지금 필요한가 / 살아있는 트랙인가 / 행동을 바꾸는 교훈인가"는 서로 배타적이지 않다. 진행 중인 트랙이면서 동시에 다음 세션에 즉시 필요한 것이 있고, 그것은 두 파일 중 하나를 골라야 한다 — 그리고 고른 순간 다른 쪽에서 안 보인다.

**2. 만료가 파일 단위로만 일어난다.** pruning 은 "이 파일에서 이 문단을 지운다"인데, 판단 단위(메모리 하나)와 저장 단위(파일 하나)가 어긋나 있다. 그래서 reflect 의 의무 cleanup 이 **문단 단위 산문 편집**이 되고, 무엇이 왜 남아 있는지는 아무데도 기록되지 않는다.

**3. 연관이 표현되지 않는다.** 한 메모리가 어느 설계 문서·backlog·generation 에서 나왔고 무엇을 가리키는지가 산문 안에 묻힌다. 대상이 사라져도(문서 삭제·트랙 종료) 그 사실을 아무도 모른다.

그리고 **비대화가 구조적으로 예정돼 있다.** 현재 규약은 longterm ~50줄 / midterm ~70줄 / shortterm ~60줄이고, 넘으면 "pruning 미수행 실패 신호"로 처리한다. 즉 **크기 상한이 곧 총량 상한**이라 오래 산 프로젝트일수록 남길 수 있는 교훈의 수가 고정된다. 이 저장소의 longterm 은 이미 그 임계를 크게 넘었다.

## Solution

`vision/memory/` 를 flat 으로 바꾸고, 메모리 하나를 **frontmatter 를 가진 파일 하나**로 만든다.

```
vision/memory/
├── <slug>.md
├── <slug>.md
└── ...
```

각 파일:

```markdown
---
status:     <살아있음 / 만료 / 대체됨>
type:       <유형>
expires:    <만료 기준 — 무엇이 참이 되면 이 메모리가 죽는가>
from:       [출처 — 이 메모리를 낳은 generation·문서·backlog]
to:         [대상 — 이 메모리가 가리키는 개념·문서·항목]
summary:    <75자 내외 — prompt 에 올라가는 유일한 본문>
---

본문 (길이 제한 없음. 필요할 때만 열린다)
```

**prompt 에는 `summary` 만 올라간다.** 살아있는 메모리가 30개면 약 2,250자다. 본문은 agent 가 필요할 때 파일을 연다.

### 이 변경의 실질 난이도는 개념이 아니라 로딩 경로다

지금 memory 는 **static knowledge** 다 — `CLAUDE.md` 의 `@` import 가 세 파일을 **경로로 직접 나열**한다:

```
@.reap/vision/memory/longterm.md
@.reap/vision/memory/midterm.md
@.reap/vision/memory/shortterm.md
```

flat 이면 파일이 계속 생기므로 **`@` 로 나열할 수 없다.** 따라서 memory 는 static 에서 **dynamic 으로 이동해야 한다** — `load-context`(Claude Code SessionStart) 와 `dump-state-sync`(OpenCode) 가 살아있는 메모리의 `summary` 를 모아 주입하고, 양쪽은 **byte-identical** 이어야 한다.

이것은 `genome/application.md` 의 Static/Dynamic 분리 표를 고치는 일이다. 그 표의 원칙은 *"dynamic 자격은 파일로 표현 불가능한 generation state 의존성"* 인데, memory 는 그 의존성이 없다 — **파일 목록이 가변이라 `@` 로 못 쓴다**는 새로운 사유다. 원칙에 이 사유를 추가할지, 아니면 static 의 정의를 "경로가 고정된 것"으로 좁힐지 판단해야 한다.

**현재 두 경로가 이미 비대칭이다**: `@` import 는 3개 전부를 올리는데 `loadReapKnowledge` 는 `shortterm` 과 `midterm` 만 읽는다(`longterm` 없음). subagent 는 CLAUDE.md 를 통해 longterm 을 받으므로 지금은 메워지지만, dynamic 으로 옮기면 **prompt 가 유일한 경로가 되므로 이 비대칭이 곧 누락이 된다.**

## 정의해야 할 것

**1. `summary` 의 소유권 — 본문과 어긋나는 문제**

`summary` 는 본문의 압축본이므로 **같은 사실을 두 곳이 안다.** 본문을 고치고 summary 를 안 고치면 prompt 에 올라가는 것만 낡는다 — 그리고 그것이 agent 가 보는 유일한 버전이다. genome 의 carrier 원칙이 정확히 적용되는 자리이며, **"공유가 표식보다 낫다"** 를 여기 적용할 수 있는지 검토한다(본문 첫 문단을 summary 로 쓰면 소유자가 하나가 된다 — 대신 75자 제약이 본문 문체를 구속한다).

**2. summary → 본문 열람 트리거**

summary 만 올라가면 agent 는 "이런 메모리가 있다"만 안다. **본문을 여는 규칙이 없으면 summary 는 목차이고, 목차만 보고 행동하면 지금보다 나빠진다.** 최소한 summary 옆에 파일 경로가 붙어야 하고, "언제 여는가"가 genome 규칙으로 있어야 한다.

**3. `expires` 가 되살리는 것 — genome 규칙과의 정면 충돌**

현재 `genome/evolution.md` 는 **"tier 를 lifespan 으로 분류하지 마라 — AI 는 미래를 모르므로 그 추론이 매번 부담이 되고 오분류를 누적시킨다"** 고 명시한다. `expires` 는 그 lifespan 판단이다.

구분이 성립하는지 확인할 것:
- **사건 기반**(`plugin 전환 완료 시`, `0.18 릴리즈까지`) → 예측이 아니라 조건이다. 규칙과 충돌하지 않는다
- **날짜 기반**(`2026-12-01`) → 옛 문제가 그대로 돌아온다

**사건 기반만 허용할지, 허용한다면 그 사건이 일어났음을 누가 판정하는지**를 정한다. 사람이 매번 판정해야 하면 3-tier 의 부담이 이름만 바꿔 돌아온 것이다.

**4. `status` 전이를 누가 언제 하는가**

만료된 메모리는 **삭제되는가 남는가.** 남으면 flat 폴더가 무한히 늘어나고, 삭제하면 git history 만 남는다(현재 pruning 정책과 같음). reflect phase 의 의무 cleanup 이 이 전이를 수행하는 형태여야 한다.

**총량 상한이 사라진다는 점을 명시적으로 다룰 것.** 지금은 줄 수 제한이 곧 총량 제한이었다. flat + status 로 바꾸면 "살아있는 것만 올라가므로 총량은 문제없다"가 되는데, **살아있는 것이 100개면 7,500자다.** 살아있는 메모리의 개수 상한을 둘지, 둔다면 무엇이 강제하는지(`fix --check` 경고?) 정한다.

**5. `from` / `to` 는 그래프다 — 끊어진 링크를 누가 잡는가**

`to` 가 가리키는 문서가 삭제되면 그 메모리는 조용히 허공을 가리킨다. `list-carriers.sh --orphans` 와 같은 문제이며, 같은 처방(검사)이 필요하다. `reap fix --check` 에 넣을지 별도 명령으로 둘지 정한다.

**6. milestone 과의 경계 — 선행 작업에 종속된다**

`midterm` 이 지금 담당하는 "진행 중인 큰 트랙"은 **milestone 으로 이동한다**(milestone backlog 가 그렇게 설계됐다). 따라서 이 작업은 **milestone 구현 이후**에 착수해야 하며, milestone 이 정한 경계를 전제로 `type` 값의 집합을 정의해야 한다. 순서를 뒤집으면 같은 경계를 양쪽에서 다르게 긋게 된다.

**7. `type` 의 값 집합**

tier 가 사라지면 `type` 이 그 자리를 받는다. **tier 를 이름만 바꿔 옮기지 말 것** — `longterm`/`midterm`/`shortterm` 이 `type` 값이 되면 아무것도 달라지지 않는다. 축이 다른 분류(예: 교훈 / 결정 / 핸드오프 / 참조)여야 하고, **여러 축이 필요하면 그것이 `type` 이 아니라 태그여야 한다는 뜻**이다.

**8. 기존 프로젝트 마이그레이션 — 자동 분해는 불가능하다**

3파일을 flat 으로 쪼개는 것은 **문단 경계가 메모리 경계인지 코드가 알 수 없으므로** 자동화할 수 없다. `src/templates/migration/vX.Y.Z.md` 로 agent 에게 절차를 지시하는 형태가 된다 — 읽고, 나누고, 각각에 메타데이터를 붙이고, summary 를 쓴다. **분해 실패 시 어떻게 되는지**(원본 3파일을 남기는가)를 note 가 명시해야 한다.

## Files to Change

**개념·규칙 (carrier `memory-tier-classification` 전면 개정)**
- `.reap/genome/evolution.md` — Memory 분류 decision tree + pruning 정책 전면 교체
- `.reap/genome/application.md` — Static/Dynamic 분리 표에서 memory 이동
- `src/templates/evolution.md` — 위와 동일한 배포 템플릿
- `src/templates/reap-guide.md` ↔ `~/.reap/reap-guide.md` — Memory 절 + `.reap/` 구조도
- `src/templates/claude-md-section.md` — `@` ref 블록에서 memory 3줄 제거
- `src/templates/migration/vX.Y.Z.md` — 분해 절차 + 규칙 변경 전달 (**유일한 도달 채널**)
- `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` — 5개 로케일 전부

**코드**
- `src/core/paths.ts` — memory 경로 (3파일 → 디렉토리)
- `src/core/memory.ts` (신규) — 파싱·status 판정·summary 수집·링크 검사
- `src/core/prompt.ts` — `ReapKnowledge` 에서 `memoryShortterm`/`memoryMidterm` 제거, summary 목록으로 교체
- `src/cli/commands/load-context.ts` + `src/core/dump-state-sync.ts` — **양쪽 동일 출력**
- `src/core/integrity.ts` — 구조 검증 + 크기 guideline 교체
- `src/cli/commands/fix.ts` — 끊어진 `to` 링크 · 살아있는 메모리 개수 경고
- `src/cli/commands/init/common.ts` — 초기 memory 구조 생성
- `src/cli/commands/run/{knowledge,evolve}.ts` — memory 참조 갱신
- `src/adapters/opencode/install.ts` — memory 를 아는 지점
- `src/templates/agents/reap-evaluate.md` — memory 참조 갱신
- `src/cli/commands/make/memory.ts` (신규 검토) — `reap make memory`. backlog·hook 과 같은 패턴으로 메타데이터를 강제할지

**tests**
- unit — frontmatter 파싱 · status 판정 · summary 길이 · 끊어진 링크 탐지
- e2e — `load-context` 와 `dump-state` 가 **byte-identical** 한 memory 절을 내는지
- scenario — 메모리 생성 → 만료 → prompt 에서 사라짐

## 판단 메모

- **선행 종속**: milestone 구현이 먼저다(§6). 그 전에 착수하면 midterm 의 역할을 두 번 정의하게 된다
- **이 backlog 의 위험은 개념이 아니라 static→dynamic 전환이다.** memory 를 아는 코드·문서가 12곳이고, 그중 `claude-md-section.md` 는 **기존 사용자의 CLAUDE.md 를 marker-hash sync 로 고치는** 경로를 탄다. 전환이 절반만 되면 memory 가 **양쪽 어디에도 안 올라가는** 상태가 가능하다
- **관측자를 먼저 정할 것** (gen-096 교훈): "memory 주입을 한 줄로 껐을 때 무엇이 빨개지는가"에 답할 수 있는 검사가 설계에 포함돼야 한다. summary 를 만드는 순수 함수만 테스트하면 주입이 사라져도 전부 초록이다
- **75자는 사용자가 정한 값이지 측정된 값이 아니다.** 살아있는 메모리 개수 × 75 가 실제 prompt 예산 안에 들어오는지 구현 중에 재고, 어긋나면 사용자에게 되묻는다

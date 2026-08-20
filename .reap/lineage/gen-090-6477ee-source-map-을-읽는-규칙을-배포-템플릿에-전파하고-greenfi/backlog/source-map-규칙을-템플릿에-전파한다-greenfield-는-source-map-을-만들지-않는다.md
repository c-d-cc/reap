---
type: genome-change
status: consumed
priority: medium
createdAt: 2026-08-20T04:47:03.266Z
consumedBy: gen-090-6477ee
consumedAt: 2026-08-20T04:54:57.543Z
---

# source-map 규칙을 템플릿에 전파한다 — greenfield 는 source-map 을 만들지 않는다

## Problem

gen-089 직후(2026-08-20) `environment/summary.md` 가 335줄로 250 가이드라인을 넘겨, 코드 구조 서술 153줄
(`Source Structure` 114 + `src/indexer/` 31 + `docs/` 8)을 **`environment/source-map.md` 로 분리**했다.
그 자리는 `paths.ts:56` 이 이미 정의하고 `reap init --mode adoption` 이 생성하는 1급 경로다.

문제는 **source-map 이 on-demand 라 자동 로드되지 않는다**는 것이다. 포인터만으로는 열리지 않으므로
`genome/evolution.md` 의 `## Code Quality Principles` 에 행동 규칙을 넣었다 (사용자 승인, 2026-08-20):

```
- **Read source-map first**: 코드를 고치기 전에 `environment/source-map.md` 를 연다. …
```

**그런데 이 규칙이 배포 템플릿(`src/templates/evolution.md`)에는 없다.** dogfooding 규약상
genome 변경은 템플릿에 동기화돼야 하는데(`application.md` § Dog-fooding), 그대로 옮기면 결함이 생긴다:

| init mode | source-map.md 생성 | 규칙을 그대로 옮기면 |
|---|---|---|
| `adoption` | **생성함** (`adoption.ts:89-90`, `generateSourceMap(scan)`) | 정상 |
| `greenfield` | **생성 안 함** (`greenfield.ts` 에 언급 0건) | **없는 파일을 열라고 지시** |

즉 신규 greenfield 프로젝트의 agent 는 매 작업마다 존재하지 않는 파일을 찾게 된다. 이 프로젝트가
반복해서 잡아온 종류의 결함이다 — 규칙이 자기가 전제하는 것의 존재를 확인하지 않는다.

그리고 gen-072 교훈: **템플릿만 고치면 이미 존재하는 프로젝트에는 아무것도 도달하지 않는다.**

## Solution

세 갈래 중 선택. 저자 판단 필요.

**S1. 조건부 문구로 전파 (최소, 권장)**
템플릿에 넣되 존재를 전제하지 않는다 — "`environment/source-map.md` 가 있으면 코드 수정 전에 읽는다.
없다면 그 프로젝트는 구조 서술을 `summary.md` 가 갖고 있다." adoption/greenfield 양쪽에서 참이다.

**S2. greenfield 도 source-map 을 만든다**
빈 스텁 또는 최소 트리를 `greenfield.ts` 가 생성. 규칙이 무조건 참이 되지만 **빈 파일이 하나 더 생긴다** —
`reap fix --check` 의 placeholder 검사와 충돌하지 않는지 확인 필요.

**S3. 전파하지 않는다**
이 규칙을 REAP 자신에게만 적용한다. dogfooding 규약을 어기는 것이므로 **이유를 genome 에 명시**해야 한다.

**어느 쪽이든 migration note 가 필요하다.** 이미 존재하는 프로젝트는 `genome/evolution.md` 를 소유하므로
템플릿 변경이 도달하지 않는다. `application.md` 의 3분기 판정(배포 원본과 정확 일치 → silent edit /
이미 신규 형식 → no-op / 사용자가 수정 → diff 제시 후 확인)을 따를 것.

## Files to Change

- `src/templates/evolution.md` — `## Code Quality Principles` 의 `Pattern-first` 앞
- `src/cli/commands/init/greenfield.ts` — S2 를 택한 경우만
- `src/templates/migration/vX.Y.Z.md` — 기존 프로젝트 도달 경로 (필수)
- `.reap/genome/evolution.md` — S1 을 택하면 본 프로젝트 문구도 조건부로 맞출지 판단

## 참고 — 이미 반영된 것 (재작업 불필요)

- `.reap/environment/source-map.md` 신설 (167줄), `summary.md` 189줄로 축소
- `summary.md` 의 `## Source Structure` 는 포인터만 남음
- `.reap/genome/evolution.md` 에 `Read source-map first` 삽입 (301줄 → 가이드라인 300 을 2줄 초과)
- `CLAUDE.md` 의 `@` import 목록은 **손대지 않음** — source-map 은 on-demand 가 맞다

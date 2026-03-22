---
type: task
status: consumed
priority: low
consumedBy: gen-148-2cc6d2
---

# Legacy lineage 데이터 정리

## 문제

`reap fix --check`에서 발견된 lineage 데이터 문제:

### completedAt/startedAt ISO 날짜 오류 (9건)
- gen-004, gen-036, gen-039~045 — migration 시 `legacy-N` 형식으로 생성된 날짜 값
- 예: `completedAt: "legacy-4"`, `startedAt: "legacy-36"`

### meta.yml 누락 (6건)
- gen-102, gen-111, gen-113, gen-122~125 — 디렉토리는 있지만 meta.yml 없음
- 아카이빙이 불완전하게 된 generation들

## 해결 방향

### 1. migration.ts 수정 — placeholder 대신 git 커밋 시간 추정

`migration.ts` L95-96에서 `startedAt/completedAt: "legacy-N"` placeholder를 넣고 있음. 이를 migration 시점에 바로 git 커밋 시간 기반으로 채우도록 수정:

```
git log --format=%aI --diff-filter=A -- ".reap/lineage/gen-NNN-*"  → startedAt (최초 커밋)
git log -1 --format=%aI -- ".reap/lineage/gen-NNN-*"               → completedAt (마지막 커밋)
```

- git 이력이 없으면 전후 generation 시간을 보간
- 정확할 필요 없음, 시간순만 맞으면 됨

### 2. 기존 legacy 데이터 교정

이미 `legacy-N`으로 들어간 9건(gen-004, gen-036, gen-039~045)은 별도 migration 또는 `reap fix`에서 같은 로직으로 교정.

### 3. meta.yml 누락 (6건)

gen-102, gen-111, gen-113, gen-122~125 — artifact에서 goal/dates 추출하여 meta.yml 재생성, 또는 `reap fix`로 자동 복구

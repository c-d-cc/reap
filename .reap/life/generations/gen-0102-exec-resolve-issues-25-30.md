---
id: gen-0102-exec
slug: resolve-issues-25-30
type: exec
milestone: ms-024
title: "resolve #25 #30: migrate 스킬 절차 마찰 5건·판단 규칙 2건"
startedAt: 2026-09-05T00:15:17Z
startCommit: 8c543c9
status: open
---

## Intent

GitHub issue #25(migrate 스킬 절차·도구 마찰 5건)와 #30(migration-map 판단 규칙 2건)을 한 세대에서 해소한다. 둘 다 selfview 실물 이주 1회에서 나온 것이고 같은 파일(`plugin/skills/migrate/SKILL.md`·`references/migration-map.md`·`scripts/`)을 고치므로 갈라 놓으면 반쪽 상태가 생긴다. ms-024의 1↔2 반복 중 tasks/1 쪽이다.

끝나는 조건:
- #25: 3/8 계측이 스크립트(`scripts/measure.sh`)다 · 2/8이 `reap` 부재를 막고 설치 명령을 안내한다 · 7/8에 `REAP_BIN` 호출 형식이 있다 · 매핑 #8 원본 열에서 `reap-guide.md`가 빠지고 `sequence/`는 "있으면" · `migrate-lineage.mjs`가 같은 원인 경고를 접는다(단일 파일 형식의 startedAt 부재는 참고) · 5/8이 `.gitignore` 두 줄을 고지한다
- #30: 매핑 #6 참조 기준이 경로·제목(H1)·파일명 stem을 인정하고 참조 문서가 이름한 문서도 참조로 치며, 경계 사례는 `## 사람 판단`에 남긴다 · 매핑 #1에 memory 3계층 절 → v0.18 표준 문단 **절 교체** 행과 그 문단이 verbatim으로 있다 · `verify-migration.sh` 검사 2의 `v17_words`에 `shortterm|midterm|longterm`이 있고 `invariants.md` 잔존은 FAIL이 아니라 "사람이 지울 것"으로 보고된다
- `tests/migrate-scripts.test.sh`가 measure.sh와 경고 접기를 검사하고 전부 PASS

## References

- https://github.com/c-d-cc/reap/issues/25 — "migrate 스킬 절차·도구 마찰 5건 (실제 이주 1회에서 발견)" (#26·#27·#28·#29 합침)
- https://github.com/c-d-cc/reap/issues/30 — "migration-map 판단 규칙 2건: #6 참조 기준이 경로만 인정 · #1 용어 치환만으로 memory 절 미전환" (#31 합침)
- ms-024 `tasks/1-skill-revision.md` — 매핑 재정의의 원 근거

---
id: gen-0102-exec
slug: resolve-issues-25-30
type: exec
milestone: ms-024
title: "resolve #25 #30: migrate 스킬 절차 마찰 5건·판단 규칙 2건"
startedAt: 2026-09-05T00:15:17Z
startCommit: 8c543c9
status: closed
closedAt: 2026-09-05T00:20:39Z
endCommit: 5ec40bd
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

## Outcome

commit 5ec40bd(주 트리)·297aca4(tests submodule). `tests/migrate-scripts.test.sh` 53 PASS, `hook.test.sh` 통과, doctor 결함 0, 플러그인 `reap@reap-dev` 재설치(캐시 = 작업 트리).

#25 — 다섯 항목 전부.
- 3/8 계측 → `scripts/measure.sh` (16개 키, `life/backlog/`를 센다). reap_v17 실물 store에서 확인: lineage 96·backlog 9·design 10
- 2/8에 `command -v reap` 차단 + `npm i -g @c-d-cc/reap@next` 안내, dev 빌드는 `REAP_BIN`. 7/8 호출 형식에 `REAP_BIN=` 명시
- 매핑 #8 원본 열: `reap-guide.md` 제외(홈 자산 — 8/8 표만), `sequence/`는 "(if present)"
- `migrate-lineage.mjs`: 단일 파일 형식의 startedAt 부재는 `warnings`가 아니라 `noDateSingle`로 모아 `참고: startedAt 없음(단일 파일 형식, 정상): gen-001~gen-026 (26건)` 한 줄. 디렉토리 형식의 날짜 부재는 여전히 경고
- 5/8에 init의 `.gitignore` 두 줄 고지

#30 — 두 항목 전부.
- 매핑 #6: 참조 = 경로·H1 제목·파일명 stem, 참조 문서가 이름한 문서도 참조(고정점까지 반복). 경계 사례는 plan 쪽에 두고 기록 파일 `## 사람 판단`에 — plan→idea는 명령 하나, 역방향은 손이라서
- 매핑 #1: 치환표에 "memory 계층 서술 → 절 교체" 행 + v0.18 표준 문단 ko·en verbatim. 사전 grep에 `shortterm|midterm|longterm`. `invariants.md`는 편집 금지, 히트는 `## Needs updating`에 "사람이 지울 것". verify 검사 2: `v17_words`에 세 단어 추가, `invariants.md` 히트는 FAIL이 아닌 참고
- 부수: 기록 파일 형식에 `## 사람 판단` 절, subagent 진행 표시 N/12 → N/13

`.claude/skills/reapdev.resolveIssue/SKILL.md` 신설 — v0.17 `reapdev.resolveIssue.md`를 v0.18 흐름으로: issue 성격별 근거 표(fix / `--milestone` / backlog 발급 후 `--backlog`), 제목 `resolve #<n>:`, 같은 파일을 고치는 issue는 한 세대, 항목 하나라도 남기면 닫지 않음, bump·publish는 사람.

## Dead Ends

- 경계 사례를 "이동/idea를 정하지 말고 기록만"으로 두는 안(issue 제안 후반) — 원본은 읽기 전용이라 문서가 어딘가엔 가야 한다. 되돌리기 싼 쪽(plan)에 두고 기록하는 것으로 정했다
- verify 검사 2에서 `invariants.md`도 FAIL로 두는 안 — 스킬이 편집을 금지하는 파일을 게이트가 요구하면 통과 불가. 참고로 내린다

## 남은 것

- 개정된 스킬로 selfview를 다시 이주해 보는 것(ms-024 tasks/2)은 사람이 별도 세션에서 한다. 판정("지워도 된다")이 오면 ms-024를 닫는다

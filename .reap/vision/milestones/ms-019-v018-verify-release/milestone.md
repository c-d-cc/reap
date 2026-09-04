---
id: ms-019
slug: v018-verify-release
title: 왕복 검증과 발행 준비 — tarball 설치·이주 실물·0.17.8·마켓플레이스
from: loop-0004-plan
refs:
  - ps-5e948f:06-release.md
status: open
openedAt: 2026-09-03T14:40:21Z
focus: true
---
## Background

발행 전 유일한 end-to-end. 0.17.8 쪽 준비물과 마켓플레이스 준비를 함께 한다. [06-release.md](../../../../docs/reap-plan/reap_v_0_18_release/06-release.md).

## Exit Criteria

- **왕복**: Bun이 PATH에 없는 셸에서 `npm pack` tarball을 임시 prefix에 설치 → 빈 리포에서 `claude --plugin-dir ./plugin`(또는 `claude -p`)로 `/reap:init`→세대 하나→`/reap:complete`가 돌고 doctor 0 → v0.17 표본 리포에서 upgrade agent 본문대로(설치는 tarball로 대체) `/reap:migrate`가 끝까지 가고 doctor 0. 수행 로그가 세대 기록에 있다
- `~/cdws/reap_v17`: 0.17.8 bump · RELEASE_NOTES 0.17.8 절 · `check-docs-version.sh` 통과 · 전 스위트 초록 · 커밋(push는 사람)
- upgrade agent URL의 실재 경로가 06-release 2번대로 결정되고 문서에 적혀 있다
- `~/cdws/ctod-plugins`: `reap` 항목(submodule `plugins/reap` → c-d-cc/reap)으로 교체한 커밋이 **로컬에** 있다 (Q5의 답 뒤. 답 전이면 준비만 하고 커밋하지 않는다)
- `docs/release-policy.md`와 06-release의 순서가 같고, 발행 직전 체크 명령이 실제로 도는 것으로 확인됐다
- loop-0004를 닫을 수 있다 — 05-open의 미답은 `idea/research/`로

## Out of Scope

- npm publish · git push · 태그 · 마켓플레이스 push — 사람
- latest 승격

## Plan Items

1. tarball 설치 → 새 프로젝트 왕복 (tasks/1)
2. v0.17 표본 이주 왕복 (tasks/2)
3. 0.17.8 준비 + upgrade agent URL (tasks/3)
4. 마켓플레이스 준비 + 최종 체크 (tasks/4)
5. 최종 재검증 — ms-021·022·023 뒤 (tasks/5)

## 이 milestone이 끝나면 물어볼 것

- 사람이 06-release의 순서대로 발행할 때 문서 밖의 지식이 필요했는가
- 왕복에서 발견한 마찰 중 코드로 못 막은 것은 무엇인가

---
id: gen-0063-exec
slug: legacy-close
type: exec
milestone: ms-013
title: 구 기획 정리 — ms-002를 닫고 ms-001을 재편한다
startedAt: 2026-08-30T23:34:24Z
startCommit: 5c5e1f8
status: closed
closedAt: 2026-08-30T23:36:59Z
endCommit: 5deb711
---
## Intent

ms-013 task 3 — reap 리포 main에서: ms-002를 사유와 함께 닫고, ms-001에서 대체된 항목과 살아남은 항목(0.17.8 다리)을 가른다. feat/plugin-distribution은 legacy 계열 이름으로 보존한다(미푸시 역사를 지우는 것은 위임 범위를 넘는 파괴라 판단 — 삭제 대신 개명 보존).

## Outcome

reap main **55c020d** — ms-002를 status: closed + 사유 절(REAP가 새 구조로 실현)로 닫고, ms-001은 f6ac48c 최신본 기반으로 재편: plugin 전환·설치 스크립트·0.18 릴리즈를 대체·이관 표시, **0.17.8 이행 다리만 main의 실행 항목**으로 남김. feat/plugin-distribution은 `legacy/v017-plugin-distribution`으로 개명 보존 — 단독 `legacy` 브랜치가 이름공간을 막아 `legacy/v0.15`(리모트 표기와 일치)로 먼저 개명.

## References

- reap main: 55c020d · 보존 브랜치: legacy/v017-plugin-distribution(f6ac48c) · legacy/v0.15(83a05ef)

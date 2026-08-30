---
id: gen-0061-exec
slug: apocalypse-snapshot
type: exec
milestone: ms-013
title: apocalypse·snapshot — v0.18 브랜치를 세운다
startedAt: 2026-08-30T23:23:29Z
startCommit: 5a05fe9
status: closed
closedAt: 2026-08-30T23:28:47Z
endCommit: 588fa33
---
## Intent

ms-013 task 1 — reap 리포에 v0.18 브랜치를 세우고 apocalypse(전부 삭제)·snapshot(reap 적재)·승계물 커밋 셋을 만든다. 끝은 브랜치에서 `bun test`가 도는 것.

Open Questions 둘은 사람의 전체 위임("critical 아니면 쭉 진행") 하에 agent가 정했다:
- 스냅샷은 전체 트리(.reap/ 기록 포함). 단 **자기관리 정본은 M1~M3 동안 reap 리포** — 두 곳이 살면 어긋난다. 작전 끝에 기록을 브랜치로 최종 동기화
- 브랜치의 구 `.reap/`(v0.17 자기 데이터)는 apocalypse가 지운다 — main이 역사를 보존하므로 잃는 것 없음

## Outcome

reap 리포에 `v0.18` 브랜치 — 커밋 셋이 계획한 순서대로:
- **d3fa6e0 apocalypse** — 추적 파일 전부 삭제(tests 서브모듈 포함, -f 필요했음 — 내부 비추적 테스트는 scratchpad에 보존). `git clean -fdx`로 tgz 4·node_modules·dist·data·구 .reap/ 잔재까지 청소. reap 리포의 `.claude/`(로컬 설정)도 함께 지워짐 — 재생성 가능
- **f7a373a snapshot** — reap 65b7790의 `git archive` 트리 적재. `.reap/` 기록 포함. 메시지에 출처와 "해시는 reap에서만 유효" 명시
- **93de395 승계물** — `docs/inherited/` 6파일 + README(각각 무엇이고 어디서 쓰는지). settings.ts는 main에 없어 f6ac48c(feat)에서 추출

완료 판정: 브랜치에서 `bun install` 후 `bun test` **172 전체 통과**.

## References

- reap v0.18 브랜치: d3fa6e0 · f7a373a · 93de395 (근거 커밋은 reap 리포에 있다 — ms-013 Constraints)
- 승계물 원본: f6ac48c(설계 문서·settings.ts) · main(uninstall.ts·install.ts)

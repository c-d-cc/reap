# Midterm Memory

## 현재 진행 중인 큰 작업

### v0.15 기능 패리티
v0.15에 있었지만 v0.16에 아직 없는 것들:
- `reap destroy` — 완전 제거 (backlog 있음)
- `reap clean` — 선택적 초기화 (backlog 있음)
- `reap update` — self-upgrade + migration (vision §7.3, 3-phase 로드맵 있음, npm 배포 후 진행)
- Agent adapter 시스템 (AgentRegistry) — vision §6, 당장 불필요

### Distribution 준비 (vision §7)
순서: README 재작성 → npm 배포 (.npmignore, CI/CD) → update agent
README는 현재 v0.15 기준으로 작성되어 있어 v0.16 재작성 필요.

### Self-evolving 강화
gen-028~031에서 gap-driven evolution + vision eval + memory 도입 완료.
다음: vision evaluation을 실제로 활용하여 adapt phase 품질 향상 관찰.

## Embryo → Normal 전환

31 generation 경과, genome 안정, abort 거의 없음. 전환 조건 충족.
유저가 아직 결정하지 않음 — 다음 세션에서 다시 논의 필요.

## submodule 관련 반복 문제

tests/ submodule에서 commit phase마다 dirty check 이슈 반복.
gen-024에서 순서 교정(submodule check → archive)했으나, subagent가 submodule ref를 원복시키는 문제도 간헐적 발생.
근본 원인: subagent가 git 작업 시 submodule 상태를 의식하지 못함.

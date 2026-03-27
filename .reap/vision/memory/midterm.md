# Midterm Memory

## 현재 진행 중인 큰 작업

### Agent 실행 구조 (확정)
- reap-evolve.md = 정적 템플릿 (role, mindset, behavior rules)
- buildBasePrompt() = 동적 context만 (state, vision, memory, clarity, cruise)
- generation마다 새 agent 생성, cruise 포함
- cruise loop: parent가 관리하도록 변경 예정 (미구현)

### v0.15 기능 패리티
v0.15에 있었지만 v0.16에 아직 없는 것들:
- Agent adapter 시스템 (AgentRegistry) — vision §6, 당장 불필요

### Self-evolving 강화
gen-028~031에서 gap-driven evolution + vision eval + memory 도입 완료.
다음: vision evaluation을 실제로 활용하여 adapt phase 품질 향상 관찰.

## Embryo → Normal 전환

31+ generation 경과, genome 안정, abort 거의 없음. 전환 조건 충족.
유저 판단 (2026-03-26): REAP 자체가 아직 완성 단계가 아니고 예상치 못한 genome 변경이 더 있을 수 있으므로 embryo 유지. 배포 후 사용자 프로젝트였다면 전환 시점이지만, self-evolving 중인 REAP 자체는 조금 더 관찰.

## submodule 관련 반복 문제

tests/ submodule에서 commit phase마다 dirty check 이슈 반복.
gen-024에서 순서 교정(submodule check → archive)했으나, subagent가 submodule ref를 원복시키는 문제도 간헐적 발생.
근본 원인: subagent가 git 작업 시 submodule 상태를 의식하지 못함.

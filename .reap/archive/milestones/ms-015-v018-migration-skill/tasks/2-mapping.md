# 2 — 이주 매핑 지시문과 홈 자산 정리

skill의 뒷 절반 — subagent에게 줄 매핑 지시와 기록 형식, 홈 자산 정리.

## 담을 것

- **subagent 강제**: 이주는 Task(subagent)로 수행하라고 skill이 지시 — 주 세션 컨텍스트 보호 (사람 요구 6)
- **매핑 표** (04-migration-skill.md 확정본 반영): genome 3종 그대로 / memory 3단 → lessons 선별(제목이 결론, "다음 세션이 같은 실수를 하는가" 통과분만) / backlog frontmatter 변환 / 열린 milestone 형식 변환 / goals.md·design/ 처리 / config 재작성(폐기 필드 기록) / hooks·migration-state·session-state 폐기
- **기록 파일**: `.reap/archive/migration-v0_17.md` — 단계별 무엇이 어디로 갔고 무엇이 버려졌는지, doctor 결과 포함 (사람 요구 7·8)
- **진행 표시**: 단계 N/M을 각 단계 시작에 출력
- **홈 자산 정리 절차**: `~/.claude/commands/reap.*.md`(19)·agents 2·settings.json의 SessionStart reap 항목·`~/.reap/`(reap-guide.md 등 reap이 쓴 것만) — gen-088 allowlist 방식, 사용자 소유물 보존. 실행 전 목록을 보여주고 동의

## 함정

- lessons 선별은 판단 작업이다 — subagent 지시문에 "전부 옮기지 마라, 통과 기준"을 명시하지 않으면 3단 전체가 그대로 복사된다
- settings.json은 검증-후-쓰기 (승계 ref-adapter-settings의 원칙 — F7: 값 하나 틀리면 전체 무효)

## 완료 판정

skill이 요구 8건 전부를 갖췄고, reference가 매핑 표를 담는다

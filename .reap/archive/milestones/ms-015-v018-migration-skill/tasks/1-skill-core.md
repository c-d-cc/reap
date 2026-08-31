# 1 — skill 골격: 판정·차단·고지·격리

`plugin/skills/migrate/SKILL.md` 신설. 절차의 앞 절반과 미결 3건 확정.

## 담을 것

- **트리거**: "v0.17에서 왔다", "migration", "구 reap 프로젝트", upgrade agent가 부를 때
- **판정 지문**: `.reap/config.yml`에 `autoSubagent`·`agentClient`·`lastMigratedVersion` 같은 v0.17 필드 + `memory/shortterm.md` 3단 + `lineage/` 존재 → v0.17. v0.18 구조(vision·life·archive 3단, map.md)면 "이주할 것 없음"으로 종료. **둘 다 아니면 멈추고 사람에게** — v0.15/0.16은 구 reap의 migrate가 담당했던 영역
- **사전 차단 둘**: uncommitted change → block(커밋하거나 stash 후 재시도 안내). 열린 generation → 미결 확정할 것
- **고지**: 단계 목록·예상 토큰(memory와 기록 전체를 읽는다)·원본 비파괴(`.reap-v0_17/`)를 보여주고 명시 동의를 받는다
- **격리**: `git mv .reap .reap-v0_17` (git 추적 중일 때) 또는 `mv` — 이후 `reap init`으로 새 구조. 되돌리기 절차(역방향 mv)도 명시

## 함정

- 판정 전에 어떤 파일도 옮기지 않는다 — 판정이 모든 것에 앞선다 (사람 요구 1)
- `.reap/.index/`·`.session-state.md` 같은 gitignore 산출물이 mv에 따라가는지 확인 — 지문에 안 쓰이게

## 완료 판정

skill 파일이 존재하고 미결 3건이 확정돼 04-migration-skill.md에서 미결 표기가 사라짐

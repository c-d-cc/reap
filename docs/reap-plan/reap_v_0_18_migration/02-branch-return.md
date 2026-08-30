# M1 — v0.18 브랜치 신설과 귀환

reap 리포에 `v0.18` 브랜치가 생기고, 그 위에서 reap가 reap이 된다. 끝나면 참이어야 하는 것:

## 브랜치

- `main`(0.17.7 라인)에서 `v0.18` 브랜치가 나온다. main은 0.17.x 유지보수(0.17.8 다리 포함)의 자리로 남는다
- 브랜치의 첫 두 커밋 구조가 정해져 있다 (사람, 2026-08-31):
  1. **apocalypse commit** — 구 reap 소스를 과감하게 전부 지우는 커밋 하나. 승계 목록([01-situation.md](01-situation.md))에 오른 것은 지우기 전에 추출해 둔다
  2. **snapshot commit** — reap 작업 트리를 싣는 커밋. 메시지가 출처(reap 리포, 마지막 커밋 해시)를 적는다 — 히스토리를 잇지 않으므로 출처는 산문으로만 남는다

  두 커밋을 나누는 이유: 삭제와 적재가 한 커밋에 섞이면 diff가 "무엇이 사라졌는가"를 말하지 못한다. apocalypse commit의 diff가 곧 폐기 목록의 실측이다

## 개명 — reap → reap

한 세대에서 코드와 리포를 함께 옮긴다 (genome/evolution.md의 마이그레이션 규칙).

- 바이너리 이름 `reap`, `plugin/.claude-plugin/plugin.json`의 name `reap`, skill 호출 `/reap:evolve` 등 전수
- store 경로 `.reap/` → `.reap/`. **구조는 reap의 3단**(vision·life·archive)이다 — v0.17의 `.reap/`과 이름만 같고 구조가 다르며, 그 구별은 migration skill의 판정이 담당한다
- 훅·carrier 표식의 `reap:` 이름공간, 문서·사용자 문자열의 reap 표기 전수
- 검증: `bun test` 전체 통과 + `doctor` 결함 0 + `--plugin-dir`로 로드한 세션에서 `/reap:evolve` 동작

## 구 기획 정리 (reap 리포 쪽)

- ms-002와 gen-101을 닫고, 닫는 커밋이 사유(reap가 실현/대체)를 적는다
- `feat/plugin-distribution` 브랜치는 승계물 이동 후 정리한다
- F1~F12 실측과 0.17.8 다리 설계는 v0.18 브랜치의 문서 자리로 옮긴다

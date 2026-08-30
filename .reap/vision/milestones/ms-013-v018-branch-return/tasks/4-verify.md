# 4 — 검증

## 무엇을

v0.18 브랜치에서:

- `bun test` 전체 + `./tests/hook.test.sh` + `bun run typecheck` + `bun run build` (산출물 이름 `reap`)
- 임시 프로젝트에 `reap init` → `doctor` 결함 0
- `claude --plugin-dir ./plugin`으로 세션을 열어 `/reap:evolve`가 뜨고 SessionStart 훅이 `.reap/` 상태 줄을 주입하는지 실사
- `reap index update` — `.reap/.index/` 재구축, 해석률이 reap 시절(99%)과 다르지 않은지

## 함정

- 훅 스크립트는 `reap`이 PATH에 없을 때 조용히 exit 0 해야 한다 (invariants) — 개명 후에도 그 경로가 사는지 hook.test.sh가 확인하는지 본다
- exit criteria의 grep 판정(사용자에게 보이는 reap 표기 0건)을 여기서 최종 실행

## 완료 판정

milestone의 Exit Criteria 다섯이 전부 서고, 그 증거(명령과 출력 요지)가 세대 기록에 있다

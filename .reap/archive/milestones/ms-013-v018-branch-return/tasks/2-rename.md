# 2 — 개명 reap → reap

v0.18 브랜치 위에서 전수 개명한다. 실측 규모: src 11파일 69곳 · plugin 11파일 83곳 · tests 157곳 · carrier 표식 17곳 + 문서.

## 손댈 곳

| 무엇 | 어디로 |
|---|---|
| 바이너리·패키지 이름 | `reap` (`package.json`·build 스크립트) |
| store 루트 `.reap/` | `.reap/` (`src/store.ts` 소유) |
| orch 공유 상태 `~/.reap/orch/` | `~/.reap/orch/` (`src/orch.ts`) |
| 플러그인 name·skill 접두사 | `reap` — `/reap:evolve` 등 (`plugin/.claude-plugin/plugin.json`) |
| SessionStart 훅의 reap 호출 | `reap` (`plugin/hooks/`) |
| carrier 이름공간 `reap:carrier-…` | `reap:carrier-…` — 17곳 전수 |
| CLI 출력·에러 문자열 | 사용자에게 보이는 "reap" 전부 |
| genome·map.md·spec 문서의 자기 지칭 | 브랜치 쪽 문서만. reap 리포는 손대지 않는다 |

## 함정

- **한글 앞에서 `\b`가 안 먹는다** (lessons.md) — 치환 정규식은 `(?<![0-9A-Za-z_-])reap(?!\d)` 꼴로
- `.reap`→`.reap` 치환이 `.reap/.index` 같은 하위 경로 문자열과 tests의 fixture 경로에 함께 걸린다 — 전수 grep으로 사후 확인
- v0.17 구조 판정(M3)이 "`.reap/`인데 구조가 다르다"에 기대므로, **store가 만드는 새 `.reap/` 구조를 바꾸지 않는다** — 이름만 바꾼다
- 이 계획 문서 세트(`docs/reap-plan/`)와 loop 기록의 "reap"는 **의도된 표기**다 — 개명 대상에서 제외

## 완료 판정

- 브랜치에서 `grep -ri reap src/ plugin/ tests/`가 0건
- `bun test` 전체 통과, 빌드 산출물 이름이 `reap`
- `.reap/`에 init한 임시 프로젝트에서 `reap ctx`·`make`·`mark`가 돈다

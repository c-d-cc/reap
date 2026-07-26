# Validation Report

## Result

**pass**

모든 검증을 fresh 실행했다.

## Checks

### 빌드/타입/문서

| 항목 | 명령 | 결과 |
|---|---|---|
| TypeCheck | `npm run typecheck` | **pass** (error 0) |
| Build (CLI) | `npm run build` | **pass** |
| Build (docs) | `cd docs && npx vite build` | **pass** — 2.09s |
| 문서 정합성 | `bash scripts/check-docs-version.sh` | **pass** |

### 테스트

| 스위트 | baseline (gen-074) | 현재 | 판정 |
|---|---|---|---|
| unit | 454 / 0 | **461 / 0** | pass — 신규 7 (`integrity-genome-size`) |
| e2e | 263 / 1 | **263 / 1** | pass — 동일 pre-existing (`init-repair`) |
| scenario | 44 / 0 | **44 / 0** | pass |

### 완료 기준 (02-planning.md)

| # | 기준 | 결과 |
|---|---|---|
| 1 | init 직후 genome 크기 warning 0건 | **pass** — 임시 프로젝트 실측 |
| 2 | 비대한 genome 은 여전히 감지 | **pass** — evolution 400 / application 300 / invariants 80 각각 warning |
| 3 | 세 threshold 근거가 코드 주석에 | **pass** |
| 4 | `reap-guide.md` 문서화 | **pass** — § File Size Guidelines |
| 5 | docs 의 summary 표기가 코드값 일치 | **pass** — 5 로케일 `~250` |
| 6 | gen-072 예외 제거 후 통과 | **pass** |
| 7 | 회귀 없음 | **pass** |

### 검사가 무력해지지 않았음을 확인

임계를 올린 변경이므로 "검사가 이제 아무것도 안 잡는 것 아닌가"를 명시적으로 확인했다:

| 케이스 | 크기 | 임계 | 결과 |
|---|---|---|---|
| evolution 비대 | 400 | 300 | warning 발생 |
| application 비대 | 300 | 250 | warning 발생 |
| invariants 비대 | 80 | 50 | warning 발생 |
| 임계와 동일 | 50 | 50 | warning 없음 (`>` 비교) |
| 독립성 | evo 400 + app 200 + inv 40 | — | evolution 만 warning |

### 본 repo 실측

| 파일 | 크기 | 임계 | 여유 |
|---|---|---|---|
| `application.md` | 205 | 250 | 45 |
| `evolution.md` | **270** | 300 | **30** |
| `invariants.md` | 7 | 50 | 43 |

`fix --check` 크기 warning 0건. **evolution.md 여유가 30줄로 가장 좁다** — 다음에 규칙을 추가할 때 기존 규칙과 중복되지 않는지 먼저 확인해야 한다는 신호다.

## Edge Cases

- **임계 경계값**: `>` 비교이므로 정확히 임계값인 파일은 warning 없음
- **파일별 독립성**: 한 파일이 초과해도 다른 파일이 연루되지 않음
- **비변경 보장**: `checkIntegrity` 실행 후 400줄 evolution.md 가 byte-identical
- **init 시 application.md 는 16줄 뼈대**: `genome-suggest` 가 나중에 채우므로 init 직후에는 어떤 임계로도 통과. 실제 warning 대상은 성숙한 프로젝트뿐

## Issues

### e2e `init-repair` 1건 — 4세대째 pre-existing

gen-072/073/074/075 동일. 본 세대는 `integrity.ts` 의 크기 판정과 문서만 수정했으므로 무관하다.

gen-074 validation 에서 "3세대째, 방치하면 계속 판단 비용"이라고 기록했고 이번이 4세대째다. **다음 세대 hints 에 backlog 화를 다시 올린다** — scenario 5건도 같은 경로를 밟다가 결국 고쳤다.

## Notes

`config.evaluator: true` 이나 부모 에이전트가 직접 검증했다. advisor 모델이므로 허용된다.

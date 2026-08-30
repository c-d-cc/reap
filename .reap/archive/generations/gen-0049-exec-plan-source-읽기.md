---
id: gen-0049-exec
slug: plan-source-읽기
type: exec
milestone: ms-011
title: sources.yml 파싱과 plan sources|convention
startedAt: 2026-08-30T14:34:46Z
startCommit: c9fd423
status: closed
closedAt: 2026-08-30T14:37:54Z
endCommit: 218d2fd
---
## Intent

`ms-011` 11.1·11.2·11.3 — `sources.yml` 파싱, `make plan-source`, `plan sources|convention`, `--ref` 검증. 손으로 쓴 `ps-4f2a91`이 대조군.

## Outcome

- **`src/plan.ts`** 신설. `readSources`(`Bun.YAML.parse` — 의존 없음, 형식 안 낮춤), `writeSources`(손 형식 — `Bun.YAML.stringify`는 흐름 형식이라 손으로 쓴 것과 달라진다), `makePlanSource`(root가 디렉토리여야 함, `sequence/source.md`에 행, `conventions/<ps-id>-<slug>.md` 씨앗), `validateRef`(형식 · 소스 실재 · 경로가 root 안 · 파일 실재. 앵커 무시), `formatSources`
- `make milestone`·`make loop`가 `--ref`를 id 발급 전에 검증한다 → 이 리포에서 `--ref ps-4f2a91:nope.md`가 거부되는 것 확인
- `plan sources` · `plan convention <ps-id>` — 규약 본문을 그대로 낸다
- `id.ts` — 해시 계열도 레지스트리 행을 남긴다(`ps-`). 접두사가 번호/해시를, 레지스트리 표가 행 유무를 따로 정한다
- 템플릿 `convention.md`. 테스트 `tests/plan.test.ts` 9개. 136 통과
- **규약 되먹임 첫 회** — `conventions/ps-4f2a91-reap.md`에 "도구가 이 소스를 어떻게 다루는가" 절. 등록 이후 처음으로 내용이 바뀌었다
- `ms-011`의 Open Question "YAML 파서를 들일 것인가" → 셋째 길(Bun 내장)로 답했다. `summary.md`에 적었다

## Notes

`make plan-source`는 이 리포에서 실제로 돌리지 않았다 — `ps-4f2a91`이 이미 손으로 등록돼 있고 둘째 소스가 없다. 테스트가 손으로 쓴 것과 바이트 단위로 같은 모양을 확인한다.

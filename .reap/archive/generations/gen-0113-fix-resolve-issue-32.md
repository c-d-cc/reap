---
id: gen-0113-fix
slug: resolve-issue-32
type: fix
title: "resolve #32: slugify에 바이트 상한 — 기록 파일 basename이 NAME_MAX를 넘지 않게"
startedAt: 2026-09-07T15:28:04Z
startCommit: c5fa243
status: closed
closedAt: 2026-09-07T15:40:28Z
endCommit: c15daf0
---

## Intent

GitHub issue #32를 해소한다. `slugify`가 제목 전체를 슬러그로 써서 한글 제목 80자 안팎이면 basename이 리눅스 NAME_MAX(255바이트)를 넘고, macOS에서 만든 파일이 리눅스 컨테이너에서 풀리지 않는다. slug가 사람이 읽는 한글 이름표라는 설계는 그대로 두고 길이만 잡는다.

끝나는 조건(issue의 expected):
- `reap make backlog|idea|flux|generation|milestone --title "<긴 한글 제목>"`이 만든 기록 파일의 basename이 NAME_MAX 안에 있다 — `slugify`가 UTF-8 80바이트 상한을 `-` 경계에서 자른다
- `--slug`로 넘긴 이름이 접두어 포함 200바이트를 넘으면 `make`가 거부하고 짧은 `--slug`를 권한다
- `doctor`가 `.reap/` 안의 basename 200바이트 초과 항목을 결함으로 보고한다 — 이미 만들어진 저장소를 구제한다

## References

- https://github.com/c-d-cc/reap/issues/32 — "slugify가 길이 제한 없이 제목 전체를 파일명으로 써서 basename이 255바이트를 넘음 — Railway 빌드가 오류 없이 멈추는 원인이 됨" (bug, 작성자 casamia918)
- `src/doc.ts` `slugify()` · `src/entries.ts` make 5종 `opts.slug ?? slugify(opts.title)` · `src/doctor.ts`

## Outcome

issue #32의 세 항목 전부. 한글 slug는 그대로다.

- `src/doc.ts` — `SLUG_MAX_BYTES` 80: `slugify`가 `-` 조각 단위로 붙이다 넘기 직전에 멈춘다. 첫 조각만으로 넘으면 grapheme 단위(`Intl.Segmenter`)로 자른다 — 코드포인트 단위로 자르면 NFD 결합 문자 중간이 끊긴다(검증 subagent 발견). `SLUG_LIMIT_BYTES` 180과 `requireSlug()`: 가장 긴 id 접두어 `flux-0000-design`(16)·`-`·`.md`를 더하면 꼭 200이다. `NAME_MAX_BYTES` 200
- `src/entries.ts` make 5종과 `src/plan.ts` `makePlanSource` — slug를 먼저 만들고 `requireSlug`를 지난 뒤 `issue()`로 id를 발급한다. 발급 뒤 거부하면 레지스트리에 파일 없는 id가 남는다. plan-source는 검증 subagent가 빠진 경로로 잡았다
- `src/doctor.ts` — 8b `walkNames`로 `.reap/` 전체(디렉토리 포함, dot 제외)를 걷고 basename 200바이트 초과를 결함 `doctor.kind.name_too_long`으로 보고한다
- 카탈로그 en·ko `entries.slug_too_long`·`doctor.kind/detail.name_too_long`. RELEASE_NOTES 0.18.0 절, `site/release-notes-content.md`(en), `site/src/i18n/translations/ko.ts` 릴리스 노트에 한 줄씩

재현(issue의 절차, 새 바이너리): basename 355 → 30바이트. `--slug` 210바이트는 `slug is 210 bytes; the limit is 180` 거부, 레지스트리 파일조차 생기지 않음. `environment/`의 213바이트 파일은 doctor 결함 1.

검사: `bun test` 243 pass(신규 5) · `hook.test.sh` 통과 · typecheck · 이 리포 doctor 결함 0. tests submodule 2bb11ff·6d079fe.

독립 검증(subagent): Intent 셋 충족. 발견 넷 — plan-source `--slug` 미검사(고침), 영문 사이트 릴리스 노트 누락(고침), 주석의 접두어 바이트 수 15→16(고침), NFD 경계(고침, 테스트 추가). 회귀 없음 — `requireRefs`는 그대로 최상단, `slugify`는 순수.

summary.md: 해당 없음.

## Dead Ends

- make의 검사를 "접두어 포함 파일명 200바이트"로 잡으면 id를 먼저 발급해야 한다. slug 단독 180으로 바꿔 발급 전에 막는다 — 결과는 같은 200이다

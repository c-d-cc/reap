---
name: reapdev.docsUpdate
description: Use when developing REAP itself and code or skill changes must reach the user-facing documents - README (en/ko), the reap.cc site copy, and RELEASE_NOTES. Runs the surface gate, scans the sections the change touches (or everything for a minor bump), edits in the site's tone, and gets the human's confirmation before committing. Trigger on "docsUpdate", "문서 갱신", "README 맞춰줘", or before versionBump.
---

# docsUpdate — 코드가 바뀐 만큼 문서를 맞춘다

REAP를 만드는 사람만 쓴다. 대상은 **사용자가 읽는 문서**다 — 리포 안의 spec·skill 텍스트·`.reap/` 기록이 아니다.

## 문서는 셋

| 문서 | 무엇을 말하나 | 어디 |
|---|---|---|
| README | 설치·첫 사용·v0.17에서 오기·skill 표·개발 | `README.md`(en, 기본) · `README.ko.md` |
| 사이트 | 개념·작업 흐름·레퍼런스 전부 | `site/src/i18n/translations/<locale>.ts` — 페이지 컴포넌트(`site/src/pages/`)는 문구를 갖지 않는다 |
| 릴리즈 노트 | 버전마다 무엇이 달라졌나 | `RELEASE_NOTES.md` + 사이트 `releaseNotes` — [versionBump](../reapdev.versionBump/SKILL.md)가 쓴다 |

로케일은 지금 `ko.ts` 하나다. **en이 기본이고 ko는 번역 층**이라는 결정(사람, 2026-09-04)에 따라 `en.ts`가 생기면 둘을 같이 고친다 — 한쪽만 고치면 게이트가 잡는다.

## 1. 게이트부터

```bash
bun run build && bash scripts/check-docs-surface.sh
```

코드가 싣는 표면(skill 목록 · 훅 이벤트 · CLI 동사)이 문서에 **이름이라도** 있는지 본다. FAIL이 하나라도 있으면 그 항목이 이번 작업의 첫 줄이다. 통과가 "문서가 맞다"는 뜻은 아니다 — 이름이 있다는 뜻이다. 설명이 맞는지는 아래에서 읽는다.

## 2. 얼마나 훑나

```bash
git describe --tags --abbrev=0 --match 'v[0-9]*.[0-9]*.[0-9]*'   # 마지막 릴리즈
git diff <tag>..HEAD --stat -- src plugin
```

- **patch 수준**(또는 bump 없음): diff가 닿은 표면의 해당 절만. `src/doctor.ts`가 바뀌었으면 Doctor 페이지, `plugin/skills/migrate/`가 바뀌었으면 Migration 페이지와 README "Coming from v0.17" 절
- **minor 이상**: README 둘 + 사이트 로케일 전체를 코드와 대조한다

대조표 — 어느 코드가 어느 문서를 결정하나:

| 코드 | 문서 |
|---|---|
| `plugin/skills/*/SKILL.md`의 frontmatter `description` | README skill 표의 "when" 열 · 사이트 `skills` 절 |
| `reap` 사용법 출력(`./dist/reap`) · `src/messages/en.ts` | 사이트 `cli` 절 |
| `src/hooks.ts` `HOOK_EVENTS` | 사이트 `hooks` 절 |
| `src/doctor.ts`의 검사 목록 | 사이트 doctor 페이지 |
| `src/templates/`(init 씨앗) · `map.md` | 사이트 storage·genome·environment 절 |
| `plugin/skills/migrate/SKILL.md` 8단계 | 사이트 migration 페이지 · README "Coming from v0.17" |
| `package.json` `engines`·설치 명령 | README Install · 사이트 quick start |

## 3. 고칠 때의 규칙

**기존 문구를 고친다, 새로 쓰지 않는다.** 사이트와 README의 문체는 브랜드다 — 합니다체 완결 문장, 사용자 관점("무엇을 얻는가"), 영문 고유명사(Generation·Milestone·Loop·Genome·skill)에 조사만. 중점(·)으로 명사 셋 이상 잇기, 문장 안 대시, "왜 이렇게 만들었는가" 서술, 도구 의인화는 쓰지 않는다. 새 문구가 필요하면 먼저 같은 파일의 이웃 문구를 읽고 그 결을 따른다.

**사용자 문서에서는 "plan"이다** — "plan source"는 등록부(`plan/sources.yml`)를 가리키는 내부 용어라 CLI 레퍼런스에서만 쓴다.

**README와 사이트가 같은 사실을 말해야 한다.** skill 표는 README 둘과 사이트 로케일(`skills` 절)에 있다 — 하나를 고치면 전부 고친다.

사이트를 고쳤으면:

```bash
bash scripts/check-docs-prerender.sh   # 라우트별 정적 html이 그 문구를 담고 나오는가
```

## 4. 프리뷰와 사람 확인 — 건너뛸 수 없다

고친 것을 커밋하기 **전에** 사람에게 보인다 — 어느 문서의 어느 절이 왜 바뀌었는지, diff와 함께. 사람이 "확인"·"좋아"라고 한 뒤에만 커밋한다. 수정 요청이 오면 고치고 다시 보인다.

이 확인은 자율 모드에서도 건너뛰지 않는다. 문서는 사람이 검수하는 산출물이고(ms-022가 그 전례다), 한 번 밖에 나간 문구는 되돌려도 캐시와 검색에 남는다.

## 5. 변경 없으면 skip

게이트가 통과하고 diff가 닿은 표면이 없으면 "문서 변경 없음"이라고 말하고 끝낸다. 억지로 손대지 않는다.

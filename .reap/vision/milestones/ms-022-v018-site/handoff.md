# Handoff — ms-022 문서 사이트

## 사람 검수 대기(디자인 비교·내용) → en 확장

첫 시도(VitePress 새 사이트, gen-0085·0088)는 사람 검수(2026-09-04)에서 기각됐다 —
"새 사이트"가 아니라 기존 reap.cc 디자인·톤에 내용만 v0.18로 바꾸는 것이 맞다는
판단이었다. gen-0093-exec이 다시 지었다: worktree `../reap-wt-site`(브랜치
`ms-022-site-port`)에 v0.17 `docs/` 앱(Vite+React+Tailwind+wouter)을 `site/`로
그대로 옮기고, 페이지 세트와 ko 번역만 v0.18로 바꿨다. 컴포넌트·CSS·테마·레이아웃은
손대지 않았다.

**검수할 것**
- 디자인이 reap.cc와 같은가 — `bun run --cwd site dev`(포트 5174)로 띄워 나란히 비교
- 내용이 맞는가 — 열두 쪽의 문구는 `site/*.md`(gen-0085·0088이 쓴 한국어 본문, 이번에
  옮기며 지웠다)와 `RELEASE_NOTES.md`가 원천

## 라우트 열셋

gen-0094-exec에서 홈 breaking change 띠와 `/docs/v018change`(소개 다음)를 더했다.

| 경로 | 페이지 | 분류 |
|---|---|---|
| `/` | Hero | 시작하기 |
| `/docs/introduction` | 소개 | 시작하기 |
| `/docs/v018change` | v0.18에서 바뀐 것 | 시작하기 |
| `/docs/install` | 설치 | 시작하기 |
| `/docs/quick-start` | 첫 사용 | 시작하기 |
| `/docs/concepts` | 개념 | 시작하기 |
| `/docs/skills` | skill 10종 | 레퍼런스 |
| `/docs/cli` | CLI 레퍼런스 | 레퍼런스 |
| `/docs/hooks` | hooks | 레퍼런스 |
| `/docs/code-index` | 코드 인덱스 | 레퍼런스 |
| `/docs/orchestrate` | orchestrate | 레퍼런스 |
| `/docs/migration` | v0.17에서 이주 | 기타 |
| `/docs/release-notes` | 릴리스 노트 | 기타 |

## 검증됨

- `bun run site:build`(client + SSR + prerender)가 `site/dist/public/<route>/index.html`
  열두 개를 낸다
- `bash scripts/check-docs-prerender.sh` 통과 — canonical·hreflang·sitemap·404·
  meta description 전부 값으로 검사(개수만 세지 않는다)
- `./dist/reap doctor` 결함 0
- `bun run site:dev`로 띄운 뒤 `/`·`/docs/quick-start`에 curl, 200 확인. dev는
  client-rendered SPA라 curl 본문엔 셸만 실린다 — 한국어 내용 확인은 prerender
  산출물(`site/dist/public/`)에서 했다

## en을 더하는 절차 (검수 뒤)

타입·경로 기제는 로케일이 늘어도 다시 손댈 필요가 없게 남겨뒀다.

1. `site/src/i18n/types.ts` — `Locale` 유니온에 `"en"` 추가, `LOCALES`에 넣는다
   (`DEFAULT_LOCALE`은 `"ko"`로 남긴다 — en을 bare URL로 만들 게 아니라면).
   `LOCALE_LABELS`에 라벨 추가
2. `site/src/i18n/translations/en.ts`를 새로 쓴다. `Translations` 타입은
   `ko.ts`가 기준이므로 `import type { Translations } from "./ko"`로 받는다
3. `site/src/i18n/index.ts`의 `translations` record에 `en` 추가
4. `site/src/i18n/locale-path.ts`의 `LOCALE_PREFIXES`에 `en: "/en"` 추가
   (또는 원하는 접두사)
5. `site/src/entry-server.tsx`의 `TRANSLATIONS`·`OG_LOCALES`에 `en` 추가
6. `LanguageSelector`는 `LOCALES.length > 1`이 되는 순간 자동으로 다시
   렌더링된다 — 손댈 필요 없다
7. `scripts/check-docs-prerender.{sh,mjs}`는 `LOCALES`·`DEFAULT_LOCALE`을
   `types.ts`에서 직접 읽으므로 그대로 통과해야 한다 — 로케일 하나일 때만
   건너뛰던 언어 셀렉터 검사(`badSelector`·`badActive`)와 cross-locale
   번역 비교가 다시 켜진다

## 발행

`.github/workflows/docs.yml`은 `main` push의 `site/**` 변경에서만 돈다.
`v0.18`·`ms-022-site-port`에서는 돌지 않는다 — 발행은 사람이 `main`으로
병합한 뒤다.

**이 milestone은 사람 검수 전까지 닫지 않는다.** exit criteria의 "사람 검수"
항목이 이 handoff와 별도로 남아 있다.

## 사람 검수 (2026-09-04) — 방향 재설정

1. VitePress 기각 → v0.17 앱 이식(gen-0093) ✔
2. 문체: spec식 "-한다"체·중점 나열은 "AI 같다" → 합니다체·완결 문장으로 교정(gen-0095) ✔. 기준은 `~/cdws/reap_v17/docs/src/i18n/translations/ko.ts`
3. **홈 구성·메시지는 v0.17 홈 그대로**(tagline "Recursive Evolutionary Autonomous Pipeline", 왜 REAP인가 5쌍, 구조, 작업 흐름, 설치, 핵심 개념, 문서 링크). spec 문장을 키워드로 쓰지 않는다. "무엇이 달라졌나"는 띠·v018change 몫 — **아직 미반영**
4. **목차를 다시 잡는다** — 내용이 너무 줄었다. v0.17(23쪽)을 참고하되 Plan과 Execution을 대등한 축으로, agent의 자율 evolve를 앞세우는 구성. 28쪽 안을 사람에게 올렸고 답 대기. 확정 뒤 홈부터 한 쪽씩 써서 검수

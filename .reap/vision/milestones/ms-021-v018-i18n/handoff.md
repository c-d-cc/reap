# handoff — ms-021 v018-i18n

## 상태 줄 라벨 대응표 (task 1 완료분, `src/ctx.ts`)

skill 본문이 상태 줄을 인용할 때(예: "상태 줄의 '열린 세대'") en 쪽을 쓴다.

| ko (기존) | en (신규) | 카탈로그 키 |
|---|---|---|
| 응답 언어: | Response language: | `ctx.label.language` |
| 현재 milestone: | Milestone: | `ctx.label.milestone` |
| 열린 세대: | Open generation: | `ctx.label.generation` |
| 열린 loop: | Open loop: | `ctx.label.loop` |
| 기억: | Memory: | `ctx.label.memory` |
| 덜 단단한 것: | Ideas: | `ctx.label.idea` |
| 구조: | Structure: | `ctx.label.map` |
| `<!-- reap 상태 -->` | `<!-- reap status -->` | `ctx.marker` |
| 작업을 시작하면 /reap:evolve, 마무리하면 /reap:complete | To start work, /reap:evolve; to wrap up, /reap:complete | `ctx.entry` |

`ctx.label.idea`는 "덜 단단한 것"(정리되지 않은 idea 더미라는 뜻)을 "Ideas:"로 단순화했다. 더 나은 표현이 있으면 `src/messages/en.ts` 하나만 고치면 된다 — 다른 곳은 키를 참조할 뿐 문장을 갖고 있지 않다.

## task 2·3이 알아야 할 것

- `src/templates/*`(genome·map.md·environment-summary·config.yml 등 씨앗 실물)와 `plugin/skills/*.md`는 task 1이 건드리지 않았다. 카탈로그·`src/`·테스트·세 스크립트(`hook.test.sh`·`verify-package.sh`·`detect-version.sh`)만 이 세대의 것
- `src/templates/config.yml`은 여전히 `language: ko`. `src/store.ts`의 기본값은 이미 `""`로 고쳤으므로(언어 미지정 → REAP_LANG → en), task 2가 씨앗의 `language: ko`를 `language: en`으로 바꾸면 새 프로젝트의 기본 응답 언어가 en이 된다 — 그 한 줄만 바꾸면 된다
- **doctor.ts의 idea 졸업·출처 판정이 카탈로그 키(`doctor.pattern.graduation`=en "Graduation"/ko "졸업", `doctor.pattern.sources`=en "Sources"/ko "출처")로 헤딩 낱말을 찾는다.** task 2가 `idea-research.md`·`idea-file.md` 템플릿의 en 헤딩에 "Graduation"·"Sources"가 아닌 다른 낱말을 쓰면 이 두 카탈로그 키(`src/messages/en.ts`)도 맞춰 고쳐야 한다 — 안 그러면 새 프로젝트(en)에서 doctor가 졸업 조건을 계속 "없다"고 잘못 잡는다. 이 리포의 실물 idea(한국어, "졸업"·"출처" 헤딩)는 그대로 통과한다
- `RELEASE_NOTES.md`의 "v0.18은 한국어 전용" 문장, `genome/application.md`의 "사용자에게 보이는 문자열은 한국어" 규칙 갱신은 task 3
- task 1 Intent는 전부 끝났다 — 남은 것 없음. `REAP_LANG=ko` → 한국어 usage, 없음(그리고 `.reap/` 없음) → en usage. `bun test`(225)·`bun run typecheck`·`bash tests/hook.test.sh`·`bash scripts/verify-package.sh` 전부 초록

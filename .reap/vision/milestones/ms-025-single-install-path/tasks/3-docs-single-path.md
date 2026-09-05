# 3 — 문서가 설치 경로 하나만 말한다

- README.md·README.ko.md Install: `npm i -g @c-d-cc/reap` → `reap setup` → 새 세션. "Coming from v0.17": 0.17.7의 안내 메시지부터 `/reap:migrate`까지. Uninstall: `claude plugin uninstall reap@ctod-plugins && npm rm -g @c-d-cc/reap`은 유지(제거는 둘)
- 사이트 `ko.ts`: quickStart·migration·v018change·releaseNotes.goodToKnow — 같은 순서로. `@next` 삭제
- `RELEASE_NOTES.md` v0.18.0 블록: Coming from v0.17·Good to know 수정
- `plugin/hooks/session-start.sh` 안내: `npm i -g @c-d-cc/reap`
- `plugin/skills/migrate/SKILL.md` 2/8 설치 안내
- `.reap/genome/application.md` "둘은 따로 설치되고" 문단 → "npm이 입구, `reap setup`이 플러그인을 설치, 한쪽만 있는 상태는 훅과 doctor가 알린다"; `src/templates/`에 대응 파일 있으면 동기화
- 게이트: `grep -rn '@next'` 0건, check-docs-surface, check-release-version, check-docs-prerender
- 사람 검수(docsUpdate 규칙) 뒤 커밋

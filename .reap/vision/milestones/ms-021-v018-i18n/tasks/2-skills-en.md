# 2 — skill·어휘·템플릿 en

- `plugin/skills/*/SKILL.md` 10종 + `references/*.md` + `shared/references/record-vocabulary.md` + `plugin/hooks/session-start.sh` 주석 → en. **의미 보존이 우선.** 한국어 특유의 대목(예: "닫힘은 상태이고 archive는 위치다")은 그 힘을 잃지 않게 옮긴다. frontmatter `description`은 이미 en
- `src/templates/*.md|yml|sh` 씨앗 → en (map.md 씨앗 포함). `tests/templates.test.ts`·`init.test.ts`의 단언 갱신
- task 1이 남긴 상태 줄 라벨 목록으로 skill 본문의 인용을 맞춘다
- `.reap/map.md`·`.reap/genome/*`·기록은 **손대지 않는다** — 이 리포의 사용자 문서
- `plugin/.claude-plugin/plugin.json` description en

완료: `grep -rP '[가-힣]' plugin/ src/templates/`가 0 · `bun test` 초록 · `claude --plugin-dir ./plugin -p`로 skill 10종 이름·상태 줄 확인(왕복 1의 방식)

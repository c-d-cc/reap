---
type: genome-change
status: consumed
consumedBy: gen-033
target: genome/domain/hook-system.md
---
# Hook System 문서를 파일 기반 구조로 업데이트

gen-031/032에서 hooks를 config.yml에서 `.reap/hooks/` 파일 기반으로 전환.
domain/hook-system.md를 새 구조에 맞게 업데이트:

- Config Format 섹션: config.yml hooks → `.reap/hooks/{event}.{name}.{ext}` 파일 기반
- Hook Types: command/prompt → .sh/.md 파일 확장자 기반
- Frontmatter: condition, order 필드 설명 추가
- 네이밍 컨벤션: `{event}.{name}.{ext}` 설명
- Hook Suggestion: completion Phase 5에서 반복 패턴 감지 → 유저 확인 후 hook 생성

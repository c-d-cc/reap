---
type: genome-change
status: consumed
consumedBy: gen-033
target: genome/constraints.md
---
# Constraints Hooks 섹션 파일 기반 구조 반영

현재: "4개 event, 2개 type: command (shell), prompt (AI agent instruction)"
변경: "4개 event. `.reap/hooks/{event}.{name}.{ext}` 파일 기반. .md=prompt, .sh=command. frontmatter: condition, order"

---
id: gen-044-d155b0
type: embryo
goal: "reap help 고도화 — 토픽 모드, 상태 표시, 다국어 지원"
parents: ["gen-043-5e6dca"]
---
# gen-044-d155b0
`reap help` 명령을 고도화하여 v0.15 수준의 기능을 v0.16에 이식했다.

### 주요 변경
- `src/cli/commands/help.ts`: 전면 재작성 — 다국어 맵(en/ko/ja/zh-CN), 토픽 모드, 상태 표시, 미지원 언어 AI 번역 위임
- `src/cli/index.ts`: `help [topic]` 인자 지원
- `src/adapters/claude-code/skills/reap.help.md`: topic 인자 전달 및 prompt 처리 안내
- `tests/unit/help.test.ts`: 24개 신규 테스트

테스트: 435 pass (기존 411 → 435)
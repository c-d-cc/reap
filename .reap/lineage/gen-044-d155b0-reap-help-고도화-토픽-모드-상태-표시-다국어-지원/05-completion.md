# Completion — gen-044-d155b0

## Summary

`reap help` 명령을 고도화하여 v0.15 수준의 기능을 v0.16에 이식했다.

### 주요 변경
- `src/cli/commands/help.ts`: 전면 재작성 — 다국어 맵(en/ko/ja/zh-CN), 토픽 모드, 상태 표시, 미지원 언어 AI 번역 위임
- `src/cli/index.ts`: `help [topic]` 인자 지원
- `src/adapters/claude-code/skills/reap.help.md`: topic 인자 전달 및 prompt 처리 안내
- `tests/unit/help.test.ts`: 24개 신규 테스트

테스트: 435 pass (기존 411 → 435)

## Lessons Learned

- v0.15 코드를 참조 가능하게 보관해둔 것이 이식 작업의 속도를 크게 높인다. 다국어 맵 같은 데이터 구조는 기존 코드에서 거의 그대로 가져올 수 있었다.
- pure function으로 로직을 분리(detectLanguage, buildCommandTable 등)하면 테스트 작성이 쉬워지고 execute() 함수의 복잡도도 줄어든다.

## Next Generation Hints

- help 명령의 e2e 테스트가 아직 없다. 실제 CLI를 통한 help 출력 검증(기본 모드, 토픽 모드)을 e2e로 추가하면 regression 방지에 도움.
- 현재 REAP_INTRO, COMMAND_DESCRIPTIONS 등 다국어 맵이 help.ts 안에 하드코딩되어 있다. 향후 다른 명령에서도 다국어가 필요해지면 공통 i18n 모듈로 분리 가능.

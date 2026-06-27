---
id: gen-048-cfbd63
type: embryo
goal: "release notice 구현 — 버전별 릴리즈 노트 표시"
parents: ["gen-047-4b8a99"]
---
# gen-048-cfbd63
release notice 기능을 구현했다. 업데이트(autoUpdate/reap update) 성공 후, RELEASE_NOTICE.md에서 해당 버전의 릴리즈 노트를 다국어로 추출하여 stderr에 표시한다.

### 주요 변경
- `RELEASE_NOTICE.md` — 패키지 루트에 신규 생성 (v0.16.0 en/ko)
- `src/core/notice.ts` — fetchReleaseNotice(version, language) 구현 (v0.15 이식)
- `src/cli/commands/check-version.ts` — autoUpdate 성공 후 notice 표시
- `src/cli/commands/update.ts` — update 완료 후 notice 표시
- `package.json` — files에 RELEASE_NOTICE.md 추가
- `tests/unit/notice.test.ts` — 8개 unit test

테스트: 464 pass (기존 456 + 8 신규)
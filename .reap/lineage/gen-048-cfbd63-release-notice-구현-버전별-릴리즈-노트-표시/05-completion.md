# Completion — gen-048-cfbd63

## Summary

release notice 기능을 구현했다. 업데이트(autoUpdate/reap update) 성공 후, RELEASE_NOTICE.md에서 해당 버전의 릴리즈 노트를 다국어로 추출하여 stderr에 표시한다.

### 주요 변경
- `RELEASE_NOTICE.md` — 패키지 루트에 신규 생성 (v0.16.0 en/ko)
- `src/core/notice.ts` — fetchReleaseNotice(version, language) 구현 (v0.15 이식)
- `src/cli/commands/check-version.ts` — autoUpdate 성공 후 notice 표시
- `src/cli/commands/update.ts` — update 완료 후 notice 표시
- `package.json` — files에 RELEASE_NOTICE.md 추가
- `tests/unit/notice.test.ts` — 8개 unit test

테스트: 464 pass (기존 456 + 8 신규)

## Lessons Learned

- v0.15 코드 이식이 매우 효율적. backlog에 참조 경로를 명시한 관행이 계속 효과적으로 작동함.
- TypeScript strict mode에서 `YAML.parse` 반환값의 null 가능성을 주의해야 함. `configContent`가 narrowing된 스코프 내에서도 nested try 안에서는 재확인 필요.

## Next Generation Hints

- 새 버전 릴리즈마다 RELEASE_NOTICE.md에 해당 버전 섹션을 추가해야 함. 이를 릴리즈 체크리스트에 포함시키면 좋겠음.
- check-version.ts의 notice 통합은 실제 npm upgrade를 필요로 하므로 자동화된 integration test로 커버하기 어려움.

# Planning — gen-048-cfbd63

## Goal
release notice 구현 — 업데이트(autoUpdate/reap update) 성공 후, 해당 버전의 릴리즈 노트를 다국어로 stderr에 표시.

## Completion Criteria
1. `RELEASE_NOTICE.md`가 패키지 루트에 존재하고, `## v0.16.0` / `### en` / `### ko` 섹션이 있다
2. `src/core/notice.ts`의 `fetchReleaseNotice(version, language)`가 올바른 섹션을 추출한다
3. `check-version.ts`의 `performAutoUpdate()`에서 upgrade 성공 시 notice가 stderr로 출력된다
4. `update.ts`에서 업데이트 완료 후 notice가 stderr로 출력된다
5. `package.json` files에 `RELEASE_NOTICE.md`가 포함된다
6. notice.ts unit test 작성 완료
7. 기존 456 tests 전부 pass

## Approach
v0.15의 `notice.ts`를 거의 그대로 이식. 동기 함수(`readFileSync`) 유지 — `check-version.ts`가 sync 코드이므로 일관성 유지.

## Scope
**변경 파일:**
- `RELEASE_NOTICE.md` — 신규
- `src/core/notice.ts` — 신규
- `src/cli/commands/check-version.ts` — notice 호출 추가
- `src/cli/commands/update.ts` — notice 호출 추가
- `package.json` — files 배열에 추가

**테스트 파일:**
- `tests/unit/notice.test.ts` — 신규

## Tasks
- [ ] T001 `RELEASE_NOTICE.md` — 패키지 루트에 생성. v0.16.0 en/ko 섹션 포함
- [ ] T002 `src/core/notice.ts` — v0.15 코드 이식 (findPackageRoot, fetchReleaseNotice, LANG_MAP)
- [ ] T003 `src/cli/commands/check-version.ts` — performAutoUpdate()에서 upgraded 시 notice stderr 출력
- [ ] T004 `src/cli/commands/update.ts` — update 완료 후 notice stderr 출력
- [ ] T005 `package.json` — files에 RELEASE_NOTICE.md 추가
- [ ] T006 `tests/unit/notice.test.ts` — fetchReleaseNotice unit test (정상, 미존재 버전, 언어 매핑, fallback)
- [ ] T007 빌드 + 전체 테스트 (npm run build && npm test)

## Dependencies
T001, T002 먼저 (독립). T003, T004는 T002에 의존. T005는 독립. T006은 T001+T002에 의존. T007은 전부 완료 후.

# Implementation Log — gen-048-cfbd63

## Completed Tasks

| Task | File | Description |
|------|------|-------------|
| T001 | `RELEASE_NOTICE.md` | 패키지 루트에 생성. v0.16.0 en/ko 섹션 포함 |
| T002 | `src/core/notice.ts` | v0.15에서 이식. findPackageRoot + fetchReleaseNotice + LANG_MAP |
| T003 | `src/cli/commands/check-version.ts` | execute()에서 performAutoUpdate() upgraded 시 config 언어 읽어 notice stderr 출력 |
| T004 | `src/cli/commands/update.ts` | v0.16 sync 완료 후 getPackageVersion()으로 버전 읽고 notice stderr 출력 |
| T005 | `package.json` | files 배열에 RELEASE_NOTICE.md 추가 |
| T006 | `tests/unit/notice.test.ts` | 8개 테스트: 정상 en/ko, v prefix, 언어 매핑, ISO 코드 직접, 미존재 버전, fallback, 빈 버전 |
| T007 | 빌드 + 테스트 | 464 pass (280 unit + 143 e2e + 41 scenario) |

## Architecture Decisions

- **동기 함수 유지**: notice.ts는 readFileSync 사용. check-version.ts가 전부 sync 코드이므로 일관성 유지. update.ts는 async이지만 공용 모듈이므로 sync로 통일.
- **stderr 출력**: JSON stdout 오염 방지를 위해 notice는 항상 console.error (stderr)로 출력.
- **에러 swallow**: notice 표시 실패는 항상 null 반환 또는 catch로 무시. postinstall/hook을 절대 깨뜨리지 않음.

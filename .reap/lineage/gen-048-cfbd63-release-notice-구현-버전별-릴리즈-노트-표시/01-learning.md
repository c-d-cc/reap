# Learning — gen-048-cfbd63

## Goal
release notice 구현 — 버전별 릴리즈 노트 표시

## Project Overview
업데이트 후 사용자에게 변경사항을 알려주는 메커니즘이 v0.16에는 없다. v0.15에서는 RELEASE_NOTICE.md 파일을 패키지에 포함하고, autoUpdate/update 성공 후 해당 버전의 릴리즈 노트를 다국어로 stderr에 출력했다.

## Key Findings

### v0.15 참조 분석
- `fetchReleaseNotice(version, language)` — RELEASE_NOTICE.md에서 `## vX.Y.Z` -> `### lang` 구조로 파싱
- `findPackageRoot()` — `require.resolve("@c-d-cc/reap/package.json")`으로 패키지 루트 탐색 (dev/prod 공통)
- 언어 매핑: `korean` -> `ko`, `english` -> `en` 등 LANG_MAP 사용
- 반환값: `\n--- Release Notes (vX.Y.Z) ---\n{content}\n` 형식 문자열 또는 null
- 모든 에러는 null 반환으로 swallow (postinstall/hook 안전)

### 현재 코드 상태
- `check-version.ts`: `performAutoUpdate(root)` 후 `console.error`로 업그레이드 메시지 출력. notice 표시 없음.
- `update.ts`: `emitOutput`으로 JSON 결과만 반환. notice 표시 없음.
- `package.json files`: `dist/`, `scripts/postinstall.sh`, `README.md` — RELEASE_NOTICE.md 미포함.

### 통합 지점
1. **check-version.ts**: `performAutoUpdate()` 반환 후, `action === "upgraded"`일 때 notice를 stderr로 출력
2. **update.ts**: v0.16 sync 완료 후 notice를 stderr로 출력
3. **notice.ts**: v0.15 코드를 거의 그대로 이식 가능. `readFileSync` 사용 (check-version.ts가 sync 함수이므로)

### 설계 결정 사항
- `check-version.ts`는 동기 함수(`performAutoUpdate`)이므로 notice도 동기로 동작해야 함 -> `readFileSync` 유지
- `update.ts`는 async이지만 notice.ts를 공용으로 쓰려면 sync가 더 간편
- notice 출력은 stderr (JSON stdout 오염 방지)

## Previous Generation Reference
gen-047: autoUpdate hand-off 메커니즘 구현 완료. `handOffToNewBinary()` 추가됨. 이번 generation은 그 위에 notice 표시를 추가하는 자연스러운 후속 작업.

## Backlog Review
- [task] auto issue report 구현 — 이번 generation과 무관
- [task] release notice 구현 — **이번 generation의 목표**

## Context for This Generation
- Clarity: **HIGH** — backlog에 구체적인 파일 목록과 구현 방향이 있고, v0.15 참조 코드가 명확
- v0.15 코드가 잘 정리되어 있어 이식이 빠를 것으로 예상
- 테스트: notice.ts unit test 필수, check-version/update 연동은 e2e 수준

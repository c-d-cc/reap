# Learning

> environment 구조 개선 -- resources/docs 디렉토리 복원 + migration 반영

## Project Overview

REAP v0.16.0. environment는 descriptive knowledge 계층으로, summary.md(항상 로드), domain/(온디맨드), source-map.md(온디맨드)로 구성. 외부 문서(API docs, SDK 스펙 등)를 저장할 전용 공간이 없는 상태.

## Key Findings

### 현재 environment 구조
- `src/core/paths.ts`: `ReapPaths` 인터페이스에 `environment`, `environmentSummary`, `environmentDomain`, `sourceMap` 경로만 존재. resources/docs 경로 없음.
- `src/cli/commands/init/common.ts`: init 시 `environment/`, `environment/domain/` 만 생성.
- `src/cli/commands/migrate.ts`: v0.15 → v0.16 migration 시 environment 복사는 summary.md + domain/ + source-map.md만 처리. resources/docs 복사 로직 없음.
- `src/templates/reap-guide.md` + `.reap/reap-guide.md`: environment 구조 설명에 resources/docs 없음.

### v0.15 참조 확인
- `~/cdws/reap_v15/.reap/environment/`에 실제로 resources/나 docs/ 디렉토리가 존재하지 않음. summary.md만 있음.
- 따라서 이것은 "v0.15에서 유실된 것을 복원"이 아니라, "새로 추가하는 기능"에 가까움. migration은 v0.15에 resources/docs가 있을 경우를 대비하는 방어적 처리.

### 영향 범위
- `integrity.ts`: `checkDirectoryStructure()`의 `optionalDirs`에 resources/docs 추가 필요.
- `prompt.ts`의 `loadReapKnowledge()`: environment 로딩 시 resources/docs 존재 여부를 참조할 수 있으나, 이들은 "온디맨드" 로딩이므로 summary에서 언급만 하면 됨.
- 테스트: `createPaths` 사용하는 unit test 5개 파일 확인. paths에 새 필드 추가 시 영향 최소.

## Backlog Review

- `[task] environment 구조 개선 -- resources/docs 디렉토리 복원 + migration 반영` (pending, high) -- 이번 generation의 source backlog.
- docs 페이지 업데이트는 backlog에서 명시적으로 범위 밖으로 표시됨.

## Context for This Generation

**Clarity: HIGH** -- 목표 명확, 변경 파일 목록 구체적, 패턴 파악 완료.

변경 대상 파일 4개:
1. `src/core/paths.ts` -- `environmentResources`, `environmentDocs` 경로 추가
2. `src/cli/commands/init/common.ts` -- 디렉토리 생성 추가
3. `src/cli/commands/migrate.ts` -- v0.15 resources/docs 복사 로직 (방어적)
4. `src/templates/reap-guide.md` -- environment 구조 설명 업데이트

추가 고려:
- `integrity.ts`의 `optionalDirs`에 추가
- `.reap/reap-guide.md` (프로젝트 로컬 복사본)도 업데이트 -- embryo이므로 자유 수정 가능
- genome의 reap-guide 구조 설명과 environment summary도 반영 필요

테스트 전략:
- paths.ts 변경: 기존 unit test에서 createPaths 사용 -- 새 필드 추가가 기존 테스트를 깨뜨리지 않음 (추가만)
- init common: scenario test (sandbox)가 적절하지만, 기존 init scenario test에 검증 포인트 추가로 충분
- migrate: e2e test에 resources/docs 복사 확인 추가
- integrity: unit test에 optionalDirs 검증 추가

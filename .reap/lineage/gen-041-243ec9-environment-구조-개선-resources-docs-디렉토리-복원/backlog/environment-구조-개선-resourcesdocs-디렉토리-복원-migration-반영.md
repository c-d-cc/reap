---
type: task
status: consumed
consumedBy: gen-041-243ec9
consumedAt: 2026-03-27T12:38:56.790Z
priority: high
createdAt: 2026-03-27T12:30:16.702Z
---

# environment 구조 개선 — resources/docs 디렉토리 복원 + migration 반영

## Problem

v0.15에서는 environment에 resources/(외부 원본 문서), docs/(참고 문서)가 있어 외부 지식을 저장하고 summary.md로 요약하는 구조였다. v0.16에서 environment가 내부 지식(소스 구조, 빌드) 중심으로 재설계되면서 이 디렉토리들이 사라짐. 외부 API 문서, SDK 스펙 등을 저장할 곳이 없다.

또한 migration 시 v0.15의 resources/, docs/가 새 구조로 복사되지 않고 유실됨.

## Solution

1. environment 구조에 resources/, docs/ 디렉토리 복원
   - `resources/` — 외부 원본 문서 (API docs, SDK 문서 등, 참조용)
   - `docs/` — 주요 참고 문서 (설계 문서, 스펙 등)
   - `summary.md` — 내부(소스 구조) + 외부(resources/docs 기반) 통합 요약
2. init에서 디렉토리 생성, reap-guide에 설명 추가
3. migration에서 v0.15의 resources/, docs/ → v0.16의 environment/resources/, environment/docs/로 복사
4. environment 관련 docs 페이지 업데이트

## Files to Change

- `src/core/paths.ts` — environmentResources, environmentDocs 경로 추가
- `src/cli/commands/init/common.ts` — 디렉토리 생성
- `src/cli/commands/migrate.ts` — v0.15 resources/docs 복사 로직
- `src/templates/reap-guide.md` — environment 구조 설명 업데이트
- `docs/src/pages/EnvironmentPage.tsx` — docs 업데이트
- `docs/src/i18n/translations/en.ts` — environment 설명 업데이트

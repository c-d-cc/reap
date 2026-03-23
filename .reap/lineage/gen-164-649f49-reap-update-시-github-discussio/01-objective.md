# Objective

## Goal
`reap update` 실행 시 GitHub Discussions (Announcements 카테고리)에서 현재 버전에 해당하는 release notice를 fetch하여 사용자 언어에 맞게 표시한다.

## Completion Criteria
1. `reap update` 완료 후 현재 버전의 notice가 있으면 표시된다
2. notice는 사용자 language 설정(agent config)에 맞는 섹션(## en, ## ko 등)이 추출되어 표시된다
3. fetch 실패 시(오프라인, gh 미설치 등) notice 없이 정상 진행된다
4. notice fetch는 `--dry-run` 모드에서도 동작한다
5. 새 모듈 `src/core/notice.ts`에 로직이 분리된다

## Requirements

### Functional Requirements
1. GitHub Discussions GraphQL API를 통해 `c-d-cc/reap` repo의 Announcements 카테고리에서 discussions를 조회한다
2. discussion 제목에서 버전을 매칭한다 (예: "v0.16.0 Release Notes")
3. 매칭된 discussion body에서 사용자 language에 맞는 섹션(## ko, ## en 등)을 추출한다
4. language 섹션이 없으면 전체 body를 표시한다
5. notice 표시 형식: 구분선 + "Release Notes" 헤더 + 내용
6. `gh` CLI가 없거나 인증 안 된 경우 graceful skip
7. GraphQL timeout 5초

### Non-Functional Requirements
1. notice fetch 실패가 update 프로세스 전체를 중단시키면 안 된다
2. 코드는 50줄 이하의 단일 책임 함수로 구성

## Design

### Approaches Considered

| Aspect | Approach A: REST API | Approach B: GraphQL API |
|--------|---------------------|------------------------|
| Summary | `gh api repos/.../discussions` REST | `gh api graphql` |
| Pros | 단순한 호출 | 필요한 필드만 조회, 카테고리 필터 가능 |
| Cons | 카테고리 필터 불가, 전체 목록 순회 필요 | 쿼리 복잡 |
| Recommendation | - | 선택 |

### Selected Design
- **GraphQL API 사용**: `gh api graphql`로 Announcements 카테고리의 discussions를 조회
- **새 모듈**: `src/core/notice.ts` — `fetchReleaseNotice(version: string, language: string): Promise<string | null>`
- **통합 지점**: `src/cli/index.ts`의 update command action 끝에서 호출
- **language 감지**: 기존 `AgentRegistry.readLanguage()` 패턴 재사용
- **섹션 추출**: body에서 `## {lang}` 헤더 이하 텍스트를 다음 `## ` 헤더 전까지 추출

### Design Approval History
- 2026-03-23: 초기 설계 확정

## Scope
- **Related Genome Areas**: constraints.md (외부 서비스 의존 없음 → GitHub Discussions 조건부 접근 추가)
- **Expected Change Scope**: `src/core/notice.ts` (신규), `src/cli/index.ts` (update action 수정)
- **Exclusions**: reapdev.versionBump 워크플로우의 notice 작성 단계는 이번 generation 범위 밖

## Genome Reference
- constraints.md: 외부 서비스 의존 없음 원칙 — notice fetch는 best-effort이므로 원칙 위반 아님
- conventions.md: execSync 사용 패턴 (report.ts, update.ts에서 이미 사용)

## Backlog (Genome Modifications Discovered)
None

## Background
- GitHub repo: c-d-cc/reap (Discussions 활성화됨)
- `gh` CLI는 report.ts, update.ts에서 이미 사용하는 패턴
- 기존 `execSync`으로 `gh api graphql` 호출하는 방식 채택

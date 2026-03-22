# Objective

## Goal
resolve #4: Genome shows 'synced' but actually needs sync on existing projects

`reap init` 후 Genome이 placeholder 템플릿 상태인데, session init에서 "synced"로 표시되는 문제 해결.
`buildGenomeHealth()`가 파일 존재 + git commit 수만 체크하고, placeholder 내용 여부를 확인하지 않음.

## Completion Criteria
1. placeholder 템플릿 상태의 genome 파일이 "synced"가 아닌 "needs sync" 상태로 표시된다
2. 실제로 내용이 작성된 genome 파일은 기존과 동일하게 "synced"로 표시된다
3. placeholder 감지 시 사용자에게 `/reap.sync` 안내 메시지가 노출된다
4. 기존 테스트가 깨지지 않으며 새 로직에 대한 테스트가 추가된다
5. genome-loader.cjs의 buildGenomeHealth() 함수에 placeholder 감지 로직이 통합된다

## Requirements

### Functional Requirements
1. genome-loader.cjs에 placeholder 패턴 감지 함수(`detectPlaceholders`) 추가
2. placeholder 패턴 목록: `(Add ... here)`, `(Describe ...)`, `(language and version)`, 빈 ADR/규칙 테이블(헤더만 있고 데이터 행이 비어있는 테이블), `(External services, APIs, etc.)`
3. `buildGenomeHealth()`에서 L1 파일들의 placeholder 비율을 체크하여 severity 결정
4. placeholder가 감지되면 "needs customization" 이슈를 추가하고 severity를 최소 'warn'으로 설정
5. session init 메시지에서 placeholder 상태 시 `/reap.sync` 안내 표시

### Non-Functional Requirements
1. placeholder 감지는 O(n) 파일 스캔으로 성능 영향 최소화
2. 기존 genome-loader.cjs의 export 인터페이스 유지 (하위 호환성)

## Design

### Approaches Considered

| Aspect | Approach A: buildGenomeHealth 내부 통합 | Approach B: 별도 health check 단계 |
|--------|-----------|-----------|
| Summary | buildGenomeHealth() 안에서 L1 파일 내용을 읽고 placeholder 패턴 매칭 | 별도 함수로 분리하고 session-start.cjs에서 호출 |
| Pros | 변경 범위 최소, health 로직 응집도 높음 | 관심사 분리, 테스트 용이 |
| Cons | buildGenomeHealth 파라미터 추가 필요 | 두 파일 수정, 호출 순서 의존성 |
| Recommendation | **선택** | - |

### Selected Design
- `genome-loader.cjs`에 `PLACEHOLDER_PATTERNS` 상수 배열 추가 (정규식 패턴)
- `detectPlaceholders(filePath)` 함수 추가: 파일 내용에서 placeholder 패턴 매칭, boolean 반환
- `buildGenomeHealth()`에 `genomeDir` 파라미터 활용하여 L1 파일들 스캔
- placeholder가 감지된 파일이 있으면 issues에 "needs customization" 추가, severity 최소 'warn'
- 모든 L1 파일이 placeholder 상태이면 severity를 'danger'로 설정

### Design Approval History
- 2026-03-22: 초기 설계 작성

## Scope
- **Related Genome Areas**: genome-loader.cjs (buildGenomeHealth), session-start.cjs (메시지 표시)
- **Expected Change Scope**: `src/templates/hooks/genome-loader.cjs` 주요 변경, 테스트 추가
- **Exclusions**: session-start.cjs는 이미 buildGenomeHealth 결과를 사용하므로 변경 불필요

## Genome Reference
- principles.md: "Genome은 살아있는 기록이다 — 빈 템플릿이 아니라 에이전트가 즉시 참조할 수 있는 맵"
- 이 원칙이 기술적으로 강제되지 않는 것이 이번 이슈의 근본 원인

## Backlog (Genome Modifications Discovered)
None

## Background
GitHub Issue #4에서 보고된 문제. `reap init`으로 프로젝트를 초기화하면 genome 파일들이 placeholder 템플릿으로 생성되지만, session-start hook에서는 파일이 존재하고 git commit이 최근이면 "synced"로 표시한다. 이는 사용자에게 genome이 완성된 것으로 오인하게 하여, 실제로 필요한 genome 커스터마이제이션을 놓치게 만든다.

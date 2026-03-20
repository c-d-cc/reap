---
id: gen-013-22fcea
type: normal
parents:
  - gen-012-4e1489
goal: artifact templates + domain guide를 ~/.reap/templates/로 이전
genomeHash: legacy
startedAt: legacy-13
completedAt: legacy-13
---

# gen-013-22fcea
- **Goal**: artifact templates + domain guide를 ~/.reap/templates/로 이전
- **Period**: 2026-03-17
- **Genome Version**: v13 → v14
- **Result**: pass
- **Key Changes**: templates를 user-level ~/.reap/templates/에 설치, 프롬프트 경로 일괄 변경

## Objective
artifact templates + domain guide를 ~/.reap/templates/로 이전

## Completion Conditions
1. `reap init` 시 artifact templates가 `~/.reap/templates/`에 복사됨
2. `reap update` 시 templates가 최신으로 동기화됨
3. 모든 slash command 프롬프트가 `~/.reap/templates/`를 참조
4. `reap init` 시 프로젝트 `.reap/genome/domain/`에 README.md를 더 이상 복사하지 않음
5. domain guide가 `~/.reap/templates/domain-guide.md`에 설치됨
6. `bun test` 통과

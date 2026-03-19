# Distributed Collaboration

> 멀티머신/멀티에이전트 환경에서 REAP 프로젝트를 협업하는 워크플로우

## 핵심 원칙

- **Opt-in 분산**: git pull/push는 항상 허용. reap pull/push/merge는 추가 기능
- **Genome-first**: merge 시 genome 충돌을 먼저 해결, 그 후 source 맞춤
- **로컬 원칙 유지**: 서버 없음. Git을 전송 계층으로 사용
- **Git ref 기반 읽기**: merge 전 상대 branch의 .reap/ 파일은 `git show` 로 접근

## 분산 작업 흐름

```
Machine A: branch-a에서 gen-046-a 진행/완료 → reap push
Machine B: branch-b에서 gen-046-b 진행/완료 → reap push
Machine A (또는 C):
  reap pull                    → fetch + 원격 generation 감지
  reap merge branch-b          → genome-first merge 시작
```

## reap pull

| 단계 | 동작 |
|------|------|
| 1. fetch | `git fetch origin` (또는 지정 remote) |
| 2. scan | 원격 branch들의 `.reap/lineage/` 를 git ref로 스캔 |
| 3. detect | 로컬에 없는 generation 식별 (hash ID 비교) |
| 4. report | "branch-b에 gen-046-b가 있습니다" 알림 |

**하지 않는 것**: git merge, checkout, working tree 변경

## reap push

| 단계 | 동작 |
|------|------|
| 1. validate | active generation이 완료 상태인지 확인 |
| 2. push | `git push origin {current-branch}` |

**검증 실패 시**: "gen-046-a가 진행 중입니다. 완료 후 push하세요" 경고

## reap merge

→ `domain/merge-lifecycle.md` 참조. genome-first 5단계 orchestration.

**진입 조건**:
- 현재 active generation이 없어야 함
- 지정한 branch가 fetch 되어 있어야 함 (reap pull 선행)
- 두 branch의 공통 조상이 DAG에서 식별 가능해야 함

## Git Ref 기반 읽기

merge 전에는 상대 branch의 파일을 filesystem에서 직접 읽을 수 없음:

```bash
# 상대 branch의 genome 읽기
git show branch-b:.reap/genome/principles.md

# 상대 branch의 lineage 목록
git ls-tree -r --name-only branch-b -- .reap/lineage/

# 상대 branch의 meta.yml 읽기
git show branch-b:.reap/lineage/gen-046-b-slug/meta.yml
```

구현 시 `merge.ts`의 함수들은 filesystem path 대신 git ref를 받는 오버로드 필요.

## 충돌 유형

| 유형 | 설명 | 해결 주체 |
|------|------|-----------|
| Genome WRITE-WRITE | 같은 genome 파일을 양쪽이 수정 | 사람 (genome-resolve 단계) |
| Genome CROSS-FILE | 다른 genome 파일이지만 양쪽 다 변경 | 사람 (검토 후 판단) |
| Source conflict | git merge 시 코드 충돌 | 사람 + AI (source-resolve 단계) |
| No conflict | genome/source 모두 충돌 없음 | 자동 진행 가능 |

## 제약

- reap merge는 **2-parent merge만** 지원 (3-way 이상은 순차 merge)
- merge generation 진행 중 다른 generation 시작 불가
- reap pull/push는 CLI subcommand로 구현 (slash command 아님)

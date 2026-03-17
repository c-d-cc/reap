---
description: "REAP Completion — 회고하고 Genome을 진화시켜 세대를 완성합니다"
---

# Completion (완성)

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `completion`인지 확인하라
- `.reap/life/04-validation.md`가 존재하는지 확인하라
- 미충족 시: 사유를 알리고 중단

## Context (세대 정보)
- `.reap/life/current.yml`에서 현재 세대 정보를 읽어라 (id, goal, genomeVersion)

## Steps

### Phase 1: 회고 (Retrospective)

1. `.reap/life/backlog/`에서 `type: genome-change`와 `type: environment-change` 항목을 모두 읽어라
2. `.reap/life/03-implementation.md`에서 deferred 태스크 목록을 읽어라
3. 이번 세대에서 얻은 교훈을 정리하라
4. genome에 반영할 변경 사항을 정리하라 (어떤 genome 파일을 어떻게 수정할지)

### Phase 2: 가비지 컬렉션 (Codebase Health)

5. `.reap/genome/conventions.md`의 Enforced Rules를 참고하여 코드베이스의 일관성을 점검하라:
   - conventions 위반이 새로 발생했는지 검사
   - 구현 중 생긴 기술 부채를 식별
   - 불필요하게 복잡해진 코드를 식별
6. 발견된 기술 부채 각각에 대해 `.reap/life/backlog/`에 마크다운 파일로 추가하라:
   ```markdown
   ---
   type: task
   ---
   # [제목]
   [설명]
   ```

### Phase 3: Backlog 정리

7. deferred 태스크를 `.reap/life/backlog/`에 `type: task`로 추가하라
   - 각 deferred 태스크의 관련 genome-change 항목을 명시하라
8. 그 외 다음 세대 목표 후보도 backlog에 추가하라
9. 인간과 함께 회고를 확정하라

### Phase 4: Genome 반영

10. `.reap/life/backlog/`에서 `type: genome-change`와 `type: environment-change` 항목을 모두 읽어라
    - 각 항목의 `target`과 제안 내용을 확인하라
11. Phase 1에서 정리한 변경 제안을 읽어라
12. genome-change 항목들을 `.reap/genome/`의 해당 파일에 반영하라:
    - `principles.md`, `domain/`, `conventions.md`, `constraints.md` 중 해당하는 파일 수정
    - **맵 원칙을 반드시 지켜라**:
      - 각 genome 파일은 **~100줄 이내**를 유지하라
      - 100줄을 초과하면 상세 내용을 `domain/` 하위 파일로 분리하라
      - 에이전트가 다음 세대에서 읽었을 때 **즉시 행동 가능한 수준**으로 작성하라
    - **domain/ 파일 작성 시 `domain/README.md`의 가이드를 따르라**
13. 변경된 genome이 기존 코드/테스트와 충돌하지 않는지 확인하라
    - constraints.md의 Validation Commands가 정의되어 있으면 실행하여 검증하라
14. 변경된 genome 내용을 인간에게 보여주고 확인을 받아라
15. environment-change 항목들을 `.reap/environment/`의 해당 파일에 반영하라
    - 새 파일 추가 또는 기존 파일 수정
16. 반영 완료된 `type: genome-change`와 `type: environment-change` backlog 항목은 삭제하라

## 산출물 생성
- `.reap/templates/05-completion.md`를 읽어라
- Retrospective (교훈, genome 변경 제안, deferred 인계, backlog)와 Changelog (genome 반영 내역)를 기록하라
- `.reap/life/05-completion.md`에 저장하라

## 완료
- `/reap.evolve`로 세대를 마무리하라고 안내하라
- `reap evolve --advance` 실행 시 자동으로 lineage 아카이빙이 수행됨을 안내하라

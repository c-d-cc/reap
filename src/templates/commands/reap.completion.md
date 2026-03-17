---
description: "REAP Completion — 회고하고 Genome을 진화시켜 세대를 완성합니다"
---

# Completion (완성)

<HARD-GATE>
Genome 변경을 인간의 확인 없이 반영하지 마라.
Validation Commands를 실행하지 않고 genome 변경을 확정하지 마라.
</HARD-GATE>

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `completion`인지 확인하라
- `.reap/life/04-validation.md`가 존재하는지 확인하라
- 미충족 시: ERROR — 사유를 알리고 **중단**

## Context (세대 정보)
- `.reap/life/current.yml`에서 현재 세대 정보를 읽어라 (id, goal, genomeVersion)

## Steps

### Phase 1: 회고 (Retrospective)

1. `.reap/life/backlog/`에서 `type: genome-change`와 `type: environment-change` 항목을 모두 읽어라
2. `.reap/life/03-implementation.md`에서 deferred 태스크 목록을 읽어라
3. 이번 세대에서 얻은 교훈을 정리하라
   - **제한**: 교훈은 최대 5개. 가장 영향력 있는 것만 남겨라.
4. genome에 반영할 변경 사항을 정리하라 (어떤 genome 파일을 어떻게 수정할지)

### Phase 2: 가비지 컬렉션 (Codebase Health)

5. `.reap/genome/conventions.md`의 Enforced Rules를 참고하여 코드베이스의 일관성을 점검하라:
   - conventions 위반이 새로 발생했는지 검사
   - 구현 중 생긴 기술 부채를 식별
6. 발견된 기술 부채 각각에 대해 `.reap/life/backlog/`에 추가하라:
   ```markdown
   ---
   type: task
   ---
   # [제목]
   [설명]
   ```

### Phase 3: Backlog 정리

7. deferred 태스크를 `.reap/life/backlog/`에 `type: task`로 추가하라
8. 그 외 다음 세대 목표 후보도 backlog에 추가하라
9. 인간과 함께 회고를 확정하라

### Phase 4: Genome 반영

10. `.reap/life/backlog/`에서 `type: genome-change`와 `type: environment-change` 항목을 읽어라
11. genome-change 항목들을 `.reap/genome/`의 해당 파일에 반영하라:
    - **맵 원칙**: 각 genome 파일은 **~100줄 이내**
    - 100줄 초과 시 `domain/` 하위 파일로 분리
    - **domain/ 파일 작성 시 `domain/README.md`의 가이드를 따르라**
12. environment-change 항목들을 `.reap/environment/`의 해당 파일에 반영하라
13. **검증**: constraints.md의 Validation Commands를 실행하여 genome 변경이 기존 코드와 충돌하지 않는지 확인하라
14. **인간 확인**: 변경된 genome/environment 내용을 인간에게 보여주고 확인을 받아라
    - 인간이 승인하기 전까지 변경을 확정하지 마라
15. 반영 완료된 `type: genome-change`와 `type: environment-change` backlog 항목은 삭제하라

## 자기 검증
산출물 저장 전에 확인하라:
- [ ] 교훈이 구체적이고 다음 세대에 적용 가능한가? (모호한 "더 잘하겠다" 금지)
- [ ] genome 변경이 인간에 의해 확인되었는가?
- [ ] Validation Commands가 변경 후에도 통과하는가?
- [ ] deferred 태스크가 backlog에 추가되었는가?

❌ 나쁜 교훈: "테스트를 더 많이 해야 한다"
✅ 좋은 교훈: "SSE 스트리밍 응답은 단위 테스트가 어려우므로 integration test를 우선하라"

## 산출물 생성
- `.reap/templates/05-completion.md`를 읽어라
- Retrospective와 Changelog를 기록하라
- `.reap/life/05-completion.md`에 저장하라

## 완료
- "`reap evolve --advance`로 세대를 마무리하세요. 자동으로 lineage 아카이빙이 수행됩니다." 안내

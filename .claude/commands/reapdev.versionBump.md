---
description: "Version bump — 변경 분석 후 bump 유형을 제안, 유저가 최종 결정"
---

# Version Bump

## Steps

1. 마지막 릴리스 태그 이후 변경사항 분석:
   - `git describe --tags --abbrev=0`으로 마지막 태그 확인
   - `git log {tag}..HEAD --oneline`으로 커밋 목록 확인
   - `.reap/lineage/`에서 해당 기간 generation들의 01-objective.md 스캔

2. 변경 유형 분류:
   - **patch**: bugfix, 성능 개선, 내부 리팩토링, 설정 변경, 문서 수정
   - **minor**: 새로운 기능 추가, 기존 기능 확장 (하위 호환)
   - **major**: breaking change, API 변경, 대규모 구조 변경

3. 분석 결과를 유저에게 제시:
   ```
   현재 버전: v{current}
   마지막 태그: v{tag}
   변경 사항:
   - [변경 1]
   - [변경 2]

   추천: {patch/minor/major} bump → v{next}
   ```

4. 유저에게 질문: "patch / minor / major / skip 중 선택해주세요"

5. 유저가 선택하면:
   - `npm version {type} --no-git-tag-version` 실행
   - RELEASE_NOTES.md 생성:
     a. 마지막 태그 이후의 `.reap/lineage/` 폴더들을 시간순으로 스캔
     b. 각 generation의 01-objective.md (Goal)과 05-completion.md (Summary)를 읽어 변경 내용 파악
     c. 형식:
        ```
        ## What's New
        - [주요 변경 1]
        - [주요 변경 2]

        ## Generations
        - **gen-XXX-{hash}**: [goal summary]
        - **gen-YYY-{hash}**: [goal summary]

        ## Breaking Changes
        [있으면 기술, 없으면 섹션 제거]
        ```
   - `git add package.json RELEASE_NOTES.md && git commit -m "chore: v{new} {type} bump"`
   - "v{new}로 bump 완료. 배포하려면 `git tag v{new} && git push origin main v{new}`"

6. skip 선택 시: 아무것도 하지 않음

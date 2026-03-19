---
condition: version-bumped
order: 40
---
Release note 생성 여부를 판단하라:
1. `git describe --tags --abbrev=0` 으로 마지막 릴리스 태그를 확인
2. `package.json`의 현재 version과 비교
3. 버전이 동일하면 skip
4. 버전이 다르면 (version bump가 있었으면):
   a. 마지막 태그 이후의 `.reap/lineage/` 폴더들을 시간순으로 스캔
   b. 각 generation의 01-objective.md (Goal)과 05-completion.md (Summary)를 읽어
      변경 내용을 파악
   c. RELEASE_NOTES.md를 프로젝트 루트에 생성. 형식:
      ```
      ## What's New
      - [주요 변경 1]
      - [주요 변경 2]

      ## Generations
      - **gen-XXX-{hash}**: [goal summary]
      - **gen-YYY**: [goal summary]

      ## Breaking Changes
      [있으면 기술, 없으면 섹션 제거]
      ```
   d. RELEASE_NOTES.md를 git에 커밋

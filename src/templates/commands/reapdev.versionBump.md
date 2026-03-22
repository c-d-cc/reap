---
description: "Version bump — 배포 산출물 검증 후 bump 유형을 제안, 유저가 최종 결정"
---

# Version Bump

## Steps

0. **배포 산출물 일관성 검증** (bump 실행 전 필수):

   아래 4가지 cross-check를 수행하고, 불일치가 하나라도 있으면 목록을 유저에게 보여준 뒤 "계속 진행 / 중단" 선택을 받는다. 모두 통과하면 "모든 검증 통과" 메시지를 출력하고 Step 1로 진행한다.

   ### 0-A. 슬래시 커맨드 ↔ COMMAND_NAMES 일치 검증
   - `src/templates/commands/` 디렉토리의 `.md` 파일 목록을 스캔 (파일명에서 `.md` 제거)
   - `src/cli/commands/init.ts`의 `COMMAND_NAMES` 배열 내용을 읽음
   - **양방향 비교**:
     - 파일은 있지만 `COMMAND_NAMES`에 없는 항목 → "누락: {name}이 COMMAND_NAMES에 없음"
     - `COMMAND_NAMES`에 있지만 파일이 없는 항목 → "누락: {name}.md 파일이 없음"

   ### 0-B. run script 매핑 검증
   - `COMMAND_NAMES`에서 `reap.`로 시작하는 항목 추출 (reapdev.* 제외)
   - 각 항목의 이름을 run script 파일명으로 변환:
     - `reap.refreshKnowledge` → `refresh-knowledge.ts`
     - `reap.sync.genome` → `sync-genome.ts`
     - `reap.merge.start` → `merge-start.ts`
     - 일반 규칙: `reap.` 접두사 제거 → `.`을 `-`로 변환 → camelCase를 kebab-case로 변환 → `.ts` 추가
   - `src/cli/commands/run/` 디렉토리에서 해당 `.ts` 파일 존재 여부 확인
   - 불일치 시 → "누락: {command}에 대응하는 run script {file} 없음"

   ### 0-C. help 텍스트 검증
   - `src/templates/help/en.txt`와 `ko.txt`를 읽음
   - 다음 주요 커맨드가 help 텍스트의 슬래시 커맨드 섹션에 포함되어 있는지 확인:
     - lifecycle: `start`, `evolve`, `objective`, `planning`, `implementation`, `validation`, `completion`
     - navigation: `next`, `back`
     - utility: `status`, `sync`, `help`
   - 누락 시 → "누락: {lang}.txt에 /reap.{command} 없음"

   ### 0-D. reap-guide.md 커맨드 참조 검증
   - `src/templates/hooks/reap-guide.md`에서 `/reap.` 패턴으로 참조되는 커맨드 목록 추출
   - 각 참조 커맨드가 `src/templates/commands/`에 대응하는 `.md` 파일을 가지는지 확인
   - 불일치 시 → "누락: reap-guide.md가 참조하는 /reap.{command}에 대응하는 커맨드 파일 없음"

   ### 검증 결과 출력
   - 불일치가 없으면: "배포 산출물 일관성 검증 통과 (4/4)"
   - 불일치가 있으면:
     ```
     배포 산출물 일관성 검증 결과:
     - [불일치 1]
     - [불일치 2]
     ...
     계속 진행하시겠습니까? (y/n)
     ```
   - 유저가 중단하면 여기서 종료

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

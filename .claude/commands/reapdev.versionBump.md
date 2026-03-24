---
description: "Version bump — 변경 분석 후 bump 유형을 제안, 유저가 최종 결정"
---

# Version Bump

## Steps

### Pre-check: Docs Consistency Gate

version bump 전에 `/reapdev.docsUpdate` 스킬을 실행하여 문서 일관성을 확인하라.
- `/reapdev.docsUpdate`를 실행
- 불일치가 발견되면 먼저 수정하고 유저 확인을 받아라
- 문서가 최신 상태임이 확인된 후에만 아래 Step으로 진행

0. **배포 산출물 일관성 검증** (bump 실행 전 필수):

   아래 4가지 cross-check를 수행하고, 불일치가 하나라도 있으면 목록을 유저에게 보여준 뒤 "계속 진행 / 중단" 선택을 받는다. 모두 통과하면 "모든 검증 통과" 메시지를 출력하고 Step 1로 진행한다.

   a. **README ↔ reap-guide.md**: 핵심 개념, 커맨드 목록, 워크플로우가 일치하는지
   b. **reap-guide.md ↔ Genome**: 라이프사이클 규칙, 커맨드 설명이 genome과 일치하는지
   c. **reap.help.md ↔ 실제 커맨드**: help topic 목록이 `src/templates/commands/reap.*.md`와 일치하는지
   d. **i18n 동기화**: README.md(en) 기준으로 ko/ja/zh-CN 구조가 일치하는지

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

5.5. **Release Notice 작성** (유저 컨펌 필수):
   - RELEASE_NOTES.md의 내용을 기반으로 `RELEASE_NOTICE.md` 파일 상단에 새 버전 항목을 추가한다
   - 분량: 평소 1-3줄, breaking change가 있으면 상세하게
   - 기존 형식을 따라 `## v{new}` 섹션을 파일 최상단 (`# Release Notices` 바로 아래)에 추가:
     ```
     ## v{new}
     ### en
     [English release notes]
     ### ko
     [한국어 릴리스 노트]
     ```
   - 초안을 유저에게 보여주고 컨펌을 받는다
   - 컨펌 후 `git add RELEASE_NOTICE.md && git commit --amend --no-edit`로 bump 커밋에 포함

5.6. **autoUpdateMinVersion 갱신** (breaking change 시에만):
   - major 또는 minor bump인 경우 (breaking change):
     a. package.json의 `reap.autoUpdateMinVersion`을 새 버전으로 업데이트
     b. 예: 0.15.x에서 0.16.0으로 bump 시, `autoUpdateMinVersion`을 `"0.16.0"`으로 변경
     c. `git add package.json && git commit --amend --no-edit`로 bump 커밋에 포함
   - patch bump인 경우: autoUpdateMinVersion 변경 불필요

6. **태그 생성 및 배포** (유저 컨펌 필수):
   - 유저에게 질문: "`v{new}` 태그를 생성하고 push할까요? (yes / no)"
   - yes: `git tag v{new} && git push origin main v{new}` 실행
   - no: "태그 생성을 건너뜁니다. 나중에 수동으로: `git tag v{new} && git push origin main v{new}`" 안내

7. skip 선택 시: 아무것도 하지 않음

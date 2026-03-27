---
description: "Resolve Issue — GitHub Issue를 분석하고 해결"
---

# Resolve Issue

GitHub Issue를 분석하고 REAP generation으로 해결합니다.

## Steps

1. Issue 목록 확인:
   - `gh issue list --repo c-d-cc/reap --state open` 실행
   - 목록을 유저에게 제시
   - 유저가 해결할 issue 번호 선택 (또는 인자로 전달)

2. Issue 상세 읽기:
   - `gh issue view {number} --repo c-d-cc/reap`
   - label, 설명, 재현 단계, config 정보 파악

3. 분석 및 방향 제시:
   - issue 내용을 분석하여 원인 추정
   - 수정 방향을 유저에게 제시
   - 유저 승인 후 진행

4. Generation 시작:
   - `/reap.start`로 generation 시작
   - goal 형식: `resolve #[number]: [issue title]`
   - current.yml에 `resolves: [number]` 필드 추가
   - 01-objective.md에 issue 링크 + 내용 인용 포함
   - `/reap.evolve`로 전체 lifecycle 실행

5. 해결 후 Issue에 코멘트:
   - `gh issue comment {number} --repo c-d-cc/reap --body "{comment}"`
   - 코멘트 형식:
     ```
     Resolved in generation `{gen-id}`.

     ### Changes
     - [주요 변경 1]
     - [주요 변경 2]

     Fix will be available in the next release.
     ```

6. Issue 닫기:
   - `gh issue close {number} --repo c-d-cc/reap`
   - 유저에게 version bump + release 여부 확인

---
id: gen-058-c24cf8
type: embryo
goal: "fix: merge generation에서 strict merge mode 자동 bypass"
parents: ["gen-057-3ce703"]
---
# gen-058-c24cf8
`buildStrictSection()`에 `generationType` 파라미터를 추가하여 merge generation에서 strict merge mode가 자동 bypass되도록 수정. 변경 파일 3개, 테스트 6건 추가.

수정 전: merge generation의 merge stage에서도 HARD-GATE가 git merge를 차단 (gen-052에서 발생한 문제).
수정 후: merge generation이면 HARD-GATE 대신 "BYPASSED" 안내 출력. git merge 허용, pull/push는 계속 제한.
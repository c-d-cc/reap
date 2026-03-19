---
type: genome-change
status: consumed
consumedBy: gen-035
target: genome/domain/hook-system.md
---
# Hook conditions를 스크립트 기반으로 전환

- Conditions 섹션 추가: `.reap/hooks/conditions/{name}.sh` 스크립트 기반
- exit 0 = true, non-zero = false
- 기본 제공: always.sh, has-code-changes.sh, version-bumped.sh
- 유저 커스텀: 파일 추가만으로 동작

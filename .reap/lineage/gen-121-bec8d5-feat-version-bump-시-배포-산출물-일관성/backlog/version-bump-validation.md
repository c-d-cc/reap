---
type: task
status: consumed
consumedBy: gen-121-bec8d5
---

# version bump 시 배포 산출물 일관성 검증 추가

`/reapdev.versionBump` 실행 시 사용자에게 배포되는 산출물 간 일관성을 검증하는 단계 추가.

## 검증 대상 (src/ 내 배포 산출물 기준)

1. **슬래시 커맨드 목록 일치**
   - `src/templates/commands/` 실제 파일 vs `src/templates/hooks/reap-guide.md`(constraints 섹션) 명시 목록
   - `src/cli/commands/run/` script 파일 vs 커맨드 템플릿 매핑

2. **help 텍스트 동기화**
   - `src/templates/help/` 언어별 파일이 현재 커맨드 목록을 반영하는지

3. **guide-readme-docs 용어/구조 일치**
   - `src/templates/hooks/reap-guide.md` (guide) vs `README.md` (readme) vs `docs/` (docs) 핵심 용어·구조 일치

## 참고

- `.reap/` 폴더는 이 프로젝트 자체의 REAP 관리 폴더이므로 검증 대상 아님
- 검증 범위는 사용자가 `npm install -g`로 설치하는 산출물(src/, templates/)

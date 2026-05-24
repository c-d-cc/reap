---
id: gen-041-243ec9
type: embryo
goal: "environment 구조 개선 — resources/docs 디렉토리 복원 + migration 반영"
parents: ["gen-040-773bb9"]
---
# gen-041-243ec9
environment 구조에 resources/와 docs/ 디렉토리를 추가했다. 외부 원본 문서(API docs, SDK 스펙)와 참고 문서를 저장할 전용 공간이 생김.

### 주요 변경
- `paths.ts`: `environmentResources`, `environmentDocs` 경로 추가
- `init/common.ts`: init 시 두 디렉토리 생성
- `migrate.ts`: v0.15에서 resources/docs 존재 시 복사 (방어적)
- `integrity.ts`: optional dirs에 추가
- `reap-guide.md`: template + 프로젝트 로컬 복사본에 구조 설명 추가

테스트: 406 pass (기존 전체 통과, 추가 없음 -- 구조적 변경이라 기존 scenario test가 커버)
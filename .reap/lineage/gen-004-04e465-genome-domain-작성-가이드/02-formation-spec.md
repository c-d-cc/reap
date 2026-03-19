# Gen-004 Formation: genome/domain 작성 가이드 명세

## 기능 요구사항

### FR-001: domain/ 작성 가이드 템플릿
- `src/templates/genome/domain/README.md` 파일 생성
- init 시 `.reap/genome/domain/README.md`로 복사됨
- 포함 내용:
  - domain/ vs 상위 genome 파일 구분 기준
  - 파일 구성 원칙 (비즈니스 도메인 단위, 코드에서 읽을 수 없는 지식, 에이전트 행동 가능 수준)
  - 파일 구조 템플릿
  - 네이밍 규칙
  - 생성/비생성 판단 기준

### FR-002: 슬래시 커맨드 업데이트
- **conception**: domain health check를 README.md 기준으로 보강
  - domain/에 README.md가 없으면 "가이드 미설치" 플래그
  - domain/ 파일이 있으면 각 파일의 맵 원칙(~100줄) 준수 여부 검사
- **formation**: domain 갭 분석 시 README.md의 판단 기준 참조 지시 추가
- **birth**: domain 파일 작성/수정 시 README.md 규칙 준수 지시 추가

### FR-003: genome principles 업데이트
- principles.md Core Beliefs에 domain 관련 원칙 추가
- "domain/은 비즈니스 규칙의 상세를 담는다 — 코드 구조가 아닌 도메인 단위로 분리"

## 비기능 요구사항

- 기존 테스트 깨지지 않을 것
- 기존 CLI 코드 변경 없음 (템플릿/문서만)

## 수용 기준

- `bun test` 전체 통과
- `bunx tsc --noEmit` 통과
- domain/README.md가 init 후 프로젝트에 존재
- 슬래시 커맨드 3개에서 domain/ 가이드 참조

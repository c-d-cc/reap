# Technical Constraints

> **작성 원칙**: 이 파일은 ~100줄 이내의 **맵(map)**이어야 한다.
> 기술 선택의 "무엇"뿐 아니라 "왜"를 반드시 기록하라.
> 에이전트가 기술 결정을 내릴 때 이 파일을 참조한다.
> Birth 단계에서만 수정된다.

## Tech Stack

각 기술 선택의 사유를 간략히 기록한다.

- **Language**: (언어 및 버전) — 선택 사유:
- **Framework**: (프레임워크) — 선택 사유:
- **Database**: (데이터베이스) — 선택 사유:
- **Runtime**: (런타임 환경) — 선택 사유:

## Constraints

에이전트가 구현 시 반드시 지켜야 할 기술적 제약.

- (여기에 기술 제약 추가)

## Validation Commands

프로젝트의 테스트/린트/빌드 명령어. Validation 단계에서 자동 실행된다.

| 용도 | 명령어 | 설명 |
|------|--------|------|
| 테스트 | | 예: `npm test`, `bun test` |
| 린트 | | 예: `npm run lint` |
| 빌드 | | 예: `npm run build` |
| 타입체크 | | 예: `tsc --noEmit` |

## External Dependencies

외부 서비스, API 등. 에이전트가 접근할 수 없는 외부 의존성을 명시하라.

- (외부 서비스, API 등)

# Visual Companion Guide

> REAP Objective 단계에서 비주얼 컴패니언을 사용하는 가이드.
> `reap.objective` 슬래시 커맨드가 이 파일을 참조한다.

## 비주얼 컴패니언이란

로컬 Node.js 서버를 통해 브라우저에 목업, 다이어그램, 비교 카드 등을 표시하여 설계 논의를 시각적으로 보조하는 도구.
외부 의존 없이 Node.js 내장 모듈만 사용한다.

## 제안 시점

Objective Step 5(Goal + Spec Definition) 진입 시, 시각적 질문이 예상되면 컴패니언을 제안한다.
제안 메시지는 **독립 메시지**로 보내야 한다 (다른 질문과 합치지 않는다):

> "이번 설계에서 목업이나 다이어그램으로 보여드리면 이해하기 쉬운 부분이 있을 수 있습니다.
> 브라우저에서 시각 자료를 보여드릴 수 있는 비주얼 컴패니언을 사용할까요?
> (로컬 서버를 띄워 브라우저에서 확인하는 방식입니다)"

유저가 거부하면 터미널 전용으로 진행한다.

## 브라우저 vs 터미널 판단 규칙

각 질문마다 판단: **유저가 읽는 것보다 보는 것이 이해에 도움이 되는가?**

### 브라우저 사용
- UI 목업, 와이어프레임, 레이아웃
- 아키텍처 다이어그램, 시스템 구성도, 데이터 흐름 맵
- 나란히 비교 (레이아웃, 색상, 디자인 방향)
- 디자인 폴리시 (느낌, 간격, 비주얼 위계)
- 공간 관계 (상태 머신, 플로우차트, ERD를 다이어그램으로)

### 터미널 사용
- 요구사항, 범위 질문 ("X는 무슨 뜻인가요?")
- 개념적 A/B/C 선택 (텍스트로 설명 가능한 접근법)
- 트레이드오프 목록, 비교표
- 기술 결정 (API 설계, 데이터 모델링, 아키텍처 접근)
- 명확화 질문 (답이 시각적 선호가 아닌 말)

### 핵심 테스트

UI 관련 질문이라도 자동으로 비주얼은 아니다.
- "어떤 종류의 마법사를 원하시나요?" → 개념적 → **터미널**
- "어떤 마법사 레이아웃이 좋으세요?" → 시각적 → **브라우저**

## 서버 기동

서버 파일은 REAP 패키지에 포함되어 있으므로 프로젝트에 복사할 필요 없음.

```bash
# npm 글로벌 패키지 경로에서 실행
node "$(npm root -g)/@c-d-cc/reap/dist/templates/brainstorm/server.cjs"
# 또는 start-server.sh 사용
bash "$(npm root -g)/@c-d-cc/reap/dist/templates/brainstorm/start-server.sh"
```

- `BRAINSTORM_PORT` 환경 변수로 포트 변경 (기본: 3210)
- `BRAINSTORM_DIR` 환경 변수로 스크린 디렉토리 변경 (기본: `.reap/brainstorm/` — HTML 파일만 저장)

## 서버 상태 확인

- `.reap/brainstorm/.server-info` — 서버 실행 중이면 JSON 존재 (url, port, pid)
- `.reap/brainstorm/.server-stopped` — 서버가 종료되면 생성됨
- 서버가 종료된 상태에서 재기동 필요: `start-server.sh` 재실행

## HTML 작성 규칙

1. `.reap/brainstorm/` 디렉토리에 HTML 파일을 Write 도구로 작성
2. 시맨틱 파일명 사용 (`architecture.html`, `layout-options.html`)
3. 파일명 재사용 금지 (수정 시 `layout-v2.html` 사용)
4. **Content fragment 기본** — `<!DOCTYPE` 없이 본문만 작성하면 프레임 템플릿이 자동 래핑
5. 전체 HTML 제어가 필요한 경우만 full document 작성

## 사용 가능한 CSS 클래스

| 클래스 | 용도 |
|--------|------|
| `.options` + `.option[data-choice]` | A/B/C 단일 선택 |
| `.options[data-multiselect]` | 다중 선택 |
| `.cards` + `.card[data-choice]` | 비주얼 디자인 카드 |
| `.mockup` + `.mockup-header` + `.mockup-body` | 목업 컨테이너 |
| `.split` | 나란히 비교 |
| `.pros-cons` + `.pros` + `.cons` | 장단점 |
| `.mock-nav`, `.mock-sidebar`, `.mock-content` | 목업 UI 요소 |
| `.mock-button`, `.mock-input` | 목업 인터랙티브 요소 |
| `.placeholder` | 플레이스홀더 블록 |
| `table`, `h2`, `h3`, `.subtitle`, `.section`, `.label` | 타이포그래피 |

## 이벤트 읽기

유저가 브라우저에서 `[data-choice]` 요소를 클릭하면 WebSocket을 통해 `.events` 파일에 JSON Lines로 기록된다:

```json
{"type":"click","choice":"a","text":"Option A","timestamp":1706000101}
```

- 터미널 메시지가 주 피드백 채널
- `.events` 파일은 보조 인터랙션 데이터
- 새 HTML 파일 푸시 시 `.events`는 자동 초기화

## 턴 기반 흐름

1. HTML 파일을 Write 도구로 작성
2. 유저에게 URL 안내 + 간략한 텍스트 설명 → **턴 종료**
3. 다음 턴에서 `.events` 파일 읽기 (유저 인터랙션 확인)
4. 터미널 메시지 + `.events`를 종합하여 다음 단계 진행
5. 터미널로 돌아갈 때 대기 화면 푸시:
   ```html
   <div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
     <p class="subtitle">터미널에서 계속 진행 중...</p>
   </div>
   ```

## 조건부 실행

비주얼 컴패니언은 brainstorming이 활성화된 경우에만 제안된다.
brainstorming 자체가 목표 복잡도에 따라 조건부로 실행되므로, 단순 태스크(bugfix, config, docs-only)에서는 비주얼 컴패니언도 제안되지 않는다.

## evolve 모드에서의 동작

`/reap.evolve`의 Autonomous Override가 활성화되어 있어도, brainstorming 진입 시 비주얼 컴패니언 제안은 수행한다.
유저가 명시적으로 거부한 경우에만 스킵한다.

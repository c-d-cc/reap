# 3 — 목차 골격, 홈 복원, 시작하기 4쪽

## 골격
- `routes.ts`·`AppSidebar`·`nav`에 8묶음 28라우트 전부. 아직 안 쓴 쪽은 자리 표시 페이지(제목 + "이 문서는 준비 중입니다." 한 줄) — 링크가 깨지지 않게. prerender 검사는 라우트 수를 routes.ts에서 세므로 그대로
- 라우트 이름은 영문 kebab: `/docs/introduction` `/docs/quick-start` `/docs/autonomous-evolution` `/docs/v018change` / `/docs/two-axes` `/docs/three-layers` `/docs/storage` / `/docs/loop` `/docs/plan-source` `/docs/idea` `/docs/carve-milestone` / `/docs/generation` `/docs/delegation` `/docs/backlog` `/docs/closing-milestone` / `/docs/genome` `/docs/environment` `/docs/vision-memory` `/docs/code-intelligence` / `/docs/orchestrate` `/docs/claim-barrier` `/docs/hooks` / `/docs/skill-reference` `/docs/cli-reference` `/docs/configuration` `/docs/doctor` / `/docs/comparison` `/docs/migration` `/docs/release-notes`

## 홈
v0.17 `HeroPage.tsx`의 섹션 구조와 ko 문구를 바탕으로 v0.18 사실만 교체. 띠는 유지.

## 시작하기 4쪽
소개(v0.17 Introduction 골격: 정의·왜·구조 개요·프로젝트 구조 트리) · 빠른 시작(v0.17 QuickStart 골격: 전제·설치·초기화·첫 바퀴·다음 단계) · 자율 진화 흐름(신설: 상태 줄 → evolve 판단 → 일한다 → complete, 실물 상태 줄 예시) · v0.18에서 바뀐 것(있는 것을 톤만 맞춤)

## 완료
build·prerender 검사 통과, 사람 검수 대기

---
type: task
status: consumed
consumedBy: gen-020
priority: high
title: "strict 모드 — REAP workflow 없이 소스 수정 방지"
---

## 개요
strict 모드가 켜져있으면 AI가 REAP lifecycle 외부에서 코드 수정을 거부한다.

## 동작 원리
- `.reap/config.yml`에 `strict: true` 옵션 추가
- SessionStart hook (reap-guide.md 또는 session-start.sh)에서 strict 상태를 감지
- strict 모드일 때 AI에게 주입되는 규칙:
  - 활성 Generation이 없으면 코드 수정 거부 ("먼저 /reap.start로 Generation을 시작하세요")
  - 활성 Generation이 있어도 implementation stage가 아니면 코드 수정 거부
  - 읽기/분석/질문 답변은 허용
  - 사용자가 명시적으로 override 요청하면 허용 (escape hatch)

## 구현 방향
- session-start.sh에서 config.yml의 strict 값을 읽어서 가이드에 포함
- reap-guide.md에 Strict Mode 섹션 추가 (조건부 주입)
- CLI에 `reap config strict on/off` 또는 config.yml 직접 수정

## 변경 파일
- `src/templates/hooks/session-start.sh` — strict 감지 + 가이드 주입
- `src/templates/hooks/reap-guide.md` — Strict Mode 규칙 섹션
- `.reap/config.yml` 스키마에 `strict` 필드 추가

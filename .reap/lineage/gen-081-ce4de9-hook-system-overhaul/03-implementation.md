# Implementation

## Changes
- types/index.ts: ReapHookEvent 16개 stage-level 이벤트로 교체
- genome: constraints.md + domain/hook-system.md 전면 재작성
- .reap/hooks/: onGenerationComplete → onLifeCompleted 파일 리네임
- command templates: reap.start, reap.next, reap.back, reap.completion, reap.help — 이벤트명 교체 + stage별 hook 발동 로직
- reap-guide.md: hook event 목록 + conditions + execution 섹션 업데이트
- docs 번역 4개: eventItems 16개 교체, Normal/Merge 분리, condition 설명 수정, configExample 수정
- docs UI: HooksPage 생성 (HookReferencePage → HooksPage 리네임), Normal/Merge Events 분리 렌더
- docs UI: max-w-5xl, sidebar 176px, 본문 800px, 모바일 bottom padding, 버튼 높이
- README 4개: hook 테이블 16개, condition 설명, docs 링크(↗), CLI Commands 링크

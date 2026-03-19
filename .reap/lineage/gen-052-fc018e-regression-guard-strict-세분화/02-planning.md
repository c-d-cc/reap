# Planning

## Summary

3가지 경량 개선을 한 generation에서 처리: regression planning append, evolve workflow guard 강화, strict 모드 세분화.

## Tasks

### T1: lifecycle-rules.md — regression planning append
- "target stage: 덮어쓰기 (planning과 implementation은 append)" 로 변경

### T2: reap.evolve.md — HARD-GATE 강화
- 기존 HARD-GATE에 "stage 전환 시 반드시 /reap.next slash command를 invoke해야 함. node script로 current.yml을 직접 수정하는 것은 위반" 추가

### T3: reap.next.md — 유일한 stage 전환 수단 명시
- "이 command가 stage를 전환하는 유일한 정당한 수단" 강조

### T4: types/index.ts — ReapConfig.strict 타입 확장
- `strict?: boolean | { edit?: boolean; merge?: boolean }`

### T5: config.ts — resolveStrict() 함수
- boolean → `{ edit, merge }` 변환
- 기본값: `{ edit: false, merge: false }`

### T6: genome-loader.cjs — strictMerge 빌드
- strict 설정 읽기 시 object 지원
- strictMerge일 때 session-start 출력에 경고 메시지 추가

### T7: tsc, bun test, build 검증

## Dependencies
```
T1 (독립)
T2, T3 (독립)
T4 → T5 → T6 → T7
```

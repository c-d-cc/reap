---
id: gen-0073-exec
slug: live-migration
type: exec
milestone: ms-015
title: 실물 검증 — 진짜 v0.17 데이터로 migration을 수행한다
startedAt: 2026-08-31T14:12:48Z
startCommit: d551261
status: closed
closedAt: 2026-08-31T14:24:26Z
endCommit: 636d9fc
---
## Intent

ms-015 task 4 — reap main의 `.reap/` 실물로 표본을 만들어 migrate skill 절차를 그대로 수행. 이주는 지시문(migration-map.md)만 주고 실제 subagent가 하게 해 "지시만으로 지켜지는가"까지 검증. 끝은 doctor 0 + 기록 파일 + 원본 무손상 + 수행 로그.

## Outcome

실물(reap main의 .reap — lineage 100·memory 172줄·goals 50줄·design 7·열린 ms 1)로 8단계 전부 수행:
- 판정 지문 정확(autoSubagent 등 + 3단 memory), dirty 차단 작동, 되돌리기 실시험 원상 복구, init 후 language korean→ko 승계
- **이주는 지시문(migration-map.md)만 준 실제 subagent가 수행** — 공통 규칙 3(원본 읽기 전용·id 도구 발급·조용히 안 버림) 전부 준수. lessons 34→32 선별(제외 2건 사유 명시), 열린 ms 1건 재생성(+goal 참조 처리 각주), goals 초안(완료 6건 제외 근거), design→idea 6건, 폐기 config 8종 목록화
- doctor **결함 0** · 참고 4(구 genome 크기·lessons 누적 — 실물 특성, 기록 파일이 사용자에게 안내), 원본 무손상 0건, 기록 파일 `.reap/archive/migration-v0_17.md` 작성 완료

## Dead Ends

- **language 형식 차이(korean vs ko)가 skill에 없었다** — 실물이 잡았고 skill 5/8에 변환 표로 반영(v0.18 89315c0). 상상으로 쓴 매핑은 실물 한 번에 마찰이 나온다 — 실물 검증을 Exit Criteria에 넣은 것이 옳았다

## References

- 표본: scratchpad/migration-specimen (2커밋 — 격리·이주) · v0.18: 89315c0(변환 표)

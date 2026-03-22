---
type: task
status: consumed
consumedBy: gen-145-864402
---

# reap update-genome — generation 없이 genome-change backlog 적용

## 개요

generation 공백기에 pending genome-change backlog를 적용하는 CLI subcommand.
소스 코드 수정 없이 순수 genome 지식/규칙만 업데이트.

## 요구사항

- generation이 없는 공백기에만 실행 가능 (active generation 있으면 에러)
- pending genome-change backlog만 대상 (task, environment-change 제외)
- `.reap/genome/` 파일만 수정 허용 (소스 코드 수정 불가)
- 적용 후 backlog를 consumed 마킹 (consumedBy: "update-genome")
- genomeVersion 증가
- 적용 내역을 커밋 메시지에 포함

## 흐름

```
reap update-genome
  → active generation 확인 (있으면 차단)
  → pending genome-change backlog scan
  → 없으면 "no pending genome changes" 종료
  → 있으면 목록 + 내용을 AI에게 JSON stdout으로 prompt 전달
  → AI가 genome 파일 수정
  → AI가 reap update-genome --phase complete 호출
  → backlog consumed 마킹 + genomeVersion 증가
```

## 구현 대상

- `src/cli/commands/update-genome.ts` (신규 — CLI subcommand)
- `src/cli/index.ts` (subcommand 등록)
- 슬래시 커맨드 불필요 (CLI subcommand로 충분, AI가 직접 실행)

---
type: task
status: consumed
consumedBy: gen-103-15e966
---

# reap.help command description 다국어 지원

## 현상
- help의 command description이 한글로 하드코딩
- language 설정과 무관하게 항상 한글 출력

## 기대 동작
- config.yml의 language에 따라 description 언어 변경
- en, ko, ja, zh-CN: 사전 정의된 번역 사용 (help.ts 내부 또는 별도 파일)
- 그 외 language: AI에게 번역 prompt (status: "prompt")
- 사전 정의 형식: `{ en: "Start a new Generation", ko: "새 Generation을 시작하고 goal을 설정", ja: "...", "zh-CN": "..." }`

## 관련 코드
- `src/cli/commands/run/help.ts` — command table 하드코딩 부분

# REAP MANAGED — Do not modify directly. Use reap run commands.
# Planning

## Tasks

### Task 1: help.ts 다국어 command descriptions
- help.ts에 4개 언어 사전 정의 descriptions 객체 추가
- config.yml에서 language 읽기
- en/ko/ja/zh-CN → 해당 언어 descriptions 사용
- 기타 language → status "prompt"로 AI에게 번역 위임 (영어 원문 + target language 제공)
- 테스트 업데이트

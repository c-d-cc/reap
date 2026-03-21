# REAP MANAGED — Do not modify directly. Use reap run commands.
# Objective

## Goal
help command description 다국어 지원 — en/ko/ja/zh-CN 사전 정의, 기타 language는 AI 번역

## Completion Criteria
- help.ts에서 config.language에 따라 command table description 언어 변경
- en, ko, ja, zh-CN: 하드코딩된 번역 사용
- 기타 language: status "prompt"로 AI에게 번역 위임
- 기존 테스트 유지 + 신규

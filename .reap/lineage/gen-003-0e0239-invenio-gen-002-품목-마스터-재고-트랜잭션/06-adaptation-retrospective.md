# Adaptation Retrospective — Gen-003

## 잘된 점
- 중첩 세대 패턴(reap-wf Gen-003 > invenio Gen-002) 실행 성공
- invenio Gen-002 8단계 완주로 워크플로우 실전 검증 지속
- mut-005 발견으로 문서화 필요성 확인

## 개선할 점
- 중첩 세대 패턴이 conception/growth 템플릿에 명시되지 않음 (mut-005)
- dog-fooding 시 외부 프로젝트에 reap CLI가 없어 수동 stage 전환 필요
- 커밋 타이밍: 세대 완주 후 커밋해야 하는데 Growth 중간에 커밋하는 실수 발생

## Genome 변경 제안
- principles.md에 "dog-fooding 시 외부 프로젝트 세대는 현재 프로젝트 Growth 안에서 실행" 패턴 추가 (mut-005 반영)

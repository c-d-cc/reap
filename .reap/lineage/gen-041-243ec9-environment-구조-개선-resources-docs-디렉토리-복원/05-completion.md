# Completion -- gen-041-243ec9

## Summary

environment 구조에 resources/와 docs/ 디렉토리를 추가했다. 외부 원본 문서(API docs, SDK 스펙)와 참고 문서를 저장할 전용 공간이 생김.

### 주요 변경
- `paths.ts`: `environmentResources`, `environmentDocs` 경로 추가
- `init/common.ts`: init 시 두 디렉토리 생성
- `migrate.ts`: v0.15에서 resources/docs 존재 시 복사 (방어적)
- `integrity.ts`: optional dirs에 추가
- `reap-guide.md`: template + 프로젝트 로컬 복사본에 구조 설명 추가

테스트: 406 pass (기존 전체 통과, 추가 없음 -- 구조적 변경이라 기존 scenario test가 커버)

## Lessons Learned

- v0.15 참조 확인 결과 실제로 resources/docs가 없었음. backlog 설명과 실제 상태가 달랐으나, "없어도 방어적으로 처리"하는 접근이 올바른 선택. migration은 존재할 경우에만 동작하므로 부작용 없음.
- 변경 범위가 작고 명확할 때는 별도 테스트 추가 없이 기존 테스트 커버리지로 충분한 경우가 있음. 이번 변경은 paths 추가 + ensureDir + cp 패턴이라 기존 init/migrate scenario가 이미 유사한 패턴을 검증.

## Next Generation Hints

- docs 페이지(EnvironmentPage.tsx, i18n)에 resources/docs 설명 추가 필요 -- 이번 범위 밖으로 명시함
- prompt.ts에서 environment resources/docs를 on-demand 로딩하는 기능은 필요 시 별도 구현 (현재는 summary.md에서 언급만)

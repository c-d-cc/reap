Version bump 필요 여부를 판단하라:
1. 방금 완료된 generation의 lineage artifacts를 읽어 변경 내용을 파악
   (`.reap/lineage/`에서 가장 최근 폴더의 01-objective.md, 05-completion.md)
2. 변경 유형을 분류:
   - **patch**: bugfix, 성능 개선, 내부 리팩토링, 설정 변경, 문서 수정
   - **minor**: 새로운 기능 추가, 기존 기능 확장 (하위 호환)
   - **major**: breaking change, API 변경, 대규모 구조 변경
3. patch인 경우:
   - `npm version patch --no-git-tag-version` 자동 실행
   - "Version bumped to v{new}" 메시지 출력
4. minor 또는 major인 경우:
   - 유저에게 "이번 변경은 {minor/major} 수준으로 판단됩니다. version bump를 진행할까요?" 확인
   - 유저가 동의하면 `npm version {type} --no-git-tag-version` 실행
   - 유저가 거부하면 skip
5. 변경 내용이 docs-only이거나 REAP artifacts만 변경된 경우: version bump skip

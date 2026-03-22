---
type: task
status: consumed
priority: high
consumedBy: gen-129-b3e864
---

# E2E 테스트: reap clean / reap destroy

## 테스트 시나리오

### reap destroy
1. `reap init` → 프로젝트 생성
2. `reap destroy` 실행 — 잘못된 확인 입력 시 취소되는지 확인
3. `reap destroy` 실행 — 정확한 확인 입력(`destroy [project-name]`) 시 삭제 확인
4. 삭제 후 상태: `.reap/`, `.claude/skills/reap.*`, `.claude/commands/reap.*`, CLAUDE.md REAP 섹션, .gitignore REAP 항목 모두 제거됨
5. 이미 destroy된 프로젝트에서 다시 실행 시 graceful 처리

### reap clean
1. `reap init` → generation 1~2개 완료 → lineage 생성
2. `reap clean` — lineage compress 옵션: lineage가 epoch로 압축되는지 확인
3. `reap clean` — lineage delete 옵션: lineage 완전 삭제 확인
4. hooks keep/reset 옵션 동작 확인
5. genome template override + sync 동작 확인
6. backlog keep/delete 동작 확인
7. active generation 경고 + 취소 동작 확인

### OpenShell sandbox에서 실행
- `npm run build && npm pack`
- `openshell run tests/e2e/clean-destroy-e2e.sh --upload *.tgz`
- interactive prompt는 stdin pipe로 전달 (echo "input" | reap destroy 등)

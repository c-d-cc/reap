# 6 — 협업 3 + 레퍼런스 4 + 기타 3

| 라우트 | 쪽 | 상태 | 담을 것 | v0.17 참고 |
|---|---|---|---|---|
| /docs/orchestrate | Orchestrate | 있음 → 톤·목차 맞춤 | 병렬 세션, worktree로 가르기, 역할 명명, 메시지 kind 관례, id는 조율자가 발급, submodule worktree --force. claim·barrier 상세는 다음 쪽으로 넘기고 링크 | DistributedOverviewPage |
| /docs/claim-barrier | Claim과 Barrier | 신설 | claim(O_EXCL·TTL·탈취 로그)·release·barrier(--expect·--timeout 필수·누가 안 왔는지)·roster·status, 공유 상태 위치(~/.reap/orch/<workspace-id>/), 실물 출력 | MergeCommandsPage 형식 |
| /docs/hooks | Hooks | 있음 → 톤·목차 맞춤 | 그대로 | HooksPage |
| /docs/skill-reference | Skill 레퍼런스 | 있음 → 톤·목차 맞춤 | 10종 표 + 각 절, 위임 모드·migrate 반영 확인 | CommandReferencePage |
| /docs/cli-reference | CLI 레퍼런스 | 있음 → 톤·목차 맞춤 | usage 원문 + 계열별 설명, `plan sources`는 등록부 | CLIPage |
| /docs/configuration | 설정 | 신설 | config.yml 필드(language·agentClient·workspaceId), `REAP_LANG`, 언어 해석 순서, `.reap/templates/` 오버라이드, `.gitignore`(.session·.index) | ConfigurationPage |
| /docs/doctor | Doctor | 신설 | 결함과 참고의 구분, 검사 항목 목록, 안내선 숫자(src/doctor.ts GUIDE), 고치지 않는다, 실물 출력 | (신설) |
| /docs/comparison | 비교 | 신설 | v0.17 ComparisonPage 골격으로 — 스펙 기반 도구·에이전트 워크플로·단순 CLAUDE.md와의 차이를 v0.18 관점(두 축·자율 evolve·fitness)으로 | ComparisonPage |
| /docs/migration | v0.17에서 이주 | 있음 → 톤 확인 | selfview 실물 이주(2026-09-05)에서 배운 것 반영: 기록 파일 예시, backlog 재발급 판단, design 하위 문서 링크 | MigrationGuidePage |
| /docs/release-notes | 릴리즈 노트 | 있음 | RELEASE_NOTES.md 그대로 | |

규칙은 task 4·5와 같다.

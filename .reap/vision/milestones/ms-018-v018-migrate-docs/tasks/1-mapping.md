# 1 — 매핑 보강과 실물 재검증

## 손댈 곳

| 파일 | 무엇 |
|---|---|
| `plugin/skills/migrate/references/migration-map.md` | 매핑 #10 environment/ (04-migrate-docs 표), #9 hooks를 "대응 2종 이주 + conditions 복사 + 나머지 기록"으로 |
| `plugin/skills/migrate/SKILL.md` | 3/8 분량 실측에 environment/·hooks 개수 추가, 8/8 기록 형식에 절 추가 |
| `plugin/skills/migrate/scripts/detect-version.sh` | ms-017이 conditions/를 표지에서 뺐는지 확인 |

## 실물 재검증

`~/cdws/reap_v17/.reap`을 scratchpad에 복사해 표본을 만들고 skill 8단계를 그대로 수행 — 6/8은 지시문만 준 subagent. 끝은 doctor 0 · `.reap/environment/summary.md`가 원본과 같고 · hooks 대응 파일이 `.reap/hooks/`에 있고 · 기록 파일에 environment·hooks 절.

## 함정

- `environment/summary.md`가 5단계 lifecycle을 말하면 "이행 안내 대상"이지 수정 대상이 아니다
- 원본 `hooks/*.example`은 훅이 아니다 — 옮기지 않고 기록

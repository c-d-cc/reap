# 4 — 실물 검증

reap main의 `.reap/`(진짜 v0.17 데이터 — lineage 40+·memory 3단·goals·design)을 임시 git 프로젝트에 복사하고, migration skill의 절차를 이 세션이 그대로 따라 수행한다.

## 검증할 것

- 판정이 v0.17을 맞게 감지, uncommitted 차단이 실제로 막는지(더럽혀서 확인), 격리 후 되돌리기(역방향 mv)가 원상 복구하는지
- 이주 결과: doctor 결함 0, 기록 파일 존재, lessons가 "전부 복사"가 아니라 선별인지, `.reap-v0_17/`이 무손상인지 (diff로)
- Exit Criteria의 실물 검증 항목이 이것으로 선다

## 완료 판정

세대 기록에 수행 로그 요지와 doctor 출력이 있다

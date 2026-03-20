---
type: task
status: pending
---
# docs 수정 시 앱 실행 + 유저 컨펌 프로세스

docs-update hook에서 문서 수정 후:
1. `cd docs && npm run dev`로 docs 앱을 실행
2. 브라우저에서 변경된 페이지를 열어 유저에게 보여주기
3. 유저의 명시적 확인("확인", "ok" 등)을 받은 후에만 다음 단계 진행
4. 유저가 수정 요청하면 수정 후 다시 보여주기

현재는 docs-update hook이 자동으로 수정만 하고 넘어감.
유저가 실제 렌더링 결과를 확인할 수 있도록 프리뷰 단계 추가 필요.

# Development Conventions

> **작성 원칙**: 이 파일은 ~100줄 이내의 **맵(map)**이어야 한다.
> 규칙은 가능한 한 기계적으로 검증 가능하게 작성하라.
> Completion 단계에서만 수정된다.

## Code Style

- TypeScript strict mode 사용
- 함수는 단일 책임, 50줄 이하 권장
- `async/await` 사용 (콜백/then 체인 금지)
- 에러는 호출자에게 throw, CLI 최상위에서 catch
- 파일 I/O는 `src/core/fs.ts` 유틸 사용 (readTextFile, writeTextFile, fileExists)

## Naming Conventions

- 파일명: `kebab-case.ts`
- 클래스/인터페이스: `PascalCase`
- 함수/변수: `camelCase`
- 상수: `UPPER_SNAKE_CASE`
- 테스트 파일: `tests/` 미러 구조, `*.test.ts`

## Git Conventions

- 커밋 메시지: `type: description` (feat, fix, test, chore, docs)
- 한 커밋 = 한 논리적 변경
- 테스트 포함 커밋 우선
- **커밋 타이밍**: Generation 완료 시 코드+artifact를 함께 커밋 (1 generation = 1 commit). 커밋 메시지: `feat/fix/chore(gen-NNN): [goal]`

## Release Conventions

- **릴리스 파이프라인**: GitHub Actions (`release.yml`) — tag push 시 자동 실행
- **릴리스 흐름**: `npm version patch/minor/major` → `git push && git push --tags`
- **자동화 단계**: 테스트 → 빌드 → 버전 검증 (tag = package.json) → npm publish → GitHub Release 생성
- **버전 주입**: `scripts/build.js`가 `package.json` 버전을 빌드 시 `--define`으로 주입 — 소스에 버전 하드코딩 금지
- **릴리스 노트**: `RELEASE_NOTES.md` — version bump 시 `onGenerationComplete` hook이 자동 생성. `release.yml`에서 참조 (없으면 `--generate-notes` fallback)

## Template Conventions

- Genome 템플릿: `src/templates/genome/` — init 시 `.reap/genome/`으로 복사 (프로젝트 소유)
- 슬래시 커맨드: `src/templates/commands/` — init/update 시 감지된 에이전트별 commands 경로에 설치
- 산출물 템플릿: `src/templates/artifacts/` — init/update 시 `~/.reap/templates/`에 설치 (user-level)
- Domain 가이드: `src/templates/genome/domain/README.md` — init/update 시 `~/.reap/templates/domain-guide.md`에 설치
- Hook 스크립트: `src/templates/hooks/` — 에이전트별 방식으로 등록 (Claude Code: settings.json, OpenCode: plugins/)
- **새 템플릿 추가 시 반드시 `init.ts`의 COMMAND_NAMES 및 설치 로직도 동기화하라**

## Language

- 산출물(artifact), backlog, 사용자 인터랙션: 유저의 language 설정을 따름
- Genome 파일: 유저의 language 설정을 따름
- 소스 템플릿(`src/templates/`): 영어 유지 (범용)

## Enforced Rules

| 규칙 | 검증 도구 | 명령어 |
|------|-----------|--------|
| 전체 테스트 통과 | bun test | `bun test` |
| TypeScript 컴파일 | tsc | `bunx tsc --noEmit` |
| Node.js 빌드 | node scripts/build.js | `npm run build` |

# Environment Summary

> 프로젝트 외부 환경 요약. ~100줄 이내 유지.

## 배포 환경

- **npm registry**: `@c-d-cc/reap` (scoped package)
- **Node.js**: >=18 호환 (Bun은 개발/테스트 전용)
- **CI/CD**: GitHub Actions — `release.yml` (npm publish), `docs.yml` (GitHub Pages)
- **Secret**: `NPM_TOKEN` (GitHub repo secret)

## 외부 의존성

### Runtime Dependencies
- `commander` ^12.0.0 — CLI 프레임워크
- `yaml` ^2.0.0 — YAML 파싱/직렬화

### Dev Dependencies
- `@types/bun` latest — Bun 타입 정의
- `typescript` ^5.0.0 — 컴파일러

### 외부 서비스
- 없음 (순수 로컬 CLI 도구)

## 도구 환경

- **패키지 매니저**: npm (배포), bun (개발/테스트)
- **빌드**: `node scripts/build.js` — esbuild 번들 + templates 복사
- **테스트**: `bun test` (600 tests, 61 files)
- **타입체크**: `bunx tsc --noEmit`
- **E2E**: OpenShell CLI (`openshell`) 필요 — `uv tool install -U openshell`

## AI 에이전트 환경

- **커맨드 저장소**: `~/.reap/commands/` — source of truth (init/update 시 설치)
- **Claude Code**: project `.claude/skills/{name}/SKILL.md` (session-start hook이 자동 복사), `settings.json` (SessionStart hook)
- **OpenCode**: `~/.config/opencode/plugins/reap-session-start.js` (session hook), `~/.config/opencode/commands/` (레거시, 현재 미사용)
- **Hook 공유 모듈**: `genome-loader.cjs` — Genome 로딩, staleness 감지, placeholder 감지, strict mode
- **Skill Discovery 변경**: Claude Code가 `.claude/commands/` → `.claude/skills/` 마이그레이션 (2026-03 확인). project-level `.claude/commands/`는 skill list에 로드되지 않음

## 테스트 인프라

- **테스트 소스**: private git submodule (`c-d-cc/reap-test`) — `tests/` 디렉토리
- **CI fetch**: GitHub Actions SSH deploy key
- **npm publish 시**: tests 미포함 (`package.json` `files` 필드)

## 문서

- **홈페이지**: https://reap.cc
- **GitHub**: https://github.com/c-d-cc/reap
- **docs/**: GitHub Pages 배포 (docs.yml workflow)

## 측정 데이터

- `docs/subagent-evolve-measurement.md` — Subagent evolve 방식 측정 결과 (context 절감 88~95%)

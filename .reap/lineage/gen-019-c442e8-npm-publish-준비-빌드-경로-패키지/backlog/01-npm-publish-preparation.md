---
type: task
status: consumed
consumedBy: gen-019
priority: high
title: "npm publish 준비 — 빌드 파이프라인 + 경로 해석 + package.json 정비"
---

## 변경 사항

### 1. 빌드 시 templates 복사
- build 스크립트에 `cp -r src/templates dist/templates` 추가
- `prepublishOnly` 스크립트로 빌드+복사 자동화

### 2. paths.ts 경로 해석 수정
- `packageTemplatesDir`를 dev/dist 양쪽 호환하도록 변경
- dist 모드: `join(dir, "templates")` (dist/templates/)
- dev 모드: `join(dir, "../templates")` (src/templates/)

### 3. package.json 정비
- `bin`: `./src/cli/index.ts` → `./dist/cli.js`
- `files`: `["dist/"]` (번들 + 복사된 templates 포함)
- `scripts.build`: bun build + cp templates
- `scripts.prepublishOnly`: build 실행
- `engines`: Node.js 최소 버전 명시

### 4. .npmignore 또는 files 필드로 배포 파일 제한
- tests, .reap, docs, examples 등 제외

### 5. npm publish --dry-run 검증

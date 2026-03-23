# Release Notices

## v0.15.9
### en
Fixed release notice not displaying after `reap update`. Path resolution now uses `require.resolve` instead of `__dirname`.
### ko
`reap update` 후 릴리스 공지가 표시되지 않던 문제 수정. 경로 탐색을 `__dirname` 대신 `require.resolve` 사용으로 변경.

## v0.15.8
### en
Removed `version` field from config.yml. No more uncommitted changes after `reap update`.
### ko
config.yml에서 `version` 필드 제거. `reap update` 후 uncommitted changes 발생 문제 해소.

## v0.15.7
### en
Renamed UPDATE_NOTICE.md to RELEASE_NOTICE.md. Notice content now inline (no GitHub Discussions dependency).
### ko
UPDATE_NOTICE.md를 RELEASE_NOTICE.md로 변경. notice 내용을 파일에 직접 포함 (GitHub Discussions 의존성 제거).

## v0.15.6
### en
Fixed UPDATE_NOTICE.md missing from npm package.
### ko
UPDATE_NOTICE.md가 npm 패키지에 누락된 문제 수정.

## v0.15.5
### en
Integrity check no longer warns about source-map.md line count.
### ko
integrity check에서 source-map.md 줄수 경고 제외.

## v0.15.4
### en
v0.15.4 — Bug fixes and new `reap make backlog` command.
- Fixed lineage archiving copying all backlog items instead of consumed only
- Fixed `reap back` nonce chain breakage
- Added `reap make backlog` for safe backlog file creation
- Compression now preserves 20 recent generations (was 3)
### ko
v0.15.4 — 버그 수정 및 `reap make backlog` 커맨드 추가.
- lineage archiving 시 consumed backlog만 복사하도록 수정
- `reap back` 후 nonce chain 유지되도록 수정
- `reap make backlog` 커맨드 추가 (안전한 backlog 파일 생성)
- 압축 보호 개수 3→20으로 확대 (최근 20세대 원본 유지)

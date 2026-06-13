# Project Brief

AI 에이전트가 Figma 디자인 작업을 수행하기 위한 브릿지 도구.
이 Memory Bank는 **디자인 작업의 맥락**을 세션 간 유지하기 위해 존재한다.

## 도구 개요

- Figma Desktop ↔ AI 에이전트를 HTTP + CLI로 연결
- `figma-cli.js`로 읽기/쓰기/코드 실행
- DESIGN.md에 디자인 토큰 정의 (SSOT)

## 이 Memory Bank의 용도

- 현재 진행 중인 **디자인 프로젝트**의 상태 기록
- 디자인 결정사항, 사용된 토큰, 작업 히스토리
- AI가 다음 세션에서 이전 디자인 작업을 이어갈 수 있도록 맥락 유지

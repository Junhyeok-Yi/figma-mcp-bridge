# Tech Context

## 도구 사용법

```bash
# 서버 시작
cd relay-server && npm run dev:http

# 기본 명령
node figma-cli.js status              # 연결 확인
node figma-cli.js selection --skeleton # 선택 프레임 구조
node figma-cli.js node <id> --depth 2  # 특정 노드 읽기
node figma-cli.js run <script.js>      # 스크립트 실행
```

## 디자인 작업 시 참고

- DESIGN.md: 디자인 토큰 정본 (색상, 타이포, 간격, 그림자)
- 복잡한 디자인 작업은 항상 `scripts/` 폴더에 `.js` 파일로 작성 후 실행
- `--skeleton` → drill-down 패턴으로 대형 프레임 탐색
- `--timeout` 글로벌 플래그로 타임아웃 조절 가능

## 현재 Figma 파일

- 메모 앱 디자인 진행 중
- 주요 프레임: "Memo Board / Desktop" (296:673)
- Inter 폰트 사용 (Regular, Medium, Semi Bold, Bold)

## 제약사항

- Figma Desktop 필수 (웹 버전 WebSocket 제한)
- 폰트: `figma.loadFontAsync()` 필수, 스타일 이름 정확히 확인
- GROUP/Mask 이동 불가 — 새로 생성해야 함

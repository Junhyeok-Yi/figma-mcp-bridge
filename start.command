#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Figma MCP Bridge — 시작 스크립트
# macOS에서 더블클릭하거나 터미널에서 실행하세요.
# ─────────────────────────────────────────────────────────────────────────────

# 스크립트 위치를 기준으로 프로젝트 루트로 이동
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# ── 색상 출력 헬퍼 ───────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

print_header() {
  echo ""
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}  Figma MCP Bridge${NC}"
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# ── Node.js 확인 ─────────────────────────────────────────────────────────────
check_node() {
  if ! command -v node &>/dev/null; then
    echo -e "${RED}✖ Node.js 가 설치되어 있지 않습니다.${NC}"
    echo ""
    echo "  https://nodejs.org 에서 v18 이상을 설치하세요."
    echo "  설치 후 이 스크립트를 다시 실행하세요."
    echo ""
    if [[ "$TERM_PROGRAM" == "Apple_Terminal" ]] || [[ -z "$TERM_PROGRAM" ]]; then
      echo "이 창은 10초 후 닫힙니다..."
      sleep 10
    fi
    exit 1
  fi

  NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
  if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}⚠ Node.js v${NODE_VERSION} 감지됨. v18 이상 권장합니다.${NC}"
  fi
}

# ── 의존성 설치 확인 ─────────────────────────────────────────────────────────
install_deps() {
  if [ ! -d "relay-server/node_modules" ]; then
    echo -e "${YELLOW}→ relay-server 의존성 설치 중...${NC}"
    (cd relay-server && npm install --omit=dev --silent)
    if [ $? -ne 0 ]; then
      echo -e "${RED}✖ npm install 실패. 인터넷 연결을 확인하세요.${NC}"
      exit 1
    fi
    echo -e "${GREEN}✔ 의존성 설치 완료${NC}"
  fi
}

# ── 빌드 확인 ────────────────────────────────────────────────────────────────
check_build() {
  if [ ! -f "relay-server/dist/http-server.js" ]; then
    echo -e "${YELLOW}→ 서버 빌드 중...${NC}"
    (cd relay-server && npm run build --silent)
    if [ $? -ne 0 ]; then
      echo -e "${RED}✖ 빌드 실패.${NC}"
      exit 1
    fi
    echo -e "${GREEN}✔ 빌드 완료${NC}"
  fi
}

# ── 포트 충돌 확인 ───────────────────────────────────────────────────────────
check_ports() {
  for PORT in 3000 8080; do
    if lsof -i ":$PORT" &>/dev/null; then
      echo -e "${YELLOW}⚠ 포트 $PORT 이미 사용 중입니다.${NC}"
      echo "   다른 서버가 실행 중이면 먼저 종료하거나 환경변수로 포트를 바꾸세요."
      echo "   종료: kill \$(lsof -ti :$PORT)"
      echo ""
    fi
  done
}

# ── 시작 안내 ────────────────────────────────────────────────────────────────
print_guide() {
  echo -e "${GREEN}✔ 서버 시작 준비 완료${NC}"
  echo ""
  echo -e "${BOLD}  다음 단계:${NC}"
  echo "  1. Figma Desktop 앱을 엽니다."
  echo "  2. 메뉴 → Plugins → Development → Import plugin from manifest…"
  echo -e "  3. 이 폴더 안의 ${BOLD}figma-plugin/manifest.json${NC} 을 선택합니다."
  echo "  4. Plugins → Development → MCP Bridge 를 실행합니다."
  echo "  5. 플러그인 UI에 🟢 연결됨 이 뜨면 준비 완료!"
  echo ""
  echo -e "${BOLD}  서버 주소:${NC}"
  echo "    HTTP API  →  http://localhost:3000"
  echo "    WebSocket →  ws://localhost:8080"
  echo ""
  echo -e "  종료: ${BOLD}Ctrl + C${NC}"
  echo ""
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# ── 메인 ─────────────────────────────────────────────────────────────────────
print_header
check_node
install_deps
check_build
check_ports
print_guide

# 서버 실행
exec node relay-server/dist/http-server.js

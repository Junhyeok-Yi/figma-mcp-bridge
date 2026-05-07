#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RELAY_DIR="$ROOT_DIR/relay-server"
PLUGIN_DIR="$ROOT_DIR/figma-plugin"

print_help() {
  cat <<'HELP'
Mode B Helper

Usage:
  ./modeb.sh setup    # install deps + build relay/plugin
  ./modeb.sh up       # setup if needed, then start HTTP relay server
  ./modeb.sh start    # start HTTP relay server (port 3000, ws 8080)
  ./modeb.sh status   # check Figma plugin connection
  ./modeb.sh doctor   # setup check + connection check

Recommended (for beginners):
  1) ./modeb.sh up
  2) Open Figma Desktop and run MCP Bridge plugin
  3) ./modeb.sh status
HELP
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ '$cmd' 명령을 찾을 수 없습니다. 먼저 설치해 주세요."
    exit 1
  fi
}

needs_setup() {
  [[ ! -d "$RELAY_DIR/node_modules" ]] || [[ ! -d "$PLUGIN_DIR/node_modules" ]] || [[ ! -f "$RELAY_DIR/dist/http-server.js" ]]
}

setup() {
  require_cmd node
  require_cmd npm

  echo "▶ Relay Server 의존성 설치/빌드"
  (cd "$RELAY_DIR" && npm install && npm run build)

  echo "▶ Figma Plugin 의존성 설치/빌드"
  (cd "$PLUGIN_DIR" && npm install && npm run build)

  echo "✅ setup 완료"
}

start_server() {
  echo "▶ Mode B HTTP 서버 시작"
  echo "   - HTTP: http://localhost:3000"
  echo "   - WS:   ws://localhost:8080"
  (cd "$RELAY_DIR" && npm run start:http)
}

up() {
  if needs_setup; then
    echo "ℹ setup이 필요해서 자동 실행합니다..."
    setup
  else
    echo "✅ setup 생략 (이미 준비됨)"
  fi
  start_server
}

check_status() {
  require_cmd node
  echo "▶ 연결 상태 확인"

  local output
  if output="$(cd "$ROOT_DIR" && node figma-cli.js status 2>&1)"; then
    echo "$output"
    return 0
  fi

  echo "❌ 상태 조회 실패"
  echo "$output"
  echo
  echo "다음 순서로 점검해 주세요:"
  echo "1) 서버 실행: ./modeb.sh up (또는 ./modeb.sh start)"
  echo "2) Figma Desktop에서 MCP Bridge 플러그인 실행"
  echo "3) 다시 확인: ./modeb.sh status"
  return 1
}

doctor() {
  require_cmd node
  require_cmd npm

  if [[ ! -d "$RELAY_DIR/node_modules" ]]; then
    echo "⚠ relay-server/node_modules 없음 (./modeb.sh setup 필요)"
  else
    echo "✅ relay-server 의존성 OK"
  fi

  if [[ ! -d "$PLUGIN_DIR/node_modules" ]]; then
    echo "⚠ figma-plugin/node_modules 없음 (./modeb.sh setup 필요)"
  else
    echo "✅ figma-plugin 의존성 OK"
  fi

  if [[ -f "$RELAY_DIR/dist/http-server.js" ]]; then
    echo "✅ relay-server 빌드 산출물 OK"
  else
    echo "⚠ relay-server 빌드 산출물 없음 (./modeb.sh setup 필요)"
  fi

  if check_status; then
    echo "✅ 상태 확인 완료"
  else
    echo "⚠ 상태 확인 실패 (위 점검 순서 참고)"
  fi
}

main() {
  local action="${1:-help}"
  case "$action" in
    setup) setup ;;
    up) up ;;
    start) start_server ;;
    status) check_status ;;
    doctor) doctor ;;
    help|-h|--help) print_help ;;
    *)
      echo "❌ 알 수 없는 명령: $action"
      echo
      print_help
      exit 1
      ;;
  esac
}

main "$@"

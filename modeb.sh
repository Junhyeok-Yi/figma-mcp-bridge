#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RELAY_DIR="$ROOT_DIR/relay-server"

print_help() {
  cat <<'HELP'
Mode B Helper

Usage:
  ./modeb.sh setup    # install deps + build relay/plugin
  ./modeb.sh start    # start HTTP relay server (port 3000, ws 8080)
  ./modeb.sh status   # check Figma plugin connection
  ./modeb.sh doctor   # setup check + connection check

Tip:
  Keep one terminal running: ./modeb.sh start
  In another terminal:       ./modeb.sh status
HELP
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ '$cmd' 명령을 찾을 수 없습니다. 먼저 설치해 주세요."
    exit 1
  fi
}

setup() {
  require_cmd node
  require_cmd npm

  echo "▶ Relay Server 의존성 설치/빌드"
  (cd "$RELAY_DIR" && npm install && npm run build)

  echo "▶ Figma Plugin 의존성 설치/빌드"
  (cd "$ROOT_DIR/figma-plugin" && npm install && npm run build)

  echo "✅ setup 완료"
}

start_server() {
  echo "▶ Mode B HTTP 서버 시작"
  echo "   - HTTP: http://localhost:3000"
  echo "   - WS:   ws://localhost:8080"
  (cd "$RELAY_DIR" && npm run start:http)
}

check_status() {
  require_cmd node
  echo "▶ 연결 상태 확인"
  (cd "$ROOT_DIR" && node figma-cli.js status)
}

doctor() {
  require_cmd node
  require_cmd npm

  if [[ ! -d "$RELAY_DIR/node_modules" ]]; then
    echo "⚠ relay-server/node_modules 없음 (./modeb.sh setup 필요)"
  else
    echo "✅ relay-server 의존성 OK"
  fi

  if [[ ! -d "$ROOT_DIR/figma-plugin/node_modules" ]]; then
    echo "⚠ figma-plugin/node_modules 없음 (./modeb.sh setup 필요)"
  else
    echo "✅ figma-plugin 의존성 OK"
  fi

  if [[ -f "$RELAY_DIR/dist/http-server.js" ]]; then
    echo "✅ relay-server 빌드 산출물 OK"
  else
    echo "⚠ relay-server 빌드 산출물 없음 (./modeb.sh setup 필요)"
  fi

  echo "▶ Figma 연결 확인"
  (cd "$ROOT_DIR" && node figma-cli.js status) || true
}

main() {
  local action="${1:-help}"
  case "$action" in
    setup) setup ;;
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

#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# make-release.sh
# 빌드 → zip 패키징 → figma-mcp-bridge-vX.X.X.zip 생성
#
# 사용법:
#   ./make-release.sh          # 버전을 물어봄
#   ./make-release.sh 1.2.0    # 버전 직접 지정
# ─────────────────────────────────────────────────────────────────────────────
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BOLD='\033[1m'; NC='\033[0m'

# ── 버전 결정 ─────────────────────────────────────────────────────────────────
VERSION="${1:-}"
if [ -z "$VERSION" ]; then
  # relay-server/package.json 에서 현재 버전 읽기
  CURRENT=$(node -p "require('./relay-server/package.json').version" 2>/dev/null || echo "1.0.0")
  read -rp "$(echo -e "${BOLD}릴리즈 버전${NC} (현재: $CURRENT) → ") " VERSION
  VERSION="${VERSION:-$CURRENT}"
fi

ZIP_NAME="figma-mcp-bridge-v${VERSION}.zip"
OUT_DIR="release-dist"

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  빌드 → ${ZIP_NAME}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ── 1. relay-server 의존성 + 빌드 ────────────────────────────────────────────
echo -e "${YELLOW}[1/4]${NC} relay-server 의존성 설치 및 빌드..."
(cd relay-server && npm install --silent && npm run build --silent)
echo -e "${GREEN}✔ relay-server 빌드 완료${NC}"

# ── 2. figma-plugin 빌드 ─────────────────────────────────────────────────────
echo -e "${YELLOW}[2/4]${NC} figma-plugin 빌드..."
(cd figma-plugin && npm install --silent && npm run build --silent)
echo -e "${GREEN}✔ figma-plugin 빌드 완료${NC}"

# ── 3. 릴리즈 폴더 조립 ──────────────────────────────────────────────────────
echo -e "${YELLOW}[3/4]${NC} 릴리즈 폴더 조립..."
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/figma-mcp-bridge"

TARGET="$OUT_DIR/figma-mcp-bridge"

# 서버 dist + production node_modules
mkdir -p "$TARGET/relay-server"
cp -r relay-server/dist "$TARGET/relay-server/"
# production deps만 따로 설치 (devDependencies 제외)
(cd relay-server && npm install --omit=dev --silent --prefix "$DIR/$TARGET/relay-server")

# 피그마 플러그인 (빌드 산출물 + UI + manifest)
mkdir -p "$TARGET/figma-plugin"
cp figma-plugin/manifest.json "$TARGET/figma-plugin/"
cp figma-plugin/code.js       "$TARGET/figma-plugin/"
cp figma-plugin/ui.html       "$TARGET/figma-plugin/"

# 루트 파일
cp figma-cli.js      "$TARGET/"
cp DESIGN.md         "$TARGET/"
cp README.md         "$TARGET/"
cp start.command     "$TARGET/"
chmod +x             "$TARGET/start.command"

# 하네스 (.clinerules, .cline/skills, memory-bank 뼈대)
cp -r .clinerules    "$TARGET/"
[ -d .cline ]       && cp -r .cline "$TARGET/"
[ -d memory-bank ]  && cp -r memory-bank "$TARGET/"

# 템플릿 + 스크립트
cp -r templates "$TARGET/"
cp -r scripts   "$TARGET/"

echo -e "${GREEN}✔ 폴더 조립 완료${NC}"

# ── 4. zip 생성 ───────────────────────────────────────────────────────────────
echo -e "${YELLOW}[4/4]${NC} zip 압축 중..."
rm -f "$ZIP_NAME"
(cd "$OUT_DIR" && zip -qr "../${ZIP_NAME}" figma-mcp-bridge)
rm -rf "$OUT_DIR"

SIZE=$(du -sh "$ZIP_NAME" | cut -f1)
echo -e "${GREEN}✔ 완료: ${BOLD}${ZIP_NAME}${NC}${GREEN} (${SIZE})${NC}"
echo ""
echo "  동료에게 보낼 때:"
echo "  1. ${ZIP_NAME} 를 공유"
echo "  2. 압축 해제 후 start.command 더블클릭 (또는 ./start.command)"
echo "  3. 피그마 → Plugins → Development → Import plugin from manifest…"
echo "     → figma-plugin/manifest.json 선택"
echo ""

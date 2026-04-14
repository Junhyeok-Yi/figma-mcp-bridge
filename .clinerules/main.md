# Figma Bridge — Cline Rules

## Tool Access

You have access to Figma via a local CLI bridge. All commands go through:
```
node /path/to/figma-mcp-bridge/figma-cli.js <command> [args]
```

Set `FIGMA_API=http://localhost:3000` if the server runs on a different port.

## Available Commands

### Read (GET)
| Command | Description |
|---------|-------------|
| `status` | Check if Figma plugin is connected |
| `selection [--skeleton\|--verbose] [--depth N]` | Get currently selected layers |
| `styles` | Get local paint/text/effect styles |
| `components` | Get local components list |
| `node <id> [--skeleton\|--verbose] [--depth N]` | Get node details by ID |
| `children <id> [--offset 0 --limit 20 --depth 1]` | Get children with pagination |
| `pages [list\|switch\|create\|delete]` | Manage pages |
| `vars [list\|collections\|create\|bind]` | Manage variables |
| `annotations <id>` | Read annotations from node |

### Write (POST)
| Command | Description |
|---------|-------------|
| `create <TYPE> [flags]` | Create a node (FRAME, RECTANGLE, TEXT, ELLIPSE, etc.) |
| `modify <id> [flags]` | Modify an existing node |
| `delete <id> [<id>...]` | Delete one or more nodes |
| `export <id> [--format png/svg]` | Export node as image |
| `annotate <id> --label "text"` | Add annotation to node |
| `vars create --name <n> [--type COLOR --value ...]` | Create variable |
| `vars bind --node <id> --field fills --var <varId>` | Bind variable to node |

### Universal
| Command | Description |
|---------|-------------|
| `run <file.js>` | Execute Figma Plugin API code from a JS file |
| `eval <code>` | Execute a short inline expression |
| `batch <file.json>` | Execute multiple operations from a JSON file |
| `tpl <name> [flags]` | Generate UI from a template |

### Global Flags
| Flag | Description |
|------|-------------|
| `--timeout <ms>` | Override request timeout (default: 30000) |

## Preferred Workflow

For complex operations, ALWAYS use `run <file.js>`:
1. Write a `.js` file with Figma Plugin API code
2. Execute it with `node figma-cli.js run <file.js>`
3. Check the returned result

For simple reads, use direct commands:
```
node figma-cli.js selection
node figma-cli.js node 1:23
```

## Design Rules

ALWAYS follow the design system defined in `DESIGN.md` when creating or modifying designs.
Before starting any design task:
1. Read `DESIGN.md` for tokens and conventions
2. Read the current selection or target frame to understand context
3. Use design tokens (colors, spacing, typography) from the system

## Memory Bank

나는 세션이 리셋되면 이전 작업을 전부 잊는다. `memory-bank/` 폴더가 유일한 연결고리다.

### 세션 시작 시
모든 작업 시작 전 `memory-bank/` 파일을 읽고 현재 상태를 파악하라.
읽는 순서: `projectbrief.md` → `activeContext.md` → `progress.md` → (필요 시 나머지)

### 자동 갱신 시점
다음 상황에서 **사용자 요청 없이도** 해당 파일을 갱신하라:
- 기능 구현/버그 수정 완료 → `progress.md` + `activeContext.md`
- Phase 단위 마일스톤 완료 → `progress.md` + `activeContext.md`
- 아키텍처/패턴 변경 → `systemPatterns.md`
- 기술 스택/의존성 변경 → `techContext.md`

### 수동 갱신
사용자가 **"update memory bank"**를 요청하면 `update-memory-bank` 워크플로우를 실행하라.
6개 파일 전부를 검토하고 현재 상태에 맞게 갱신한다.

### 갱신 규칙
- 각 파일 **1~2페이지** 이내로 간결하게 유지
- `activeContext.md`는 현재 초점만 남기고 과거 이력은 `progress.md`로 이동
- 사실만 기록하라. 추측이나 계획 의견을 섞지 마라.

---

## Workflow/Skill 유도

사용자가 다음 작업을 요청하면 해당 Workflow를 안내하라:
- 접근성 검토/가이드 → `/a11y-audit.md`
- UX 리뷰/피드백 → `/ux-review.md`
- 모바일 전환/적응 → `/mobile-adapt.md`
- 색상/변수 등록 → `/register-colors.md`
- Memory Bank 전체 갱신 → `/update-memory-bank.md`

---

## 할루시네이션 방지 규칙 (CRITICAL)

1. Figma에서 읽은 텍스트(`characters`)를 사용자에게 보고할 때 **반드시 원문 그대로 인용**하라. 절대 추측하지 마라.
2. 노드의 `name`은 **레이어 이름**이지 화면에 표시되는 텍스트가 아니다. 실제 화면 텍스트는 TEXT 노드의 `characters` 필드에만 있다.
3. 읽기 실패 또는 타임아웃 시 **"읽지 못했습니다"**라고 명확히 보고하라. 추측으로 채우지 마라.
4. `truncated: true`가 반환되면 사용자에게 알리고, 추가 조회 여부를 물어라. 잘린 데이터를 추측으로 보완하지 마라.
5. `childSummary`에 TEXT 노드가 있어도 `characters`가 없으면 내용을 모르는 것이다. "텍스트 내용 확인을 위해 해당 노드를 조회해야 합니다"라고 안내하라.

## Compact 데이터 해석 규칙

1. `_defaults` 배열에 있는 필드는 **기본값이 적용된 것**이다 (예: visible=true, opacity=1). 속성이 "없는 것"이 아니다.
2. compact 모드에서 생략된 속성을 쓰기 작업에 사용해야 할 때는, 대상 노드를 `--verbose` 모드로 다시 읽어서 정확한 속성 구조를 확인하라.
3. HEX 색상(예: `"#3B82F6"`)은 compact 표현이다. Figma API에 쓸 때는 `{r: 0.231, g: 0.510, b: 0.965}` RGB 형식으로 변환하라.

## 읽기 전략

1. 대형 프레임(자식 10개 이상 예상)은 **`--skeleton`** 모드로 구조부터 파악하라.
2. 구조 파악 후 필요한 자식만 **`node <id> --depth 1`**로 drill-down하라.
3. 타임아웃 발생 시 `--depth`를 줄이거나, 자식을 분할 조회하라.
4. component instance 내부는 필요한 경우에만 읽어라.
5. 전체 텍스트 내용이 필요하면 `--depth`를 충분히 높여서 TEXT 노드의 `characters`까지 도달하라.

## 디자인 수정 안전 규칙

1. **기존 프레임을 직접 비우지 마라.** 새 프레임에 먼저 조립하고, 완성 후 교체하라.
2. **GROUP/Mask 노드는 옮기지 마라.** 마스킹이 깨진다. 내용을 새로 만들어라.
3. **`layoutSizingHorizontal = "FILL"`은 부모에 appendChild한 뒤에 설정하라.**
4. 폰트 스타일 이름에 주의하라 (예: "Semi Bold" ≠ "Semibold"). `loadFontAsync`로 사전 검증.

## Error Handling

- "Figma plugin not connected" → 사용자에게 Figma에서 플러그인 실행 요청
- Timeout error → 작업을 더 작은 단위로 분할
- `node figma-cli.js status`로 연결 상태 먼저 확인

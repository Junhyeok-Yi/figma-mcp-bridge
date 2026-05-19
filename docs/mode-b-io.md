# Mode B I/O 구조도 (HTTP + CLI)

아래 다이어그램은 **요청/응답이 어디를 통해 흐르는지**를 단순화해서 보여줍니다.

```text
[User Prompt]
   │
   ▼
[Cline/Codex]
   │ shell command
   ▼
[node figma-cli.js <command>]
   │
   ├─(1) Global flag parse
   │    - --timeout
   │    - --workflow
   │    - --force
   │    - --verbose(status)
   │
   ├─(2) Write-command guard
   │    - memory-bank/activeContext.md mtime
   │    - memory-bank/progress.md mtime
   │    - stale && !--force => block
   │
   ├─(3) HTTP request
   ▼
[relay-server HTTP API :3000]
   │
   ├─ endpoint routing
   │   /api/selection
   │   /api/node/:id
   │   /api/node/:id/children
   │   /api/create_node ...
   │
   ├─ timeout policy
   │   depth>=2 => longer timeout
   │
   └─ sendToFigma(type, payload, timeout)
       ▼
[WebSocket Relay :8080]
   │ request(messageId)
   ▼
[Figma Plugin]
   │ execute Figma Plugin API
   ▼
[Figma Document]
   │
   └─ response(payload|error)
        ▲
        └──────── back through WS → HTTP → CLI JSON stdout

Extra I/O (observability)
- CLI appends JSONL rows to:
  .figma-bridge/logs/workflow-usage.jsonl
- `node figma-cli.js status --verbose` reads last 5 rows.
```

## Timeout 발생 시 권장 I/O 전략

1. `selection --skeleton`으로 구조만 먼저 읽기
2. `children <id> --offset --limit --depth 1`로 분할 읽기
3. 필요한 노드만 `node <id> --depth 1..2`로 드릴다운
4. 그래도 느리면 `--timeout <ms>` 증가

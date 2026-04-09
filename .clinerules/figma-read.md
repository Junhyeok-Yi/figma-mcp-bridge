---
paths:
  - "**"
---

# Figma Read Rules

이 규칙은 Figma에서 데이터를 읽는 모든 작업에 적용된다.

## Response Format

기본 응답은 smart compact JSON:
- Colors: HEX strings (`"#1a1a2e"`)
- `_defaults`: 기본값으로 생략된 필드 목록 (예: `["visible","opacity"]`)
- Layout padding: `[top, right, bottom, left]` array
- Font: `"Family/Style"` string (예: `"Inter/Bold"`)

`--verbose`: 전체 Figma 데이터 (CSS 포함, 모든 속성)
`--skeleton`: id/name/type/childCount만 (구조 탐색용)
`--depth N`: 트리 순회 깊이 제한

## 대형 프레임 읽기 전략

```
Step 1: node figma-cli.js selection --skeleton
        → 전체 구조 파악 (childCount, type 확인)

Step 2: node figma-cli.js node <관심_노드_id> --depth 1
        → 필요한 섹션만 drill-down

Step 3: node figma-cli.js node <텍스트_노드_id>
        → TEXT 노드의 characters 정확히 확인

Step 4: (필요 시) node figma-cli.js node <id> --verbose
        → 쓰기 전 정밀 속성 확인
```

## Truncation 대처

응답에 `truncated: true`가 포함되면:
1. 사용자에게 "일부 데이터가 크기 제한으로 잘렸습니다"라고 알린다
2. 잘린 부분이 필요하면 해당 노드를 개별 조회한다
3. **절대로** 잘린 데이터를 추측으로 보완하지 않는다

## Timeout 대처

읽기 타임아웃 시:
1. `--depth`를 낮춰서 재시도 (예: depth 3 → depth 1)
2. 특정 자식만 개별 조회
3. `--skeleton`으로 구조만 먼저 파악한 후 분할 조회

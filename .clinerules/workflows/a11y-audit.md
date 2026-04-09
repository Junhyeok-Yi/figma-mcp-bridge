# Accessibility Audit Workflow

선택된 Figma 프레임에 대해 WCAG 2.1 AA 기준의 접근성 감사를 수행하고 annotation으로 기록하는 워크플로우.

## Step 1: 연결 확인
```bash
node figma-cli.js status
```

## Step 2: 프레임 구조 파악
```bash
node figma-cli.js selection --depth 1
```
선택된 프레임의 구조와 자식 노드를 파악한다.

## Step 3: 텍스트 및 색상 수집
프레임 내 모든 TEXT 노드와 배경색을 수집한다:
```bash
node figma-cli.js eval 'const sel = figma.currentPage.selection[0]; if (!sel) return "no selection"; const texts = sel.findAll(n => n.type === "TEXT"); return texts.map(t => ({id: t.id, name: t.name, chars: t.characters, fontSize: t.fontSize, fills: JSON.parse(JSON.stringify(t.fills))}));'
```

배경색 수집:
```bash
node figma-cli.js eval 'const sel = figma.currentPage.selection[0]; if (!sel) return "no selection"; const frames = sel.findAll(n => n.type === "FRAME" && n.fills && n.fills.length > 0); return frames.map(f => ({id: f.id, name: f.name, fills: JSON.parse(JSON.stringify(f.fills))}));'
```

## Step 4: WCAG 2.1 AA 체크리스트 대조
`a11y-guide` 스킬을 참조하여 다음을 검사한다:

### 4-1. 색상 대비 (WCAG 1.4.3)
- 일반 텍스트 (< 18px): 대비율 **4.5:1** 이상
- 큰 텍스트 (>= 18px bold 또는 >= 24px): 대비율 **3:1** 이상
- 대비율 계산: `(L1 + 0.05) / (L2 + 0.05)` where L = relative luminance

### 4-2. 텍스트 크기 (WCAG 1.4.4)
- 본문 텍스트: 최소 12px 이상 권장, 14px 이상 추천
- 가독성을 위해 line-height는 fontSize의 1.4배 이상

### 4-3. 터치 타겟 (WCAG 2.5.8)
- 인터랙티브 요소(버튼, 입력 필드): 최소 **44x44px**
- 버튼/링크처럼 보이는 프레임의 크기를 확인

### 4-4. 정보 구조
- 시각적 계층 구조가 명확한가 (heading 크기 차이)
- 색상만으로 정보를 전달하고 있지 않은가

## Step 5: 위반 사항 정리
각 위반을 다음 형식으로 정리:

```
[WCAG 기준] 위반 설명
- 노드: <id> (<name>)
- 현재 값: (예: 대비율 2.1:1)
- 필요 값: (예: 최소 4.5:1)
- 수정 제안: (예: 텍스트 색상을 #333333으로 변경)
```

## Step 6: Annotation 달기
각 위반 노드에 annotation을 추가:
```bash
node figma-cli.js eval 'const n = await figma.getNodeByIdAsync("NODE_ID"); n.annotations = [...(n.annotations||[]), {label: "[WCAG 1.4.3] 색상 대비 부족: 현재 2.1:1 → 최소 4.5:1 필요"}]; return "done";'
```

## Step 7: 보고서 생성
접근성 감사 결과를 사용자에게 보고:
- 전체 검사 항목 수
- 통과 항목 수
- 위반 항목 수 (기준별 분류)
- 가장 심각한 위반 Top 3
- 전체적인 접근성 수준 평가 (A/AA/AAA)

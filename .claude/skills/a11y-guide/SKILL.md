---
name: a11y-guide
description: "접근성 검토, WCAG 검증, 접근성 annotation 작성 시 사용. 접근성 가이드, 색상 대비 검사, 터치 타겟 평가 관련 작업에 활성화."
---

# Accessibility Guide

WCAG 2.1 AA 기준의 접근성 검사 가이드.

## WCAG 2.1 AA 핵심 체크리스트

### 지각 가능 (Perceivable)

| 기준 | 설명 | 검사 방법 |
|------|------|----------|
| 1.1.1 Non-text Content | 모든 비텍스트 콘텐츠에 대체 텍스트 | 이미지/아이콘에 설명 라벨 있는지 확인 |
| 1.3.1 Info and Relationships | 정보 구조가 프로그래밍 방식으로 결정 가능 | 시각적 계층이 heading 크기로 구분되는지 |
| 1.4.1 Use of Color | 색상만으로 정보를 전달하지 않음 | 에러/성공 상태가 색상+아이콘/텍스트로 표시되는지 |
| 1.4.3 Contrast (Minimum) | 텍스트-배경 대비율 충족 | 아래 대비율 계산 참조 |
| 1.4.4 Resize Text | 200%까지 확대 시 콘텐츠 손실 없음 | 고정 px 높이 컨테이너에 텍스트가 갇혀있지 않은지 |
| 1.4.11 Non-text Contrast | UI 요소와 배경 대비 3:1 이상 | 버튼 테두리, 입력 필드 테두리 등 |

### 조작 가능 (Operable)

| 기준 | 설명 | 검사 방법 |
|------|------|----------|
| 2.4.3 Focus Order | 논리적 포커스 순서 | 탭 순서가 시각적 순서와 일치하는지 |
| 2.4.6 Headings and Labels | 설명적인 제목과 라벨 | 제목이 내용을 정확히 설명하는지 |
| 2.4.7 Focus Visible | 포커스 표시가 보임 | 포커스 상태 디자인이 있는지 |
| 2.5.8 Target Size | 최소 터치 타겟 크기 | 아래 터치 타겟 참조 |

### 이해 가능 (Understandable)

| 기준 | 설명 | 검사 방법 |
|------|------|----------|
| 3.1.1 Language | 페이지 언어 명시 | 텍스트 언어가 명확한지 |
| 3.2.1 On Focus | 포커스 시 예상치 못한 변경 없음 | 인터랙션 패턴이 예측 가능한지 |
| 3.3.1 Error Identification | 오류를 명확히 식별 | 에러 메시지가 구체적인지 |
| 3.3.2 Labels or Instructions | 입력에 라벨 제공 | 모든 입력 필드에 라벨이 있는지 |

## 색상 대비 계산

### 상대 휘도 (Relative Luminance)

```
L = 0.2126 * R + 0.7152 * G + 0.0722 * B

여기서 각 채널 (0~1 범위):
  sRGB <= 0.04045: channel / 12.92
  sRGB > 0.04045: ((sRGB + 0.055) / 1.055) ^ 2.4
```

### 대비율

```
Contrast Ratio = (L_lighter + 0.05) / (L_darker + 0.05)
```

### 기준

| 텍스트 유형 | AA 기준 | AAA 기준 |
|------------|---------|---------|
| 일반 텍스트 (< 18px, 또는 < 14px bold) | **4.5:1** | 7:1 |
| 큰 텍스트 (>= 18px, 또는 >= 14px bold) | **3:1** | 4.5:1 |
| UI 컴포넌트/그래픽 | **3:1** | — |

### Figma에서 확인

```js
// 텍스트 노드의 fills에서 색상 추출
const textColor = textNode.fills[0].color; // {r, g, b}
// 부모 프레임의 fills에서 배경색 추출
const bgColor = parentFrame.fills[0].color; // {r, g, b}
```

## 터치 타겟

- **최소 크기**: 44 x 44 px (WCAG 2.5.8)
- **권장 크기**: 48 x 48 px (Material Design)
- 적용 대상: 버튼, 링크, 체크박스, 라디오, 입력 필드, 토글

Figma에서 확인:
```js
// 인터랙티브 요소의 크기 확인
const width = node.width;
const height = node.height;
const pass = width >= 44 && height >= 44;
```

## Annotation 형식

접근성 위반을 annotation으로 기록할 때 사용하는 형식:

```
[WCAG {기준번호}] {위반 설명}
현재: {현재 값}
필요: {필요 값}
수정: {구체적 수정 제안}
```

예시:
```
[WCAG 1.4.3] 색상 대비 부족
현재: 대비율 2.1:1 (#999999 on #FFFFFF)
필요: 최소 4.5:1
수정: 텍스트 색상을 #595959 이상으로 어둡게
```

## 심각도 분류

- **Critical**: 콘텐츠 접근 불가 (대비율 2:1 미만, 라벨 없는 입력)
- **Major**: 사용성 심각 저하 (대비율 3:1~4.5:1, 터치 타겟 30px 미만)
- **Minor**: 개선 권장 (대비율 4.5:1~7:1 사이에서 AAA 미충족)

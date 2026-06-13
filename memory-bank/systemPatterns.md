# System Patterns

## 디자인 구조

```
Memo Board / Desktop (1440px, VERTICAL auto-layout)
├── Header (HORIZONTAL) — 타이틀 "Memos" + 검색 버튼
├── Tab Bar (HORIZONTAL) — 카테고리 탭 4개 + 정렬 버튼
└── Card Grid (VERTICAL, gap 20)
    ├── Row 1 (HORIZONTAL, fill, gap 20) — Card ×4
    ├── Row 2 (HORIZONTAL, fill, gap 20) — Card ×4
    └── Row 3 (HORIZONTAL, fill, gap 20) — Card ×4
```

## 카드 구조

```
Card (VERTICAL, 320h, fill width, radius 20)
├── Tag pill (radius 12, 반투명 배경)
├── Date (12px, Medium)
├── Spacer (grow)
├── Title (18px, Semi Bold, fill width)
└── Memo indicator (dot + label)
```

## 컬러 팔레트

| 이름 | From | To |
|------|------|------|
| 노랑 | #FEF08A | #DECF62 |
| 파랑 | #ADD8E6 | #87BBCD |
| 보라 | #E8C3F6 | #C799DB |
| 주황 | #FCBB9F | #E8967A |
| 초록 | #B3EECA | #8BD1AA |
| 골드 | #FED98E | #E8BE6B |

## Auto-Layout 주의사항

- `layoutSizingHorizontal = "FILL"`은 부모에 붙인 뒤 설정
- GROUP/Mask 노드는 이동 불가 → 새로 만들어야 함
- 폰트: "Semi Bold" (공백 있음), "Semibold" 아님

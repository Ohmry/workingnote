# Working Note - Detailed UI/UX Specification (v1.2)

## 1. 디자인 시스템 (Design System)
*(기존 내용 유지)*

---

## 2. 전체 레이아웃 (Global Layout)
*(Portrait Focus 및 Resizable Divider 구조 유지)*

---

## 3. 화면별 상세 기획

### 3.1 데일리 포커스 뷰 (Daily Focus View)
- **Task List (Top Area)**:
    - 체크박스 클릭 시 '완료된 항목'으로 분류되어 리스트 하단으로 이동하는 애니메이션 추가.
    - 호버 시 휴지통 아이콘 노출. 클릭 시 Soft Delete 수행.
- **Daily Note (Bottom Area)**:
    - **이미지 업로드**: 에디터 영역에 이미지 드래그 앤 드롭 또는 붙여넣기 시 업로드 표시와 함께 이미지 삽입.
    - **이미지 미리보기**: 마운트된 이미지는 클릭 시 풀 스크린 미리보기 지원.

### 3.2 사이드바 (Sidebar) - **UPDATE**
- **Bottom Actions**:
    - **🗑️ 휴지통**: 삭제된 항목(Task, Note)을 조회 및 복구할 수 있는 전용 뷰로 이동.
    - **⚙️ 설정**: 앱의 전역 설정을 관리하는 모달 또는 풀 스크린 뷰 호출.

### 3.3 휴지통 뷰 (Trash View)
- 삭제된 날짜순으로 정렬된 리스트 노출.
- 각 항목 우측에 '복구(Restore)'와 '영구 삭제(Destroy)' 버튼 배치.
- 상단에 '휴지통 비우기' 일괄 실행 버튼.

### 3.4 설정 화면 (Settings) - **NEW**
- **데이터 관리**:
    - 현재 데이터 저장 경로 표시 및 '변경' 버튼.
    - 데이터 백업 생성 및 복원 버튼.
- **개인화**:
    - 테마 선택 (라이트, 다크, 시스템 연동).
    - 글꼴 크기 조절 옵션.

---

## 4. 인터랙션 및 애니메이션 (Interactions)
- **Soft Delete**: 항목 삭제 시 리스트에서 사라지며 하단에 "휴지통으로 이동되었습니다. [취소]" 스낵바 알림 노출.
- **Path Change Sync**: 저장 경로 변경 시 데이터 이동 진행률(Progress Bar) 표시.

---
*Last Updated: 2026-03-22*

# Working Note - Project Context & Guidelines (v0.3.0)

이 파일은 'Working Note' 프로젝트의 최신 구조, 기술 스택, 개발 컨벤션 및 주요 비즈니스 로직을 요약한 마스터 가이드입니다. 에이전트는 모든 작업 시 이 문서의 내용을 최우선으로 준수해야 합니다.

## 🚀 프로젝트 개요
- **목표**: 개인의 업무와 회고를 위한 미니멀리즘 데스크탑 앱
- **핵심 가치**: 오프라인 우선(Local-first), 프라이버시(SQLite 기반), 경량화, 심리스한 UX

## 🛠 상세 기술 스택 (Tech Stack)

### Frontend
- **Framework**: React 19 (TypeScript)
- **State Management**: Zustand (SQLite 연동, `persist` 미들웨어 미사용)
- **Styling**: Vanilla CSS (CSS Modules), 글로벌 변수(`variables.css`) 활용
- **Icons**: Lucide React
- **Markdown**: React-Markdown, Remark GFM, Prism Code Highlighting
- **Date Utilities**: date-fns

### Backend (Tauri / Rust)
- **Runtime**: Tauri v2
- **Language**: Rust
- **Storage**: SQLite 전용 (`tauri-plugin-sql`)
- **Desktop Features**: Native menus, System Tray, Shortcut registration, Window Title: 'Working Note'

---

## 💻 개발 환경 및 명령 (Commands)

- **버전**: v0.3.0 (package.json, tauri.conf.json, Cargo.toml 동기화 필요)
- **개발 모드 실행**: `npm run tauri dev`
- **프로덕션 빌드**: `npm run tauri build`
- **타입 체크**: `npm run build` (tsc 포함)

---

## 📁 프로젝트 구조 (Folder Structure)

```text
/
├── src/                # Frontend (React)
│   ├── components/     # UI components (Checkbox, Sidebar, MarkdownRenderer 등)
│   ├── views/          # Screen-level views (DailyFocus, AllTasks, SecureNotes 등)
│   ├── store/          # Zustand store (useTaskStore.ts - SQLite 연동 로직 포함)
│   ├── types/          # TypeScript definitions (index.ts)
│   ├── styles/         # Global styles (variables.css)
│   └── utils/          # Helpers (Date, Markdown, Storage)
├── src-tauri/          # Backend (Tauri/Rust)
│   ├── src/            # Rust source (main.rs, lib.rs - SQLite migrations 포함)
│   └── tauri.conf.json  # Tauri app configuration (Title: 'Working Note')
└── docs/               # Documentation (Specs, Guides)
```

---

## 🚦 개발 워크플로우 및 규칙 (Conventions)

### 1. 데이터 저장 및 상태 관리 (SQLite)
- **Single Source of Truth**: 모든 데이터는 `workingnote.db` (SQLite)에 저장됩니다.
- **Zustand & DB 동기화**: `useTaskStore.ts`의 액션 함수 내에서 `db.execute`를 통해 DB를 먼저 업데이트하고 상태를 반영합니다.
- **Soft Delete**: 삭제 시 `isDeleted: 1` 및 `deletedAt` 기록.
- **Relationships**: 태그 관계는 `task_tags` 테이블을 통해 관리합니다.

### 2. UI/UX 및 레이아웃 원칙
- **여백 및 간격**: 주요 카드 영역 사이에는 `gap: 20px`를 유지합니다. (DailyFocusView 참고)
- **콤팩트 헤더**: 상단 타이틀 영역은 패딩을 최소화(`16px 20px`)하여 가용 화면을 확보합니다.
- **마크다운 스타일**: 제목(`H1`, `H2`)의 상단 여백은 `16px` 정도로 조밀하게 유지합니다.
- **Empty State**: 데이터가 없을 경우 `.emptyState` 클래스를 사용하여 중앙 정렬 및 넉넉한 여백(`40px`)을 제공합니다.
- **Vault (보안)**: 보관함 잠금 화면은 `max-width: 300px` 내외로 콤팩트하게 구성하며, 배경 카드 없이 메인 배경에 직접 노출합니다.

### 3. 코딩 컨벤션
- **Naming**: 컴포넌트 PascalCase, 일반 파일/폴더 kebab-case.
- **Type Safety**: `src/types/index.ts` 정의 준수.
- **Clean Code**: 미사용 파일(App.css 등) 및 임포트 즉시 정리.

---

## 📝 주요 문서 참조
- `docs/FUNCTIONAL_SPEC.md`: 기능 상세 명세 (데이터 모델 v2, API 리스트)
- `docs/UI_SPEC.md`: UI/UX 디자인 명세
- `src-tauri/tauri.conf.json`: 앱 설정 및 버전(0.3.0)

---
*Last Updated: 2026-03-24 (v0.3.0 Upgrade)*

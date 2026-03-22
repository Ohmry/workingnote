# Working Note - Project Context & Guidelines

이 파일은 'Working Note' 프로젝트의 구조, 기술 스택, 개발 컨벤션 및 주요 비즈니스 로직을 요약한 가이드입니다. 에이전트는 모든 작업 시 이 문서의 내용을 최우선으로 준수해야 합니다.

## 🚀 프로젝트 개요
- **목표**: 개인의 업무와 회고를 위한 미니멀리즘 데스크탑 앱
- **핵심 가치**: 오프라인 우선(Local-first), 프라이버시, 경량화, 심리스한 UX

## 🛠 상세 기술 스택 (Tech Stack)

### Frontend
- **Framework**: React 19 (TypeScript)
- **State Management**: Zustand (with Persist middleware for local storage)
- **Styling**: Vanilla CSS (using CSS Modules for scoping)
- **Icons**: Lucide React
- **Editor/Markdown**: React-Markdown (with Remark GFM)
- **Date Utilities**: date-fns

### Backend (Tauri / Rust)
- **Runtime**: Tauri v2
- **Language**: Rust
- **Storage**: Initial (JSON via `tauri-plugin-fs`), Scalability (SQLite via `tauri-plugin-sql`)
- **Desktop Features**: Native menus, System Tray, Shortcut registration

---

## 💻 개발 환경 및 명령 (Commands)

- **개발 모드 실행**: `npm run tauri dev`
- **프로덕션 빌드**: `npm run tauri build`
- **프론트엔드 단독 실행**: `npm run dev`
- **타입 체크**: `npm run build` (tsc 포함)

---

## 📁 프로젝트 구조 (Folder Structure)

```text
/
├── src/                # Frontend (React)
│   ├── components/     # Atomic UI components (Checkbox, Sidebar, Toast 등)
│   ├── views/          # Screen-level components (DailyFocus, Calendar, AllTasks 등)
│   ├── hooks/          # Business logic & data fetching
│   ├── store/          # Zustand store definitions (useTaskStore.ts)
│   ├── types/          # TypeScript definitions (index.ts)
│   ├── styles/         # Global CSS & Design Tokens (variables.css)
│   └── utils/          # Helpers (Date, Markdown, Storage)
├── src-tauri/          # Backend (Tauri/Rust)
│   ├── src/            # Rust source code (main.rs, lib.rs)
│   └── tauri.conf.json  # Tauri app configuration
└── docs/               # Documentation (Specs, Guides)
```

---

## 🚦 개발 워크플로우 및 규칙 (Conventions)

### 1. 코딩 컨벤션
- **Naming**: 컴포넌트는 PascalCase, 일반 파일/폴더는 kebab-case 권장.
- **Type Safety**: 모든 데이터 모델은 `src/types/index.ts`에 정의하고 엄격하게 적용.
- **Components**: UI 컴포넌트는 `.tsx` 파일과 `.module.css` 파일을 같은 폴더에 위치시켜 모듈화.

### 2. 상태 관리 (Zustand)
- 전역 상태는 `src/store/` 폴더 내에 정의.
- `persist` 미들웨어를 사용하여 로컬 스토리지와 자동 동기화.

### 3. 데이터 영속화 및 비즈니스 로직
- **Soft Delete**: 할 일 삭제 시 `isDeleted: true`와 `deletedAt` 기록 (휴지통 시스템).
- **Auto Save**: 일지 작성 시 1초(Debounce) 내에 자동 저장 수행.
- **Ordering**: 중간값(Mid-point) 알고리즘을 사용한 할 일 정렬 순서 관리.

### 4. 에셋 관리
- 이미지 등 에셋은 `assets/` 폴더에 `{date}_{uuid}_{original_name}` 형태로 저장.
- 마크다운 내에서는 `asset://` 커스텀 프로토콜 사용 권장.

---

## 📝 주요 문서 참조
- `docs/FUNCTIONAL_SPEC.md`: 기능 상세 명세 (데이터 모델, API 리스트)
- `docs/UI_SPEC.md`: UI/UX 디자인 명세
- `src-tauri/tauri.conf.json`: 앱 설정 및 권한

---
*Last Updated: 2026-03-22*

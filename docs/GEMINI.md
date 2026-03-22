# Working Note - Project Engineering Guide

이 문서는 'Working Note'의 기술적 근간과 개발 표준을 정의하는 마스터 가이드입니다.

## 🚀 프로젝트 개요
- **목표**: 개인의 업무와 회고를 위한 미니멀리즘 데스크탑 앱
- **핵심 가치**: 오프라인 우선(Local-first), 프라이버시, 경량화, 심리스한 UX

## 🛠 상세 기술 스택 (Tech Stack)

### Frontend
- **Framework**: React (TypeScript)
- **State**: Zustand (with Persist middleware for local storage)
- **Styling**: Vanilla CSS (using CSS Modules for scoping)
- **Icons**: Lucide React
- **Editor**: React-Markdown (with Remark GFM)
- **Date**: date-fns

### Backend (Tauri / Rust)
- **Runtime**: Tauri v2
- **Language**: Rust
- **Storage**: Initial (JSON via `tauri-plugin-fs`), Scalability (SQLite via `tauri-plugin-sql`)
- **Desktop Features**: Native menus, System Tray, Shortcut registration

---

## 💻 개발 환경 설정 (Setup)

### 1. Prerequisites
- Node.js v18+ & npm/pnpm
- Rust 1.75+ (via rustup)
- **OS Specific**:
  - macOS: `xcode-select --install`
  - Windows: Visual Studio C++ Build Tools
  - Linux: `libgtk-3-dev`, `webkit2gtk-4.0-dev`, `libnm-dev` 등

### 2. Getting Started
```bash
# 프로젝트 초기화 (진행 예정)
npx create-tauri-app@latest

# 개발 모드 실행
npm run tauri dev

# 프로덕션 빌드
npm run tauri build
```

---

## 📁 프로젝트 구조 (Folder Structure)
```text
/src
  ├── components/    # Atomic UI components
  ├── views/         # Screen-level components (List, Kanban, Note, etc.)
  ├── hooks/         # Business logic & data fetching
  ├── store/         # State management (Zustand)
  ├── types/         # TypeScript definitions
  ├── utils/         # Helpers (Date, Markdown, Storage)
  └── styles/        # Global CSS & Design Tokens
/src-tauri
  ├── src/           # Rust commands & handlers
  └── tauri.conf.json # Tauri app configuration
```

---

## 🚦 개발 워크플로우 및 규칙

### 1. 코딩 컨벤션
- **Naming**: 컴포넌트는 PascalCase, 파일/폴더는 kebab-case 권장.
- **Type Safety**: 모든 데이터 모델은 `types/` 폴더에 정의하고 엄격하게 적용.
- **Components**: 기능 단위로 폴더를 나누고 `index.ts`를 통해 export.

### 2. 데이터 영속화 (Persistence)
- 사용자의 모든 입력(할 일, 일지)은 로컬 환경에 자동 저장되어야 함.
- 일일 업무 일지의 경우, 작성 중단 후 1초(Debounce) 내에 파일 시스템에 쓰기 작업 수행.

### 3. 성능 최적화
- 대규모 리스트 렌더링 시 Virtual List (예: `react-window`) 도입 고려.
- Tauri의 `invoke` 호출은 비동기로 처리하며, 필요한 경우에만 최소한으로 호출.

---
*Last Updated: 2026-03-22*

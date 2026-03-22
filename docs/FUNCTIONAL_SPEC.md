# Working Note - Unified Functional Specification (v2.0)

이 문서는 'Working Note' 애플리케이션의 모든 동작 로직, 데이터 구조 및 기술적 요구사항을 정의하는 최종 완결판입니다. 개발 에이전트는 이 문서의 명세를 최우선으로 준수하여 구현해야 합니다.

---

## 1. 데이터 모델 (Full Data Model)

### 1.0 AppConfig (전역 설정)
- `version`: number (현재 데이터 스키마 버전: 1)
- `storagePath`: string (사용자 지정 데이터 폴더 절대 경로)
- `theme`: 'light' | 'dark' | 'system'
- `language`: 'ko' | 'en' (기본값: 'ko')
- `lastBackupAt`: string (ISO 8601)

### 1.1 Task (할 일)
- `id`: string (UUID v4)
- `title`: string (Required, Max 100자)
- `description`: string (Optional, Markdown support)
- `status`: 'todo' | 'in_progress' | 'done'
- `priority`: 'low' | 'medium' | 'high' (기본값: 'medium')
- `order`: number (정렬 순서, 소수점 권장 - 예: Lexical ordering)
- `dueDate`: string (ISO 8601, Optional)
- `categoryId`: string (Foreign Key, Optional)
- `tags`: string[] (Tag Name 리스트)
- `subTasks`: Array<{ id: string, title: string, isDone: boolean, order: number }>
- `isDeleted`: boolean (Default: false)
- `deletedAt`: string (Optional, ISO 8601)
- `createdAt`: string (ISO 8601)
- `updatedAt`: string (ISO 8601)

### 1.2 DailyNote (일일 업무 일지)
- `date`: string (Primary Key, "YYYY-MM-DD")
- `content`: string (Markdown text)
- `assets`: Array<{ originalName: string, savedPath: string, uploadedAt: string }>
- `isDeleted`: boolean (Default: false)
- `deletedAt`: string (Optional)
- `lastSavedAt`: string (ISO 8601)

### 1.3 Category & Tag (마스터)
- `Category`: `{ id: string, name: string, color: string, order: number }`
- `Tag`: `{ name: string, color?: string }`

---

## 2. 핵심 비즈니스 로직 (Business Logic)

### 2.1 휴지통 시스템 (Trash & Lifecycle)
- **Soft Delete**: `delete_task` 호출 시 `isDeleted`를 `true`로 설정하고 `deletedAt`에 현재 시간을 기록합니다.
- **영구 삭제**: 휴지통에서 '삭제' 버튼 클릭 시 파일 시스템 및 데이터 배열에서 완전히 제거합니다.
- **복구**: `isDeleted`를 `false`로 변경하고 기존 카테고리가 존재하지 않으면 'Uncategorized'로 연결합니다.

### 2.2 할 일 정렬 및 완료 처리 (Ordering & Completion)
- **정렬 알고리즘**: 사용자가 항목을 이동하면 이전 항목과 다음 항목 `order` 값의 중간값(Mid-point)을 새 `order`로 부여하여 전체 재계산을 방지합니다.
- **완료 시 이동**: `status`가 `done`으로 변경되면 현재 활성 목록의 가장 높은 `order` 값 + 1000을 부여하여 하단으로 보냅니다.

### 2.3 이미지 및 에셋 관리 (Asset Management)
- **충돌 방지**: 이미지를 `assets/` 폴더로 복사할 때 파일명을 `{date}_{uuid}_{original_name}` 형태로 변경하여 저장합니다.
- **참조**: 마크다운 내에서는 `![alt](asset://{savedPath})` 커스텀 프로토콜 또는 상대 경로를 통해 이미지를 표시합니다.
- **고아 파일 정리**: 일지에서 이미지 참조가 사라지고 일정 시간이 지나면 실제 파일도 삭제하는 Cleanup 로직을 포함합니다.

### 2.4 커스텀 저장소 및 마이그레이션 (Storage & Migration)
- **경로 변경**: 설정에서 경로 변경 시 1) 타겟 폴더 권한 확인, 2) 기존 데이터 복사, 3) 경로 설정 업데이트, 4) 구 폴더 데이터 안전 삭제 순으로 진행합니다.
- **버전 체크**: 앱 기동 시 `version` 필드를 검사하여 현재 앱의 요구 버전보다 낮으면 마이그레이션 함수를 실행합니다.

---

## 3. 통합 API 리스트 (Full Tauri Commands)

### 데이터 로드 및 관리
- `get_app_config()`: 설정 정보 로드.
- `update_app_config(config: AppConfig)`: 설정 업데이트 및 경로 변경 트리거.
- `get_initial_data()`: 오늘 날짜 데이터 및 전체 할 일 목록 로드.
- `get_calendar_summary(year: number, month: number)`: 특정 월의 일지 존재 여부 및 완료 통계 로드.

### 할 일(Task) 관련
- `create_task(task: Partial<Task>)`: 새 할 일 생성.
- `update_task(id: string, updates: Partial<Task>)`: 할 일 정보 수정 및 상태 변경.
- `delete_task(id: string, permanent: boolean)`: 소프트/하드 삭제.
- `update_task_positions(positions: Array<{id: string, order: number}>)`: 순서 일괄 업데이트.

### 일지(Note) 관련
- `get_note_by_date(date: string)`: 특정 날짜 일지 로드.
- `save_note(date: string, content: string)`: 일지 자동 저장 (Debounced).
- `upload_asset(date: string, file_path: string)`: 이미지 에셋 복사 및 참조 추가.

---

## 4. 예외 처리 및 제약 사항 (Edge Cases)

- **파일 권한**: 사용자가 쓰기 권한이 없는 폴더를 선택할 경우 에러 메시지를 노출하고 기본 앱 데이터 폴더로 폴백(Fallback)합니다.
- **동시성 제어**: `save_note` 호출 중 동일 날짜에 대한 새로운 저장 요청이 오면 큐(Queue)에 쌓아 순차적으로 처리합니다.
- **데이터 유효성**: 저장 전 필수 필드(Task 제목 등)의 유무를 프론트/백엔드 양단에서 검증합니다.

---
*Last Updated: 2026-03-22 (Unified Master Specs)*

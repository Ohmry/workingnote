use tauri::Manager;
use std::fs;
use tauri_plugin_sql::{Migration, MigrationKind};

#[tauri::command]
fn get_db_folder_path(app_handle: tauri::AppHandle) -> String {
    let mut path = app_handle.path().local_data_dir().expect("Failed to get local data dir");
    path.push("Working Note");
    path.to_string_lossy().to_string()
}

#[tauri::command]
fn get_data_path_string(app_handle: tauri::AppHandle) -> String {
    let mut path = app_handle.path().local_data_dir().expect("Failed to get local data dir");
    path.push("Working Note");
    path.push("workingnote.db");
    path.to_string_lossy().to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:workingnote.db", vec![
        Migration {
            version: 1,
            description: "create initial tables",
            sql: "
                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT,
                    status TEXT NOT NULL,
                    priority TEXT NOT NULL,
                    task_order REAL NOT NULL,
                    due_date TEXT,
                    category_id TEXT,
                    is_deleted BOOLEAN DEFAULT 0,
                    deleted_at TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS daily_notes (
                    date TEXT PRIMARY KEY,
                    content TEXT NOT NULL,
                    is_deleted BOOLEAN DEFAULT 0,
                    deleted_at TEXT,
                    last_saved_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS secure_notes (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    is_deleted BOOLEAN DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS tags (
                    name TEXT PRIMARY KEY,
                    color TEXT
                );
                CREATE TABLE IF NOT EXISTS task_tags (
                    task_id TEXT NOT NULL,
                    tag_name TEXT NOT NULL,
                    PRIMARY KEY (task_id, tag_name),
                    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
                    FOREIGN KEY (tag_name) REFERENCES tags(name) ON DELETE CASCADE
                );
                CREATE TABLE IF NOT EXISTS categories (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    color TEXT NOT NULL,
                    category_order REAL NOT NULL
                );
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "add config table",
            sql: "
                CREATE TABLE IF NOT EXISTS config (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                );
            ",
            kind: MigrationKind::Up,
        }
    ])
                .build(),
        )
        .invoke_handler(tauri::generate_handler![get_data_path_string, get_db_folder_path])
        .setup(|app| {
            let path = app.path().local_data_dir().expect("Failed to get local data dir");
            
            // New default path: .../Local/workingnote/workingnote.db
            let mut new_app_path = path.clone();
            new_app_path.push("workingnote");
            if !new_app_path.exists() {
                let _ = fs::create_dir_all(&new_app_path);
            }

            // Old path: .../Local/Working Note/workingnote.db
            let mut old_app_path = path.clone();
            old_app_path.push("Working Note");
            let mut old_db_path = old_app_path.clone();
            old_db_path.push("workingnote.db");

            if old_db_path.exists() {
                let mut new_db_path = new_app_path.clone();
                new_db_path.push("workingnote.db");
                if !new_db_path.exists() {
                    let _ = fs::copy(&old_db_path, &new_db_path);
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

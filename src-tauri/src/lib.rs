use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SubTask {
    pub id: String,
    pub title: String,
    pub is_done: bool,
    pub order: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub priority: String,
    pub order: f64,
    pub due_date: Option<String>,
    pub category_id: Option<String>,
    pub tags: Vec<String>,
    pub sub_tasks: Vec<SubTask>,
    pub is_deleted: bool,
    pub deleted_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Asset {
    pub original_name: String,
    pub saved_path: String,
    pub uploaded_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DailyNote {
    pub date: String,
    pub content: String,
    pub assets: Vec<Asset>,
    pub is_deleted: bool,
    pub deleted_at: Option<String>,
    pub last_saved_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Category {
    pub id: String,
    pub name: String,
    pub color: String,
    pub order: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    pub name: String,
    pub color: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppData {
    pub version: u32,
    pub tasks: Vec<Task>,
    pub notes: Vec<DailyNote>,
    pub categories: Vec<Category>,
    pub tags: Vec<Tag>,
}

fn get_data_path(app_handle: &tauri::AppHandle) -> PathBuf {
    let mut path = app_handle.path().app_data_dir().expect("Failed to get app data dir");
    if !path.exists() {
        let _ = fs::create_dir_all(&path);
    }
    path.push("data.json");
    path
}

#[tauri::command]
fn get_initial_data(app_handle: tauri::AppHandle) -> AppData {
    let path = get_data_path(&app_handle);
    if path.exists() {
        let content = fs::read_to_string(path).unwrap_or_else(|_| "{}".to_string());
        serde_json::from_str(&content).unwrap_or_else(|_| AppData {
            version: 1,
            tasks: Vec::new(),
            notes: Vec::new(),
            categories: Vec::new(),
            tags: Vec::new(),
        })
    } else {
        AppData {
            version: 1,
            tasks: Vec::new(),
            notes: Vec::new(),
            categories: Vec::new(),
            tags: Vec::new(),
        }
    }
}

#[tauri::command]
async fn save_data(app_handle: tauri::AppHandle, data: AppData) -> Result<(), String> {
    let path = get_data_path(&app_handle);
    let content = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    fs::write(path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_initial_data, save_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

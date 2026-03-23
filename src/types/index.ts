export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in_progress' | 'done';
export type Theme = 'light' | 'dark' | 'system';

export interface AppConfig {
  version: number;
  storagePath: string;
  theme: Theme;
  language: string;
  lastBackupAt?: string;
  dailyNoteLayout?: 'horizontal' | 'vertical';
}


export interface SubTask {
  id: string;
  title: string;
  isDone: boolean;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  order: number;
  dueDate?: string;
  categoryId?: string;
  tags: string[];
  subTasks: SubTask[];
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  originalName: string;
  savedPath: string;
  uploadedAt: string;
}

export interface DailyNote {
  date: string; // YYYY-MM-DD
  content: string;
  assets: Asset[];
  isDeleted: boolean;
  deletedAt?: string;
  lastSavedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface Tag {
  name: string;
  color?: string;
}

export interface SecureNote {
  id: string;
  title: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  version: number;
  tasks: Task[];
  notes: DailyNote[];
  categories: Category[];
  tags: Tag[];
  secureNotes: SecureNote[];
  vaultPassword?: string; // Hashed password could be better, but we'll start with simple comparison
}

import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { Task, DailyNote, Category, Tag, Status, AppData, AppConfig } from '../types';

interface TaskState {
  tasks: Task[];
  notes: DailyNote[];
  categories: Category[];
  tags: Tag[];
  version: number;
  config: AppConfig;
  
  // Persistence
  loadData: () => Promise<void>;
  syncWithBackend: () => Promise<void>;
  updateConfig: (updates: Partial<AppConfig>) => void;
  
  // Tasks
  addTask: (title: string, dueDate?: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  restoreTask: (id: string) => void;
  permanentDeleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  
  // Notes
  getNote: (date: string) => DailyNote | undefined;
  saveNote: (date: string, content: string) => void;

  // Categories
  addCategory: (name: string, color: string) => void;
  deleteCategory: (id: string) => void;
  
  // Tags
  addTag: (name: string, color?: string) => void;
  deleteTag: (name: string) => void;
}

const DEFAULT_CONFIG: AppConfig = {
  version: 1,
  storagePath: '',
  theme: 'system',
  language: 'ko',
  lastBackupAt: new Date().toISOString(),
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  notes: [],
  categories: [],
  tags: [],
  version: 1,
  config: DEFAULT_CONFIG,

  loadData: async () => {
    try {
      const data = await invoke<AppData>('get_initial_data');
      const actualPath = await invoke<string>('get_data_path_string');
      
      if (data && (data.version || data.tasks)) {
        set((state) => ({
          tasks: data.tasks || [],
          notes: data.notes || [],
          categories: data.categories || [],
          tags: data.tags || [],
          version: data.version || state.version,
          config: { ...state.config, storagePath: actualPath }
        }));
      } else {
        set((state) => ({ config: { ...state.config, storagePath: actualPath } }));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  },

  syncWithBackend: async () => {
    const state = get();
    const data: AppData = {
      version: state.version,
      tasks: state.tasks,
      notes: state.notes,
      categories: state.categories,
      tags: state.tags,
    };
    try {
      await invoke('save_data', { data });
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  },

  updateConfig: (updates: Partial<AppConfig>) => {
    set((state) => ({ config: { ...state.config, ...updates } }));
    get().syncWithBackend();
  },

  addTask: (title: string, dueDate?: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      status: 'todo',
      priority: 'medium',
      order: get().tasks.length > 0 ? Math.max(...get().tasks.map(t => t.order)) + 1 : 0,
      dueDate,
      tags: [],
      subTasks: [],
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
    get().syncWithBackend();
  },

  updateTask: (id: string, updates: Partial<Task>) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
      ),
    }));
    get().syncWithBackend();
  },

  deleteTask: (id: string) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, isDeleted: true, deletedAt: new Date().toISOString() } : task
      ),
    }));
    get().syncWithBackend();
  },

  restoreTask: (id: string) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, isDeleted: false, deletedAt: undefined } : task
      ),
    }));
    get().syncWithBackend();
  },

  permanentDeleteTask: (id: string) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
    get().syncWithBackend();
  },

  toggleTaskStatus: (id: string) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus: Status = task.status === 'done' ? 'todo' : 'done';
    
    let newOrder = task.order;
    if (newStatus === 'done') {
      newOrder = get().tasks.length > 0 ? Math.max(...get().tasks.map(t => t.order)) + 1000 : 1000;
    }

    get().updateTask(id, { status: newStatus, order: newOrder });
  },

  getNote: (date: string) => {
    return get().notes.find((n) => n.date === date);
  },

  saveNote: (date: string, content: string) => {
    set((state) => {
      const existingNoteIndex = state.notes.findIndex((n) => n.date === date);
      const now = new Date().toISOString();
      
      let newNotes = [...state.notes];
      if (existingNoteIndex > -1) {
        newNotes[existingNoteIndex] = {
          ...newNotes[existingNoteIndex],
          content,
          lastSavedAt: now,
        };
      } else {
        newNotes.push({
          date,
          content,
          assets: [],
          isDeleted: false,
          lastSavedAt: now,
        });
      }
      return { notes: newNotes };
    });
    get().syncWithBackend();
  },

  addCategory: (name: string, color: string) => {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name,
      color,
      order: get().categories.length
    };
    set((state) => ({ categories: [...state.categories, newCategory] }));
    get().syncWithBackend();
  },

  deleteCategory: (id: string) => {
    set((state) => ({
      categories: state.categories.filter(c => c.id !== id),
      // 해당 카테고리가 할당된 태스크들은 카테고리 해제
      tasks: state.tasks.map(t => t.categoryId === id ? { ...t, categoryId: undefined } : t)
    }));
    get().syncWithBackend();
  },

  addTag: (name: string, color?: string) => {
    if (get().tags.some(t => t.name === name)) return;
    const newTag: Tag = { name, color };
    set((state) => ({ tags: [...state.tags, newTag] }));
    get().syncWithBackend();
  },

  deleteTag: (name: string) => {
    set((state) => ({
      tags: state.tags.filter(t => t.name !== name),
      // 태스크들에서 해당 태그 제거
      tasks: state.tasks.map(t => ({
        ...t,
        tags: t.tags.filter(tag => tag !== name)
      }))
    }));
    get().syncWithBackend();
  },
}));

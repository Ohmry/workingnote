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
        let tasks = data.tasks || [];
        
        // 테스트 데이터 생성 (태스크가 5개 미만일 때 강제 생성)
        if (tasks.filter(t => !t.isDeleted).length < 5) {
          const startIdx = tasks.length + 1;
          for (let i = startIdx; i < startIdx + 50; i++) {
            tasks.push({
              id: crypto.randomUUID(),
              title: `테스트 항목 #${i}`,
              description: `이것은 #${i}번 항목에 대한 상세 테스트 내용입니다. 스크롤과 필터링 테스트를 위해 생성되었습니다.`,
              status: 'todo',
              priority: i % 3 === 0 ? 'high' : (i % 2 === 0 ? 'medium' : 'low'),
              order: i,
              tags: ['test', i % 2 === 0 ? 'work' : 'personal'],
              subTasks: [],
              isDeleted: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
          // 생성된 데이터 즉시 백엔드 동기화 예약
          setTimeout(() => get().syncWithBackend(), 1000);
        }

        set((state) => ({
          tasks: tasks,
          notes: data.notes || [],
          categories: data.categories || [],
          tags: data.tags || (tasks.length > 0 ? [{ name: 'test' }, { name: 'work' }, { name: 'personal' }] : []),
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

import { create } from 'zustand';
import Database from '@tauri-apps/plugin-sql';
import { Task, DailyNote, Category, Tag, Status, AppConfig, SecureNote } from '../types';

interface TaskState {
  tasks: Task[];
  notes: DailyNote[];
  categories: Category[];
  tags: Tag[];
  secureNotes: SecureNote[];
  vaultPassword?: string;
  isVaultLocked: boolean;
  version: number;
  config: AppConfig;
  db: Database | null;
  
  // Persistence
  loadData: () => Promise<void>;
  updateConfig: (updates: Partial<AppConfig>) => void;
  
  // Tasks
  addTask: (title: string, dueDate?: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  restoreTask: (id: string) => Promise<void>;
  permanentDeleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  
  // Notes
  getNote: (date: string) => DailyNote | undefined;
  saveNote: (date: string, content: string) => Promise<void>;

  // Categories
  addCategory: (name: string, color: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Tags
  addTag: (name: string, color?: string) => Promise<void>;
  deleteTag: (name: string) => Promise<void>;

  // Secure Notes (Vault)
  unlockVault: (password: string) => boolean;
  lockVault: () => void;
  setVaultPassword: (password: string) => Promise<void>;
  addSecureNote: (title: string) => Promise<void>;
  updateSecureNote: (id: string, updates: Partial<SecureNote>) => Promise<void>;
  deleteSecureNote: (id: string) => Promise<void>;
}

const DEFAULT_CONFIG: AppConfig = {
  version: 1,
  storagePath: '',
  theme: 'system',
  language: 'ko',
  lastBackupAt: new Date().toISOString(),
  dailyNoteLayout: 'horizontal',
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  notes: [],
  categories: [],
  tags: [],
  secureNotes: [],
  vaultPassword: undefined,
  isVaultLocked: true,
  version: 1,
  config: DEFAULT_CONFIG,
  db: null,

  loadData: async () => {
    try {
      const db = await Database.load('sqlite:workingnote.db');
      set({ db });

      const safeSelect = async (query: string) => {
        try { return await db.select<any[]>(query); }
        catch (e) { return []; }
      };

      const tasksRaw = await safeSelect('SELECT * FROM tasks');
      const notesRaw = await safeSelect('SELECT * FROM daily_notes');
      const categoriesRaw = await safeSelect('SELECT * FROM categories');
      const tagsRaw = await safeSelect('SELECT * FROM tags');
      const secureNotesRaw = await safeSelect('SELECT * FROM secure_notes');
      const configRaw = await safeSelect('SELECT * FROM config');
      const taskTagsRaw = await safeSelect('SELECT * FROM task_tags');

      // Map config
      const themeConfig = configRaw.find(c => c.key === 'theme')?.value as any;
      const layoutConfig = configRaw.find(c => c.key === 'daily_note_layout')?.value as any;
      const vaultPassword = configRaw.find(c => c.key === 'vault_password')?.value;

      const newConfig = { 
        ...get().config, 
        theme: themeConfig || get().config.theme,
        dailyNoteLayout: layoutConfig || get().config.dailyNoteLayout 
      };

      const tasks: Task[] = (tasksRaw || []).map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        order: t.task_order ?? 0,
        dueDate: t.due_date,
        categoryId: t.category_id,
        isDeleted: t.is_deleted === 1 || t.is_deleted === true,
        deletedAt: t.deleted_at,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        subTasks: [],
        tags: (taskTagsRaw || [])
          .filter(tt => tt.task_id === t.id)
          .map(tt => tt.tag_name)
      }));

      const notes: DailyNote[] = (notesRaw || []).map(n => ({
        ...n,
        isDeleted: n.is_deleted === 1 || n.is_deleted === true,
        assets: [],
      }));

      const categories: Category[] = (categoriesRaw || []).map(c => ({
        ...c,
        order: c.category_order ?? 0,
      }));

      const secureNotes: SecureNote[] = (secureNotesRaw || []).map(sn => ({
        ...sn,
        isDeleted: sn.is_deleted === 1 || sn.is_deleted === true,
      }));

      set({
        tasks,
        notes,
        categories,
        tags: tagsRaw || [],
        secureNotes,
        vaultPassword,
        config: newConfig
      });

    } catch (error) {
      console.error('Failed to load data from SQLite:', error);
      set({ tasks: [], notes: [], categories: [], tags: [], secureNotes: [] });
    }
  },

  updateConfig: async (updates: Partial<AppConfig>) => {
    const { db } = get();
    const newConfig = { ...get().config, ...updates };
    set({ config: newConfig });

    if (db) {
      try {
        if (updates.theme) {
          await db.execute('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)', ['theme', updates.theme]);
        }
        if (updates.dailyNoteLayout) {
          await db.execute('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)', ['daily_note_layout', updates.dailyNoteLayout]);
        }
      } catch (err) {
        console.error('Failed to save config to DB:', err);
      }
    }
  },

  addTask: async (title: string, dueDate?: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      status: 'todo',
      priority: 'medium',
      order: get().tasks.length > 0 ? Math.max(...get().tasks.map(t => t.order)) + 1 : 0,
      dueDate: dueDate || undefined,
      tags: [],
      subTasks: [],
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { db } = get();
    if (db) {
      try {
        await db.execute(
          'INSERT INTO tasks (id, title, status, priority, task_order, due_date, is_deleted, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [newTask.id, newTask.title, newTask.status, newTask.priority, newTask.order, newTask.dueDate, 0, newTask.createdAt, newTask.updatedAt]
        );
      } catch (error) {
        console.error('Database INSERT error:', error);
      }
    }

    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    const { db, tasks } = get();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const updatedTask = { ...task, ...updates, updatedAt: new Date().toISOString() };
    
    if (db) {
      const setClauses: string[] = [];
      const values: any[] = [];
      
      if (updates.title !== undefined) { setClauses.push('title = ?'); values.push(updates.title); }
      if (updates.description !== undefined) { setClauses.push('description = ?'); values.push(updates.description); }
      if (updates.status !== undefined) { setClauses.push('status = ?'); values.push(updates.status); }
      if (updates.priority !== undefined) { setClauses.push('priority = ?'); values.push(updates.priority); }
      if (updates.order !== undefined) { setClauses.push('task_order = ?'); values.push(updates.order); }
      if (updates.dueDate !== undefined) { setClauses.push('due_date = ?'); values.push(updates.dueDate); }
      if (updates.categoryId !== undefined) { setClauses.push('category_id = ?'); values.push(updates.categoryId); }
      if (updates.isDeleted !== undefined) { setClauses.push('is_deleted = ?'); values.push(updates.isDeleted ? 1 : 0); }
      if (updates.deletedAt !== undefined) { setClauses.push('deleted_at = ?'); values.push(updates.deletedAt); }
      
      setClauses.push('updated_at = ?'); values.push(updatedTask.updatedAt);
      values.push(id);

      await db.execute(`UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`, values);

      // Handle tags update
      if (updates.tags !== undefined) {
        await db.execute('DELETE FROM task_tags WHERE task_id = ?', [id]);
        for (const tagName of updates.tags) {
          await db.execute('INSERT OR IGNORE INTO task_tags (task_id, tag_name) VALUES (?, ?)', [id, tagName]);
        }
      }
    }

    set((state) => ({
      tasks: state.tasks.map((t) => t.id === id ? updatedTask : t),
    }));
  },

  deleteTask: async (id: string) => {
    await get().updateTask(id, { isDeleted: true, deletedAt: new Date().toISOString() });
  },

  restoreTask: async (id: string) => {
    await get().updateTask(id, { isDeleted: false, deletedAt: undefined });
  },

  permanentDeleteTask: async (id: string) => {
    const { db } = get();
    if (db) {
      await db.execute('DELETE FROM tasks WHERE id = ?', [id]);
    }
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
  },

  toggleTaskStatus: async (id: string) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus: Status = task.status === 'done' ? 'todo' : 'done';
    await get().updateTask(id, { status: newStatus });
  },

  getNote: (date: string) => {
    return get().notes.find((n) => n.date === date);
  },

  saveNote: async (date: string, content: string) => {
    const { db, notes } = get();
    const existingNote = notes.find((n) => n.date === date);
    const now = new Date().toISOString();
    
    if (db) {
      if (existingNote) {
        await db.execute('UPDATE daily_notes SET content = ?, last_saved_at = ? WHERE date = ?', [content, now, date]);
      } else {
        await db.execute('INSERT INTO daily_notes (date, content, last_saved_at) VALUES (?, ?, ?)', [date, content, now]);
      }
    }

    set((state) => {
      const idx = state.notes.findIndex((n) => n.date === date);
      let newNotes = [...state.notes];
      if (idx > -1) newNotes[idx] = { ...newNotes[idx], content, lastSavedAt: now };
      else newNotes.push({ date, content, assets: [], isDeleted: false, lastSavedAt: now });
      return { notes: newNotes };
    });
  },

  addCategory: async (name: string, color: string) => {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name,
      color,
      order: get().categories.length
    };
    const { db } = get();
    if (db) {
      await db.execute('INSERT INTO categories (id, name, color, category_order) VALUES (?, ?, ?, ?)', [newCategory.id, newCategory.name, newCategory.color, newCategory.order]);
    }
    set((state) => ({ categories: [...state.categories, newCategory] }));
  },

  deleteCategory: async (id: string) => {
    const { db } = get();
    if (db) {
      await db.execute('DELETE FROM categories WHERE id = ?', [id]);
      await db.execute('UPDATE tasks SET category_id = NULL WHERE category_id = ?', [id]);
    }
    set((state) => ({
      categories: state.categories.filter(c => c.id !== id),
      tasks: state.tasks.map(t => t.categoryId === id ? { ...t, categoryId: undefined } : t)
    }));
  },

  addTag: async (name: string, color?: string) => {
    if (get().tags.some(t => t.name === name)) return;
    const newTag: Tag = { name, color };
    const { db } = get();
    if (db) {
      await db.execute('INSERT INTO tags (name, color) VALUES (?, ?)', [name, color]);
    }
    set((state) => ({ tags: [...state.tags, newTag] }));
  },

  deleteTag: async (name: string) => {
    const { db } = get();
    if (db) {
      await db.execute('DELETE FROM tags WHERE name = ?', [name]);
    }
    set((state) => ({
      tags: state.tags.filter(t => t.name !== name),
      tasks: state.tasks.map(t => ({ ...t, tags: t.tags.filter(tag => tag !== name) }))
    }));
  },

  unlockVault: (password: string) => {
    if (get().vaultPassword === password) {
      set({ isVaultLocked: false });
      return true;
    }
    return false;
  },

  lockVault: () => {
    set({ isVaultLocked: true });
  },

  setVaultPassword: async (password: string) => {
    const { db } = get();
    if (db) {
      await db.execute('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)', ['vault_password', password]);
    }
    set({ vaultPassword: password });
  },

  addSecureNote: async (title: string) => {
    const newNote: SecureNote = {
      id: crypto.randomUUID(),
      title,
      content: '',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const { db } = get();
    if (db) {
      await db.execute('INSERT INTO secure_notes (id, title, content, is_deleted, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)', [newNote.id, newNote.title, newNote.content, 0, newNote.createdAt, newNote.updatedAt]);
    }
    set((state) => ({ secureNotes: [...state.secureNotes, newNote] }));
  },

  updateSecureNote: async (id: string, updates: Partial<SecureNote>) => {
    const { db, secureNotes } = get();
    const note = secureNotes.find(n => n.id === id);
    if (!note) return;

    const updatedNote = { ...note, ...updates, updatedAt: new Date().toISOString() };
    
    if (db) {
      const setClauses: string[] = [];
      const values: any[] = [];
      if (updates.title !== undefined) { setClauses.push('title = ?'); values.push(updates.title); }
      if (updates.content !== undefined) { setClauses.push('content = ?'); values.push(updates.content); }
      if (updates.isDeleted !== undefined) { setClauses.push('is_deleted = ?'); values.push(updates.isDeleted ? 1 : 0); }
      setClauses.push('updated_at = ?'); values.push(updatedNote.updatedAt);
      values.push(id);

      await db.execute(`UPDATE secure_notes SET ${setClauses.join(', ')} WHERE id = ?`, values);
    }

    set((state) => ({
      secureNotes: state.secureNotes.map((n) => n.id === id ? updatedNote : n),
    }));
  },

  deleteSecureNote: async (id: string) => {
    const { db } = get();
    if (db) {
      await db.execute('DELETE FROM secure_notes WHERE id = ?', [id]);
    }
    set((state) => ({
      secureNotes: state.secureNotes.filter((note) => note.id !== id),
    }));
  },
}));

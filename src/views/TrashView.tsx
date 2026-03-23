import React from 'react';
import { useTaskStore } from '../store/useTaskStore';
import styles from './DailyFocusView.module.css';
import { Trash2, RotateCcw, XCircle } from 'lucide-react';

const TrashView: React.FC = () => {
  const { tasks, restoreTask, permanentDeleteTask } = useTaskStore();
  const deletedTasks = tasks.filter(t => t.isDeleted);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>휴지통</h1>
        <p className={styles.subtitle}>삭제된 업무들을 복구하거나 영구 삭제할 수 있습니다.</p>
      </header>

      <div className={styles.card} style={{ flex: 1, padding: '8px' }}>
        {deletedTasks.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>휴지통이 비어있습니다.</div>
        ) : (
          <ul className={styles.taskList}>
            {deletedTasks.map(task => (
              <li key={task.id} className={styles.taskItem}>
                <Trash2 size={16} color="var(--text-sub)" />
                <span className={styles.taskTitle}>{task.title}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className={styles.backButton} onClick={() => restoreTask(task.id)} title="복구"><RotateCcw size={14} /></button>
                  <button className={styles.deleteButton} onClick={() => { if(confirm('영구 삭제하시겠습니까?')) permanentDeleteTask(task.id); }} title="영구 삭제"><XCircle size={14} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TrashView;

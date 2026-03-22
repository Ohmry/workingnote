import { useTaskStore } from '../store/useTaskStore';
import styles from './TrashView.module.css';
import { format } from 'date-fns';

const TrashView: React.FC = () => {
  const { tasks, restoreTask, permanentDeleteTask } = useTaskStore();
  
  const deletedTasks = tasks.filter(t => t.isDeleted);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>휴지통</h1>
      </div>

      <div className={styles.list}>
        {deletedTasks.length === 0 ? (
          <div className={styles.emptyState}>
            휴지통이 비어 있습니다.
          </div>
        ) : (
          deletedTasks.map(task => (
            <div key={task.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <span className={styles.itemTitle}>{task.title}</span>
                <span className={styles.itemMeta}>
                  삭제일: {task.deletedAt ? format(new Date(task.deletedAt), 'yyyy-MM-dd HH:mm') : '알 수 없음'}
                </span>
              </div>
              <div className={styles.actions}>
                <button 
                  className={`${styles.actionButton} ${styles.restore}`}
                  onClick={() => restoreTask(task.id)}
                >
                  복원
                </button>
                <button 
                  className={`${styles.actionButton} ${styles.delete}`}
                  onClick={() => {
                    if (confirm('영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                      permanentDeleteTask(task.id);
                    }
                  }}
                >
                  영구 삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrashView;

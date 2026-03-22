import { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import Checkbox from '../components/Checkbox';
import styles from './DailyFocusView.module.css';
import { ArrowLeft, Trash2 } from 'lucide-react';

const AllTasksView: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus } = useTaskStore();
  
  const [taskInput, setTaskInput] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const handleAddTask = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && taskInput.trim()) {
      addTask(taskInput.trim());
      setTaskInput('');
    }
  };

  const handleTaskDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (selectedTaskId) {
      updateTask(selectedTaskId, { description: e.target.value });
    }
  };

  const handleTaskTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedTaskId) {
      updateTask(selectedTaskId, { title: e.target.value });
    }
  };

  const generalTasks = tasks
    .filter(t => !t.isDeleted && !t.dueDate)
    .sort((a, b) => a.order - b.order);

  return (
    <div className={styles.container}>
      <section className={styles.taskListSection} style={{ height: '100%', padding: '40px' }}>
        {selectedTaskId && selectedTask ? (
          <div className={styles.detailContainer}>
            <div className={styles.detailHeader}>
              <button 
                className={styles.backButton} 
                onClick={() => setSelectedTaskId(null)}
              >
                <ArrowLeft size={18} />
              </button>
              <input 
                className={styles.detailTitleInput}
                value={selectedTask.title}
                onChange={handleTaskTitleChange}
              />
              <button 
                className={styles.deleteButton}
                onClick={() => {
                  if (confirm('이 할 일을 삭제하시겠습니까?')) {
                    deleteTask(selectedTask.id);
                    setSelectedTaskId(null);
                  }
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
            <textarea
              className={styles.taskDescriptionEditor}
              placeholder="상세 내용을 적어보세요..."
              value={selectedTask.description || ''}
              onChange={handleTaskDescriptionChange}
              autoFocus
            />
          </div>
        ) : (
          <>
            <h1 className={styles.title}>할 일 목록</h1>
            <div className={styles.inputGroup}>
              <input
                type="text"
                className={styles.quickInput}
                placeholder="새로운 할 일을 추가하고 Enter를 누르세요"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={handleAddTask}
              />
            </div>
            <ul className={styles.taskList}>
              {generalTasks.length === 0 ? (
                <p className={styles.emptyState}>등록된 할 일이 없습니다.</p>
              ) : (
                generalTasks.map((task) => (
                  <li 
                    key={task.id} 
                    className={`${styles.taskItem} ${task.status === 'done' ? styles.done : ''}`}
                  >
                    <Checkbox 
                      checked={task.status === 'done'}
                      onChange={() => toggleTaskStatus(task.id)}
                    />
                    <span 
                      className={styles.taskTitle}
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      {task.title}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </>
        )}
      </section>
    </div>
  );
};

export default AllTasksView;

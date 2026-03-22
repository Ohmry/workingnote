import { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import Checkbox from '../components/Checkbox';
import styles from './DailyFocusView.module.css';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { ask } from '@tauri-apps/plugin-dialog';

interface AllTasksViewProps {
  viewType: 'all' | 'category' | 'tag';
  filterId?: string;
  onToggleTask: (id: string) => void;
}

const AllTasksView: React.FC<AllTasksViewProps> = ({ viewType, filterId, onToggleTask }) => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus, categories } = useTaskStore();
  
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

  const handleDelete = async () => {
    if (!selectedTaskId) return;
    
    let confirmed = false;
    try {
      // Tauri 플러그인을 통한 네이티브 창 시도 (한글 버튼 설정)
      confirmed = await ask('이 항목을 삭제하시겠습니까?', {
        title: '항목 삭제',
        kind: 'warning',
        okLabel: '삭제',
        cancelLabel: '취소'
      });
    } catch (error) {
      // 플러그인 로드 실패 시 브라우저 기본 confirm 사용
      confirmed = window.confirm('이 항목을 삭제하시겠습니까?');
    }

    if (confirmed) {
      deleteTask(selectedTaskId);
      setSelectedTaskId(null);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (t.isDeleted) return false;
    if (viewType === 'all') return !t.dueDate;
    if (viewType === 'category') return t.categoryId === filterId;
    if (viewType === 'tag') return t.tags.includes(filterId || '');
    return true;
  }).sort((a, b) => a.order - b.order);

  const getTitle = () => {
    if (viewType === 'all') return '목록';
    if (viewType === 'category') {
      const cat = categories.find(c => c.id === filterId);
      return cat ? `카테고리: ${cat.name}` : '카테고리';
    }
    if (viewType === 'tag') return `태그: #${filterId}`;
    return '목록';
  };

  return (
    <div className={styles.container} style={{ backgroundColor: 'var(--surface-color)', display: 'flex', flexDirection: 'column' }}>
      {/* 상단 고정 영역 */}
      <div style={{ padding: '40px 40px 0 40px', flexShrink: 0, zIndex: 999, position: 'relative' }}>
        {selectedTaskId && selectedTask ? (
          <div className={styles.detailHeader} style={{ position: 'relative', pointerEvents: 'auto' }}>
            <button className={styles.backButton} onClick={() => setSelectedTaskId(null)} title="목록으로 돌아가기">
              <ArrowLeft size={18} />
            </button>
            <input className={styles.detailTitleInput} value={selectedTask.title} onChange={handleTaskTitleChange} />
            <button 
              className={styles.deleteButton} 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              style={{ cursor: 'pointer', pointerEvents: 'auto', position: 'relative', zIndex: 1000 }}
              title="삭제"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ) : (
          <>
            <h1 className={styles.title} style={{ marginBottom: '24px' }}>{getTitle()}</h1>
            <div className={styles.inputGroup}>
              <input type="text" className={styles.quickInput} placeholder="새로운 항목을 추가하고 Enter를 누르세요" value={taskInput} onChange={(e) => setTaskInput(e.target.value)} onKeyDown={handleAddTask} />
            </div>
          </>
        )}
      </div>

      {/* 하단 스크롤 영역 */}
      <section className={styles.taskListSection} style={{ flex: 1, width: '100%', maxWidth: 'none', padding: '0 40px 40px 40px', overflowY: 'auto', border: 'none' }}>
        {selectedTaskId && selectedTask ? (
          <textarea className={styles.taskDescriptionEditor} placeholder="상세 내용을 적어보세요..." value={selectedTask.description || ''} onChange={handleTaskDescriptionChange} autoFocus />
        ) : (
          <ul className={styles.taskList}>
            {filteredTasks.length === 0 ? (
              <p className={styles.emptyState}>등록된 항목이 없습니다.</p>
            ) : (
              filteredTasks.map((task) => (
                <li key={task.id} className={`${styles.taskItem} ${task.status === 'done' ? styles.done : ''}`}>
                  <Checkbox checked={task.status === 'done'} onChange={() => onToggleTask(task.id)} />
                  <span className={styles.taskTitle} onClick={() => setSelectedTaskId(task.id)}>{task.title}</span>
                </li>
              ))
            )}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AllTasksView;

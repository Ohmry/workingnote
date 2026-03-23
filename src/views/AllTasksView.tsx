import { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import Checkbox from '../components/Checkbox';
import styles from './DailyFocusView.module.css';
import { ArrowLeft, Trash2, Edit2, Check, ArrowUpDown } from 'lucide-react';
import { ask } from '@tauri-apps/plugin-dialog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AllTasksViewProps {
  viewType: 'all' | 'category' | 'tag';
  filterId?: string;
  onToggleTask: (id: string) => void;
}

const AllTasksView: React.FC<AllTasksViewProps> = ({ viewType, filterId, onToggleTask }) => {
  const { tasks, addTask, updateTask, deleteTask, categories } = useTaskStore();
  
  const [taskInput, setTaskInput] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // 필터 및 정렬 상태 추가
  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'done'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'status' | 'title'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const handleAddTask = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && taskInput.trim()) {
      await addTask(taskInput.trim());
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
      confirmed = await ask('이 항목을 삭제하시겠습니까?', {
        title: '항목 삭제',
        kind: 'warning',
        okLabel: '삭제',
        cancelLabel: '취소'
      });
    } catch (error) {
      confirmed = window.confirm('이 항목을 삭제하시겠습니까?');
    }

    if (confirmed) {
      deleteTask(selectedTaskId);
      setSelectedTaskId(null);
      setIsEditing(false);
    }
  };

  const handleBack = () => {
    setSelectedTaskId(null);
    setIsEditing(false);
  };

  // 필터링 및 정렬된 태스크 계산
  const processedTasks = tasks.filter(t => {
    if (t.isDeleted) return false;
    
    // 기본 뷰 타입 필터
    let match = true;
    if (viewType === 'all') match = !t.dueDate;
    else if (viewType === 'category') match = t.categoryId === filterId;
    else if (viewType === 'tag') match = t.tags.includes(filterId || '');
    
    if (!match) return false;

    // 완료 상태 필터
    if (filterStatus === 'todo') return t.status === 'todo';
    if (filterStatus === 'done') return t.status === 'done';
    
    return true;
  }).sort((a, b) => {
    let comparison = 0;
    
    // 정렬 로직
    if (sortBy === 'status') {
      if (a.status === b.status) comparison = a.order - b.order;
      else comparison = a.status === 'todo' ? -1 : 1;
    } else if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else {
      comparison = a.order - b.order;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

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
            <button className={styles.backButton} onClick={handleBack} title="목록으로 돌아가기">
              <ArrowLeft size={18} />
            </button>
            <input className={styles.detailTitleInput} value={selectedTask.title} onChange={handleTaskTitleChange} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={styles.backButton} 
                onClick={() => setIsEditing(!isEditing)}
                title={isEditing ? "저장" : "편집"}
              >
                {isEditing ? <Check size={18} /> : <Edit2 size={18} />}
              </button>
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
          </div>
        ) : (
          <>
            <h1 className={styles.title} style={{ marginBottom: '24px' }}>{getTitle()}</h1>
            <div className={styles.inputGroup}>
              <input type="text" className={styles.quickInput} placeholder="새로운 항목을 추가하고 Enter를 누르세요" value={taskInput} onChange={(e) => setTaskInput(e.target.value)} onKeyDown={handleAddTask} />
            </div>
            
            {/* 필터 및 정렬 UI */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setFilterStatus('all')} 
                  style={{ 
                    background: 'none', border: 'none', color: filterStatus === 'all' ? 'var(--primary-color)' : 'var(--text-sub)', 
                    fontWeight: filterStatus === 'all' ? 'bold' : 'normal', cursor: 'pointer' 
                  }}
                >전체</button>
                <button 
                  onClick={() => setFilterStatus('todo')} 
                  style={{ 
                    background: 'none', border: 'none', color: filterStatus === 'todo' ? 'var(--primary-color)' : 'var(--text-sub)', 
                    fontWeight: filterStatus === 'todo' ? 'bold' : 'normal', cursor: 'pointer' 
                  }}
                >진행 중</button>
                <button 
                  onClick={() => setFilterStatus('done')} 
                  style={{ 
                    background: 'none', border: 'none', color: filterStatus === 'done' ? 'var(--primary-color)' : 'var(--text-sub)', 
                    fontWeight: filterStatus === 'done' ? 'bold' : 'normal', cursor: 'pointer' 
                  }}
                >완료</button>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-sub)' }}>정렬:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{ 
                    background: 'none', border: 'none', color: 'var(--text-main)', 
                    fontSize: '12px', cursor: 'pointer', outline: 'none' 
                  }}
                >
                  <option value="order">사용자 순서</option>
                  <option value="status">상태별</option>
                  <option value="title">가나다순</option>
                </select>
                <button 
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  style={{ 
                    background: 'none', border: 'none', color: 'var(--text-sub)', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    padding: '2px', borderRadius: '4px', transition: 'all 0.2s'
                  }}
                  title={sortOrder === 'asc' ? '오름차순' : '내림차순'}
                >
                  <ArrowUpDown size={14} style={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 하단 스크롤 영역 */}
      <section className={styles.taskListSection} style={{ flex: 1, width: '100%', maxWidth: 'none', padding: '0 40px 40px 40px', overflowY: 'auto', border: 'none' }}>
        {selectedTaskId && selectedTask ? (
          isEditing ? (
            <textarea 
              className={styles.taskDescriptionEditor} 
              placeholder="상세 내용을 적어보세요... (마크다운 지원)" 
              value={selectedTask.description || ''} 
              onChange={handleTaskDescriptionChange} 
              autoFocus 
            />
          ) : (
            <div className={styles.markdownPreview} style={{ minHeight: '200px' }}>
              {selectedTask.description ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedTask.description}</ReactMarkdown>
              ) : (
                <p style={{ color: 'var(--text-sub)', fontStyle: 'italic' }}>상세 내용이 없습니다. 편집 버튼을 눌러 추가하세요.</p>
              )}
            </div>
          )
        ) : (
          <ul className={styles.taskList}>
            {processedTasks.length === 0 ? (
              <p className={styles.emptyState}>해당하는 항목이 없습니다.</p>
            ) : (
              processedTasks.map((task) => (
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

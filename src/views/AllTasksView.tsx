import { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import Checkbox from '../components/Checkbox';
import styles from './DailyFocusView.module.css';
import { ArrowLeft, Trash2, Edit2, Check, ArrowUpDown } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ConfirmDialog from '../components/ConfirmDialog';

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
  
  const [localTitle, setLocalTitle] = useState('');
  const [localDesc, setLocalDesc] = useState('');

  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'done'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'status' | 'title'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const handleSelectTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setLocalTitle(task.title);
      setLocalDesc(task.description || '');
      setSelectedTaskId(id);
      setIsEditing(false);
    }
  };

  const handleAddTask = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && taskInput.trim()) {
      await addTask(taskInput.trim());
      setTaskInput('');
    }
  };

  const saveChanges = async () => {
    if (selectedTaskId) {
      await updateTask(selectedTaskId, { title: localTitle, description: localDesc });
    }
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      await saveChanges();
    }
    setIsEditing(!isEditing);
  };

  const handleDelete = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedTaskId) {
      deleteTask(selectedTaskId);
      setSelectedTaskId(null);
      setIsEditing(false);
    }
    setIsConfirmOpen(false);
  };

  const handleBack = async () => {
    if (isEditing) await saveChanges();
    setSelectedTaskId(null);
    setIsEditing(false);
  };

  const processedTasks = tasks.filter(t => {
    if (t.isDeleted) return false;
    let match = true;
    if (viewType === 'all') match = !t.dueDate;
    else if (viewType === 'category') match = t.categoryId === filterId;
    else if (viewType === 'tag') match = t.tags.includes(filterId || '');
    if (!match) return false;
    if (filterStatus === 'todo') return t.status === 'todo';
    if (filterStatus === 'done') return t.status === 'done';
    return true;
  }).sort((a, b) => {
    let comparison = 0;
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
    if (viewType === 'all') return '업무 목록';
    if (viewType === 'category') {
      const cat = categories.find(c => c.id === filterId);
      return cat ? `카테고리: ${cat.name}` : '카테고리';
    }
    if (viewType === 'tag') return `태그: #${filterId}`;
    return '목록';
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{getTitle()}</h1>
        <p className={styles.subtitle}>{processedTasks.length}개의 항목이 있습니다.</p>
      </header>

      <div className={styles.card} style={{ flex: 1 }}>
        {selectedTaskId && selectedTask ? (
          <>
            <div className={styles.detailHeader}>
              <button className={styles.backButton} onClick={handleBack} title="목록으로 돌아가기">
                <ArrowLeft size={18} />
              </button>
              <input 
                className={styles.detailTitleInput} 
                value={localTitle} 
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={saveChanges}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className={styles.backButton} onClick={handleToggleEdit} title={isEditing ? "저장" : "편집"}>
                  {isEditing ? <Check size={18} /> : <Edit2 size={18} />}
                </button>
                <button className={styles.deleteButton} onClick={handleDelete} title="삭제">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            {isEditing ? (
              <textarea 
                className={styles.markdownEditor} 
                placeholder="상세 내용을 적어보세요... (마크다운 지원)" 
                value={localDesc} 
                onChange={(e) => setLocalDesc(e.target.value)} 
                onBlur={saveChanges}
                autoFocus 
              />
            ) : (
              <MarkdownRenderer content={localDesc || '*상세 내용이 없습니다. 편집 버튼을 눌러 추가하세요.*'} />
            )}
          </>
        ) : (
          <>
            <div className={styles.inputGroup}>
              <input 
                type="text" 
                className={styles.quickInput} 
                placeholder="새로운 업무를 추가하세요..." 
                value={taskInput} 
                onChange={(e) => setTaskInput(e.target.value)} 
                onKeyDown={handleAddTask} 
              />
            </div>
            
            <div className={styles.controlsRow}>
              <div className={styles.segmentedControl}>
                <button className={filterStatus === 'all' ? styles.activeSegment : ''} onClick={() => setFilterStatus('all')}>전체</button>
                <button className={filterStatus === 'todo' ? styles.activeSegment : ''} onClick={() => setFilterStatus('todo')}>진행 중</button>
                <button className={filterStatus === 'done' ? styles.activeSegment : ''} onClick={() => setFilterStatus('done')}>완료</button>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className={styles.segmentedControl}>
                  <button className={sortBy === 'order' ? styles.activeSegment : ''} onClick={() => setSortBy('order')}>순서순</button>
                  <button className={sortBy === 'status' ? styles.activeSegment : ''} onClick={() => setSortBy('status')}>상태순</button>
                  <button className={sortBy === 'title' ? styles.activeSegment : ''} onClick={() => setSortBy('title')}>이름순</button>
                </div>
                <button 
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className={styles.backButton}
                  style={{ padding: '4px' }}
                  title={sortOrder === 'asc' ? '오름차순' : '내림차순'}
                >
                  <ArrowUpDown size={14} style={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              </div>
            </div>

            <ul className={styles.taskList}>
              {processedTasks.length === 0 ? (
                <div className={styles.emptyState}>해당하는 업무가 없습니다.</div>
              ) : (
                processedTasks.map((task) => (
                  <li key={task.id} className={`${styles.taskItem} ${task.status === 'done' ? styles.done : ''}`}>
                    <Checkbox checked={task.status === 'done'} onChange={() => onToggleTask(task.id)} />
                    <span className={styles.taskTitle} onClick={() => handleSelectTask(task.id)}>{task.title}</span>
                  </li>
                ))
              )}
            </ul>
          </>
        )}
      </div>
      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="항목 삭제"
        message="이 항목을 삭제하시겠습니까?"
        confirmLabel="삭제"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
        isDanger={true}
      />
    </div>
  );
};

export default AllTasksView;

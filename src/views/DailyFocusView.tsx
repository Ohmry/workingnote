import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTaskStore } from '../store/useTaskStore';
import Checkbox from '../components/Checkbox';
import styles from './DailyFocusView.module.css';
import { ArrowLeft, Trash2, Edit3, Eye, CalendarDays, ArrowUpDown } from 'lucide-react';

interface DailyFocusViewProps {
  date: string; // YYYY-MM-DD
  onDateSelect: (date: string) => void;
  onToggleTask: (id: string) => void;
}

const DailyFocusView: React.FC<DailyFocusViewProps> = ({ date, onDateSelect, onToggleTask }) => {
  const { tasks, addTask, updateTask, deleteTask, getNote, saveNote } = useTaskStore();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  let displayDate = "";
  try {
    displayDate = format(new Date(date), 'yyyy년 M월 d일 eeee', { locale: ko });
  } catch (e) {
    displayDate = date;
  }
  
  const [taskInput, setTaskInput] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [splitSize, setSplitSize] = useState(40); // %
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  // 필터 및 정렬 상태 추가
  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'done'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'status' | 'title'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  useEffect(() => {
    const existingNote = getNote(date);
    if (existingNote) {
      setNoteContent(existingNote.content);
    } else {
      setNoteContent('');
    }
    setSelectedTaskId(null);
  }, [getNote, date]);

  const handleAddTask = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && taskInput.trim()) {
      addTask(taskInput.trim(), date);
      setTaskInput('');
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setNoteContent(content);
    saveNote(date, content);
  };

  const handleTaskTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedTaskId) {
      updateTask(selectedTaskId, { title: e.target.value });
    }
  };

  const handleTaskDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (selectedTaskId) {
      updateTask(selectedTaskId, { description: e.target.value });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = splitSize;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (containerRef.current) {
        let delta = 0;
        if (isLandscape) {
          delta = ((moveEvent.clientX - startX) / containerRef.current.offsetWidth) * 100;
        } else {
          delta = ((moveEvent.clientY - startY) / containerRef.current.offsetHeight) * 100;
        }
        const newSize = Math.min(Math.max(startSize + delta, 10), 80);
        setSplitSize(newSize);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const todayTasks = tasks.filter(t => {
    if (t.isDeleted || t.dueDate !== date) return false;
    
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

    // 정렬 순서 적용
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className={styles.container} ref={containerRef}>
      <section 
        className={styles.taskListSection} 
        style={isLandscape ? { width: `${splitSize}%`, height: '100%' } : { height: `${splitSize}%`, width: '100%' }}
      >
        {selectedTaskId && selectedTask ? (
          <div className={styles.detailContainer}>
            <div className={styles.detailHeader}>
              <button 
                className={styles.backButton} 
                onClick={() => setSelectedTaskId(null)}
                title="목록으로 돌아가기"
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
              placeholder="할 일에 대한 상세 내용을 마크다운으로 작성하세요..."
              value={selectedTask.description || ''}
              onChange={handleTaskDescriptionChange}
              autoFocus
            />
          </div>
        ) : (
          <>
            <div className={styles.headerRow}>
              <h1 className={styles.title}>{displayDate}</h1>
              {date !== todayStr && (
                <button 
                  className={styles.todayButton}
                  onClick={() => onDateSelect(todayStr)}
                >
                  <CalendarDays size={14} />
                  오늘로 이동
                </button>
              )}
            </div>
            <div className={styles.inputGroup}>
              <input
                type="text"
                className={styles.quickInput}
                placeholder="할 일을 입력하고 Enter를 누르세요"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={handleAddTask}
              />
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

            <ul className={styles.taskList}>
              {todayTasks.length === 0 ? (
                <p className={styles.emptyState}>예정된 할 일이 없습니다.</p>
              ) : (
                todayTasks.map((task) => (
                  <li 
                    key={task.id} 
                    className={`${styles.taskItem} ${task.status === 'done' ? styles.done : ''}`}
                  >
                    <Checkbox
                      checked={task.status === 'done'}
                      onChange={() => onToggleTask(task.id)}
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

      <div className={styles.divider} onMouseDown={handleMouseDown} />

      <section className={styles.noteSection}>
        <div className={styles.noteHeader}>
          <h2 className={styles.title}>일지</h2>
          <button 
            className={styles.toggleButton} 
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? (
              <>
                <Eye size={14} />
                <span>미리보기</span>
              </>
            ) : (
              <>
                <Edit3 size={14} />
                <span>편집하기</span>
              </>
            )}
          </button>
        </div>
        
        {isEditMode ? (
          <textarea
            className={styles.markdownEditor}
            placeholder="오늘의 일지를 작성해 보세요..."
            value={noteContent}
            onChange={handleNoteChange}
          />
        ) : (
          <div className={styles.markdownPreview}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {noteContent || '*작성된 일지가 없습니다.*'}
            </ReactMarkdown>
          </div>
        )}
      </section>
    </div>
  );
};

export default DailyFocusView;

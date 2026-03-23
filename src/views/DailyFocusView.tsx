import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import MarkdownRenderer from '../components/MarkdownRenderer';
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
  const { tasks, addTask, updateTask, deleteTask, getNote, saveNote, config } = useTaskStore();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isLandscape = config.dailyNoteLayout === 'horizontal';
  
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

  const [localTaskTitle, setLocalTaskTitle] = useState('');
  const [localTaskDesc, setLocalTaskDesc] = useState('');

  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'done'>('all');
  const [sortBy] = useState<'order' | 'status' | 'title'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  useEffect(() => {
    const existingNote = getNote(date);
    setNoteContent(existingNote?.content || '');
    setSelectedTaskId(null);
  }, [getNote, date]);

  const handleSelectTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setLocalTaskTitle(task.title);
      setLocalTaskDesc(task.description || '');
      setSelectedTaskId(id);
    }
  };

  const handleAddTask = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && taskInput.trim()) {
      await addTask(taskInput.trim(), date);
      setTaskInput('');
    }
  };

  const saveTaskChanges = async () => {
    if (selectedTaskId) {
      await updateTask(selectedTaskId, { title: localTaskTitle, description: localTaskDesc });
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(e.target.value);
    saveNote(date, e.target.value);
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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className={styles.title}>{displayDate}</h1>
            <p className={styles.subtitle}>{todayTasks.length}개의 할 일이 있습니다.</p>
          </div>
          {date !== todayStr && (
            <button className={styles.backButton} onClick={() => onDateSelect(todayStr)} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
              <CalendarDays size={16} /> 오늘로 이동
            </button>
          )}
        </div>
      </header>

      <div 
        ref={containerRef}
        className={`${isLandscape ? styles.horizontal : styles.vertical}`} 
        style={{ flex: 1, display: 'flex', minHeight: 0 }}
      >
        {/* Tasks Card */}
        <section className={`${styles.card} ${styles.taskListSection}`} style={isLandscape ? { width: `${splitSize}%` } : { height: `${splitSize}%` }}>
          {selectedTaskId && selectedTask ? (
            <>
              <div className={styles.detailHeader}>
                <button className={styles.backButton} onClick={() => { saveTaskChanges(); setSelectedTaskId(null); }}><ArrowLeft size={18} /></button>
                <input className={styles.detailTitleInput} value={localTaskTitle} onChange={(e) => setLocalTaskTitle(e.target.value)} onBlur={saveTaskChanges} />
                <button className={styles.deleteButton} onClick={() => { if(confirm('삭제할까요?')) { deleteTask(selectedTask.id); setSelectedTaskId(null); }}}><Trash2 size={18} /></button>
              </div>
              <textarea className={styles.markdownEditor} placeholder="상세 내용..." value={localTaskDesc} onChange={(e) => setLocalTaskDesc(e.target.value)} onBlur={saveTaskChanges} autoFocus />
            </>
          ) : (
            <>
              <div className={styles.inputGroup}>
                <input type="text" className={styles.quickInput} placeholder="할 일 추가..." value={taskInput} onChange={(e) => setTaskInput(e.target.value)} onKeyDown={handleAddTask} />
              </div>
              <div className={styles.controlsRow}>
                <div className={styles.segmentedControl}>
                  <button className={filterStatus === 'all' ? styles.activeSegment : ''} onClick={() => setFilterStatus('all')}>전체</button>
                  <button className={filterStatus === 'todo' ? styles.activeSegment : ''} onClick={() => setFilterStatus('todo')}>진행</button>
                  <button className={filterStatus === 'done' ? styles.activeSegment : ''} onClick={() => setFilterStatus('done')}>완료</button>
                </div>
                <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className={styles.backButton} style={{ padding: '4px' }}>
                  <ArrowUpDown size={14} style={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }} />
                </button>
              </div>
              <ul className={styles.taskList}>
                {todayTasks.map(task => (
                  <li key={task.id} className={styles.taskItem}>
                    <Checkbox checked={task.status === 'done'} onChange={() => onToggleTask(task.id)} />
                    <span className={styles.taskTitle} onClick={() => handleSelectTask(task.id)}>{task.title}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <div className={styles.divider} onMouseDown={handleMouseDown} />

        {/* Note Card */}
        <section className={`${styles.card} ${styles.noteSection}`}>
          <div className={styles.noteHeader}>
            <span style={{ fontWeight: 700, fontSize: '14px' }}>일일 업무 일지</span>
            <div className={styles.segmentedControl}>
              <button className={!isEditMode ? styles.activeSegment : ''} onClick={() => setIsEditMode(false)}><Eye size={14} /> 미리보기</button>
              <button className={isEditMode ? styles.activeSegment : ''} onClick={() => setIsEditMode(true)}><Edit3 size={14} /> 편집</button>
            </div>
          </div>
          {isEditMode ? (
            <textarea className={styles.markdownEditor} placeholder="오늘의 일지를 마크다운으로 작성하세요..." value={noteContent} onChange={handleNoteChange} autoFocus />
          ) : (
            <MarkdownRenderer content={noteContent || '*작성된 일지가 없습니다.*'} />
          )}
        </section>
      </div>
    </div>
  );
};

export default DailyFocusView;

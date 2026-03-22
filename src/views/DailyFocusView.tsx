import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTaskStore } from '../store/useTaskStore';
import styles from './DailyFocusView.module.css';

const DailyFocusView: React.FC = () => {
  const { tasks, addTask, toggleTaskStatus, getNote, saveNote } = useTaskStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const displayDate = format(new Date(), 'yyyy년 M월 d일 eeee', { locale: ko });
  
  const [taskInput, setTaskInput] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isEditMode, setIsEditMode] = useState(true);
  const [taskListHeight, setTaskListHeight] = useState(40); // %
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existingNote = getNote(today);
    if (existingNote) {
      setNoteContent(existingNote.content);
    }
  }, [getNote, today]);

  const handleAddTask = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && taskInput.trim()) {
      addTask(taskInput.trim());
      setTaskInput('');
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setNoteContent(content);
    saveNote(today, content);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const startY = e.clientY;
    const startHeight = taskListHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (containerRef.current) {
        const delta = ((moveEvent.clientY - startY) / containerRef.current.offsetHeight) * 100;
        const newHeight = Math.min(Math.max(startHeight + delta, 10), 80);
        setTaskListHeight(newHeight);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const todayTasks = tasks
    .filter(t => !t.isDeleted)
    .sort((a, b) => a.order - b.order);

  return (
    <div className={styles.container} ref={containerRef}>
      <section 
        className={styles.taskListSection} 
        style={{ height: `${taskListHeight}%` }}
      >
        <h1 className={styles.title}>오늘의 할 일</h1>
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
        <ul className={styles.taskList}>
          {todayTasks.length === 0 ? (
            <p className={styles.emptyState}>오늘 예정된 할 일이 없습니다.</p>
          ) : (
            todayTasks.map((task) => (
              <li 
                key={task.id} 
                className={`${styles.taskItem} ${task.status === 'done' ? styles.done : ''}`}
              >
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={task.status === 'done'}
                  onChange={() => toggleTaskStatus(task.id)}
                />
                <span className={styles.taskTitle}>{task.title}</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <div className={styles.divider} onMouseDown={handleMouseDown} />

      <section className={styles.noteSection}>
        <div className={styles.noteHeader}>
          <h2 className={styles.title}>{displayDate}</h2>
          <button 
            className={styles.toggleButton} 
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? '미리보기' : '편집하기'}
          </button>
        </div>
        
        {isEditMode ? (
          <textarea
            className={styles.markdownEditor}
            placeholder="오늘의 업무 내용을 마크다운으로 적어보세요..."
            value={noteContent}
            onChange={handleNoteChange}
            autoFocus
          />
        ) : (
          <div className={styles.markdownPreview}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {noteContent || '*작성된 내용이 없습니다.*'}
            </ReactMarkdown>
          </div>
        )}
      </section>
    </div>
  );
};

export default DailyFocusView;

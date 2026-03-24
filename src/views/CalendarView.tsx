import { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay 
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, StickyNote } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import styles from './CalendarView.module.css';

interface CalendarViewProps {
  onDateSelect: (date: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { tasks, notes } = useTaskStore();

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{format(currentMonth, 'yyyy년 M월', { locale: ko })}</h1>
        <div className={styles.nav}>
          <button className={styles.navButton} onClick={prevMonth}><ChevronLeft size={20} /></button>
          <button className={styles.navButton} onClick={() => setCurrentMonth(new Date())}>오늘</button>
          <button className={styles.navButton} onClick={nextMonth}><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className={styles.grid}>
        {weekDays.map((day) => (
          <div key={day} className={styles.dayHeader}>{day}</div>
        ))}
        {days.map((day, idx) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, monthStart);
          const hasNote = notes.some(n => n.date === dayStr && !n.isDeleted);
          const dayTasks = tasks.filter(t => !t.isDeleted && t.dueDate === dayStr);
          const totalTasks = dayTasks.length;
          const todoTasks = dayTasks.filter(t => t.status !== 'done').length;

          return (
            <div 
              key={idx} 
              className={`
                ${styles.dayCell} 
                ${!isCurrentMonth ? styles.notCurrentMonth : ''} 
                ${isToday ? styles.today : ''}
              `}
              onClick={() => onDateSelect(dayStr)}
            >
              <div className={styles.dayTop}>
                <span className={styles.dayNumber}>{format(day, 'd')}</span>
                {hasNote && <StickyNote className={styles.noteIndicator} size={12} />}
              </div>
              
              <div className={styles.taskCountContainer}>
                {totalTasks > 0 && (
                  <span className={`${styles.taskCountBadge} ${todoTasks === 0 ? styles.allDone : ''}`}>
                    {todoTasks > 0 ? `업무 ${todoTasks}` : '완료'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;

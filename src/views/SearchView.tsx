import React from 'react';
import { useTaskStore } from '../store/useTaskStore';
import styles from './DailyFocusView.module.css';
import { Search as SearchIcon, FileText, CheckCircle, Lock } from 'lucide-react';

interface SearchViewProps {
  query: string;
  onResultClick: (type: 'task' | 'note' | 'vault', id: string) => void;
}

const SearchView: React.FC<SearchViewProps> = ({ query, onResultClick }) => {
  const { tasks, notes, secureNotes } = useTaskStore();

  if (!query.trim()) {
    return (
      <div className={styles.container} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', opacity: 0.5 }}>
          <SearchIcon size={64} strokeWidth={1} style={{ marginBottom: '24px' }} />
          <p style={{ fontSize: '16px' }}>검색어를 입력하여 업무와 일지를 찾아보세요.</p>
        </div>
      </div>
    );
  }

  const searchLower = query.toLowerCase();
  const filteredTasks = tasks.filter(t => !t.isDeleted && (t.title.toLowerCase().includes(searchLower) || t.description?.toLowerCase().includes(searchLower)));
  const filteredNotes = notes.filter(n => !n.isDeleted && n.content.toLowerCase().includes(searchLower));
  const filteredSecureNotes = secureNotes.filter(sn => !sn.isDeleted && sn.title.toLowerCase().includes(searchLower));

  const totalResults = filteredTasks.length + filteredNotes.length + filteredSecureNotes.length;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>검색 결과</h1>
        <p className={styles.subtitle}>"{query}"에 대한 {totalResults}개의 결과를 찾았습니다.</p>
      </header>

      <div className={styles.card} style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        {totalResults === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>검색 결과가 없습니다.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {filteredTasks.length > 0 && (
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '12px' }}>할 일 ({filteredTasks.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredTasks.map(task => (
                    <div key={task.id} className={styles.taskItem} onClick={() => onResultClick('task', task.id)}>
                      <CheckCircle size={14} color="var(--primary-color)" />
                      <span className={styles.taskTitle}>{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredNotes.length > 0 && (
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '12px' }}>일지 ({filteredNotes.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredNotes.map(note => (
                    <div key={note.date} className={styles.taskItem} style={{ flexDirection: 'column', alignItems: 'flex-start' }} onClick={() => onResultClick('note', note.date)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={14} color="var(--primary-color)" />
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>{note.date} 일지</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-sub)', margin: '4px 0 0 22px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredSecureNotes.length > 0 && (
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '12px' }}>보관함 ({filteredSecureNotes.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredSecureNotes.map(note => (
                    <div key={note.id} className={styles.taskItem} onClick={() => onResultClick('vault', note.id)}>
                      <Lock size={14} color="var(--primary-color)" />
                      <span className={styles.taskTitle}>{note.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;

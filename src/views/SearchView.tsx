import React from 'react';
import { useTaskStore } from '../store/useTaskStore';
import styles from './SearchView.module.css';
import { Search as SearchIcon, FileText, CheckCircle } from 'lucide-react';

interface SearchViewProps {
  query: string;
  onResultClick: (type: 'task' | 'note', id: string) => void;
}

const SearchView: React.FC<SearchViewProps> = ({ query, onResultClick }) => {
  const { tasks, notes } = useTaskStore();

  if (!query.trim()) {
    return (
      <div className={styles.emptyState}>
        <SearchIcon size={48} strokeWidth={1} style={{ marginBottom: '16px' }} />
        <p>검색어를 입력하여 할 일과 일지를 찾아보세요.</p>
      </div>
    );
  }

  const searchLower = query.toLowerCase();

  // 할 일 검색 (제목, 설명)
  const filteredTasks = tasks.filter(t => 
    !t.isDeleted && 
    (t.title.toLowerCase().includes(searchLower) || 
     t.description?.toLowerCase().includes(searchLower))
  );

  // 일지 검색 (내용)
  const filteredNotes = notes.filter(n => 
    !n.isDeleted && 
    n.content.toLowerCase().includes(searchLower)
  );

  const totalResults = filteredTasks.length + filteredNotes.length;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>검색 결과</h1>
      <p className={styles.summary}>"{query}"에 대한 검색 결과가 {totalResults}개 있습니다.</p>

      {totalResults === 0 ? (
        <div className={styles.emptyState}>
          <p>검색 결과가 없습니다.</p>
        </div>
      ) : (
        <>
          {filteredTasks.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>할 일 ({filteredTasks.length})</h2>
              {filteredTasks.map(task => (
                <div 
                  key={task.id} 
                  className={styles.resultItem}
                  onClick={() => onResultClick('task', task.id)}
                >
                  <div className={styles.itemHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={14} color="var(--primary-color)" />
                      <span className={styles.itemTitle}>{task.title}</span>
                    </div>
                    <span className={styles.itemMeta}>{task.dueDate || '날짜 미지정'}</span>
                  </div>
                  {task.description && (
                    <p className={styles.itemSnippet}>{task.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {filteredNotes.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>업무 일지 ({filteredNotes.length})</h2>
              {filteredNotes.map(note => (
                <div 
                  key={note.date} 
                  className={styles.resultItem}
                  onClick={() => onResultClick('note', note.date)}
                >
                  <div className={styles.itemHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={14} color="var(--primary-color)" />
                      <span className={styles.itemTitle}>{note.date} 업무일지</span>
                    </div>
                  </div>
                  <p className={styles.itemSnippet}>{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchView;

import { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import styles from './DailyFocusView.module.css';
import { Lock, Unlock, Plus, Trash2, Edit3, Eye, ArrowLeft, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SecureNotesView: React.FC = () => {
  const { 
    secureNotes, 
    vaultPassword, 
    isVaultLocked, 
    unlockVault, 
    lockVault, 
    setVaultPassword,
    addSecureNote,
    updateSecureNote,
    deleteSecureNote 
  } = useTaskStore();

  const [passwordInput, setPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockVault(passwordInput)) {
      setPasswordInput('');
      setError('');
    } else {
      setError('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setError('비밀번호는 최소 4자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setVaultPassword(newPassword);
    setError('');
  };

  const handleAddNote = () => {
    const title = prompt('메모 제목을 입력하세요:');
    if (title) {
      addSecureNote(title);
    }
  };

  const currentNote = secureNotes.find(n => n.id === selectedNoteId);

  // Initial Password Setup
  if (!vaultPassword) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <Lock size={48} style={{ color: 'var(--primary-color)', marginBottom: '24px' }} />
          <h1 className={styles.title} style={{ marginBottom: '12px' }}>보관함 비밀번호 설정</h1>
          <p style={{ color: 'var(--text-sub)', marginBottom: '32px', fontSize: '14px' }}>민감한 정보를 보호하기 위해 사용할 비밀번호를 설정해주세요.</p>
          
          <form onSubmit={handleSetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="password" 
              className={styles.quickInput} 
              placeholder="새 비밀번호" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input 
              type="password" 
              className={styles.quickInput} 
              placeholder="비밀번호 확인" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && <p style={{ color: 'var(--danger-color)', fontSize: '12px', margin: '4px 0' }}>{error}</p>}
            <button 
              className={styles.toggleButton} 
              style={{ 
                marginTop: '12px', 
                width: '100%', 
                justifyContent: 'center',
                height: '42px',
                fontSize: '14px'
              }}
            >
              보관함 시작하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Locked Screen
  if (isVaultLocked) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <Lock size={48} style={{ color: 'var(--text-sub)', marginBottom: '24px' }} />
          <h1 className={styles.title} style={{ marginBottom: '12px' }}>보관함이 잠겨있습니다</h1>
          <p style={{ color: 'var(--text-sub)', marginBottom: '32px', fontSize: '14px' }}>비밀번호를 입력하여 접근하세요.</p>
          
          <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="password" 
              className={styles.quickInput} 
              placeholder="비밀번호 입력" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
              style={{ height: '42px' }}
            />
            {error && <p style={{ color: 'var(--danger-color)', fontSize: '12px', margin: '4px 0' }}>{error}</p>}
            <button 
              className={styles.toggleButton} 
              style={{ 
                marginTop: '12px', 
                width: '100%', 
                justifyContent: 'center',
                height: '42px',
                fontSize: '14px'
              }}
            >
              잠금 해제
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main Content
  return (
    <div className={styles.container} style={{ display: 'flex' }}>
      {/* Left List Section */}
      <section className={styles.taskListSection} style={{ width: '300px', flexShrink: 0, borderRight: '1px solid var(--border-color)' }}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>보관함</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={styles.todayButton} onClick={handleAddNote} title="메모 추가">
              <Plus size={16} />
            </button>
            <button className={styles.todayButton} onClick={lockVault} title="보관함 잠그기">
              <Unlock size={16} />
            </button>
          </div>
        </div>
        
        <ul className={styles.taskList}>
          {secureNotes.length === 0 ? (
            <p className={styles.emptyState}>저장된 메모가 없습니다.</p>
          ) : (
            secureNotes.map(note => (
              <li 
                key={note.id} 
                className={`${styles.taskItem} ${selectedNoteId === note.id ? styles.active : ''}`}
                onClick={() => {
                  setSelectedNoteId(note.id);
                  setIsEditMode(false);
                }}
                style={{ cursor: 'pointer', padding: '12px' }}
              >
                <span className={styles.taskTitle}>{note.title}</span>
              </li>
            ))
          )}
        </ul>
      </section>

      {/* Right Content Section */}
      <section className={styles.noteSection}>
        {currentNote ? (
          <>
            <div className={styles.noteHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 className={styles.title}>{currentNote.title}</h2>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className={styles.toggleButton} onClick={() => setIsEditMode(!isEditMode)}>
                  {isEditMode ? <><Eye size={14} /> 미리보기</> : <><Edit3 size={14} /> 편집</>}
                </button>
                <button 
                  className={styles.deleteButton} 
                  style={{ padding: '6px 12px' }}
                  onClick={() => {
                    if (confirm('이 메모를 영구 삭제하시겠습니까?')) {
                      deleteSecureNote(currentNote.id);
                      setSelectedNoteId(null);
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {isEditMode ? (
              <textarea
                className={styles.markdownEditor}
                value={currentNote.content}
                onChange={(e) => updateSecureNote(currentNote.id, { content: e.target.value })}
                placeholder="민감한 정보를 기록하세요..."
                autoFocus
              />
            ) : (
              <div className={styles.markdownPreview}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {currentNote.content || '*내용이 없습니다.*'}
                </ReactMarkdown>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-sub)' }}>
            <Unlock size={32} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>메모를 선택하거나 새로 추가하세요.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default SecureNotesView;

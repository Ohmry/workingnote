import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import styles from './DailyFocusView.module.css';
import { Lock, Unlock, Plus, Trash2, Edit3, Eye, ShieldCheck, ChevronRight } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ConfirmDialog from '../components/ConfirmDialog';

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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState('');
  
  // Local content state to fix input overlapping/lag issue
  const [localContent, setLocalContent] = useState('');

  const currentNote = secureNotes.find(n => n.id === selectedNoteId);

  // Sync local content when note changes
  useEffect(() => {
    if (currentNote) {
      setLocalContent(currentNote.content || '');
    } else {
      setLocalContent('');
    }
  }, [selectedNoteId]);

  const handleDeleteConfirm = () => {
    if (selectedNoteId) {
      deleteSecureNote(selectedNoteId);
      setSelectedNoteId(null);
    }
    setIsConfirmOpen(false);
  };

  const handleAddNote = (title?: string) => {
    if (title && title.trim()) {
      addSecureNote(title.trim());
    }
    setIsAddModalOpen(false);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalContent(newValue);
    if (selectedNoteId) {
      updateSecureNote(selectedNoteId, { content: newValue });
    }
  };

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

  if (!vaultPassword || isVaultLocked) {
    return (
      <div className={styles.container} style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
        <div className={styles.lockScreenCard}>
          <div className={styles.lockIconContainer}>
            <Lock size={40} color="var(--primary-color)" />
          </div>
          <h1 className={styles.title} style={{ fontSize: '24px', marginBottom: '8px' }}>
            {!vaultPassword ? '보관함 비밀번호 설정' : '보관함이 잠겨있습니다'}
          </h1>
          <p className={styles.subtitle} style={{ marginBottom: '32px' }}>
            {!vaultPassword ? '민감한 정보를 보호하기 위한 비밀번호를 설정하세요.' : '접근을 위해 비밀번호를 입력해주세요.'}
          </p>
          
          <form onSubmit={!vaultPassword ? handleSetPassword : handleUnlock} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            {!vaultPassword ? (
              <>
                <input type="password" className={styles.quickInput} placeholder="새 비밀번호 (4자 이상)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoFocus style={{ height: '40px', width: '100%', boxSizing: 'border-box' }} />
                <input type="password" className={styles.quickInput} placeholder="비밀번호 확인" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ height: '40px', width: '100%', boxSizing: 'border-box' }} />
              </>
            ) : (
              <input type="password" className={styles.quickInput} placeholder="비밀번호 입력" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} autoFocus style={{ height: '40px', width: '100%', boxSizing: 'border-box' }} />
            )}
            {error && <p style={{ color: 'var(--danger-color)', fontSize: '13px', margin: '4px 0', fontWeight: 600 }}>{error}</p>}
            <button className={styles.primaryButton} style={{ marginTop: '12px', width: '100%' }}>
              {!vaultPassword ? '보관함 시작하기' : '잠금 해제'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className={styles.title}>비밀 보관함</h1>
            <p className={styles.subtitle}>암호로 보호되는 민감한 메모입니다.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className={styles.backButton} onClick={async () => {
              for(let i=1; i<=20; i++) {
                await addSecureNote(`테스트 메모 ${i}`);
              }
              alert('20개의 테스트 메모가 생성되었습니다.');
            }} style={{ fontSize: '12px' }}>
              일괄 생성 (테스트)
            </button>
            <button className={styles.backButton} onClick={() => setIsAddModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
              <Plus size={16} /> 새 메모
            </button>
            <button className={styles.backButton} onClick={lockVault} title="잠그기">
              <Lock size={16} />
            </button>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', gap: '24px', minHeight: 0 }}>
        <section className={styles.card} style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
          <div className={styles.controlsRow} style={{ padding: '12px 20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)' }}>메모 목록 ({secureNotes.length})</span>
          </div>
          <ul className={styles.taskList}>
            {secureNotes.map(note => (
              <li 
                key={note.id} 
                className={styles.taskItem} 
                style={selectedNoteId === note.id ? { backgroundColor: 'var(--bg-color)' } : {}}
                onClick={() => { setSelectedNoteId(note.id); setIsEditMode(false); }}
              >
                <ShieldCheck size={14} color="var(--primary-color)" />
                <span className={styles.taskTitle} style={{ fontWeight: selectedNoteId === note.id ? 700 : 500 }}>{note.title}</span>
                <ChevronRight size={14} style={{ opacity: 0.3 }} />
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.card} style={{ flex: 1 }}>
          {currentNote ? (
            <>
              <div className={styles.noteHeader}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>{currentNote.title}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div className={styles.segmentedControl}>
                    <button className={!isEditMode ? styles.activeSegment : ''} onClick={() => setIsEditMode(false)}><Eye size={14} /></button>
                    <button className={isEditMode ? styles.activeSegment : ''} onClick={() => setIsEditMode(true)}><Edit3 size={14} /></button>
                  </div>
                  <button className={styles.deleteButton} onClick={() => setIsConfirmOpen(true)}><Trash2 size={16} /></button>
                </div>
              </div>
              {isEditMode ? (
                <textarea 
                  className={styles.markdownEditor} 
                  value={localContent} 
                  onChange={handleContentChange} 
                  autoFocus 
                  placeholder="메모 내용을 입력하세요..."
                />
              ) : (
                <MarkdownRenderer content={currentNote.content || '*내용이 없습니다.*'} />
              )}
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
              <Unlock size={48} style={{ marginBottom: '16px' }} />
              <p>메모를 선택하거나 새로 추가하세요.</p>
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="영구 삭제"
        message="이 메모를 영구적으로 삭제하시겠습니까?"
        confirmLabel="삭제"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsConfirmOpen(false)}
        isDanger={true}
      />

      <ConfirmDialog 
        isOpen={isAddModalOpen}
        title="새 비밀 메모"
        showInput={true}
        inputPlaceholder="메모 제목을 입력하세요"
        confirmLabel="생성"
        onConfirm={handleAddNote}
        onCancel={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default SecureNotesView;

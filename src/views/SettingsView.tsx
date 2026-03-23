import { useTaskStore } from '../store/useTaskStore';
import styles from './SettingsView.module.css';
import { invoke } from '@tauri-apps/api/core';
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import { FolderOpen } from 'lucide-react';

const SettingsView: React.FC = () => {
  const { config, updateConfig } = useTaskStore();

  const handleOpenFolder = async () => {
    try {
      // For revealItemInDir, we need the path to a file inside the folder or the folder itself
      const path = await invoke<string>('get_db_folder_path');
      await revealItemInDir(path);
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>설정</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>데이터 관리</h2>
        <div className={styles.settingItem}>
          <label className={styles.label}>데이터 저장 위치</label>
          <p className={styles.description}>앱의 모든 데이터(SQLite DB 등)가 저장되는 시스템 경로입니다.</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button className={styles.button} onClick={handleOpenFolder} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderOpen size={16} />
              저장 폴더 열기
            </button>
          </div>
        </div>
        <div className={styles.settingItem}>
          <label className={styles.label}>데이터 백업</label>
          <p className={styles.description}>마지막 백업: {config.lastBackupAt ? new Date(config.lastBackupAt).toLocaleString() : '기록 없음'}</p>
          <button className={styles.button}>지금 백업하기</button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>개인화</h2>
        <div className={styles.settingItem}>
          <label className={styles.label}>테마</label>
          <div className={styles.buttonGroup}>
            <button 
              className={`${styles.button} ${config.theme === 'light' ? styles.primary : ''}`}
              onClick={() => updateConfig({ theme: 'light' })}
            >
              라이트
            </button>
            <button 
              className={`${styles.button} ${config.theme === 'dark' ? styles.primary : ''}`}
              onClick={() => updateConfig({ theme: 'dark' })}
            >
              다크
            </button>
            <button 
              className={`${styles.button} ${config.theme === 'system' ? styles.primary : ''}`}
              onClick={() => updateConfig({ theme: 'system' })}
            >
              시스템
            </button>
          </div>
        </div>

        <div className={styles.settingItem} style={{ marginTop: '24px' }}>
          <label className={styles.label}>일지 레이아웃</label>
          <p className={styles.description}>할 일 목록과 일지 작성 창의 배치 방식을 선택합니다.</p>
          <div className={styles.buttonGroup}>
            <button 
              className={`${styles.button} ${config.dailyNoteLayout === 'horizontal' ? styles.primary : ''}`}
              onClick={() => updateConfig({ dailyNoteLayout: 'horizontal' })}
            >
              좌우 배치 (수평)
            </button>
            <button 
              className={`${styles.button} ${config.dailyNoteLayout === 'vertical' ? styles.primary : ''}`}
              onClick={() => updateConfig({ dailyNoteLayout: 'vertical' })}
            >
              상하 배치 (수직)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsView;

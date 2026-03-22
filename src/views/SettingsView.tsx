import { useTaskStore } from '../store/useTaskStore';
import styles from './SettingsView.module.css';

const SettingsView: React.FC = () => {
  const { config, updateConfig } = useTaskStore();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>설정</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>데이터 관리</h2>
        <div className={styles.settingItem}>
          <label className={styles.label}>저장 경로</label>
          <p className={styles.description}>사용자의 할 일과 일지 데이터가 저장될 위치를 지정합니다.</p>
          <div className={styles.buttonGroup}>
            <input 
              type="text" 
              className={styles.inputField} 
              value={config.storagePath || '기본 경로 사용 중'} 
              readOnly 
            />
            <button className={styles.button}>경로 변경</button>
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
      </section>
    </div>
  );
};

export default SettingsView;

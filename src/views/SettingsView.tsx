import React from 'react';
import { useTaskStore } from '../store/useTaskStore';
import styles from './SettingsView.module.css';
import { invoke } from '@tauri-apps/api/core';
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import { 
  FolderOpen, 
  Moon, 
  Sun, 
  Monitor, 
  LayoutTemplate, 
  Database,
  Info,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const SettingsView: React.FC = () => {
  const { config, updateConfig, vaultPassword } = useTaskStore();
  const version = "0.1.0"; // Manually or via getVersion from tauri-apps/api/app

  const handleOpenFolder = async () => {
    try {
      const path = await invoke<string>('get_db_folder_path');
      await revealItemInDir(path);
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>설정</h1>
        <p className={styles.subtitle}>앱의 환경과 데이터를 관리합니다.</p>
      </header>

      <div className={styles.content}>
        {/* Appearance Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Sun size={18} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>테마 및 디자인</h2>
          </div>
          
          <div className={styles.card}>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>컬러 테마</span>
                <span className={styles.settingDesc}>앱의 전체적인 색상 모드를 선택합니다.</span>
              </div>
              <div className={styles.segmentedControl}>
                <button 
                  className={config.theme === 'light' ? styles.activeSegment : ''} 
                  onClick={() => updateConfig({ theme: 'light' })}
                >
                  <Sun size={14} /> 라이트
                </button>
                <button 
                  className={config.theme === 'dark' ? styles.activeSegment : ''} 
                  onClick={() => updateConfig({ theme: 'dark' })}
                >
                  <Moon size={14} /> 다크
                </button>
                <button 
                  className={config.theme === 'system' ? styles.activeSegment : ''} 
                  onClick={() => updateConfig({ theme: 'system' })}
                >
                  <Monitor size={14} /> 시스템
                </button>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>일지 레이아웃</span>
                <span className={styles.settingDesc}>할 일과 일지창의 배치 방식을 변경합니다.</span>
              </div>
              <div className={styles.segmentedControl}>
                <button 
                  className={config.dailyNoteLayout === 'horizontal' ? styles.activeSegment : ''} 
                  onClick={() => updateConfig({ dailyNoteLayout: 'horizontal' })}
                >
                  <LayoutTemplate size={14} style={{ transform: 'rotate(90deg)' }} /> 좌우
                </button>
                <button 
                  className={config.dailyNoteLayout === 'vertical' ? styles.activeSegment : ''} 
                  onClick={() => updateConfig({ dailyNoteLayout: 'vertical' })}
                >
                  <LayoutTemplate size={14} /> 상하
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Data Management Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Database size={18} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>데이터 및 보안</h2>
          </div>
          
          <div className={styles.card}>
            <div className={styles.settingRow} onClick={handleOpenFolder} style={{ cursor: 'pointer' }}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>로컬 데이터 폴더</span>
                <span className={styles.settingDesc}>데이터베이스 파일이 저장된 위치를 탐색기에서 엽니다.</span>
              </div>
              <div className={styles.actionBtn}>
                <FolderOpen size={16} />
                <span>폴더 열기</span>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>보관함 보안</span>
                <span className={styles.settingDesc}>
                  {vaultPassword ? '비밀번호가 설정되어 있습니다.' : '비밀번호를 설정하지 않았습니다.'}
                </span>
              </div>
              <ShieldCheck size={20} color={vaultPassword ? "var(--success-color)" : "var(--text-sub)"} />
            </div>
          </div>
        </section>

        {/* App Info Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Info size={18} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>앱 정보</h2>
          </div>
          <div className={styles.card}>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>현재 버전</span>
                <span className={styles.settingDesc}>최신 버전을 사용 중입니다.</span>
              </div>
              <span className={styles.versionBadge}>v{version}</span>
            </div>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <p>© 2026 Working Note. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SettingsView;

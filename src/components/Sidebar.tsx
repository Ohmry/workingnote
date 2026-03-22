import React from 'react';
import { 
  Calendar, 
  Trash2, 
  Settings, 
  Folder, 
  Tag as TagIcon,
  Layout,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import styles from './Sidebar.module.css';

export type ViewType = 'today' | 'calendar' | 'trash' | 'settings';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isCollapsed, onToggle }) => {
  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        {!isCollapsed && <div className={styles.logoArea}>Working Note</div>}
        {isCollapsed && <Layout className={styles.icon} style={{ color: 'var(--primary-color)' }} />}
      </div>

      <nav className={styles.menuSection}>
        <div 
          className={`${styles.menuItem} ${activeView === 'today' ? styles.active : ''}`}
          onClick={() => onViewChange('today')}
          title="오늘의 포커스"
        >
          <Layout className={styles.icon} />
          <span className={styles.menuText}>오늘의 포커스</span>
        </div>
        <div 
          className={`${styles.menuItem} ${activeView === 'calendar' ? styles.active : ''}`}
          onClick={() => onViewChange('calendar')}
          title="캘린더"
        >
          <Calendar className={styles.icon} />
          <span className={styles.menuText}>캘린더</span>
        </div>
        <div 
          className={`${styles.menuItem} ${activeView === 'trash' ? styles.active : ''}`}
          onClick={() => onViewChange('trash')}
          title="휴지통"
        >
          <Trash2 className={styles.icon} />
          <span className={styles.menuText}>휴지통</span>
        </div>

        {!isCollapsed && <div className={styles.sectionTitle}>Categories</div>}
        <div className={styles.menuItem} title="Work">
          <Folder className={styles.icon} />
          <span className={styles.menuText}>Work</span>
        </div>
        <div className={styles.menuItem} title="Personal">
          <Folder className={styles.icon} />
          <span className={styles.menuText}>Personal</span>
        </div>

        {!isCollapsed && <div className={styles.sectionTitle}>Tags</div>}
        <div className={styles.menuItem} title="#important">
          <TagIcon className={styles.icon} />
          <span className={styles.menuText}>#important</span>
        </div>
      </nav>

      <div className={styles.bottomSection}>
        <div 
          className={styles.menuItem} 
          onClick={onToggle} 
          title={isCollapsed ? "사이드바 펴기" : "사이드바 접기"}
        >
          {isCollapsed ? <PanelLeftOpen className={styles.icon} /> : <PanelLeftClose className={styles.icon} />}
          <span className={styles.menuText}>사이드바 접기</span>
        </div>
        <div 
          className={`${styles.menuItem} ${activeView === 'settings' ? styles.active : ''}`}
          onClick={() => onViewChange('settings')}
          title="설정"
        >
          <Settings className={styles.icon} />
          <span className={styles.menuText}>설정</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

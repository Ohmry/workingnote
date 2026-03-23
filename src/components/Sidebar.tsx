import React from 'react';
import { 
  Calendar, 
  Trash2, 
  Settings, 
  Layout,
  ListTodo,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Lock
} from 'lucide-react';
import styles from './Sidebar.module.css';

import Logo from './Logo';

export type ViewType = 'today' | 'all' | 'calendar' | 'trash' | 'settings' | 'category' | 'tag' | 'search' | 'vault';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange, 
  isCollapsed, 
  onToggle,
  searchQuery,
  onSearchChange
}) => {
  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <Logo collapsed={isCollapsed} />
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <Search size={16} className={styles.searchIcon} />
          {!isCollapsed && (
            <input 
              className={styles.searchInput}
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          )}
        </div>
      </div>

      <nav className={styles.menuSection}>
        <div 
          className={`${styles.menuItem} ${activeView === 'today' ? styles.active : ''}`}
          onClick={() => onViewChange('today')}
          title="일지"
        >
          <Layout className={styles.icon} />
          <span className={styles.menuText}>일지</span>
        </div>
        <div 
          className={`${styles.menuItem} ${activeView === 'all' ? styles.active : ''}`}
          onClick={() => onViewChange('all')}
          title="목록"
        >
          <ListTodo className={styles.icon} />
          <span className={styles.menuText}>목록</span>
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
          className={`${styles.menuItem} ${activeView === 'vault' ? styles.active : ''}`}
          onClick={() => onViewChange('vault')}
          title="보관함"
        >
          <Lock className={styles.icon} />
          <span className={styles.menuText}>보관함</span>
        </div>
        <div 
          className={`${styles.menuItem} ${activeView === 'trash' ? styles.active : ''}`}
          onClick={() => onViewChange('trash')}
          title="휴지통"
        >
          <Trash2 className={styles.icon} />
          <span className={styles.menuText}>휴지통</span>
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

import React from 'react';
import { 
  Calendar, 
  Trash2, 
  Settings, 
  Folder, 
  Tag as TagIcon,
  Layout,
  ListTodo,
  PanelLeftClose,
  PanelLeftOpen,
  Plus
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { useTaskStore } from '../store/useTaskStore';

export type ViewType = 'today' | 'all' | 'calendar' | 'trash' | 'settings' | 'category' | 'tag';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  activeFilter?: string;
  onFilterChange: (type: ViewType, filterId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange, 
  isCollapsed, 
  onToggle,
  activeFilter,
  onFilterChange
}) => {
  const { categories, tags, addCategory } = useTaskStore();

  const handleAddCategory = () => {
    const name = prompt('새 카테고리 이름을 입력하세요:');
    if (name) {
      addCategory(name, '#4f46e5');
    }
  };

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
          title="업무일지"
        >
          <Layout className={styles.icon} />
          <span className={styles.menuText}>업무일지</span>
        </div>
        <div 
          className={`${styles.menuItem} ${activeView === 'all' ? styles.active : ''}`}
          onClick={() => onViewChange('all')}
          title="할 일 목록"
        >
          <ListTodo className={styles.icon} />
          <span className={styles.menuText}>할 일 목록</span>
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

        {!isCollapsed && (
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>Categories</div>
            <button className={styles.addBtn} onClick={handleAddCategory}><Plus size={14} /></button>
          </div>
        )}
        {categories.map(category => (
          <div 
            key={category.id}
            className={`${styles.menuItem} ${activeView === 'category' && activeFilter === category.id ? styles.active : ''}`}
            onClick={() => onFilterChange('category', category.id)}
            title={category.name}
          >
            <Folder className={styles.icon} style={{ color: category.color }} />
            <span className={styles.menuText}>{category.name}</span>
          </div>
        ))}

        {!isCollapsed && <div className={styles.sectionTitle}>Tags</div>}
        {tags.map(tag => (
          <div 
            key={tag.name}
            className={`${styles.menuItem} ${activeView === 'tag' && activeFilter === tag.name ? styles.active : ''}`}
            onClick={() => onFilterChange('tag', tag.name)}
            title={tag.name}
          >
            <TagIcon className={styles.icon} />
            <span className={styles.menuText}>#{tag.name}</span>
          </div>
        ))}
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

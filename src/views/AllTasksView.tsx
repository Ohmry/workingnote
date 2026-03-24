import { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import Checkbox from '../components/Checkbox';
import TaskModal from '../components/TaskModal';
import TagPicker from '../components/TagPicker';
import ContextMenu from '../components/ContextMenu';
import styles from './DailyFocusView.module.css';
import { ArrowLeft, Trash2, Edit2, Check, ArrowUpDown, Search, Plus, Filter, Tag as TagIcon } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ConfirmDialog from '../components/ConfirmDialog';

interface AllTasksViewProps {
  viewType: 'all' | 'category' | 'tag';
  filterId?: string;
  onToggleTask: (id: string) => void;
}

const AllTasksView: React.FC<AllTasksViewProps> = ({ viewType, filterId, onToggleTask }) => {
  const { tasks, updateTask, deleteTask, categories, tags, addTag } = useTaskStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [localTitle, setLocalTitle] = useState('');
  const [localDesc, setLocalDesc] = useState('');
  const [localTags, setLocalTags] = useState<string[]>([]);

  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'done'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'status' | 'title'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, isOpen: boolean, taskId: string | null }>({
    x: 0, y: 0, isOpen: false, taskId: null
  });

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const handleSelectTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setLocalTitle(task.title);
      setLocalDesc(task.description || '');
      setLocalTags(task.tags || []);
      setSelectedTaskId(id);
      setIsEditing(false);
    }
  };

  const saveChanges = async () => {
    if (selectedTaskId) {
      await updateTask(selectedTaskId, { 
        title: localTitle, 
        description: localDesc,
        tags: localTags
      });
    }
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      await saveChanges();
    }
    setIsEditing(!isEditing);
  };

  const handleDelete = (id?: string) => {
    if (id) {
      // If triggered from context menu
      setSelectedTaskId(id);
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedTaskId) {
      deleteTask(selectedTaskId);
      setSelectedTaskId(null);
      setIsEditing(false);
    }
    setIsConfirmOpen(false);
  };

  const handleBack = async () => {
    if (isEditing) await saveChanges();
    setSelectedTaskId(null);
    setIsEditing(false);
  };

  const handleToggleTag = (tagName: string) => {
    setLocalTags(prev => {
      const newTags = prev.includes(tagName) 
        ? prev.filter(t => t !== tagName) 
        : [...prev, tagName];
      
      // Auto save if not in full edit mode
      if (!isEditing && selectedTaskId) {
        updateTask(selectedTaskId, { tags: newTags });
      }
      return newTags;
    });
  };

  const handleAddNewTag = async (tagName: string) => {
    await addTag(tagName);
    const newTags = [...localTags, tagName];
    setLocalTags(newTags);
    if (!isEditing && selectedTaskId) {
      updateTask(selectedTaskId, { tags: newTags });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      isOpen: true,
      taskId
    });
  };

  const processedTasks = tasks.filter(t => {
    if (t.isDeleted) return false;
    
    // View type filtering
    let match = true;
    if (viewType === 'all') match = !t.dueDate;
    else if (viewType === 'category') match = t.categoryId === filterId;
    else if (viewType === 'tag') match = t.tags.includes(filterId || '');
    if (!match) return false;

    // Status filtering
    if (filterStatus === 'todo' && t.status !== 'todo') return false;
    if (filterStatus === 'done' && t.status !== 'done') return false;

    // Label filtering
    if (selectedLabel && !t.tags.includes(selectedLabel)) return false;

    // Search filtering
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      const inTitle = t.title.toLowerCase().includes(search);
      const inDesc = t.description?.toLowerCase().includes(search);
      if (!inTitle && !inDesc) return false;
    }

    return true;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'status') {
      if (a.status === b.status) comparison = a.order - b.order;
      else comparison = a.status === 'todo' ? -1 : 1;
    } else if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else {
      comparison = a.order - b.order;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getTitle = () => {
    if (viewType === 'all') return '업무 목록';
    if (viewType === 'category') {
      const cat = categories.find(c => c.id === filterId);
      return cat ? `카테고리: ${cat.name}` : '카테고리';
    }
    if (viewType === 'tag') return `태그: #${filterId}`;
    return '목록';
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className={styles.title}>{getTitle()}</h1>
            <p className={styles.subtitle}>{processedTasks.length}개의 항목이 있습니다.</p>
          </div>
          {!selectedTaskId && (
            <button 
              className={styles.primaryButton} 
              style={{ width: 'auto', padding: '0 16px', gap: '8px' }}
              onClick={() => setIsTaskModalOpen(true)}
            >
              <Plus size={18} /> 업무 추가
            </button>
          )}
        </div>
      </header>

      <div className={styles.card} style={{ flex: 1 }}>
        {selectedTaskId && selectedTask ? (
          <>
            <div className={styles.detailHeader}>
              <button className={styles.backButton} onClick={handleBack} title="목록으로 돌아가기">
                <ArrowLeft size={18} />
              </button>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input 
                  className={styles.detailTitleInput} 
                  value={localTitle} 
                  onChange={(e) => setLocalTitle(e.target.value)}
                  onBlur={saveChanges}
                />
                <div style={{ padding: '0 4px' }}>
                  <TagPicker 
                    selectedTags={localTags} 
                    onToggleTag={handleToggleTag} 
                    onAddTag={handleAddNewTag}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start', marginTop: '4px' }}>
                <button className={styles.backButton} onClick={handleToggleEdit} title={isEditing ? "저장" : "편집"}>
                  {isEditing ? <Check size={18} /> : <Edit2 size={18} />}
                </button>
                <button className={styles.deleteButton} onClick={() => handleDelete()} title="삭제">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            {isEditing ? (
              <textarea 
                className={styles.markdownEditor} 
                placeholder="상세 내용을 적어보세요... (마크다운 지원)" 
                value={localDesc} 
                onChange={(e) => setLocalDesc(e.target.value)} 
                onBlur={saveChanges}
                autoFocus 
              />
            ) : (
              <MarkdownRenderer content={localDesc || '*상세 내용이 없습니다. 편집 버튼을 눌러 추가하세요.*'} />
            )}
          </>
        ) : (
          <>
            <div className={styles.inputGroup} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
                <input 
                  type="text" 
                  className={styles.quickInput} 
                  style={{ paddingLeft: '36px' }}
                  placeholder="업무 목록에서 검색..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '140px' }}>
                <Filter size={16} color="var(--text-sub)" />
                <select 
                  className={styles.quickInput} 
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                  value={selectedLabel}
                  onChange={(e) => setSelectedLabel(e.target.value)}
                >
                  <option value="">모든 라벨</option>
                  {tags.map(tag => (
                    <option key={tag.name} value={tag.name}>{tag.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className={styles.controlsRow}>
              <div className={styles.segmentedControl}>
                <button className={filterStatus === 'all' ? styles.activeSegment : ''} onClick={() => setFilterStatus('all')}>전체</button>
                <button className={filterStatus === 'todo' ? styles.activeSegment : ''} onClick={() => setFilterStatus('todo')}>진행 중</button>
                <button className={filterStatus === 'done' ? styles.activeSegment : ''} onClick={() => setFilterStatus('done')}>완료</button>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className={styles.segmentedControl}>
                  <button className={sortBy === 'order' ? styles.activeSegment : ''} onClick={() => setSortBy('order')}>순서순</button>
                  <button className={sortBy === 'status' ? styles.activeSegment : ''} onClick={() => setSortBy('status')}>상태순</button>
                  <button className={sortBy === 'title' ? styles.activeSegment : ''} onClick={() => setSortBy('title')}>이름순</button>
                </div>
                <button 
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className={styles.backButton}
                  style={{ padding: '4px' }}
                  title={sortOrder === 'asc' ? '오름차순' : '내림차순'}
                >
                  <ArrowUpDown size={14} style={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              </div>
            </div>

            <ul className={styles.taskList}>
              {processedTasks.length === 0 ? (
                <div className={styles.emptyState}>해당하는 업무가 없습니다.</div>
              ) : (
                processedTasks.map((task) => (
                  <li 
                    key={task.id} 
                    className={`${styles.taskItem} ${task.status === 'done' ? styles.done : ''}`}
                    onContextMenu={(e) => handleContextMenu(e, task.id)}
                  >
                    <Checkbox checked={task.status === 'done'} onChange={() => onToggleTask(task.id)} />
                    <div className={styles.taskTitle} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }} onClick={() => handleSelectTask(task.id)}>
                      <span>{task.title}</span>
                      {task.tags && task.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {task.tags.map(tag => (
                            <span key={tag} style={{ fontSize: '10px', padding: '1px 6px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-sub)' }}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </>
        )}
      </div>

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        dueDate={viewType === 'all' ? undefined : undefined} 
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="항목 삭제"
        message="이 항목을 삭제하시겠습니까?"
        confirmLabel="삭제"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
        isDanger={true}
      />

      <ContextMenu 
        {...contextMenu}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
        items={[
          {
            label: '상세 보기',
            icon: <Edit2 size={14} />,
            onClick: () => contextMenu.taskId && handleSelectTask(contextMenu.taskId)
          },
          {
            label: '삭제',
            icon: <Trash2 size={14} />,
            onClick: () => contextMenu.taskId && handleDelete(contextMenu.taskId),
            isDanger: true
          }
        ]}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TagIcon size={12} /> 라벨 관리
        </div>
        <TagPicker 
          selectedTags={tasks.find(t => t.id === contextMenu.taskId)?.tags || []}
          onToggleTag={(tagName) => {
            if (contextMenu.taskId) {
              const task = tasks.find(t => t.id === contextMenu.taskId);
              if (task) {
                const newTags = task.tags.includes(tagName)
                  ? task.tags.filter(t => t !== tagName)
                  : [...task.tags, tagName];
                updateTask(contextMenu.taskId, { tags: newTags });
                // If this is the currently selected task in detail view, update local state too
                if (contextMenu.taskId === selectedTaskId) setLocalTags(newTags);
              }
            }
          }}
          onAddTag={async (tagName) => {
            if (contextMenu.taskId) {
              await addTag(tagName);
              const task = tasks.find(t => t.id === contextMenu.taskId);
              if (task) {
                const newTags = [...task.tags, tagName];
                updateTask(contextMenu.taskId, { tags: newTags });
                if (contextMenu.taskId === selectedTaskId) setLocalTags(newTags);
              }
            }
          }}
        />
      </ContextMenu>
    </div>
  );
};

export default AllTasksView;


import { useEffect, useState } from 'react';
import DailyFocusView from './views/DailyFocusView';
import AllTasksView from './views/AllTasksView';
import CalendarView from './views/CalendarView';
import TrashView from './views/TrashView';
import SettingsView from './views/SettingsView';
import SearchView from './views/SearchView';
import SecureNotesView from './views/SecureNotesView';
import Sidebar, { ViewType } from './components/Sidebar';
import Toast from './components/Toast';
import { useTaskStore } from './store/useTaskStore';
import { format } from 'date-fns';

interface ToastState {
  message: string;
  onUndo?: () => void;
}

function App() {
  const loadData = useTaskStore((state) => state.loadData);
  const toggleTaskStatus = useTaskStore((state) => state.toggleTaskStatus);
  const theme = useTaskStore((state) => state.config.theme);
  
  const [activeView, setActiveView] = useState<ViewType>('today');
  const [filterId, setFilterId] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 테마 적용 로직
  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (targetTheme: 'light' | 'dark' | 'system') => {
      let resolvedTheme = targetTheme;
      if (targetTheme === 'system') {
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      root.setAttribute('data-theme', resolvedTheme);
    };

    applyTheme(theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const showToast = (message: string, onUndo?: () => void) => {
    setToast({ message, onUndo });
  };

  const handleToggleTask = (id: string) => {
    const task = useTaskStore.getState().tasks.find(t => t.id === id);
    if (!task) return;

    const isCompleting = task.status !== 'done';
    const originalOrder = task.order; // 기존 순서 기억
    
    toggleTaskStatus(id);

    if (isCompleting) {
      showToast('항목을 완료했습니다.', () => {
        // 실행 취소 시: 상태를 미완료로 돌리고 기존 순서 복구
        toggleTaskStatus(id); 
        useTaskStore.getState().updateTask(id, { order: originalOrder });
      });
    }
  };

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    setFilterId(undefined);
    if (view === 'today') {
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    }
    if (view !== 'search') setSearchQuery('');
  };

  const handleFilterChange = (type: ViewType, id: string) => {
    setActiveView(type);
    setFilterId(id);
    setSearchQuery('');
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setActiveView('today');
    setSearchQuery('');
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setActiveView('search');
    } else {
      setActiveView('today');
    }
  };

  const handleSearchResultClick = (type: 'task' | 'note' | 'vault', id: string) => {
    if (type === 'note') {
      setSelectedDate(id);
      setActiveView('today');
    } else if (type === 'vault') {
      setActiveView('vault');
      // noteId selection logic can be added to SecureNotesView via a global state if needed
    } else {
      const task = useTaskStore.getState().tasks.find(t => t.id === id);
      if (task?.dueDate) {
        setSelectedDate(task.dueDate);
        setActiveView('today');
      } else {
        setActiveView('all');
      }
    }
    setSearchQuery('');
  };

  const renderView = () => {
    switch (activeView) {
      case 'today':
        return <DailyFocusView date={selectedDate} onDateSelect={handleDateSelect} onToggleTask={handleToggleTask} />;
      case 'all':
      case 'category':
      case 'tag':
        return <AllTasksView viewType={activeView as any} filterId={filterId} onToggleTask={handleToggleTask} />;
      case 'search':
        return <SearchView query={searchQuery} onResultClick={handleSearchResultClick} />;
      case 'calendar':
        return <CalendarView onDateSelect={handleDateSelect} />;
      case 'vault':
        return <SecureNotesView />;
      case 'trash':
        return <TrashView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DailyFocusView date={selectedDate} onDateSelect={handleDateSelect} onToggleTask={handleToggleTask} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar 
        activeView={activeView} 
        onViewChange={handleViewChange} 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeFilter={filterId}
        onFilterChange={handleFilterChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />
      <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {renderView()}
        {toast && (
          <Toast 
            message={toast.message} 
            onUndo={toast.onUndo} 
            onClose={() => setToast(null)} 
          />
        )}
      </main>
    </div>
  );
}

export default App;

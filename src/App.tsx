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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('--- DATABASE INFO ---');
        console.log('DB Name:', 'workingnote.db');
        console.log('---------------------');
        
        await loadData();
      } catch (err) {
        console.error('App: Initialization failed', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
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
  }, [theme]);

  const showToast = (message: string, onUndo?: () => void) => {
    setToast({ message, onUndo });
  };

  const handleToggleTask = async (id: string) => {
    const task = useTaskStore.getState().tasks.find(t => t.id === id);
    if (!task) return;

    const isCompleting = task.status !== 'done';
    const originalOrder = task.order;
    
    await toggleTaskStatus(id);

    if (isCompleting) {
      showToast('항목을 완료했습니다.', () => {
        toggleTaskStatus(id).then(() => {
          useTaskStore.getState().updateTask(id, { order: originalOrder });
        });
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

  // If still loading and it's been more than 5 seconds, force render
  if (isLoading) {
    return (
      <div style={{ 
        height: '100vh', width: '100vw', display: 'flex', 
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#f9fafb', color: '#111827'
      }}>
        <h2>데이터를 불러오는 중...</h2>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar 
        activeView={activeView} 
        onViewChange={handleViewChange} 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
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

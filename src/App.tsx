import { useEffect, useState } from 'react';
import DailyFocusView from './views/DailyFocusView';
import AllTasksView from './views/AllTasksView';
import CalendarView from './views/CalendarView';
import TrashView from './views/TrashView';
import SettingsView from './views/SettingsView';
import SearchView from './views/SearchView';
import Sidebar, { ViewType } from './components/Sidebar';
import { useTaskStore } from './store/useTaskStore';
import { format } from 'date-fns';

function App() {
  const loadData = useTaskStore((state) => state.loadData);
  const theme = useTaskStore((state) => state.config.theme);
  const [activeView, setActiveView] = useState<ViewType>('today');
  const [filterId, setFilterId] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  const handleSearchResultClick = (type: 'task' | 'note', id: string) => {
    if (type === 'note') {
      setSelectedDate(id);
      setActiveView('today');
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
        return <DailyFocusView date={selectedDate} onDateSelect={handleDateSelect} />;
      case 'all':
      case 'category':
      case 'tag':
        return <AllTasksView viewType={activeView as any} filterId={filterId} />;
      case 'search':
        return <SearchView query={searchQuery} onResultClick={handleSearchResultClick} />;
      case 'calendar':
        return <CalendarView onDateSelect={handleDateSelect} />;
      case 'trash':
        return <TrashView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DailyFocusView date={selectedDate} />;
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
      </main>
    </div>
  );
}

export default App;

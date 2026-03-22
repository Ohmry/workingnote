import { useEffect, useState } from 'react';
import DailyFocusView from './views/DailyFocusView';
import AllTasksView from './views/AllTasksView';
import CalendarView from './views/CalendarView';
import TrashView from './views/TrashView';
import SettingsView from './views/SettingsView';
import Sidebar, { ViewType } from './components/Sidebar';
import { useTaskStore } from './store/useTaskStore';

function App() {
  const loadData = useTaskStore((state) => state.loadData);
  const theme = useTaskStore((state) => state.config.theme);
  const [activeView, setActiveView] = useState<ViewType>('today');
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

    // 시스템 테마 변경 감지 (시스템 모드일 때만)
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const renderView = () => {
    switch (activeView) {
      case 'today':
        return <DailyFocusView />;
      case 'all':
        return <AllTasksView />;
      case 'calendar':
        return <CalendarView />;
      case 'trash':
        return <TrashView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DailyFocusView />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {renderView()}
      </main>
    </div>
  );
}

export default App;

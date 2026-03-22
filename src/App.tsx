import { useEffect, useState } from 'react';
import DailyFocusView from './views/DailyFocusView';
import CalendarView from './views/CalendarView';
import TrashView from './views/TrashView';
import SettingsView from './views/SettingsView';
import Sidebar, { ViewType } from './components/Sidebar';
import { useTaskStore } from './store/useTaskStore';

function App() {
  const loadData = useTaskStore((state) => state.loadData);
  const [activeView, setActiveView] = useState<ViewType>('today');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderView = () => {
    switch (activeView) {
      case 'today':
        return <DailyFocusView />;
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

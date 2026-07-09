import { useTheme } from '../../hooks/useTheme';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  // Apply theme to DOM + keep in sync
  useTheme();

  return (
    <div className="relative flex h-screen overflow-hidden" style={{ background: 'var(--td-bg-color-page)' }}>
      {/* Skip to content link (flat TDesign style) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 z-[100] px-4 py-2 rounded-lg text-white text-sm font-medium focus:outline-none"
        style={{ background: 'var(--pao-primary)' }}
      >
        跳转到主要内容
      </a>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="relative flex flex-col flex-1 min-w-0 lg:ml-16 z-10">
        {/* Top navigation */}
        <TopNav />

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-4 py-4 lg:px-8 lg:py-6"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

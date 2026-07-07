import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { useTheme } from '../../hooks/useTheme';

export default function AppLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  // Apply theme to DOM + keep in sync
  useTheme();

  const handleSidebarExpandChange = useCallback(() => {
    setSidebarExpanded((prev) => !prev);
  }, []);

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="pao-mesh-bg" aria-hidden="true">
        <div
          className="pao-mesh-orb"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)',
            top: '30%',
            left: '40%',
          }}
        />
      </div>

      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 z-[100] px-4 py-2 rounded-xl text-white text-sm font-medium focus:outline-none"
        style={{ background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))' }}
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

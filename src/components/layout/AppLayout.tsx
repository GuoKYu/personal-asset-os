import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { clsx } from 'clsx';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function AppLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const handleSidebarExpandChange = useCallback(() => {
    // Track sidebar expansion state for layout adjustments
    setSidebarExpanded((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-[#F0F5FF] to-[#F8FAFC]">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 z-[100] px-4 py-2 bg-[#3B82F6] text-white text-sm rounded-md focus:outline-none"
      >
        跳转到主要内容
      </a>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-16">
        {/* Top navigation */}
        <TopNav />

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 lg:p-6"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

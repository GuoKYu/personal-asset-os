import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { Input } from 'tdesign-react';
import { clsx } from 'clsx';
import { MODULES, type ModuleDefinition } from '@/config/modules';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function TopNav() {
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount] = useState(3);
  const location = useLocation();
  const navigate = useNavigate();

  const currentModule = MODULES.find((mod: ModuleDefinition) => {
    if (mod.route === '/') return location.pathname === '/';
    return location.pathname.startsWith(mod.route);
  });

  const pageTitle = currentModule?.name ?? '个人资产管理';

  const handleSearchChange = useCallback((val: string) => {
    setSearchQuery(val);
    // Future: implement global search
  }, []);

  return (
    <header
      className="relative h-16 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-20"
      role="banner"
      style={{
        background: 'var(--td-bg-color-container)',
        borderBottom: '1px solid var(--pao-border)',
      }}
    >
      {/* Left section: Logo + page title */}
      <div className="flex items-center gap-3 min-w-0 anim-fade-in-left">
        <span
          className="text-lg font-bold whitespace-nowrap hidden sm:inline"
          style={{ color: 'var(--pao-text-primary)' }}
        >
          PAO
        </span>
        <span className="hidden sm:inline" aria-hidden="true" style={{ color: 'var(--pao-text-tertiary)' }}>
          /
        </span>
        <h1 className="text-sm font-medium truncate" style={{ color: 'var(--pao-text-secondary)' }}>
          {pageTitle}
        </h1>
      </div>

      {/* Center: Search (TDesign Input) */}
      <div
        className={clsx('relative mx-4 flex-1 max-w-md hidden sm:block')}
        role="search"
        aria-label="全局搜索"
      >
        <Input
          value={searchQuery}
          onChange={handleSearchChange}
          prefixIcon={<Search className="w-4 h-4" style={{ color: 'var(--pao-text-tertiary)' }} />}
          clearable
          placeholder="搜索资产、项目、文档..."
          size="medium"
        />
      </div>

      {/* Right section: actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Mobile search button */}
        <button
          type="button"
          className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-200 hover:bg-[var(--td-bg-color-container-hover)] focus-ring"
          style={{ color: 'var(--pao-text-secondary)' }}
          aria-label="搜索"
        >
          <Search className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Theme toggle */}
        <ThemeToggle compact />

        {/* Notifications */}
        <button
          type="button"
          className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-200 hover:bg-[var(--td-bg-color-container-hover)] focus-ring"
          style={{ color: 'var(--pao-text-secondary)' }}
          aria-label={`通知，${notificationCount}条未读`}
        >
          <Bell className="w-4.5 h-4.5" aria-hidden="true" />
          {notificationCount > 0 && (
            <span
              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-white text-[10px] font-semibold flex items-center justify-center leading-none"
              style={{ background: 'var(--pao-rose)' }}
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg transition-colors duration-200 hover:bg-[var(--td-bg-color-container-hover)] focus-ring ml-1"
          style={{ background: 'transparent' }}
          aria-label="用户菜单"
          aria-haspopup="true"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--pao-primary)' }}
          >
            <span className="text-white text-xs font-semibold">B</span>
          </div>
          <span className="hidden md:inline text-sm" style={{ color: 'var(--pao-text-secondary)' }}>BTI</span>
          <ChevronDown className="hidden md:block w-3.5 h-3.5" style={{ color: 'var(--pao-text-tertiary)' }} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

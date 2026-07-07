import { useState, useCallback, useRef, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, Command } from 'lucide-react';
import { clsx } from 'clsx';
import { MODULES, type ModuleDefinition } from '@/config/modules';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function TopNav() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notificationCount] = useState(3);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const currentModule = MODULES.find((mod: ModuleDefinition) => {
    if (mod.route === '/') return location.pathname === '/';
    return location.pathname.startsWith(mod.route);
  });

  const pageTitle = currentModule?.name ?? '个人资产管理';

  const handleSearch = useCallback((e: FormEvent) => {
    e.preventDefault();
    // Future: implement global search
  }, []);

  return (
    <header
      className="relative h-16 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-20"
      role="banner"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid var(--pao-border)',
      }}
    >
      {/* Left section: Logo + page title */}
      <div className="flex items-center gap-3 min-w-0 anim-fade-in-left">
        <span className="text-lg font-bold gradient-text whitespace-nowrap hidden sm:inline">
          PAO
        </span>
        <span className="hidden sm:inline" aria-hidden="true" style={{ color: 'var(--pao-text-tertiary)' }}>
          /
        </span>
        <h1 className="text-sm font-medium truncate" style={{ color: 'var(--pao-text-secondary)' }}>
          {pageTitle}
        </h1>
      </div>

      {/* Center: Search */}
      <form
        onSubmit={handleSearch}
        className={clsx('relative mx-4 flex-1 max-w-md hidden sm:block')}
        role="search"
        aria-label="全局搜索"
      >
        <div
          className="flex items-center h-9 rounded-xl border transition-all duration-300"
          style={{
            background: isSearchFocused ? 'var(--pao-surface-hover)' : 'var(--pao-divider)',
            borderColor: isSearchFocused ? 'var(--pao-primary)' : 'transparent',
            boxShadow: isSearchFocused ? '0 0 0 3px rgba(99,102,241,0.15), var(--shadow-glow)' : 'none',
          }}
        >
          <Search
            className="w-4 h-4 ml-3 flex-shrink-0 transition-colors duration-300"
            style={{ color: isSearchFocused ? 'var(--pao-primary)' : 'var(--pao-text-tertiary)' }}
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="搜索资产、项目、文档..."
            className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:opacity-60"
            style={{ color: 'var(--pao-text-primary)' }}
            aria-label="搜索"
          />
          <kbd
            className="hidden lg:inline-flex items-center mr-2 px-1.5 py-0.5 text-[10px] rounded font-mono leading-none gap-0.5"
            style={{ background: 'var(--pao-surface)', color: 'var(--pao-text-tertiary)' }}
          >
            <Command className="w-2.5 h-2.5" />
            K
          </kbd>
        </div>
      </form>

      {/* Right section: actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Mobile search button */}
        <button
          type="button"
          className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 hover:scale-110 focus-ring"
          style={{ color: 'var(--pao-text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pao-divider)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          aria-label="搜索"
        >
          <Search className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Theme toggle */}
        <ThemeToggle compact />

        {/* Notifications */}
        <button
          type="button"
          className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 hover:scale-110 focus-ring"
          style={{ color: 'var(--pao-text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pao-divider)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          aria-label={`通知，${notificationCount}条未读`}
        >
          <Bell className="w-4.5 h-4.5" aria-hidden="true" />
          {notificationCount > 0 && (
            <span
              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-white text-[10px] font-semibold flex items-center justify-center leading-none anim-glow-pulse"
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
          className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg transition-all duration-300 hover:scale-105 focus-ring ml-1"
          style={{ background: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pao-divider)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          aria-label="用户菜单"
          aria-haspopup="true"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))',
              boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
            }}
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

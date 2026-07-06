import { useState, useCallback, useRef, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Settings, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { modules } from '@/config/modules';

interface TopNavProps {
  onMenuToggle?: () => void;
}

export default function TopNav({ onMenuToggle }: TopNavProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notificationCount] = useState(3);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  const currentModule = modules.find((mod) => {
    if (mod.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(mod.path);
  });

  const pageTitle = currentModule?.label ?? '个人资产管理';

  const handleSearch = useCallback((e: FormEvent) => {
    e.preventDefault();
    // Search logic would go here
  }, []);

  return (
    <header
      className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0"
      role="banner"
    >
      {/* Left section: Logo + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-lg font-bold bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] bg-clip-text text-transparent whitespace-nowrap hidden sm:inline">
          PAO
        </span>
        <span className="text-gray-300 hidden sm:inline" aria-hidden="true">
          /
        </span>
        <h1 className="text-sm font-medium text-gray-700 truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Center: Search */}
      <form
        onSubmit={handleSearch}
        className={clsx(
          'relative mx-4 flex-1 max-w-md hidden sm:block',
        )}
        role="search"
        aria-label="全局搜索"
      >
        <div
          className={clsx(
            'flex items-center h-9 rounded-lg bg-[#F1F5F9] border transition-all duration-150',
            isSearchFocused
              ? 'border-[#3B82F6] ring-1 ring-[#3B82F6]'
              : 'border-transparent',
          )}
        >
          <Search
            className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0"
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
            className="flex-1 bg-transparent px-2 py-1.5 text-sm text-gray-700 placeholder-gray-400 outline-none"
            aria-label="搜索"
          />
          {searchQuery && (
            <kbd className="hidden lg:inline-flex items-center mr-2 px-1.5 py-0.5 text-[10px] text-gray-400 bg-gray-200 rounded font-mono leading-none">
              ⌘K
            </kbd>
          )}
        </div>
      </form>

      {/* Right section: actions */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Mobile search button */}
        <button
          type="button"
          className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
          aria-label="搜索"
        >
          <Search className="w-4 h-4 text-gray-500" aria-hidden="true" />
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
          aria-label={`通知，${notificationCount}条未读`}
        >
          <Bell className="w-5 h-5 text-gray-500" aria-hidden="true" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center leading-none">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          type="button"
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
          aria-label="设置"
        >
          <Settings className="w-5 h-5 text-gray-500" aria-hidden="true" />
        </button>

        {/* User avatar */}
        <button
          type="button"
          className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] ml-1"
          aria-label="用户菜单"
          aria-haspopup="true"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">Z</span>
          </div>
          <span className="hidden md:inline text-sm text-gray-600">张三</span>
          <ChevronDown className="hidden md:block w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

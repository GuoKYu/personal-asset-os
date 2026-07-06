import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Boxes } from 'lucide-react';
import { clsx } from 'clsx';
import { modules, type ModuleConfig } from '@/config/modules';

interface SidebarItemProps {
  module: ModuleConfig;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}

function SidebarItem({ module, isActive, isExpanded, onClick }: SidebarItemProps) {
  const Icon = module.icon;

  return (
    <li
      className={clsx(
        'relative flex items-center h-12 cursor-pointer transition-colors duration-150 group',
        isActive ? 'bg-[#EFF6FF]' : 'hover:bg-gray-50',
      )}
      role="menuitem"
      aria-current={isActive ? 'page' : undefined}
      aria-label={module.label}
    >
      {isActive && (
        <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#3B82F6] rounded-r-sm" />
      )}
      <button
        type="button"
        onClick={onClick}
        className="flex items-center w-full h-full px-4 gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-1"
      >
        <Icon
          className={clsx(
            'w-5 h-5 flex-shrink-0',
            isActive ? 'text-[#3B82F6]' : 'text-gray-500 group-hover:text-gray-700',
          )}
          aria-hidden="true"
        />
        {isExpanded && (
          <span
            className={clsx(
              'text-sm font-medium whitespace-nowrap',
              isActive ? 'text-[#3B82F6]' : 'text-gray-600',
            )}
          >
            {module.label}
          </span>
        )}
      </button>

      {/* Tooltip on hover when collapsed */}
      {!isExpanded && (
        <div
          className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 pointer-events-none"
          role="tooltip"
        >
          {module.label}
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45" />
        </div>
      )}
    </li>
  );
}

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleMobileToggle = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const sidebarWidth = isExpanded ? 'w-60' : 'w-16';

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={handleMobileToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col z-50 transition-all duration-200',
          sidebarWidth,
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        role="navigation"
        aria-label="主导航"
      >
        {/* Logo area */}
        <div className="flex items-center h-16 px-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center flex-shrink-0">
              <Boxes className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            {isExpanded && (
              <span className="text-base font-bold bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] bg-clip-text text-transparent whitespace-nowrap">
                PAO
              </span>
            )}
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 py-3 overflow-y-auto" aria-label="模块导航">
          <ul role="menubar" className="flex flex-col">
            {modules.map((mod) => {
              const isActive = mod.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(mod.path);

              return (
                <SidebarItem
                  key={mod.id}
                  module={mod}
                  isActive={isActive}
                  isExpanded={isExpanded}
                  onClick={() => {
                    navigate(mod.path);
                    setIsMobileOpen(false);
                  }}
                />
              );
            })}
          </ul>
        </nav>

        {/* Collapse/expand toggle */}
        <div className="flex-shrink-0 border-t border-gray-100 p-2">
          <button
            type="button"
            onClick={handleToggle}
            className="hidden lg:flex items-center justify-center w-full h-10 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
            aria-label={isExpanded ? '收起侧边栏' : '展开侧边栏'}
          >
            {isExpanded ? (
              <ChevronLeft className="w-4 h-4 text-gray-500" aria-hidden="true" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" aria-hidden="true" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        type="button"
        onClick={handleMobileToggle}
        className="fixed bottom-4 left-4 z-50 lg:hidden w-12 h-12 rounded-full bg-[#3B82F6] text-white shadow-lg flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3B82F6]"
        aria-label={isMobileOpen ? '关闭导航菜单' : '打开导航菜单'}
      >
        <Boxes className="w-5 h-5" aria-hidden="true" />
      </button>
    </>
  );
}

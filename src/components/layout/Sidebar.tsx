import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Boxes,
  LayoutDashboard, Rocket, Shield, TrendingUp,
  HeartPulse, Activity, FileText, FolderKanban, Settings,
  type LucideIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import { MODULES, type ModuleDefinition } from '@/config/modules';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Rocket,
  Shield,
  TrendingUp,
  HeartPulse,
  Activity,
  FileText,
  FolderKanban,
  Settings,
};

interface SidebarItemProps {
  module: ModuleDefinition;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  index: number;
}

function SidebarItem({ module, isActive, isExpanded, onClick, index }: SidebarItemProps) {
  const Icon = ICON_MAP[module.icon] || LayoutDashboard;

  return (
    <li
      className={clsx(
        'relative flex items-center h-12 cursor-pointer transition-all duration-300 group anim-slide-left',
        isActive ? '' : 'hover:bg-white/5',
      )}
      style={{ animationDelay: `${index * 0.04}s` }}
      role="menuitem"
      aria-current={isActive ? 'page' : undefined}
      aria-label={module.name}
      onClick={onClick}
    >
      {/* Active glow indicator */}
      {isActive && (
        <>
          <span
            className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full"
            style={{
              background: 'linear-gradient(180deg, var(--pao-primary), var(--pao-violet))',
              boxShadow: '0 0 12px var(--pao-primary)',
            }}
          />
          <span
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'var(--sidebar-active)',
              boxShadow: 'inset 0 0 20px var(--sidebar-active-glow)',
            }}
          />
        </>
      )}

      <button
        type="button"
        className="relative flex items-center w-full h-full px-4 gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 rounded-xl"
        style={{ outlineColor: 'var(--pao-primary)' }}
      >
        <Icon
          className={clsx(
            'w-5 h-5 flex-shrink-0 transition-all duration-300',
            isActive ? 'scale-110' : 'group-hover:scale-105',
          )}
          style={{
            color: isActive ? 'var(--pao-primary)' : 'var(--pao-text-tertiary)',
            filter: isActive ? 'drop-shadow(0 0 6px var(--pao-primary))' : 'none',
          }}
          aria-hidden="true"
        />
        {isExpanded && (
          <span
            className={clsx(
              'text-sm font-medium whitespace-nowrap transition-colors duration-300',
            )}
            style={{
              color: isActive ? 'var(--pao-text-primary)' : 'var(--pao-text-secondary)',
            }}
          >
            {module.name}
          </span>
        )}
      </button>

      {/* Tooltip when collapsed */}
      {!isExpanded && (
        <div
          className="absolute left-full ml-3 px-2.5 py-1.5 text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none glass-strong"
          style={{ color: 'var(--pao-text-primary)' }}
          role="tooltip"
        >
          {module.name}
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
          className="fixed inset-0 z-40 lg:hidden anim-fade-in"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={handleMobileToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 h-screen flex flex-col z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          sidebarWidth,
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{
          background: 'var(--sidebar-bg)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRight: '1px solid var(--pao-border)',
        }}
        role="navigation"
        aria-label="主导航"
      >
        {/* Logo area */}
        <div
          className="flex items-center h-16 px-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--pao-divider)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 anim-glow-pulse"
              style={{
                background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))',
                boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
              }}
            >
              <Boxes className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            {isExpanded && (
              <span className="text-base font-bold gradient-text whitespace-nowrap anim-fade-in">
                PAO
              </span>
            )}
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 py-3 overflow-y-auto" aria-label="模块导航">
          <ul role="menubar" className="flex flex-col gap-0.5 px-2">
            {MODULES.map((mod: ModuleDefinition, index: number) => {
              const isActive = mod.route === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(mod.route);

              return (
                <SidebarItem
                  key={mod.id}
                  module={mod}
                  isActive={isActive}
                  isExpanded={isExpanded}
                  index={index}
                  onClick={() => {
                    navigate(mod.route);
                    setIsMobileOpen(false);
                  }}
                />
              );
            })}
          </ul>
        </nav>

        {/* Collapse/expand toggle */}
        <div className="flex-shrink-0 p-2" style={{ borderTop: '1px solid var(--pao-divider)' }}>
          <button
            type="button"
            onClick={handleToggle}
            className="hidden lg:flex items-center justify-center w-full h-10 rounded-xl transition-all duration-300 hover:scale-105 focus-ring"
            style={{ background: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--pao-divider)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label={isExpanded ? '收起侧边栏' : '展开侧边栏'}
          >
            {isExpanded ? (
              <ChevronLeft className="w-4 h-4" style={{ color: 'var(--pao-text-tertiary)' }} aria-hidden="true" />
            ) : (
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--pao-text-tertiary)' }} aria-hidden="true" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        type="button"
        onClick={handleMobileToggle}
        className="fixed bottom-4 left-4 z-50 lg:hidden w-12 h-12 rounded-full text-white shadow-lg flex items-center justify-center anim-scale-in focus-ring"
        style={{
          background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))',
          boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
        }}
        aria-label={isMobileOpen ? '关闭导航菜单' : '打开导航菜单'}
      >
        <Boxes className="w-5 h-5" aria-hidden="true" />
      </button>
    </>
  );
}

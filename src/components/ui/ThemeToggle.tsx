import { useState, useRef, type ButtonHTMLAttributes } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '../../hooks/useTheme';

type ThemeMode = 'light' | 'dark' | 'system';

const MODES: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
  { mode: 'light', icon: Sun, label: '浅色' },
  { mode: 'dark', icon: Moon, label: '暗色' },
  { mode: 'system', icon: Monitor, label: '跟随系统' },
];

interface ThemeToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  compact?: boolean;
}

export default function ThemeToggle({ compact = false, className, ...rest }: ThemeToggleProps) {
  const { themeMode, setThemeMode } = useTheme();
  const [hovered, setHovered] = useState<number>(-1);

  if (compact) {
    const CurrentIcon = MODES.find((m) => m.mode === themeMode)?.icon ?? Monitor;
    const nextIndex = (MODES.findIndex((m) => m.mode === themeMode) + 1) % MODES.length;

    return (
      <button
        type="button"
        onClick={() => setThemeMode(MODES[nextIndex].mode)}
        className={clsx(
          'relative w-9 h-9 flex items-center justify-center rounded-lg',
          'glass hover:shadow-glow transition-all duration-300',
          'focus-ring',
          className,
        )}
        aria-label={`当前主题: ${MODES.find((m) => m.mode === themeMode)?.label}，点击切换`}
        {...rest}
      >
        <CurrentIcon className="w-4 h-4 transition-transform duration-500" style={{ color: 'var(--pao-primary)' }} />
        <span className="sr-only">{themeMode}</span>
      </button>
    );
  }

  return (
    <div
      className="relative flex items-center glass rounded-xl p-1 gap-0.5"
      role="radiogroup"
      aria-label="主题模式"
      onMouseLeave={() => setHovered(-1)}
    >
      {/* Sliding indicator */}
      <div
        className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          left: `${MODES.findIndex((m) => m.mode === themeMode) * (100 / MODES.length)}%`,
          width: `calc(${100 / MODES.length}% - 2px)`,
          background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))',
          opacity: 0.15,
        }}
      />
      {MODES.map((item, idx) => {
        const Icon = item.icon;
        const isActive = themeMode === item.mode;

        return (
          <button
            key={item.mode}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={item.label}
            onClick={() => setThemeMode(item.mode)}
            onMouseEnter={() => setHovered(idx)}
            className={clsx(
              'relative z-10 flex items-center justify-center rounded-lg transition-all duration-300',
              compact ? 'w-8 h-8' : 'w-9 h-8',
              isActive ? 'text-white' : 'hover:scale-110',
            )}
            style={
              isActive
                ? { background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))' }
                : { color: hovered === idx ? 'var(--pao-primary)' : 'var(--pao-text-tertiary)' }
            }
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );
}

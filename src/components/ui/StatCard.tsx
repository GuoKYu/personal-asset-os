import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import DataGradeTag, { type DataGrade } from './DataGradeTag';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: LucideIcon;
  iconBgColor?: string;
  dataGrade?: DataGrade;
  className?: string;
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  iconBgColor = 'bg-blue-50',
  dataGrade,
  className,
  onClick,
}: StatCardProps) {
  const isTrendPositive = trend !== undefined && trend >= 0;
  const isTrendNegative = trend !== undefined && trend < 0;
  const showTrend = trend !== undefined;

  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 lg:p-5',
        'transition-all duration-200 hover:scale-[1.02] hover:shadow-md',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        {/* Icon */}
        <div
          className={clsx(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            iconBgColor,
          )}
        >
          <Icon className="w-4 h-4 text-[#3B82F6]" aria-hidden="true" />
        </div>

        {/* Data grade tag */}
        {dataGrade && <DataGradeTag grade={dataGrade} />}
      </div>

      {/* Value */}
      <p className="text-2xl font-semibold text-gray-900 mb-1 tracking-tight">
        {value}
      </p>

      {/* Title and trend */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-gray-500 truncate">{title}</span>

        {showTrend && (
          <span
            className={clsx(
              'inline-flex items-center gap-0.5 text-xs font-medium flex-shrink-0',
              isTrendPositive ? 'text-green-600' : 'text-red-500',
            )}
            aria-label={`趋势${isTrendPositive ? '上升' : '下降'} ${Math.abs(trend).toFixed(1)}%`}
          >
            {isTrendPositive ? (
              <TrendingUp className="w-3 h-3" aria-hidden="true" />
            ) : (
              <TrendingDown className="w-3 h-3" aria-hidden="true" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

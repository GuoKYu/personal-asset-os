import { clsx } from 'clsx';

export type ModuleContext = 'finance' | 'insurance' | 'ip' | 'growth' | 'projects';

type StatusConfig = {
  label: string;
  className: string;
};

/** Base color palettes for status tags */
const colorMap = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  red: 'bg-red-50 text-red-500 border-red-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
  gray: 'bg-gray-50 text-gray-500 border-gray-200',
} as const;

/** Predefined status mappings per module */
const statusMappings: Record<ModuleContext, Record<string, StatusConfig>> = {
  finance: {
    holding: { label: '持仓中', className: colorMap.blue },
    closed: { label: '已平仓', className: colorMap.green },
    stopped_loss: { label: '止损', className: colorMap.red },
    stopped_profit: { label: '止盈', className: colorMap.green },
  },
  insurance: {
    active: { label: '生效中', className: colorMap.green },
    expired: { label: '已过期', className: colorMap.red },
    pending: { label: '待生效', className: colorMap.orange },
    claim: { label: '理赔中', className: colorMap.blue },
  },
  ip: {
    draft: { label: '草稿', className: colorMap.gray },
    applying: { label: '申请中', className: colorMap.blue },
    accepted: { label: '已受理', className: colorMap.green },
    granted: { label: '已授权', className: colorMap.green },
    rejected: { label: '已驳回', className: colorMap.red },
    expired: { label: '已过期', className: colorMap.orange },
  },
  growth: {
    not_started: { label: '未开始', className: colorMap.gray },
    in_progress: { label: '进行中', className: colorMap.blue },
    completed: { label: '已完成', className: colorMap.green },
    abandoned: { label: '已放弃', className: colorMap.red },
  },
  projects: {
    in_progress: { label: '进行中', className: colorMap.blue },
    completed: { label: '已完成', className: colorMap.green },
    cancelled: { label: '已取消', className: colorMap.gray },
  },
};

interface StatusTagProps {
  status: string;
  context: ModuleContext;
  className?: string;
}

export default function StatusTag({ status, context, className }: StatusTagProps) {
  const moduleMap = statusMappings[context];
  const config = moduleMap?.[status];

  if (!config) {
    // Fallback for unknown status
    return (
      <span
        className={clsx(
          'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border',
          colorMap.gray,
          className,
        )}
        role="status"
      >
        {status}
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border',
        config.className,
        className,
      )}
      role="status"
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-50 flex-shrink-0"
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}

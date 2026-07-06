import { clsx } from 'clsx';

export type DataGrade = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

const gradeConfig: Record<DataGrade, { label: string; className: string }> = {
  L1: {
    label: '实时',
    className: 'bg-green-100 text-green-700',
  },
  L2: {
    label: '确认',
    className: 'bg-blue-100 text-blue-700',
  },
  L3: {
    label: '估算',
    className: 'bg-yellow-100 text-yellow-700',
  },
  L4: {
    label: '推演',
    className: 'bg-orange-100 text-orange-700',
  },
  L5: {
    label: '不可用',
    className: 'bg-gray-100 text-gray-500',
  },
};

interface DataGradeTagProps {
  grade: DataGrade;
  className?: string;
}

export default function DataGradeTag({ grade, className }: DataGradeTagProps) {
  const config = gradeConfig[grade];

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full leading-none',
        config.className,
        className,
      )}
      aria-label={`数据等级 ${grade}：${config.label}`}
      role="status"
    >
      {grade}
      <span className="mx-0.5 text-current/40" aria-hidden="true">·</span>
      {config.label}
    </span>
  );
}

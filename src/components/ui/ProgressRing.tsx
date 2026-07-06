import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  color?: string;
  label?: string;
  className?: string;
}

export default function ProgressRing({
  percentage,
  size = 80,
  color = '#3B82F6',
  label,
  className,
}: ProgressRingProps) {
  const [animatedOffset, setAnimatedOffset] = useState(0);
  const circleRef = useRef<SVGCircleElement>(null);

  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const targetOffset = circumference - (clampedPercentage / 100) * circumference;

  useEffect(() => {
    // Animate on mount
    const timer = requestAnimationFrame(() => {
      setAnimatedOffset(targetOffset);
    });
    return () => cancelAnimationFrame(timer);
  }, [targetOffset]);

  return (
    <div
      className={clsx('inline-flex flex-col items-center gap-2', className)}
      role="progressbar"
      aria-valuenow={Math.round(clampedPercentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `进度 ${Math.round(clampedPercentage)}%`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />

        {/* Center text */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="transform rotate-90 fill-gray-700 text-xs font-semibold"
          style={{
            transformOrigin: 'center',
          }}
        >
          {Math.round(clampedPercentage)}%
        </text>
      </svg>

      {label && (
        <span className="text-xs text-gray-500 text-center">{label}</span>
      )}
    </div>
  );
}

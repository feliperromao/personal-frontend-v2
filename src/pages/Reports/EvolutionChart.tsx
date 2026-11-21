import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { EvolutionPoint } from '../../domain/types';
import { tokens } from '../../theme';

interface EvolutionChartProps {
  points: EvolutionPoint[];
  exerciseName: string;
}

const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const loadNumber = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export default function EvolutionChart({ points, exerciseName }: EvolutionChartProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const width = Math.max(560, points.length * 92);
  const height = 300;
  const padding = { top: 54, right: 24, bottom: 50, left: 52 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const loads = points.map((point) => point.max_load);
  const rawMin = Math.min(...loads);
  const rawMax = Math.max(...loads);
  const buffer = Math.max(2.5, (rawMax - rawMin) * 0.2, rawMax * 0.06);
  const min = Math.max(0, rawMin - buffer);
  const max = rawMax + buffer;
  const range = Math.max(1, max - min);
  const x = (index: number) => points.length === 1
    ? padding.left + chartWidth / 2
    : padding.left + (index / (points.length - 1)) * chartWidth;
  const y = (load: number) => padding.top + chartHeight - ((load - min) / range) * chartHeight;
  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point.max_load)}`).join(' ');
  const ticks = Array.from({ length: 4 }, (_, index) => max - (index / 3) * range);
  const description = points.map((point) => `${shortDate.format(new Date(point.executed_at))}: ${loadNumber.format(point.max_load)} kg`).join('; ');

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollLeft = scroller.scrollWidth - scroller.clientWidth;
  }, [points]);

  return (
    <Box ref={scrollerRef} sx={{ overflowX: 'auto', overscrollBehaviorInline: 'contain', pb: 0.5 }}>
      <Box
        component="svg"
        role="img"
        aria-label={`Evolução de carga em ${exerciseName}. ${description}`}
        viewBox={`0 0 ${width} ${height}`}
        sx={{ display: 'block', width: `${width}px`, minWidth: '100%', height: 'auto', maxHeight: 340 }}
      >
        <style>{`
          @keyframes drawEvolution { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
          .evolution-line { stroke-dasharray: 1; animation: drawEvolution 720ms cubic-bezier(.16,1,.3,1) both; }
        `}</style>
        {ticks.map((tick) => {
          const tickY = y(tick);
          return (
            <g key={tick}>
              <line x1={padding.left} x2={width - padding.right} y1={tickY} y2={tickY} stroke={tokens.color.line} strokeWidth="1" />
              <text x={padding.left - 10} y={tickY + 4} textAnchor="end" fill={tokens.color.muted} fontSize="13" fontWeight="650">
                {loadNumber.format(tick)}
              </text>
            </g>
          );
        })}
        {points.length > 1 && (
          <path
            d={line}
            fill="none"
            stroke={tokens.color.primary}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            className="evolution-line"
          />
        )}
        {points.map((point, index) => {
          const pointX = x(index);
          const pointY = y(point.max_load);
          return (
            <g key={point.progress_id}>
              <circle cx={pointX} cy={pointY} r="7" fill={tokens.color.surface} stroke={tokens.color.primary} strokeWidth="4" />
              <text x={pointX} y={pointY - 17} textAnchor="middle" fill={tokens.color.ink} fontSize="16" fontWeight="800">
                {loadNumber.format(point.max_load)} kg
              </text>
              <text x={pointX} y={height - 18} textAnchor="middle" fill={tokens.color.muted} fontSize="14" fontWeight="650">
                {shortDate.format(new Date(point.executed_at)).replace('.', '')}
              </text>
            </g>
          );
        })}
        <text x="14" y={padding.top - 20} fill={tokens.color.muted} fontSize="13" fontWeight="700">KG</text>
      </Box>
    </Box>
  );
}

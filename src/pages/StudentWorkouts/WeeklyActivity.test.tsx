import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import WeeklyActivity, { getWeekDays, getWeekRange } from './WeeklyActivity';

describe('WeeklyActivity', () => {
  it('shows Monday through Sunday and marks days with at least one finished workout', () => {
    const referenceDate = new Date(2026, 10, 18, 12);
    const mondayWorkout = new Date(2026, 10, 16, 9).toISOString();
    const secondMondayWorkout = new Date(2026, 10, 16, 18).toISOString();
    const wednesdayWorkout = new Date(2026, 10, 18, 19).toISOString();

    render(
      <WeeklyActivity
        referenceDate={referenceDate}
        completedAt={[mondayWorkout, secondMondayWorkout, wednesdayWorkout]}
      />,
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(7);
    expect(screen.getByText('SEG')).toBeInTheDocument();
    expect(screen.getByText('DOM')).toBeInTheDocument();
    expect(screen.getByText('2 dias com treino')).toBeInTheDocument();
    expect(screen.getAllByLabelText(/treino realizado$/i)).toHaveLength(2);
    expect(screen.getByLabelText(/quarta-feira.*treino realizado/i)).toHaveAttribute('aria-current', 'date');
  });

  it('calculates the local week from Monday up to the next Monday', () => {
    const referenceDate = new Date(2026, 10, 22, 12);
    const { start, end } = getWeekRange(referenceDate);
    const days = getWeekDays(referenceDate);

    expect(start.getDay()).toBe(1);
    expect(start.getDate()).toBe(16);
    expect(end.getDay()).toBe(1);
    expect(end.getDate()).toBe(23);
    expect(days.map((day) => day.date.getDate())).toEqual([16, 17, 18, 19, 20, 21, 22]);
  });
});

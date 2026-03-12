import type { SolveRecord } from "./types";

export const formatSolveTime = (ms: number): string => {
  const centiseconds = Math.floor(ms / 10);
  const cs = centiseconds % 100;
  const totalSeconds = Math.floor(centiseconds / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  const csStr = String(cs).padStart(2, "0");
  const secStr = String(seconds).padStart(minutes > 0 || hours > 0 ? 2 : 1, "0");

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${csStr}`;
  }

  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, "0")}.${csStr}`;
  }

  return `${secStr}.${csStr}`;
};

export const formatDisplayTime = (solve: SolveRecord | null | undefined): string => {
  if (!solve) return "--";
  if (solve.penalty === "dnf" || solve.finalTimeMs === null) return "DNF";
  const value = formatSolveTime(solve.finalTimeMs);
  return solve.penalty === "+2" ? `${value}+` : value;
};

export type AverageResult = number | "DNF" | null;

export const computeAverageOfN = (solves: SolveRecord[], n: number): AverageResult => {
  if (n < 3 || solves.length < n) return null;
  const window = solves.slice(-n);
  const values = window.map((solve) => (solve.finalTimeMs === null ? Number.POSITIVE_INFINITY : solve.finalTimeMs));
  const dnfCount = values.filter((value) => !Number.isFinite(value)).length;

  if (dnfCount >= 2) return "DNF";

  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.slice(1, -1);

  if (middle.some((value) => !Number.isFinite(value))) return "DNF";

  const average = middle.reduce((sum, value) => sum + value, 0) / middle.length;
  return Math.round(average);
};

export type SessionStats = {
  count: number;
  current: SolveRecord | null;
  best: SolveRecord | null;
  meanValidMs: number | null;
  ao5: AverageResult;
  ao12: AverageResult;
};

export const computeSessionStats = (solves: SolveRecord[]): SessionStats => {
  const validSolves = solves.filter((solve) => solve.finalTimeMs !== null);
  const best = validSolves.reduce<SolveRecord | null>((bestSoFar, solve) => {
    if (!bestSoFar) return solve;
    if ((solve.finalTimeMs ?? Number.POSITIVE_INFINITY) < (bestSoFar.finalTimeMs ?? Number.POSITIVE_INFINITY)) {
      return solve;
    }
    return bestSoFar;
  }, null);

  const meanValidMs = validSolves.length
    ? Math.round(validSolves.reduce((sum, solve) => sum + (solve.finalTimeMs ?? 0), 0) / validSolves.length)
    : null;

  return {
    count: solves.length,
    current: solves.length ? solves[solves.length - 1] : null,
    best,
    meanValidMs,
    ao5: computeAverageOfN(solves, 5),
    ao12: computeAverageOfN(solves, 12),
  };
};


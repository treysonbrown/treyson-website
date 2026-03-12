import type { SolveRecord } from "./types";

export const CUBING_STORAGE_KEY = "treyson:cubing:v1";
const MAX_SOLVES = 1000;

type CubingStorage = {
  solves333: SolveRecord[];
};

const emptyStorage = (): CubingStorage => ({
  solves333: [],
});

const isSolvePenalty = (value: unknown): value is SolveRecord["penalty"] => {
  return value === "none" || value === "+2" || value === "dnf";
};

const isSolveRecord = (value: unknown): value is SolveRecord => {
  if (!value || typeof value !== "object") return false;
  const solve = value as Partial<SolveRecord>;
  return (
    typeof solve.id === "string" &&
    solve.event === "333" &&
    typeof solve.scramble === "string" &&
    typeof solve.rawTimeMs === "number" &&
    (typeof solve.inspectionMs === "number" || solve.inspectionMs === null) &&
    isSolvePenalty(solve.penalty) &&
    (typeof solve.finalTimeMs === "number" || solve.finalTimeMs === null) &&
    typeof solve.startedAt === "string" &&
    typeof solve.finishedAt === "string"
  );
};

export const loadCubingStorage = (): CubingStorage => {
  if (typeof window === "undefined") return emptyStorage();

  try {
    const raw = window.localStorage.getItem(CUBING_STORAGE_KEY);
    if (!raw) return emptyStorage();
    const parsed = JSON.parse(raw) as Partial<CubingStorage>;
    const solves333 = Array.isArray(parsed.solves333) ? parsed.solves333.filter(isSolveRecord) : [];
    return { solves333: solves333.slice(-MAX_SOLVES) };
  } catch {
    return emptyStorage();
  }
};

export const saveCubingSolves333 = (solves: SolveRecord[]): void => {
  if (typeof window === "undefined") return;
  const payload: CubingStorage = {
    solves333: solves.slice(-MAX_SOLVES),
  };
  window.localStorage.setItem(CUBING_STORAGE_KEY, JSON.stringify(payload));
};


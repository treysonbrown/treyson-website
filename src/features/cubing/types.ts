export type CubingEvent = "333";

export type SolvePenalty = "none" | "+2" | "dnf";

export type SolveRecord = {
  id: string;
  event: CubingEvent;
  scramble: string;
  rawTimeMs: number;
  inspectionMs: number | null;
  penalty: SolvePenalty;
  finalTimeMs: number | null;
  startedAt: string;
  finishedAt: string;
};


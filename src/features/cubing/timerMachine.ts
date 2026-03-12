import type { SolvePenalty } from "./types";

export const READY_HOLD_MS = 300;
export const INSPECTION_LIMIT_MS = 15_000;
export const INSPECTION_PLUS2_MS = 17_000;

export type CubingTimerState =
  | "idle"
  | "holding"
  | "inspection"
  | "holding_to_start"
  | "running";

export const getInspectionPenalty = (inspectionMs: number): SolvePenalty => {
  if (inspectionMs <= INSPECTION_LIMIT_MS) return "none";
  if (inspectionMs <= INSPECTION_PLUS2_MS) return "+2";
  return "dnf";
};

export const computeFinalTimeMs = (rawTimeMs: number, penalty: SolvePenalty): number | null => {
  if (penalty === "dnf") return null;
  if (penalty === "+2") return rawTimeMs + 2_000;
  return rawTimeMs;
};

export const hasHoldBecomeReady = (holdStartedAtMs: number, nowMs: number): boolean => {
  return nowMs - holdStartedAtMs >= READY_HOLD_MS;
};

export const isEditableElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return Boolean(target.closest("input, textarea, select, button, [contenteditable='true']"));
};

export const isSpaceKey = (event: KeyboardEvent): boolean => {
  return event.code === "Space" || event.key === " ";
};


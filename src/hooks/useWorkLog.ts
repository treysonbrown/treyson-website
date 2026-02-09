import { useCallback, useMemo } from "react";

export interface WorkLogDraft {
  date: string;
  hours: number;
  description?: string;
  tag?: string;
}

export type WorkLogEntry = {
  _id: string;
  work_date: string;
  hours: number;
  description?: string | null;
  tag?: string | null;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

const ensureIsoDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
};

const normalizeDescription = (value?: string) => value?.trim() || undefined;
const normalizeTag = (value?: string) => value?.trim() || undefined;

export const useWorkLog = () => {
  const isAuthenticated = false;
  const canEdit = false;
  const list: WorkLogEntry[] = [];

  const entries = useMemo(() => {
    if (!list) return [];
    return [...list].sort((a, b) => (a.work_date < b.work_date ? 1 : -1));
  }, [list]);

  const totals = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        acc.hours += entry.hours;
        acc.daysTracked.add(entry.work_date);
        return acc;
      },
      { hours: 0, daysTracked: new Set<string>() },
    );
  }, [entries]);

  const addEntry = useCallback(
    async (draft: WorkLogDraft) => {
      void draft;
      throw new Error("Work logs are disabled");
    },
    [],
  );

  const deleteEntry = useCallback(
    async (entryId: string) => {
      void entryId;
      throw new Error("Work logs are disabled");
    },
    [],
  );

  return {
    entries,
    isAuthenticated,
    canEdit,
    isAuthLoading: false,
    isLoading: false,
    isError: false,
    error: null,
    totalHours: totals.hours,
    totalDaysTracked: totals.daysTracked.size,
    addEntry,
    deleteEntry,
    isSubmitting: false,
    isDeletingEntry: false,
  };
};

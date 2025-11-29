import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type WorkLogCreateDTO, type WorkLogEntryDTO } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { ALLOWED_WORKLOG_USER_ID } from "@/lib/config";

export interface WorkLogDraft {
  date: string;
  hours: number;
  description?: string;
  tag?: string;
}

export type WorkLogEntry = WorkLogEntryDTO;

const WORK_LOG_QUERY_KEY = ["work-log"];

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
  const queryClient = useQueryClient();
  const { accessToken, isLoading: isAuthLoading, user } = useAuth();
  const isAuthenticated = Boolean(accessToken);
  const canEdit = Boolean(isAuthenticated && user?.id === ALLOWED_WORKLOG_USER_ID);

  const listQuery = useQuery({
    queryKey: WORK_LOG_QUERY_KEY,
    queryFn: () => api.listWorkLogEntries(accessToken ?? undefined),
  });

  const createMutation = useMutation({
    mutationFn: (draft: WorkLogDraft) => {
      if (!canEdit || !accessToken) {
        return Promise.reject(new Error("Not authenticated"));
      }
      const payload: WorkLogCreateDTO = {
        work_date: ensureIsoDate(draft.date),
        hours: Math.max(0, Number(draft.hours)),
        description: normalizeDescription(draft.description),
        tag: normalizeTag(draft.tag),
      };
      return api.createWorkLogEntry(payload, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORK_LOG_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (entryId: number) => {
      if (!canEdit || !accessToken) {
        return Promise.reject(new Error("Not authenticated"));
      }
      return api.deleteWorkLogEntry(entryId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORK_LOG_QUERY_KEY });
    },
  });

  const entries = useMemo(() => {
    if (!listQuery.data) return [];
    return [...listQuery.data].sort((a, b) => (a.work_date < b.work_date ? 1 : -1));
  }, [listQuery.data]);

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
      await createMutation.mutateAsync(draft);
    },
    [createMutation],
  );

  const deleteEntry = useCallback(
    async (entryId: number) => {
      await deleteMutation.mutateAsync(entryId);
    },
    [deleteMutation],
  );

  return {
    entries,
    isAuthenticated,
    canEdit,
    isAuthLoading,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    totalHours: totals.hours,
    totalDaysTracked: totals.daysTracked.size,
    addEntry,
    deleteEntry,
    isSubmitting: createMutation.isPending,
    isDeletingEntry: deleteMutation.isPending,
  };
};

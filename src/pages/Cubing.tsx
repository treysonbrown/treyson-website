import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeft, Copy, PanelLeft, RefreshCw, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { generate333Scramble } from "@/features/cubing/scramble";
import {
  computeSessionStats,
  formatDisplayTime,
  formatSolveTime,
  type AverageResult,
} from "@/features/cubing/stats";
import { loadCubingStorage, saveCubingSolves333 } from "@/features/cubing/storage";
import {
  computeFinalTimeMs,
  getInspectionPenalty,
  hasHoldBecomeReady,
  INSPECTION_LIMIT_MS,
  INSPECTION_PLUS2_MS,
  isEditableElement,
  isSpaceKey,
  type CubingTimerState,
} from "@/features/cubing/timerMachine";
import type { SolvePenalty, SolveRecord } from "@/features/cubing/types";

const ACCENT_COLOR = "#ff4499";

const formatInspectionCountdown = (elapsedMs: number): string => {
  if (elapsedMs <= INSPECTION_LIMIT_MS) {
    const remainingMs = Math.max(0, INSPECTION_LIMIT_MS - elapsedMs);
    return formatSolveTime(remainingMs);
  }
  return `+${formatSolveTime(elapsedMs - INSPECTION_LIMIT_MS)}`;
};

const formatAverageResult = (value: AverageResult): string => {
  if (value === null) return "--";
  if (value === "DNF") return "DNF";
  return formatSolveTime(value);
};

const formatInspectionPenaltyBadge = (penalty: SolvePenalty) => {
  if (penalty === "none") return "OK";
  if (penalty === "+2") return "+2";
  return "DNF";
};

const createSolveId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const preventSwitchSpaceToggle = (event: React.KeyboardEvent<HTMLButtonElement>) => {
  if (event.code === "Space" || event.key === " ") {
    event.preventDefault();
  }
};

const Cubing = () => {
  const [solves, setSolves] = useState<SolveRecord[]>([]);
  const [scramble, setScramble] = useState(() => generate333Scramble());
  const [timerState, setTimerState] = useState<CubingTimerState>("idle");
  const [isReady, setIsReady] = useState(false);
  const [phaseElapsedMs, setPhaseElapsedMs] = useState(0);
  const [inspectionEnabled, setInspectionEnabled] = useState(false);
  const [hideTimerWhileSolving, setHideTimerWhileSolving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTouchMode, setIsTouchMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastRecordedSolve, setLastRecordedSolve] = useState<SolveRecord | null>(null);

  const rafRef = useRef<number | null>(null);
  const copiedTimeoutRef = useRef<number | null>(null);

  const timerStateRef = useRef<CubingTimerState>("idle");
  const isReadyRef = useRef(false);
  const inspectionEnabledRef = useRef(false);
  const solvesRef = useRef<SolveRecord[]>([]);
  const scrambleRef = useRef(scramble);
  const beginHoldRef = useRef<(source: "idle" | "inspection") => void>(() => undefined);
  const releaseHoldRef = useRef<() => void>(() => undefined);
  const stopSolveRef = useRef<() => void>(() => undefined);

  const holdStartedAtRef = useRef<number | null>(null);
  const inspectionStartedAtRef = useRef<number | null>(null);
  const runStartedAtRef = useRef<number | null>(null);

  const solveStartedAtIsoRef = useRef<string | null>(null);
  const activeSolveScrambleRef = useRef<string | null>(null);
  const activeInspectionMsRef = useRef<number | null>(null);
  const activePenaltyRef = useRef<SolvePenalty>("none");

  const stats = useMemo(() => computeSessionStats(solves), [solves]);
  const recentSolves = useMemo(() => solves.slice(-10).reverse(), [solves]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    const stored = loadCubingStorage();
    setSolves(stored.solves333);
    setLastRecordedSolve(stored.solves333.length ? stored.solves333[stored.solves333.length - 1] : null);
  }, []);

  useEffect(() => {
    timerStateRef.current = timerState;
  }, [timerState]);

  useEffect(() => {
    isReadyRef.current = isReady;
  }, [isReady]);

  useEffect(() => {
    inspectionEnabledRef.current = inspectionEnabled;
  }, [inspectionEnabled]);

  useEffect(() => {
    solvesRef.current = solves;
  }, [solves]);

  useEffect(() => {
    scrambleRef.current = scramble;
  }, [scramble]);

  useEffect(() => {
    const tick = () => {
      const now = performance.now();
      const state = timerStateRef.current;

      if ((state === "holding" || state === "holding_to_start") && holdStartedAtRef.current !== null) {
        const ready = hasHoldBecomeReady(holdStartedAtRef.current, now);
        setIsReady((prev) => (prev === ready ? prev : ready));
      }

      if ((state === "inspection" || state === "holding_to_start") && inspectionStartedAtRef.current !== null) {
        setPhaseElapsedMs(now - inspectionStartedAtRef.current);
      } else if (state === "running" && runStartedAtRef.current !== null) {
        setPhaseElapsedMs(now - runStartedAtRef.current);
      }

      if (
        state === "holding" ||
        state === "inspection" ||
        state === "holding_to_start" ||
        state === "running"
      ) {
        rafRef.current = window.requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };

    if (
      timerState === "holding" ||
      timerState === "inspection" ||
      timerState === "holding_to_start" ||
      timerState === "running"
    ) {
      rafRef.current = window.requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [timerState]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableElement(event.target)) return;

      const state = timerStateRef.current;
      if (state === "running") {
        event.preventDefault();
        if (event.repeat) return;
        stopSolveRef.current();
        return;
      }

      if (!isSpaceKey(event)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      event.preventDefault();
      if (event.repeat) return;

      if (state === "idle") {
        beginHoldRef.current("idle");
        return;
      }
      if (state === "inspection") {
        beginHoldRef.current("inspection");
        return;
      }
      if (state === "running") {
        stopSolveRef.current();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (!isSpaceKey(event)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableElement(event.target)) return;

      event.preventDefault();
      releaseHoldRef.current();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (timerStateRef.current === "running") return;

      const isToggleShortcut =
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        event.key.toLowerCase() === "b";

      if (!isToggleShortcut) return;
      if (isEditableElement(event.target)) return;

      event.preventDefault();
      setIsSidebarOpen((prev) => !prev);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const persistSolves = (next: SolveRecord[]) => {
    setSolves(next);
    saveCubingSolves333(next);
  };

  const clearTransientTiming = () => {
    holdStartedAtRef.current = null;
    inspectionStartedAtRef.current = null;
    runStartedAtRef.current = null;
    solveStartedAtIsoRef.current = null;
    activeSolveScrambleRef.current = null;
    activeInspectionMsRef.current = null;
    activePenaltyRef.current = "none";
    setTimerState("idle");
    setIsReady(false);
    setPhaseElapsedMs(0);
  };

  const beginHold = (source: "idle" | "inspection") => {
    const now = performance.now();
    holdStartedAtRef.current = now;
    setIsReady(false);
    setTimerState(source === "idle" ? "holding" : "holding_to_start");
    if (source === "idle") {
      setPhaseElapsedMs(0);
    }
  };

  const startInspection = () => {
    inspectionStartedAtRef.current = performance.now();
    holdStartedAtRef.current = null;
    activePenaltyRef.current = "none";
    activeInspectionMsRef.current = null;
    setIsReady(false);
    setPhaseElapsedMs(0);
    setTimerState("inspection");
  };

  const startRunning = () => {
    const now = performance.now();
    const inspectionMs =
      inspectionStartedAtRef.current !== null ? Math.max(0, now - inspectionStartedAtRef.current) : null;
    const penalty = inspectionMs === null ? "none" : getInspectionPenalty(inspectionMs);

    holdStartedAtRef.current = null;
    runStartedAtRef.current = now;
    solveStartedAtIsoRef.current = new Date().toISOString();
    activeSolveScrambleRef.current = scrambleRef.current;
    activeInspectionMsRef.current = inspectionMs;
    activePenaltyRef.current = penalty;
    setIsReady(false);
    setPhaseElapsedMs(0);
    setTimerState("running");
  };

  const stopSolve = () => {
    if (timerStateRef.current !== "running" || runStartedAtRef.current === null) return;

    const now = performance.now();
    const rawTimeMs = Math.max(0, Math.round(now - runStartedAtRef.current));
    const penalty = activePenaltyRef.current;
    const finalTimeMs = computeFinalTimeMs(rawTimeMs, penalty);
    const finishedAtIso = new Date().toISOString();

    const solve: SolveRecord = {
      id: createSolveId(),
      event: "333",
      scramble: activeSolveScrambleRef.current ?? scrambleRef.current,
      rawTimeMs,
      inspectionMs: activeInspectionMsRef.current,
      penalty,
      finalTimeMs,
      startedAt: solveStartedAtIsoRef.current ?? finishedAtIso,
      finishedAt: finishedAtIso,
    };

    const next = [...solvesRef.current, solve];
    persistSolves(next);
    setLastRecordedSolve(solve);
    setScramble(generate333Scramble());
    clearTransientTiming();
  };

  const releaseHold = () => {
    const state = timerStateRef.current;
    const ready = isReadyRef.current;

    if (state === "holding") {
      holdStartedAtRef.current = null;
      setIsReady(false);
      if (!ready) {
        setTimerState("idle");
        return;
      }
      if (inspectionEnabledRef.current) {
        startInspection();
      } else {
        inspectionStartedAtRef.current = null;
        startRunning();
      }
      return;
    }

    if (state === "holding_to_start") {
      holdStartedAtRef.current = null;
      setIsReady(false);
      if (!ready) {
        setTimerState("inspection");
        return;
      }
      startRunning();
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch" && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    if (event.button !== 0) return;
    event.preventDefault();
    setIsTouchMode(true);

    const state = timerStateRef.current;
    if (state === "running") {
      stopSolve();
      return;
    }
    if (state === "idle") {
      beginHold("idle");
      return;
    }
    if (state === "inspection") {
      beginHold("inspection");
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    releaseHold();
  };

  const handlePointerCancel = () => {
    const state = timerStateRef.current;
    if (state === "holding") {
      holdStartedAtRef.current = null;
      setIsReady(false);
      setTimerState("idle");
      return;
    }
    if (state === "holding_to_start") {
      holdStartedAtRef.current = null;
      setIsReady(false);
      setTimerState("inspection");
    }
  };

  const handleNewScramble = () => {
    setScramble(generate333Scramble());
  };

  const handleCopyScramble = async () => {
    try {
      await navigator.clipboard.writeText(scramble);
      setCopied(true);
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
      copiedTimeoutRef.current = window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const handleClearSession = () => {
    persistSolves([]);
    setLastRecordedSolve(null);
    clearTransientTiming();
  };

  const handleResetCurrent = () => {
    clearTransientTiming();
  };

  beginHoldRef.current = beginHold;
  releaseHoldRef.current = releaseHold;
  stopSolveRef.current = stopSolve;

  const isTimerMasked = hideTimerWhileSolving && timerState === "running";

  const displayText = (() => {
    if (isTimerMasked) return "••••";
    if (timerState === "inspection" || timerState === "holding_to_start") {
      return formatInspectionCountdown(phaseElapsedMs);
    }
    if (timerState === "running") {
      return formatSolveTime(Math.round(phaseElapsedMs));
    }
    if (timerState === "holding") {
      return "0.00";
    }
    return lastRecordedSolve ? formatDisplayTime(lastRecordedSolve) : "0.00";
  })();

  const currentStatusLabel = (() => {
    if (timerState === "running") return "RUNNING";
    if (timerState === "inspection") return "INSPECTION";
    if (timerState === "holding_to_start") return isReady ? "READY" : "HOLD";
    if (timerState === "holding") return isReady ? "READY" : "HOLD";
    return "IDLE";
  })();

  const statusSubtext = (() => {
    if (timerState === "running" && isTimerMasked) return "Timer hidden while solving. Press Space or tap the pad to stop.";
    if (timerState === "running") return "Press Space or tap the pad to stop.";
    if (timerState === "inspection" || timerState === "holding_to_start") {
      if (phaseElapsedMs > INSPECTION_PLUS2_MS) return "Inspection exceeded 17s. Solve will record as DNF.";
      if (phaseElapsedMs > INSPECTION_LIMIT_MS) return "Inspection exceeded 15s. Solve will receive +2.";
      return "Hold and release to start the solve after inspection.";
    }
    if (timerState === "holding" && !isReady) return "Keep holding until READY.";
    if (timerState === "holding" && isReady) return "Release to begin inspection.";
    return "Hold Space (or press and hold the pad) to start.";
  })();

  const liveInspectionPenalty =
    timerState === "inspection" || timerState === "holding_to_start"
      ? getInspectionPenalty(phaseElapsedMs)
      : "none";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans selection:text-white transition-colors">
      <style>{`
        ::selection {
          background-color: ${ACCENT_COLOR};
          color: white;
        }
      `}</style>

      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <Button asChild variant="brutal-outline" size="sm" className="h-11 px-4">
          <Link to="/" aria-label="Go home">
            <ArrowLeft />
            Home
          </Link>
        </Button>
        <Button
          type="button"
          variant="brutal-outline"
          size="sm"
          className="h-11 px-4"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
          title="Toggle sidebar (Cmd/Ctrl+B)"
        >
          <PanelLeft />
          {isSidebarOpen ? "Hide" : "Show"}
        </Button>
      </div>

      <main className="pt-20 pb-10 px-6 bg-gray-50 dark:bg-zinc-950">
        <div className="container mx-auto max-w-7xl space-y-6">
          <section className="pt-1 pb-2">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button variant="brutal-outline" size="sm" onClick={handleNewScramble}>
                  <RefreshCw />
                  New Scramble
                </Button>
                <Button
                  variant="brutal-yellow"
                  size="sm"
                  onClick={handleCopyScramble}
                  className="text-black dark:text-black hover:text-black focus-visible:ring-black"
                >
                  <Copy />
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>

              <div className="w-full flex items-center justify-center gap-3">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                  3x3 Scramble
                </p>
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-gray-600 dark:text-gray-500">
                  Cmd/Ctrl+B toggles sidebar
                </span>
              </div>

              <div className="w-full max-w-6xl px-2">
                <p className="font-mono font-bold text-black dark:text-white text-[clamp(1.6rem,3.6vw,3.1rem)] leading-[1.35] tracking-tight break-words select-text">
                  {scramble}
                </p>
              </div>
            </div>
          </section>

          <div className={cn("grid grid-cols-1 gap-8 items-start", isSidebarOpen && "xl:grid-cols-[360px_minmax(0,1fr)]")}>
            {isSidebarOpen && (
              <aside className="space-y-6 xl:sticky xl:top-28">
                <div className="bg-card dark:bg-zinc-900 border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black uppercase tracking-tight dark:text-white">Stats</h2>
                    <span className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                      Session
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="border-2 border-black dark:border-white p-3 bg-background dark:bg-zinc-950">
                      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Current</div>
                      <div className="mt-1 text-lg font-black dark:text-white">{formatDisplayTime(stats.current)}</div>
                    </div>
                    <div className="border-2 border-black dark:border-white p-3 bg-background dark:bg-zinc-950">
                      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Best</div>
                      <div className="mt-1 text-lg font-black dark:text-white">{formatDisplayTime(stats.best)}</div>
                    </div>
                    <div className="border-2 border-black dark:border-white p-3 bg-background dark:bg-zinc-950">
                      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Mean (valid)</div>
                      <div className="mt-1 text-lg font-black dark:text-white">
                        {stats.meanValidMs === null ? "--" : formatSolveTime(stats.meanValidMs)}
                      </div>
                    </div>
                    <div className="border-2 border-black dark:border-white p-3 bg-background dark:bg-zinc-950">
                      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Count</div>
                      <div className="mt-1 text-lg font-black dark:text-white">{stats.count}</div>
                    </div>
                    <div className="border-2 border-black dark:border-white p-3 bg-background dark:bg-zinc-950">
                      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Ao5</div>
                      <div className="mt-1 text-lg font-black dark:text-white">{formatAverageResult(stats.ao5)}</div>
                    </div>
                    <div className="border-2 border-black dark:border-white p-3 bg-background dark:bg-zinc-950">
                      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Ao12</div>
                      <div className="mt-1 text-lg font-black dark:text-white">{formatAverageResult(stats.ao12)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-card dark:bg-zinc-900 border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black uppercase tracking-tight dark:text-white">Recent Solves</h2>
                    <span className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                      Last 10
                    </span>
                  </div>

                  {recentSolves.length === 0 ? (
                    <div className="border-2 border-dashed border-black dark:border-white p-4 font-mono text-sm text-gray-600 dark:text-gray-400">
                      No solves yet. Hold Space to start your first 3x3 solve.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentSolves.map((solve) => (
                        <div
                          key={solve.id}
                          className="border-2 border-black dark:border-white bg-background dark:bg-zinc-950 p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-lg font-black dark:text-white">{formatDisplayTime(solve)}</div>
                            <div className="flex items-center gap-2">
                              <span
                                className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.15em] border border-black dark:border-white dark:text-white"
                                style={solve.penalty !== "none" ? { backgroundColor: ACCENT_COLOR, color: "white" } : undefined}
                              >
                                {formatInspectionPenaltyBadge(solve.penalty)}
                              </span>
                              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                                {new Date(solve.finishedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 font-mono text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {solve.scramble}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            )}

            <section className="space-y-6">
              <div className="px-2 md:px-4 py-2">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4 xl:gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                          Timer
                        </span>
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500" aria-hidden="true" />
                        <span className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                          3x3
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-2xl md:text-3xl font-black tracking-tight uppercase" style={{ color: ACCENT_COLOR }}>
                          {currentStatusLabel}
                        </span>
                        {(timerState === "inspection" || timerState === "holding_to_start") && (
                          <span className="font-mono text-xs font-bold uppercase tracking-[0.12em] dark:text-white">
                            Penalty: <span style={{ color: ACCENT_COLOR }}>{formatInspectionPenaltyBadge(liveInspectionPenalty)}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-1 md:px-0">
                      <div className="flex items-center gap-3">
                        <label htmlFor="inspection-toggle" className="font-mono text-xs font-bold uppercase tracking-[0.12em] dark:text-white">
                          Inspection
                        </label>
                        <Switch
                          id="inspection-toggle"
                          checked={inspectionEnabled}
                          onCheckedChange={setInspectionEnabled}
                          disabled={timerState !== "idle"}
                          onKeyDown={preventSwitchSpaceToggle}
                          onPointerUp={(event) => event.currentTarget.blur()}
                          aria-label="Toggle inspection"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <label htmlFor="hide-timer-toggle" className="font-mono text-xs font-bold uppercase tracking-[0.12em] dark:text-white">
                          Hide During Solve
                        </label>
                        <Switch
                          id="hide-timer-toggle"
                          checked={hideTimerWhileSolving}
                          onCheckedChange={setHideTimerWhileSolving}
                          onKeyDown={preventSwitchSpaceToggle}
                          onPointerUp={(event) => event.currentTarget.blur()}
                          aria-label="Hide timer while solving"
                        />
                      </div>

                      <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                        {timerState === "idle" ? "Space to start • Space to stop" : "Timing controls active"}
                      </span>
                    </div>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Cubing timer pad"
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                    onContextMenu={(e) => e.preventDefault()}
                    className={cn(
                      "select-none touch-none min-h-[340px] md:min-h-[460px] flex flex-col items-center justify-center text-center px-4 transition-all",
                      (timerState === "holding" || timerState === "holding_to_start") && !isReady && "scale-[0.995]",
                      isReady && "ring-4 ring-offset-4 ring-offset-background dark:ring-offset-zinc-900",
                    )}
                    style={
                      isReady ? ({ ["--tw-ring-color"]: ACCENT_COLOR } as CSSProperties) : undefined
                    }
                  >
                    <div className={cn(
                      "text-[clamp(3.25rem,12vw,8.5rem)] leading-none font-black tracking-tight uppercase dark:text-white transition-opacity",
                      isTimerMasked && "opacity-90"
                    )}>
                      {displayText}
                    </div>

                    <div className="mt-5 font-mono text-sm md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl">
                      {statusSubtext}
                    </div>

                    <div className="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                      {isTouchMode ? "Touch mode enabled (Spacebar still works)." : "Keyboard: hold Space to arm, release to start."}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-wrap gap-3">
                      <Button variant="brutal-outline" onClick={handleResetCurrent}>
                        Reset Current
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="brutal-secondary" className="bg-hot-pink">
                            <Trash2 />
                            Clear Session
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-black uppercase tracking-tight">Clear local cubing session?</AlertDialogTitle>
                            <AlertDialogDescription className="font-mono">
                              This deletes all stored 3x3 solves on this device for `/cubing`.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-none border-2 border-black dark:border-white font-mono font-bold">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleClearSession}
                              className="rounded-none border-2 border-black dark:border-white font-mono font-bold bg-black text-white hover:bg-black/90"
                            >
                              Clear
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <div className="min-w-[220px] p-1">
                      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Last Result</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.15em] border border-black dark:border-white dark:text-white"
                          style={
                            lastRecordedSolve && lastRecordedSolve.penalty !== "none"
                              ? { backgroundColor: ACCENT_COLOR, color: "white" }
                              : undefined
                          }
                        >
                          {lastRecordedSolve ? formatInspectionPenaltyBadge(lastRecordedSolve.penalty) : "—"}
                        </span>
                        <span className="text-lg font-black dark:text-white">
                          {lastRecordedSolve ? formatDisplayTime(lastRecordedSolve) : "--"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cubing;

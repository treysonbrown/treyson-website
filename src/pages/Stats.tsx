import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Terminal, Activity, Github } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, subDays, eachDayOfInterval, subYears, startOfWeek } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip } from "recharts";

import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { GITHUB_USERNAME } from "@/lib/config";
import {
  getGitHubRepos,
  getGitHubUser,
  getGitHubContributions,
  type GitHubContributionDay,
  type GitHubContributionsResponse,
} from "@/lib/github";
import { useWorkLog, type WorkLogEntry } from "@/hooks/useWorkLog";

const ACCENT_COLOR = "#ff4499";
const TOOLTIP_WIDTH = 250;
const TOOLTIP_HEIGHT = 170; // Adjusted for content
const TOOLTIP_MARGIN = 12;
const GITHUB_HEATMAP_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"] as const;

const getGitHubCellColor = (day: GitHubContributionDay) => {
  if (day.contributionLevel === "NONE" || day.contributionCount === 0) {
    return "var(--heatmap-empty)";
  }
  return day.color;
};

// Helper to determine intensity color based on hours
const getIntensityColor = (hours: number) => {
  if (hours === 0) return "var(--heatmap-empty)";
  if (hours <= 2) return `${ACCENT_COLOR}33`; // 20% opacity
  if (hours <= 4) return `${ACCENT_COLOR}66`; // 40% opacity
  if (hours <= 6) return `${ACCENT_COLOR}99`; // 60% opacity
  return ACCENT_COLOR; // 100%
};

type EntryDetail = {
  description: string | null;
  tag: string | null;
};

type VelocityChartEntry = {
  label: string;
  workDate: Date;
  hours: number;
  entries: EntryDetail[];
};

type VelocityChartPayload = {
  payload?: VelocityChartEntry;
};

type VelocityTooltipProps = {
  active?: boolean;
  payload?: VelocityChartPayload[];
};

type VelocityBarClickArg = unknown;

type DayDetail = {
  totalHours: number;
  entries: EntryDetail[];
};

const VelocityTooltip = ({ active, payload }: VelocityTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }
  const data = payload[0]?.payload;
  if (!data) {
    return null;
  }
  const entries = data.entries;
  return (
    <div className="border-2 border-black dark:border-white bg-card dark:bg-zinc-900 p-2 font-mono text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] max-w-xs text-black dark:text-white">
      <div className="flex justify-between items-center">
        <p className="font-bold">{format(data.workDate, "MMM do")}</p>
        <p className="font-black text-sm" style={{ color: ACCENT_COLOR }}>
          {data.hours.toFixed(1)} hrs
        </p>
      </div>
      <div className="space-y-1 max-h-[120px] overflow-hidden font-mono text-xs leading-tight mt-2">
        {entries.length ? (
          entries.map((entry: EntryDetail, index: number) => (
            <div key={index} className="space-y-1">
              {entry.tag ? (
                <span className="inline-block bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-zinc-700">
                  {entry.tag}
                </span>
              ) : null}
              <p className="truncate text-gray-800 dark:text-gray-300">- {entry.description ?? "No description"}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 italic">No activity logged.</p>
        )}
      </div>
    </div >
  );
};

// --- COMPONENT: CONTRIBUTION GRAPH (HEATMAP) ---
type ContributionGraphProps = {
  entries: WorkLogEntry[];
  onDaySelect?: (date: Date, data: DayDetail | undefined) => void;
};

const ContributionGraph = ({ entries, onDaySelect }: ContributionGraphProps) => {
  const today = new Date();
  const startDate = subYears(today, 1);
  const gridStartDate = startOfWeek(startDate);

  const days = useMemo(() => {
    return eachDayOfInterval({ start: gridStartDate, end: today });
  }, [gridStartDate, today]);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, { totalHours: number; entries: EntryDetail[] }>();
    entries.forEach(entry => {
      const dateKey = format(parseISO(entry.work_date), 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, { totalHours: 0, entries: [] });
      }
      const dayData = map.get(dateKey)!;
      dayData.totalHours += entry.hours;
      dayData.entries.push({
        description: entry.description ?? null,
        tag: entry.tag ?? null,
      });
    });
    return map;
  }, [entries]);

  const [hoveredDay, setHoveredDay] = useState<{
    date: Date;
    data: { totalHours: number; entries: EntryDetail[] } | undefined;
    position: { left: number; top: number };
    placement: "above" | "below";
  } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scrollToMostRecent = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const { scrollWidth, clientWidth } = container;
      container.scrollLeft = Math.max(scrollWidth - clientWidth, 0);
    };

    scrollToMostRecent();
    window.addEventListener("resize", scrollToMostRecent);
    return () => window.removeEventListener("resize", scrollToMostRecent);
  }, [entries]);

  return (
    <div className="w-full pb-4">
      <div ref={scrollContainerRef} className="w-full overflow-x-auto pb-4">
        <div className="min-w-[800px] relative">
          {/* Days of week labels */}
          <div className="absolute -left-8 top-0 flex flex-col justify-between h-[100px] text-[10px] font-mono text-gray-400 dark:text-gray-500">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          <div>
            <div className="grid gap-[3px] grid-rows-7 grid-flow-col h-[102px]">
              {days.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const data = entriesByDate.get(dateKey);
                const hours = data?.totalHours || 0;

                return (
                  <div
                    key={dateKey}
                    className="w-[12px] h-[12px] border border-transparent hover:border-black dark:hover:border-white hover:z-50 transition-all cursor-pointer relative group"
                    style={{
                      backgroundColor: getIntensityColor(hours),
                      borderRadius: '1px'
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const cellCenterX = rect.left + rect.width / 2;
                      const maxLeft = Math.max(TOOLTIP_MARGIN, window.innerWidth - TOOLTIP_WIDTH - TOOLTIP_MARGIN);
                      const aboveTop = rect.top - TOOLTIP_HEIGHT - TOOLTIP_MARGIN;

                      let left = cellCenterX - TOOLTIP_WIDTH / 2;
                      left = Math.max(TOOLTIP_MARGIN, Math.min(left, maxLeft));

                      let top = aboveTop;
                      let placement: "above" | "below" = "above";
                      if (aboveTop < TOOLTIP_MARGIN) {
                        top = rect.bottom + TOOLTIP_MARGIN;
                        placement = "below";
                        const maxBelowTop = Math.max(TOOLTIP_MARGIN, window.innerHeight - TOOLTIP_HEIGHT - TOOLTIP_MARGIN);
                        top = Math.min(top, maxBelowTop);
                      }

                      setHoveredDay({
                        date: day,
                        data,
                        position: { left, top },
                        placement
                      });
                    }}
                    onClick={() => onDaySelect?.(day, data)}
                    onMouseLeave={() => setHoveredDay(null)}
                  />
                );
              })}
            </div>

            <AnimatePresence>
              {hoveredDay && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{
                    position: 'fixed',
                    left: hoveredDay.position.left,
                    top: hoveredDay.position.top,
                    zIndex: 100
                  }}
                  className="pointer-events-none w-[250px]"
                >
                  <div className="bg-card dark:bg-zinc-900 border-2 border-black dark:border-white p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] relative text-black dark:text-white">
                    {/* Arrow */}
                    <div
                      className={
                        hoveredDay.placement === "above"
                          ? "absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card dark:bg-zinc-900 border-b-2 border-r-2 border-black dark:border-white rotate-45"
                          : "absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card dark:bg-zinc-900 border-t-2 border-l-2 border-black dark:border-white -rotate-45"
                      }
                    />

                    <div className="relative z-10 space-y-2">
                      <div className="flex justify-between items-center border-b border-gray-200 dark:border-zinc-700 pb-2">
                        <span className="font-mono text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                          {format(hoveredDay.date, "MMM do, yyyy")}
                        </span>
                        <span
                          className="font-black text-sm"
                          style={{ color: ACCENT_COLOR }}
                        >
                          {hoveredDay.data?.totalHours.toFixed(1) || 0} hrs
                        </span>
                      </div>

                      <div className="space-y-1 max-h-[100px] overflow-hidden">
                        {hoveredDay.data?.entries.length ? (
                          hoveredDay.data.entries.map((entry, i) => (
                            <div key={i} className="font-mono text-xs leading-tight truncate space-y-0.5">
                              {entry.tag ? (
                                <span className="inline-block bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 text-[9px] uppercase tracking-[0.3em] text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-zinc-700">
                                  {entry.tag}
                                </span>
                              ) : null}
                              <p className="truncate">
                                {entry.description ?? "No description"}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs font-mono text-gray-400 italic">No activity logged.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] font-mono text-gray-500 dark:text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-[10px] h-[10px] bg-gray-100 dark:bg-zinc-800" />
          <div className="w-[10px] h-[10px]" style={{ backgroundColor: `${ACCENT_COLOR}33` }} />
          <div className="w-[10px] h-[10px]" style={{ backgroundColor: `${ACCENT_COLOR}66` }} />
          <div className="w-[10px] h-[10px]" style={{ backgroundColor: `${ACCENT_COLOR}99` }} />
          <div className="w-[10px] h-[10px]" style={{ backgroundColor: ACCENT_COLOR }} />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

// --- COMPONENT: GITHUB HEATMAP (Rebuilt to match) ---
type GitHubHeatmapProps = {
  username?: string;
  weeks?: GitHubContributionDay[][];
  totalContributions?: number;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
};

const GitHubHeatmap = ({
  username,
  weeks,
  totalContributions,
  isLoading,
  isError,
  error,
}: GitHubHeatmapProps) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [selectedGitHubDay, setSelectedGitHubDay] = useState<{ date: Date; count: number } | null>(null);
  const [hoveredDay, setHoveredDay] = useState<{
    date: Date;
    count: number;
    position: { left: number; top: number };
    placement: "above" | "below";
  } | null>(null);

  const flattenedDays = useMemo(
    () => (weeks ? weeks.flat() : []),
    [weeks]
  );

  useEffect(() => {
    if (!weeks?.length) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollToLatest = () => {
      const { scrollWidth, clientWidth } = container;
      container.scrollLeft = Math.max(scrollWidth - clientWidth, 0);
    };
    const frame = requestAnimationFrame(scrollToLatest);
    return () => cancelAnimationFrame(frame);
  }, [weeks]);

  if (isLoading) return <Skeleton className="h-[200px] w-full" />;
  if (isError) return <p className="font-mono text-red-500">Failed to load GitHub data.</p>;
  if (!weeks?.length || !flattenedDays.length) return <p className="font-mono text-gray-500">No GitHub data.</p>;

  // Visual grid matches Momentum heatmap (7 rows, flowing horizontally)
  return (
    <div className="mt-10 pt-8 border-t-2 border-dashed border-black/10 dark:border-white/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <p className="font-mono text-xs text-gray-500 dark:text-gray-400">// GITHUB_ACTIVITY</p>
          <h3 className="text-2xl font-black uppercase dark:text-white flex items-center gap-2">
            <Github className="w-6 h-6" /> GitHub Heatmap
          </h3>
        </div>
        {typeof totalContributions === "number" && (
          <div className="font-mono text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 px-2 py-1 border border-gray-300 dark:border-zinc-700">
            {totalContributions.toLocaleString()} total commits
          </div>
        )}
      </div>

      <div className="w-full pb-4">
        <div ref={scrollContainerRef} className="w-full overflow-x-auto pb-4">
          <div className="min-w-[800px] relative">
            {/* Day Labels - Matching existing graph */}
            <div className="absolute -left-8 top-0 flex flex-col justify-between h-[100px] text-[10px] font-mono text-gray-400 dark:text-gray-500">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Grid Container (matches Momentum heatmap) */}
            <div className="grid gap-[3px] grid-rows-7 grid-flow-col h-[102px]">
              {flattenedDays.map((day) => (
                <div
                  key={day.date}
                  className="w-[12px] h-[12px] border border-transparent hover:border-black dark:hover:border-white hover:z-50 transition-all cursor-pointer relative"
                  style={{
                    backgroundColor: getGitHubCellColor(day),
                    borderRadius: "1px",
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const cellCenterX = rect.left + rect.width / 2;
                    // Smaller tooltip dimensions for GitHub since less data
                    const GH_TOOLTIP_HEIGHT = 80;
                    const GH_TOOLTIP_WIDTH = 200;

                    const maxLeft = Math.max(
                      TOOLTIP_MARGIN,
                      window.innerWidth - GH_TOOLTIP_WIDTH - TOOLTIP_MARGIN
                    );
                    const aboveTop = rect.top - GH_TOOLTIP_HEIGHT - TOOLTIP_MARGIN;

                    let left = cellCenterX - GH_TOOLTIP_WIDTH / 2;
                    left = Math.max(TOOLTIP_MARGIN, Math.min(left, maxLeft));

                    let top = aboveTop;
                    let placement: "above" | "below" = "above";
                    if (aboveTop < TOOLTIP_MARGIN) {
                      top = rect.bottom + TOOLTIP_MARGIN;
                      placement = "below";
                      const maxBelowTop = Math.max(
                        TOOLTIP_MARGIN,
                        window.innerHeight - GH_TOOLTIP_HEIGHT - TOOLTIP_MARGIN
                      );
                      top = Math.min(top, maxBelowTop);
                    }

                    setHoveredDay({
                      date: parseISO(day.date),
                      count: day.contributionCount,
                      position: { left, top },
                      placement,
                    });
                  }}
                  onMouseLeave={() => setHoveredDay(null)}
                  onClick={() =>
                    setSelectedGitHubDay({
                      date: parseISO(day.date),
                      count: day.contributionCount,
                    })
                  }
                />
              ))}
            </div>

            {/* Hover Tooltip (Identical style to WorkLog) */}
            <AnimatePresence>
              {hoveredDay && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{
                    position: "fixed",
                    left: hoveredDay.position.left,
                    top: hoveredDay.position.top,
                    zIndex: 100,
                  }}
                  className="pointer-events-none w-[200px]"
                >
                  <div className="bg-card dark:bg-zinc-900 border-2 border-black dark:border-white p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] relative text-black dark:text-white">
                    {/* Arrow */}
                    <div
                      className={
                        hoveredDay.placement === "above"
                          ? "absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card dark:bg-zinc-900 border-b-2 border-r-2 border-black dark:border-white rotate-45"
                          : "absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card dark:bg-zinc-900 border-t-2 border-l-2 border-black dark:border-white -rotate-45"
                      }
                    />
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <span className="font-mono text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                        {format(hoveredDay.date, "MMM do, yyyy")}
                      </span>
                      <span className="font-black text-lg mt-1 dark:text-white">
                        {hoveredDay.count}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
                        Contributions
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-2 text-[10px] font-mono text-gray-500 dark:text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            {GITHUB_HEATMAP_COLORS.map((color, index) => (
              <div
                key={color}
                className="w-[10px] h-[10px] rounded-[1px]"
                style={{ backgroundColor: index === 0 ? "var(--heatmap-empty)" : color }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Click Dialog */}
      <Dialog
        open={Boolean(selectedGitHubDay)}
        onOpenChange={(open) => {
          if (!open) setSelectedGitHubDay(null);
        }}
      >
        <DialogContent className="border-2 border-black dark:border-white bg-card dark:bg-zinc-900 px-6 py-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] font-mono max-w-sm text-center">
          <div className="flex flex-col items-center gap-4">
            <Github className="w-12 h-12 dark:text-white" strokeWidth={1.5} />
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                {selectedGitHubDay ? format(selectedGitHubDay.date, "EEEE, MMMM do yyyy") : ""}
              </p>
              <div className="text-5xl font-black dark:text-white">
                {selectedGitHubDay?.count}
              </div>
              <p className="text-sm font-bold mt-1 text-gray-600 dark:text-gray-300">
                Contributions
              </p>
            </div>
            <div className="h-px w-full bg-gray-200 dark:bg-zinc-800 my-2" />
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              View on GitHub &rarr;
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Stats = () => {
  // work log entry removed

  const {
    entries,
    totalHours,
    totalDaysTracked,
    isLoading: isWorkLogLoading,
  } = useWorkLog();
  const [selectedDay, setSelectedDay] = useState<{ date: Date; data: DayDetail | undefined } | null>(null);
  const selectedEntries = selectedDay?.data?.entries ?? [];
  const selectedTotalHours = selectedDay?.data?.totalHours ?? 0;

  const userQuery = useQuery({
    queryKey: ["github-user", GITHUB_USERNAME],
    queryFn: () => getGitHubUser(GITHUB_USERNAME),
    staleTime: 1000 * 60 * 10,
  });

  const repoQuery = useQuery({
    queryKey: ["github-repos", GITHUB_USERNAME],
    queryFn: () => getGitHubRepos(GITHUB_USERNAME),
    staleTime: 1000 * 60 * 10,
  });

  const contributionsQuery = useQuery<GitHubContributionsResponse, Error>({
    queryKey: ["github-contributions", GITHUB_USERNAME],
    queryFn: () => getGitHubContributions(GITHUB_USERNAME),
    staleTime: 1000 * 60 * 30,
    enabled: Boolean(GITHUB_USERNAME),
  });

  const chartData = useMemo<VelocityChartEntry[]>(() => {
    const totalsByDate = entries.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.work_date] = (acc[entry.work_date] ?? 0) + entry.hours;
      return acc;
    }, {});
    const detailsByDate = entries.reduce<Record<string, EntryDetail[]>>((acc, entry) => {
      if (!acc[entry.work_date]) {
        acc[entry.work_date] = [];
      }
      acc[entry.work_date].push({
        description: entry.description ?? null,
        tag: entry.tag ?? null,
      });
      return acc;
    }, {});

    return Array.from({ length: 7 }).map((_, index) => {
      const date = subDays(new Date(), 6 - index);
      const iso = format(date, "yyyy-MM-dd");
      return {
        label: format(date, "EEE"),
        workDate: date,
        hours: totalsByDate[iso] ?? 0,
        entries: detailsByDate[iso] ?? [],
      };
    });
  }, [entries]);

  const handleVelocityBarClick = (barData?: VelocityBarClickArg) => {
    const data = (() => {
      if (!barData || typeof barData !== "object") return undefined;
      const maybe = barData as any;
      if (maybe?.workDate) return maybe as VelocityChartEntry;
      if (maybe?.payload?.workDate) return maybe.payload as VelocityChartEntry;
      if (maybe?.activePayload?.[0]?.payload?.workDate) return maybe.activePayload[0].payload as VelocityChartEntry;
      return undefined;
    })();
    if (!data) return;

    setSelectedDay({
      date: data.workDate,
      data: {
        totalHours: data.hours,
        entries: data.entries,
      },
    });
  };

  // work log entry removed

  // Ensure page starts at the top when navigating here.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 font-sans selection:text-white transition-colors">
      <Navbar showHomeLink useAbsolutePaths />

      {/* Style Injection with Dark Mode Variables */}
      <style>{`
        ::selection { background-color: ${ACCENT_COLOR}; color: white; }
        .hover-accent-shadow:hover { box-shadow: 6px 6px 0px 0px ${ACCENT_COLOR}; border-color: ${ACCENT_COLOR}; }
        :root { --heatmap-empty: #f3f4f6; --chart-grid: #e5e7eb; --chart-bar: black; }
        .dark { --heatmap-empty: #27272a; --chart-grid: #444; --chart-bar: white; }
      `}</style>

      {/* Engineering Grid Background - Inverted for Dark Mode */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(#f0f0f0_1px,transparent_1px),linear-gradient(90deg,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(#27272a_1px,transparent_1px),linear-gradient(90deg,#27272a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <main className="container relative z-10 mx-auto px-6 py-24 md:py-32 space-y-20">

        {/* --- HEADER --- */}
        <section className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 border-2 border-black dark:border-white bg-card dark:bg-zinc-900 px-3 py-1 font-mono text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:text-white">
            <div className="h-3 w-3 animate-pulse rounded-full" style={{ backgroundColor: ACCENT_COLOR }} />
            LIVE_METRICS
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] dark:text-white">
            Work in <br /> Public<span style={{ color: ACCENT_COLOR }}>.</span>
          </h1>
          <p className="text-xl md:text-2xl font-mono text-gray-600 dark:text-gray-400 max-w-2xl">
            Daily development logs. Keeping strict accountability on the road to shipping Thesis.
          </p>
        </section>

        <div className="w-full h-1 bg-black dark:bg-white" />


        {/* --- TOTALS & CHARTS --- */}
        <section className="grid lg:grid-cols-[1fr_2fr] gap-8 items-stretch">
          {/* Totals Box */}
          <div className="flex flex-col justify-center bg-black dark:bg-zinc-900 text-white p-8 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(100,100,100,0.5)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
            <div className="space-y-8">
              <div>
                <p className="font-mono text-sm text-gray-400 mb-1">TOTAL_HOURS_LOGGED</p>
                <p className="text-6xl font-black tracking-tighter" style={{ color: ACCENT_COLOR }}>
                  {totalHours.toFixed(1)}
                </p>
              </div>
              <div className="w-full h-px bg-gray-700" />
              <div>
                <p className="font-mono text-sm text-gray-400 mb-1">DAYS_ACTIVE</p>
                <p className="text-4xl font-bold tracking-tight">{totalDaysTracked}</p>
              </div>
            </div>
          </div>

          {/* Chart Box */}
          <div className="bg-card dark:bg-zinc-900 p-6 md:p-8 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl uppercase dark:text-white">7 Day Velocity</h3>
              <Terminal className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex-grow w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontFamily: 'monospace', fontSize: 12, fill: 'gray' }}
                    dy={10}
                  />
                  <Tooltip cursor={{ fill: 'var(--heatmap-empty)' }} content={<VelocityTooltip />} />
                  <Bar
                    dataKey="hours"
                    fill="var(--chart-bar)"
                    radius={[0, 0, 0, 0]}
                    barSize={40}
                    cursor="pointer"
                    onClick={handleVelocityBarClick}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* --- HEATMAP (REPLACES CHANNEL LOG) --- */}
        <section className="space-y-8 pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-black dark:border-white pb-2">
            <div className="flex items-end gap-4">
              <h2 className="text-4xl font-black uppercase dark:text-white">Momentum</h2>
              <span className="font-mono text-sm mb-2 text-gray-500 dark:text-gray-400">// 1_YEAR_VIEW</span>
            </div>
            <div className="hidden md:flex items-center gap-2 font-mono text-xs font-bold bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100 border border-black dark:border-white px-2 py-1">
              <Activity className="w-4 h-4" />
              HOVER AND CLICK FOR DETAILS
            </div>
            <div className="flex md:hidden items-center gap-2 font-mono text-xs font-bold bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100 border border-black dark:border-white px-2 py-1">
              <Activity className="w-4 h-4" />
              TAP FOR DETAILS
            </div>
          </div>

          <div className="border-4 border-black dark:border-white bg-card dark:bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            {isWorkLogLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <>
                <ContributionGraph
                  entries={entries}
                  onDaySelect={(date, data) => setSelectedDay({ date, data })}
                />
                {GITHUB_USERNAME ? (
                  <GitHubHeatmap
                    username={GITHUB_USERNAME}
                    weeks={contributionsQuery.data?.contributions}
                    totalContributions={contributionsQuery.data?.totalContributions}
                    isLoading={contributionsQuery.isLoading}
                    isError={contributionsQuery.isError}
                    error={contributionsQuery.error}
                  />
                ) : null}
                <Dialog
                  open={Boolean(selectedDay)}
                  onOpenChange={(open) => {
                    if (!open) setSelectedDay(null);
                  }}
                >
                  <DialogContent className="border-2 border-black dark:border-white bg-card dark:bg-zinc-900 px-6 pt-10 pb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] font-mono text-[13px] max-w-xl min-w-[320px] dark:text-white">
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-zinc-700 pb-2">
                      <span className="font-bold uppercase text-[10px] text-gray-500 dark:text-gray-400 tracking-[0.3em]">
                        {selectedDay ? format(selectedDay.date, "MMM do, yyyy") : ""}
                      </span>
                      <span
                        className="font-black text-sm"
                        style={{ color: ACCENT_COLOR }}
                      >
                        {selectedTotalHours.toFixed(1)} hrs
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 max-h-[320px] overflow-y-auto">
                      {selectedEntries.length ? (
                        selectedEntries.map((entry, i) => (
                          <div key={i} className="text-xs leading-relaxed break-words space-y-1 border-b border-gray-100 dark:border-zinc-800 pb-2 last:border-0 last:pb-0">
                            {entry.tag ? (
                              <span className="inline-block bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-zinc-700">
                                {entry.tag}
                              </span>
                            ) : null}
                            <p>
                              - {entry.description ?? "No description provided."}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic">No activity logged.</p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </section>

        {/* Work log entry UI removed */}

      </main>
    </div>
  );
};

export default Stats;

import { FormEvent, useEffect, useMemo, useState, type CSSProperties } from "react";
import { Github, RefreshCw, Star, Users, CalendarDays, Trash2, ArrowUpRight, Terminal, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, subDays, eachDayOfInterval, subYears, isSameDay, getDay, startOfWeek } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip } from "recharts";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { GITHUB_USERNAME } from "@/lib/config";
import { getGitHubRepos, getGitHubUser } from "@/lib/github";
import { useWorkLog, type WorkLogEntry } from "@/hooks/useWorkLog";
import { supabase } from "@/lib/supabaseClient";

const ACCENT_COLOR = "#ff4499";
const TOOLTIP_WIDTH = 250;
const TOOLTIP_HEIGHT = 170;
const TOOLTIP_MARGIN = 12;

// Helper to determine intensity color based on hours
const getIntensityColor = (hours: number) => {
  if (hours === 0) return "#f3f4f6"; // gray-100
  if (hours <= 2) return `${ACCENT_COLOR}33`; // 20% opacity
  if (hours <= 4) return `${ACCENT_COLOR}66`; // 40% opacity
  if (hours <= 6) return `${ACCENT_COLOR}99`; // 60% opacity
  return ACCENT_COLOR; // 100%
};

type VelocityChartEntry = {
  label: string;
  workDate: Date;
  hours: number;
  descs: string[];
};

type VelocityTooltipPayload = {
  payload?: VelocityChartEntry;
};

type VelocityTooltipProps = {
  active?: boolean;
  payload?: VelocityTooltipPayload[];
};

type VelocityBarClickArg = VelocityChartEntry | { payload?: VelocityChartEntry };

type DayDetail = {
  totalHours: number;
  descs: string[];
};

const VelocityTooltip = ({ active, payload }: VelocityTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }
  const data = payload[0]?.payload;
  if (!data) {
    return null;
  }
  const descriptions = data.descs;
  return (
    <div className="border-2 border-black bg-white p-2 font-mono text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-xs">
      <div className="flex justify-between items-center">
        <p className="font-bold">{format(data.workDate, "MMM do")}</p>
        <p className="font-black text-sm" style={{ color: ACCENT_COLOR }}>
          {data.hours.toFixed(1)} hrs
        </p>
      </div>
      <div className="space-y-1 max-h-[120px] overflow-hidden font-mono text-xs leading-tight">
        {descriptions.length ? (
          descriptions.map((desc: string, index: number) => (
            <p key={index} className="truncate">
              - {desc}
            </p>
          ))
        ) : (
          <p className="text-gray-400 italic">No activity logged.</p>
        )}
      </div>
      <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-gray-400">Click for details</p>
    </div>
  );
};

// --- COMPONENT: CONTRIBUTION GRAPH (HEATMAP) ---
type ContributionGraphProps = {
  entries: WorkLogEntry[];
  onDaySelect?: (date: Date, data: DayDetail | undefined) => void;
};

const ContributionGraph = ({ entries, onDaySelect }: ContributionGraphProps) => {
  // 1. Generate the last 365 days
  const today = new Date();
  const startDate = subYears(today, 1);

  // Align start date to the previous Sunday so the grid looks square
  const gridStartDate = startOfWeek(startDate);

  const days = useMemo(() => {
    return eachDayOfInterval({ start: gridStartDate, end: today });
  }, [gridStartDate, today]);

  // 2. Map entries to a lookup object for O(1) access
  const entriesByDate = useMemo(() => {
    const map = new Map<string, { totalHours: number; descs: string[] }>();
    entries.forEach(entry => {
      const dateKey = format(parseISO(entry.work_date), 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, { totalHours: 0, descs: [] });
      }
      const dayData = map.get(dateKey)!;
      dayData.totalHours += entry.hours;
      if (entry.description) dayData.descs.push(entry.description);
    });
    return map;
  }, [entries]);

  const [hoveredDay, setHoveredDay] = useState<{
    date: Date;
    data: { totalHours: number; descs: string[] } | undefined;
    position: { left: number; top: number };
    placement: "above" | "below";
  } | null>(null);

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[800px] relative">
        {/* Days of week labels */}
        <div className="absolute -left-8 top-0 flex flex-col justify-between h-[100px] text-[10px] font-mono text-gray-400">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>

        {/* The Grid */}
        <div
          className="grid gap-[3px] grid-rows-7 grid-flow-col h-[115px]"
        >
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const data = entriesByDate.get(dateKey);
            const hours = data?.totalHours || 0;

            return (
              <div
                key={dateKey}
                className="w-[12px] h-[12px] border border-transparent hover:border-black hover:z-50 transition-all cursor-pointer relative group"
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

        {/* Custom Portal/Popup for Hover */}
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
              <div className="bg-white border-2 border-black p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
                {/* Arrow */}
                <div
                  className={
                    hoveredDay.placement === "above"
                      ? "absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-black rotate-45"
                      : "absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t-2 border-l-2 border-black -rotate-45"
                  }
                />

                <div className="relative z-10 space-y-2">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="font-mono text-xs font-bold uppercase text-gray-500">
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
                    {hoveredDay.data?.descs.length ? (
                      hoveredDay.data.descs.map((desc, i) => (
                        <p key={i} className="text-xs font-mono leading-tight truncate">
                          - {desc}
                        </p>
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

      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] font-mono text-gray-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-[10px] h-[10px]" style={{ backgroundColor: "#f3f4f6" }} />
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

const Stats = () => {
  const todayIso = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(todayIso);
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    entries,
    addEntry,
    totalHours,
    totalDaysTracked,
    isLoading: isWorkLogLoading,
    isSubmitting: isWorkLogSubmitting,
    canEdit,
  } = useWorkLog();
  const [selectedDay, setSelectedDay] = useState<{ date: Date; data: DayDetail | undefined } | null>(null);
  const selectedDescriptions = selectedDay?.data?.descs ?? [];
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

  const totalStars = useMemo(() => {
    if (!repoQuery.data) return 0;
    return repoQuery.data.reduce((sum, repo) => sum + (repo.stargazers_count ?? 0), 0);
  }, [repoQuery.data]);

  const topRepos = useMemo(() => {
    if (!repoQuery.data) return [];
    return [...repoQuery.data]
      .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
      .slice(0, 3);
  }, [repoQuery.data]);

  const chartData = useMemo<VelocityChartEntry[]>(() => {
    const totalsByDate = entries.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.work_date] = (acc[entry.work_date] ?? 0) + entry.hours;
      return acc;
    }, {});
    const descriptionsByDate = entries.reduce<Record<string, string[]>>((acc, entry) => {
      if (!acc[entry.work_date]) {
        acc[entry.work_date] = [];
      }
      if (entry.description) {
        acc[entry.work_date].push(entry.description);
      }
      return acc;
    }, {});

    return Array.from({ length: 7 }).map((_, index) => {
      const date = subDays(new Date(), 6 - index);
      const iso = format(date, "yyyy-MM-dd");
      return {
        label: format(date, "EEE"),
        workDate: date,
        hours: totalsByDate[iso] ?? 0,
        descs: descriptionsByDate[iso] ?? [],
      };
    });
  }, [entries]);
  const handleVelocityBarClick = (barData?: VelocityBarClickArg) => {
    if (!barData) return;
    const payload = "payload" in barData ? barData.payload : barData;
    if (!payload) return;
    setSelectedDay({
      date: payload.workDate,
      data: {
        totalHours: payload.hours,
        descs: payload.descs,
      },
    });
  };

  const handleAddEntry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit) {
      setFormError("Only the authorized account can log work.");
      return;
    }
    const parsedHours = parseFloat(hours);
    if (!date) return setFormError("Choose a date.");
    if (Number.isNaN(parsedHours) || parsedHours < 0) return setFormError("Invalid hours.");

    try {
      await addEntry({ date, hours: parsedHours, description, tag });
      setHours("");
      setDescription("");
      setTag("");
      setFormError(null);
    } catch (error) {
      setFormError("Failed to save entry.");
      console.error(error);
    }
  };

  const isGithubLoading = userQuery.isLoading || repoQuery.isLoading;
  const githubError = userQuery.error || repoQuery.error;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log("access token:", data.session?.access_token);
    });
  }, [])

  return (
    <div className="min-h-screen bg-white font-sans selection:text-white">
      <Navbar showHomeLink useAbsolutePaths />

      {/* Style Injection */}
      <style>{`
        ::selection { background-color: ${ACCENT_COLOR}; color: white; }
        .hover-accent-shadow:hover { box-shadow: 6px 6px 0px 0px ${ACCENT_COLOR}; border-color: ${ACCENT_COLOR}; }
      `}</style>

      {/* Engineering Grid Background */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(#f0f0f0_1px,transparent_1px),linear-gradient(90deg,#f0f0f0_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <main className="container relative z-10 mx-auto px-6 py-24 md:py-32 space-y-20">

        {/* --- HEADER --- */}
        <section className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1 font-mono text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="h-3 w-3 animate-pulse rounded-full" style={{ backgroundColor: ACCENT_COLOR }} />
            LIVE_METRICS
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
            Work in <br /> Public<span style={{ color: ACCENT_COLOR }}>.</span>
          </h1>
          <p className="text-xl md:text-2xl font-mono text-gray-600 max-w-2xl">
            Daily development logs. Keeping strict accountability on the road to shipping Thesis.
          </p>
        </section>

        <div className="w-full h-1 bg-black" />


        {/* --- TOTALS & CHARTS --- */}
        <section className="grid lg:grid-cols-[1fr_2fr] gap-8 items-stretch">
          {/* Totals Box */}
          <div className="flex flex-col justify-center bg-black text-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(100,100,100,0.5)]">
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
          <div className="bg-white p-6 md:p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl uppercase">7 Day Velocity</h3>
              <Terminal className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex-grow w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontFamily: 'monospace', fontSize: 12 }}
                    dy={10}
                  />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} content={<VelocityTooltip />} />
                  <Bar
                    dataKey="hours"
                    fill="black"
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-black pb-2">
            <div className="flex items-end gap-4">
              <h2 className="text-4xl font-black uppercase">Momentum</h2>
              <span className="font-mono text-sm mb-2 text-gray-500">// 1_YEAR_VIEW</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold bg-yellow-100 border border-black px-2 py-1">
              <Activity className="w-4 h-4" />
              HOVER FOR DETAILS
            </div>
          </div>

            <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {isWorkLogLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <>
                <ContributionGraph
                  entries={entries}
                  onDaySelect={(date, data) => setSelectedDay({ date, data })}
                />
                <Dialog
                  open={Boolean(selectedDay)}
                  onOpenChange={(open) => {
                    if (!open) setSelectedDay(null);
                  }}
                >
                  <DialogContent className="border-2 border-black bg-white px-6 pt-10 pb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-mono text-[13px] max-w-xl min-w-[320px]">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="font-bold uppercase text-[10px] text-gray-500 tracking-[0.3em]">
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
                      {selectedDescriptions.length ? (
                        selectedDescriptions.map((desc, i) => (
                          <p key={i} className="text-xs leading-relaxed break-words">
                            - {desc}
                          </p>
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

        {/* --- LOG NEW WORK (CONDITIONAL) --- */}
        {canEdit && (
          <section className="border-4 border-black bg-yellow-50 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-6 border-b-2 border-black pb-4">
              <h2 className="text-3xl font-black uppercase">Log Entry</h2>
              <p className="font-mono text-sm text-gray-600 mt-1">Admin Access Granted</p>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="log-date" className="font-mono font-bold uppercase">Date</Label>
                  <Input
                    id="log-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={todayIso}
                    disabled={isWorkLogLoading || isWorkLogSubmitting}
                    className="border-2 border-black bg-white focus-visible:ring-0 focus-visible:border-[color:var(--accent)] rounded-none h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="log-hours" className="font-mono font-bold uppercase">Hours</Label>
                  <Input
                    id="log-hours"
                    type="number"
                    min="0"
                    step="0.25"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="border-2 border-black bg-white focus-visible:ring-0 focus-visible:border-[color:var(--accent)] rounded-none h-12"
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="log-desc" className="font-mono font-bold uppercase">Description</Label>
                <Textarea
                  id="log-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-2 border-black bg-white focus-visible:ring-0 focus-visible:border-[color:var(--accent)] rounded-none min-h-[100px]"
                  placeholder="What did you ship today?"
                />
              </div>

              <div className="grid md:grid-cols-[1fr_auto] gap-6 items-end">
                <div className="space-y-2">
                  <Label htmlFor="log-tag" className="font-mono font-bold uppercase">Tag</Label>
                  <Input
                    id="log-tag"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="border-2 border-black bg-white focus-visible:ring-0 focus-visible:border-[color:var(--accent)] rounded-none h-12"
                    placeholder="planning, dev, debug..."
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isWorkLogLoading || isWorkLogSubmitting}
                  className="h-12 px-8 bg-black text-white hover:bg-[color:var(--accent)] hover:text-white rounded-none border-2 border-black font-bold uppercase tracking-widest transition-all"
                  style={{ '--accent': ACCENT_COLOR } as CSSProperties}
                >
                  {isWorkLogSubmitting ? "SAVING..." : "COMMIT LOG"}
                </Button>
              </div>
              {formError && <p className="font-mono text-red-600 font-bold bg-red-100 p-2 border-l-4 border-red-600">{formError}</p>}
            </form>
          </section>
        )}

      </main>
    </div>
  );
};

export default Stats;

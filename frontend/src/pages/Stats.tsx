import { FormEvent, useEffect, useMemo, useState, type CSSProperties } from "react";
import { Github, RefreshCw, Star, Users, CalendarDays, Clock, Trash2, ArrowUpRight, Terminal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, subDays } from "date-fns";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip } from "recharts";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { GITHUB_USERNAME } from "@/lib/config";
import { getGitHubRepos, getGitHubUser } from "@/lib/github";
import { useWorkLog, type WorkLogEntry } from "@/hooks/useWorkLog";
import { supabase } from "@/lib/supabaseClient";

type TimeframeFilter = "7d" | "30d" | "all" | "custom";

const ACCENT_COLOR = "#ff4499";
const TIMEFRAME_OPTIONS: { label: string; value: TimeframeFilter }[] = [
  { label: "7D Sprint", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "All Time", value: "all" },
  { label: "Custom", value: "custom" },
];

const formatDisplayDate = (isoDate: string) => {
  try {
    return format(parseISO(isoDate), "MMMM d, yyyy");
  } catch {
    return isoDate;
  }
};

// Custom Brutalist Tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="border-2 border-black bg-white p-2 font-mono text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="font-bold">{label}</p>
        <p style={{ color: ACCENT_COLOR }}>{payload[0].value} hours</p>
      </div>
    );
  }
  return null;
};

const Stats = () => {
  const todayIso = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(todayIso);
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("all");
  const [timeframeFilter, setTimeframeFilter] = useState<TimeframeFilter>("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const {
    entries,
    addEntry,
    deleteEntry,
    totalHours,
    totalDaysTracked,
    isLoading: isWorkLogLoading,
    isSubmitting: isWorkLogSubmitting,
    isDeletingEntry,
    canEdit,
  } = useWorkLog();

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

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    entries.forEach((entry) => {
      const normalized = entry.tag?.trim();
      if (normalized) {
        tags.add(normalized);
      }
    });
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [entries]);

  const timeframeBounds = useMemo(() => {
    if (timeframeFilter === "all") {
      return { startDate: null as string | null, endDate: null as string | null };
    }

    if (timeframeFilter === "custom") {
      return {
        startDate: customStartDate || null,
        endDate: customEndDate || null,
      };
    }

    const windowSize = timeframeFilter === "7d" ? 6 : 29;
    const startDate = format(subDays(new Date(), windowSize), "yyyy-MM-dd");
    return { startDate, endDate: null as string | null };
  }, [customEndDate, customStartDate, timeframeFilter]);

  const filteredEntries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        entry.description?.toLowerCase().includes(normalizedSearch) ||
        entry.tag?.toLowerCase().includes(normalizedSearch);

      const matchesTag = selectedTagFilter === "all" || entry.tag === selectedTagFilter;

      const matchesTimeframe = (() => {
        if (!timeframeBounds.startDate && !timeframeBounds.endDate) return true;
        if (timeframeBounds.startDate && entry.work_date < timeframeBounds.startDate) return false;
        if (timeframeBounds.endDate && entry.work_date > timeframeBounds.endDate) return false;
        return true;
      })();

      return matchesSearch && matchesTag && matchesTimeframe;
    });
  }, [entries, searchTerm, selectedTagFilter, timeframeBounds]);

  const groupedEntries = useMemo(() => {
    const map = new Map<string, { totalHours: number; items: WorkLogEntry[] }>();

    filteredEntries.forEach((entry) => {
      if (!map.has(entry.work_date)) {
        map.set(entry.work_date, { totalHours: 0, items: [] });
      }
      const group = map.get(entry.work_date);
      if (group) {
        group.totalHours += entry.hours;
        group.items = [...group.items, entry];
      }
    });

    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filteredEntries]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count += 1;
    if (selectedTagFilter !== "all") count += 1;
    if (timeframeFilter === "7d" || timeframeFilter === "30d") {
      count += 1;
    } else if (timeframeFilter === "custom" && (customStartDate || customEndDate)) {
      count += 1;
    }
    return count;
  }, [customEndDate, customStartDate, searchTerm, selectedTagFilter, timeframeFilter]);

  const chartData = useMemo(() => {
    const totalsByDate = entries.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.work_date] = (acc[entry.work_date] ?? 0) + entry.hours;
      return acc;
    }, {});

    return Array.from({ length: 7 }).map((_, index) => {
      const date = subDays(new Date(), 6 - index);
      const iso = format(date, "yyyy-MM-dd");
      return {
        label: format(date, "EEE"),
        hours: totalsByDate[iso] ?? 0,
      };
    });
  }, [entries]);

  const handleTimeframeChange = (value: TimeframeFilter) => {
    setTimeframeFilter(value);
    if (value !== "custom") {
      setCustomStartDate("");
      setCustomEndDate("");
    }
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
            Real-time GitHub pulse and daily development logs. Keeping strict accountability on the road to shipping Thesis.
          </p>
        </section>

        <div className="w-full h-1 bg-black" />

        {/* --- GITHUB STATS --- */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <h2 className="text-3xl font-black uppercase flex items-center gap-3">
              <Github className="h-8 w-8" />
              GitHub Pulse
            </h2>
            <p className="font-mono text-sm text-gray-500">// SYNCED_VIA_API</p>
          </div>

          {isGithubLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full border-2 border-black" />)}
            </div>
          ) : githubError ? (
            <div className="border-4 border-red-500 bg-red-50 p-6 shadow-[6px_6px_0px_0px_rgba(220,38,38,1)]">
              <p className="font-mono text-red-700 font-bold mb-4">ERROR: COULD NOT FETCH GITHUB DATA</p>
              <Button variant="outline" onClick={() => { userQuery.refetch(); repoQuery.refetch(); }} className="border-2 border-red-500 hover:bg-red-100 text-red-700">
                <RefreshCw className="mr-2 h-4 w-4" /> Retry Connection
              </Button>
            </div>
          ) : (
            <>
              {/* Top Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Followers", value: userQuery.data?.followers, icon: Users },
                  { label: "Public Repos", value: userQuery.data?.public_repos, icon: CalendarDays },
                  { label: "Total Stars", value: totalStars, icon: Star, iconColor: "text-yellow-500" },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-start mb-4">
                      <p className="font-mono text-xs font-bold uppercase tracking-wider text-gray-500">{stat.label}</p>
                      <stat.icon className={`h-6 w-6 ${stat.iconColor || "text-gray-400"}`} />
                    </div>
                    <p className="text-4xl font-black">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Top Repos Grid */}
              <div className="space-y-4 pt-4">
                <p className="font-mono text-sm font-bold bg-black text-white inline-block px-2 py-1">TOP REPOSITORIES</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topRepos.map((repo) => (
                    <motion.a
                      key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ y: -5 }}
                      className="group flex flex-col justify-between h-full bg-white p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover-accent-shadow transition-all duration-200"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold break-all group-hover:text-[var(--accent)]">{repo.name}</h3>
                          <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm font-mono text-gray-600 line-clamp-2 mb-4">
                          {repo.description || "No description provided."}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-sm font-bold">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        {repo.stargazers_count}
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

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
                  <Tooltip cursor={{ fill: '#f3f4f6' }} content={<CustomTooltip />} />
                  <Bar dataKey="hours" fill="black" radius={[0, 0, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
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

        {/* --- DAILY LOG HISTORY --- */}
        <section className="space-y-8 pb-12">
          <div className="flex items-end gap-4 border-b-4 border-black pb-2">
            <h2 className="text-4xl font-black uppercase">Changelog</h2>
            <span className="font-mono text-sm mb-2 text-gray-500">// HISTORY</span>
          </div>

          <div className="space-y-4 border-2 border-black bg-white p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
              <div className="space-y-2">
                <Label htmlFor="log-search" className="font-mono font-bold uppercase">Search Log</Label>
                <Input
                  id="log-search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Ship, debug, planning..."
                  className="border-2 border-black rounded-none bg-white focus-visible:ring-0 focus-visible:border-[color:var(--accent)]"
                  style={{ '--accent': ACCENT_COLOR } as CSSProperties}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-mono font-bold uppercase">Timeframe</Label>
                <div className="flex flex-wrap gap-2">
                  {TIMEFRAME_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      onClick={() => handleTimeframeChange(option.value)}
                      className={`rounded-none border-2 border-black font-mono text-xs font-bold tracking-widest ${
                        timeframeFilter === option.value ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
                      }`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                {timeframeFilter === "custom" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="custom-start" className="font-mono text-[11px] uppercase">Start Date</Label>
                      <Input
                        id="custom-start"
                        type="date"
                        value={customStartDate}
                        onChange={(event) => setCustomStartDate(event.target.value)}
                        className="border-2 border-dashed border-black rounded-none bg-white focus-visible:ring-0 focus-visible:border-black"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="custom-end" className="font-mono text-[11px] uppercase">End Date</Label>
                      <Input
                        id="custom-end"
                        type="date"
                        value={customEndDate}
                        min={customStartDate || undefined}
                        onChange={(event) => setCustomEndDate(event.target.value)}
                        className="border-2 border-dashed border-black rounded-none bg-white focus-visible:ring-0 focus-visible:border-black"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-mono font-bold uppercase">Tag</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => setSelectedTagFilter("all")}
                    className={`rounded-none border-2 border-black font-mono text-xs font-bold tracking-widest ${
                      selectedTagFilter === "all" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
                    }`}
                  >
                    All Tags
                  </Button>
                  {availableTags.length === 0 ? (
                    <span className="text-xs font-mono text-gray-500 self-center">No tags logged yet</span>
                  ) : (
                    availableTags.map((tagOption) => (
                      <Button
                        key={tagOption}
                        type="button"
                        onClick={() => setSelectedTagFilter(tagOption)}
                        className={`rounded-none border-2 border-black font-mono text-xs font-bold tracking-widest ${
                          selectedTagFilter === tagOption ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
                        }`}
                      >
                        {tagOption}
                      </Button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs uppercase tracking-widest text-gray-500">
              <span>{activeFilterCount === 0 ? "Showing all entries" : `${activeFilterCount} filters active`}</span>
              {activeFilterCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedTagFilter("all");
                    handleTimeframeChange("all");
                  }}
                  className="rounded-none border-2 border-black bg-white text-black hover:bg-gray-100"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </div>

          {isWorkLogLoading ? (
            <Skeleton className="h-40 w-full border-2 border-black" />
          ) : groupedEntries.length === 0 ? (
            <div className="border-2 border-dashed border-gray-400 p-12 text-center font-mono text-gray-500">
              {entries.length === 0 ? "NO_DATA_FOUND" : "NO_LOGS_MATCH_FILTERS"}
            </div>
          ) : (
            <div className="space-y-8">
              {groupedEntries.map(([day, group]) => (
                <div key={day} className="relative pl-0 md:pl-8 border-l-0 md:border-l-4 border-gray-200">
                  <div className="md:absolute md:-left-[25px] md:top-0 h-4 w-4 bg-black rounded-none border-2 border-white outline outline-2 outline-black mb-2 md:mb-0" />

                  <div className="flex items-baseline gap-4 mb-4">
                    <h3 className="text-2xl font-black uppercase">{formatDisplayDate(day)}</h3>
                    <span className="font-mono text-sm font-bold bg-gray-100 px-2 py-1 border border-black">{group.totalHours.toFixed(2)}h</span>
                  </div>

                  <div className="grid gap-4">
                    {group.items.map((entry) => (
                      <div key={entry.id} className="group bg-white border-2 border-black p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {entry.tag && (
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5">
                                {entry.tag}
                              </span>
                            )}
                            <span className="text-xs font-mono text-gray-500">{entry.hours} hrs</span>
                          </div>
                          <p className="font-medium text-lg leading-snug">{entry.description || <span className="text-gray-400 italic">No description</span>}</p>
                        </div>

                        {canEdit && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteEntry(entry.id)}
                            disabled={isDeletingEntry}
                            className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default Stats;

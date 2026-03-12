import { Component, FormEvent, ReactNode, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ExternalLink, Link2, MapPin, MoonStar, Plus, TentTree } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  accommodationBlocks,
  cityOptions,
  dayOptions,
  ideaCategoryOptions,
  tripDays,
  type TripDay,
  type TripDayFormValues,
  type TripDayOverride,
  type TripIdea,
  type TripIdeaFormValues,
} from "@/data/japan2026";

const ACCENT = "#ff6f61";
const SECONDARY = "#f4d35e";
const SURFACE = "#fff7ed";
const SURFACE_ALT = "#d7f9f1";
const DAY_OVERRIDES_QUERY = "japan2026:listDayOverrides" as never;
const TRIP_QUERY = "japan2026:listIdeas" as never;
const ADD_IDEA_MUTATION = "japan2026:addIdea" as never;
const UPDATE_IDEA_MUTATION = "japan2026:updateIdea" as never;
const UPDATE_DAY_OVERRIDE_MUTATION = "japan2026:updateDayOverride" as never;

const emptyIdeaForm: TripIdeaFormValues = {
  title: "",
  url: "",
  imageUrl: "",
  description: "",
  city: "Tokyo",
  day: "",
  category: "food",
};

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }

  return "Something went wrong";
};

const formatTimestamp = (timestamp: number) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);

const isDirectImageUrl = (value: string | undefined) =>
  Boolean(value && /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(new URL(value).pathname));

const joinLines = (values: string[] | undefined) => (values ?? []).join("\n");

const splitLines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

class IdeasErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  state = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to load shared ideas.";
    return { hasError: true, message };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="border-4 border-black bg-white p-6 dark:border-white dark:bg-zinc-900">
        <p className="font-black uppercase tracking-[0.2em]">Ideas unavailable</p>
        <p className="mt-3 font-mono text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          The trip plan still works, but the shared idea board is not available on the active Convex
          deployment yet. Run <code>npx convex dev</code> or <code>npx convex deploy</code> after
          adding new backend functions.
        </p>
        <p className="mt-3 break-words font-mono text-xs text-zinc-500 dark:text-zinc-400">
          {this.state.message}
        </p>
      </div>
    );
  }
}

export default function Japan2026() {
  const dayOverrides = useQuery(DAY_OVERRIDES_QUERY) as TripDayOverride[] | undefined;
  const ideas = useQuery(TRIP_QUERY) as TripIdea[] | undefined;
  const addIdea = useMutation(ADD_IDEA_MUTATION) as unknown as (
    values: Partial<TripIdeaFormValues>,
  ) => Promise<string>;
  const updateIdea = useMutation(UPDATE_IDEA_MUTATION) as unknown as (values: {
    ideaId: string;
    title: string;
    url?: string;
    imageUrl?: string;
    description?: string;
    city?: string;
    day?: string;
    category?: string;
  }) => Promise<void>;
  const updateDayOverride = useMutation(UPDATE_DAY_OVERRIDE_MUTATION) as unknown as (values: {
    dayId: string;
    city?: string;
    mainPlan?: string;
    otherPlans: string[];
    foodIdeas: string[];
    notes: string[];
  }) => Promise<string>;

  const [formValues, setFormValues] = useState<TripIdeaFormValues>(emptyIdeaForm);
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dayFilter, setDayFilter] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddIdeaOpen, setIsAddIdeaOpen] = useState(false);
  const [isDayEditorOpen, setIsDayEditorOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [dayFormValues, setDayFormValues] = useState<TripDayFormValues>({
    city: "",
    mainPlan: "",
    otherPlans: "",
    foodIdeas: "",
    notes: "",
  });
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
  const [ideaDrafts, setIdeaDrafts] = useState<Record<string, TripIdeaFormValues>>({});
  const [savingIdeaId, setSavingIdeaId] = useState<string | null>(null);
  const [isSavingDay, setIsSavingDay] = useState(false);

  const mergedTripDays = useMemo(() => {
    const overridesByDayId = new Map((dayOverrides ?? []).map((item) => [item.dayId, item]));
    return tripDays.map((day) => {
      const override = overridesByDayId.get(day.id);
      if (!override) return day;

      return {
        ...day,
        city: override.city ?? day.city,
        mainPlan: override.mainPlan ?? day.mainPlan,
        otherPlans: override.otherPlans.length > 0 ? override.otherPlans : day.otherPlans,
        foodIdeas: override.foodIdeas.length > 0 ? override.foodIdeas : day.foodIdeas,
        notes: override.notes.length > 0 ? override.notes : day.notes,
      };
    });
  }, [dayOverrides]);

  const filteredIdeas = useMemo(() => {
    if (!ideas) return [];

    return ideas.filter((idea) => {
      if (cityFilter !== "all" && (idea.city ?? "") !== cityFilter) return false;
      if (categoryFilter !== "all" && (idea.category ?? "") !== categoryFilter) return false;
      if (dayFilter !== "all" && (idea.day ?? "") !== dayFilter) return false;
      return true;
    });
  }, [ideas, cityFilter, categoryFilter, dayFilter]);

  const ideasByDay = useMemo(() => {
    const grouped = new Map<string, TripIdea[]>();

    for (const idea of ideas ?? []) {
      if (!idea.day) continue;
      const existing = grouped.get(idea.day) ?? [];
      existing.push(idea);
      grouped.set(idea.day, existing);
    }

    return grouped;
  }, [ideas]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await addIdea({
        title: formValues.title,
        url: formValues.url || undefined,
        imageUrl: formValues.imageUrl || undefined,
        description: formValues.description || undefined,
        city: formValues.city || undefined,
        day: formValues.day || undefined,
        category: formValues.category || undefined,
      });
      setFormValues(emptyIdeaForm);
      setIsAddIdeaOpen(false);
      toast.success("Idea added");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditingIdea = (idea: TripIdea) => {
    setEditingIdeaId(idea._id);
    setIdeaDrafts((current) => ({
      ...current,
      [idea._id]: {
        title: idea.title,
        url: idea.url ?? "",
        imageUrl: idea.imageUrl ?? "",
        description: idea.description ?? "",
        city: idea.city ?? "Tokyo",
        day: idea.day ?? "",
        category: idea.category ?? "food",
      },
    }));
  };

  const handleSaveIdea = async (ideaId: string) => {
    const draft = ideaDrafts[ideaId];
    if (!draft) return;

    setSavingIdeaId(ideaId);

    try {
      await updateIdea({
        ideaId,
        title: draft.title,
        url: draft.url || undefined,
        imageUrl: draft.imageUrl || undefined,
        description: draft.description || undefined,
        city: draft.city || undefined,
        day: draft.day || undefined,
        category: draft.category || undefined,
      });
      setEditingIdeaId(null);
      toast.success("Idea updated");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingIdeaId(null);
    }
  };

  const handleOpenDayEditor = (day: TripDay) => {
    setSelectedDayId(day.id);
    setDayFormValues({
      city: day.city,
      mainPlan: day.mainPlan ?? "",
      otherPlans: joinLines(day.otherPlans),
      foodIdeas: joinLines(day.foodIdeas),
      notes: joinLines(day.notes),
    });
    setIsDayEditorOpen(true);
  };

  const handleSaveDay = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDayId) return;

    setIsSavingDay(true);
    try {
      await updateDayOverride({
        dayId: selectedDayId,
        city: dayFormValues.city || undefined,
        mainPlan: dayFormValues.mainPlan || undefined,
        otherPlans: splitLines(dayFormValues.otherPlans),
        foodIdeas: splitLines(dayFormValues.foodIdeas),
        notes: splitLines(dayFormValues.notes),
      });
      setIsDayEditorOpen(false);
      toast.success("Day updated");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSavingDay(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 font-sans text-black dark:text-white">
      <style>{`
        ::selection {
          background-color: ${ACCENT};
          color: white;
        }
      `}</style>

      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(255,111,97,0.20),transparent_30%),radial-gradient(circle_at_top_right,rgba(244,211,94,0.18),transparent_24%),linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,111,97,0.20),transparent_30%),radial-gradient(circle_at_top_right,rgba(244,211,94,0.18),transparent_24%),linear-gradient(#27272a_1px,transparent_1px),linear-gradient(90deg,#27272a_1px,transparent_1px)] bg-[size:auto,auto,26px_26px,26px_26px] pointer-events-none" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-black uppercase tracking-[-0.08em] sm:text-4xl">Japan 2026</h1>
          <Badge className="border-2 border-black bg-black px-3 py-1 text-xs uppercase tracking-[0.24em] text-white">
            Public plan
          </Badge>
          <Badge
            className="border-2 border-black px-3 py-1 text-xs uppercase tracking-[0.24em] text-black"
            style={{ backgroundColor: SURFACE_ALT }}
          >
            Shared ideas
          </Badge>
        </div>

        <Tabs defaultValue="plan" className="flex flex-col gap-4">
          <TabsList className="grid h-auto grid-cols-2 border-4 border-black bg-white p-1 dark:border-white dark:bg-zinc-900">
            <TabsTrigger
              value="plan"
              className="min-h-12 rounded-none border-2 border-transparent font-mono text-sm font-bold uppercase tracking-[0.22em] data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:border-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
            >
              Plan
            </TabsTrigger>
            <TabsTrigger
              value="ideas"
              className="min-h-12 rounded-none border-2 border-transparent font-mono text-sm font-bold uppercase tracking-[0.22em] data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:border-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
            >
              Ideas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="mt-0 space-y-4">
            <Card className="border-4 border-black dark:border-white">
              <CardHeader
                className="border-b-4 border-black pb-4 dark:border-white"
                style={{ backgroundColor: SURFACE }}
              >
                <CardTitle className="text-2xl font-black uppercase tracking-[-0.05em] text-black dark:text-black">
                  Accommodation
                </CardTitle>
                <p className="font-mono text-sm text-zinc-800 dark:text-zinc-900">
                  Tokyo from May 1-7, Osaka from May 8-13, and May 14 is still undecided.
                </p>
              </CardHeader>
              <CardContent className="grid gap-4 p-4 sm:p-6 lg:grid-cols-3">
                {accommodationBlocks.map((block) => (
                  <div
                    key={`${block.city}-${block.start}`}
                    className="border-4 border-black bg-white p-4 dark:border-white dark:bg-zinc-900"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-lg font-black uppercase">{block.city}</p>
                      <Badge className="border-2 border-black bg-black px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white">
                        {block.start} - {block.end}
                      </Badge>
                    </div>
                    {block.note ? (
                      <p className="mt-3 font-mono text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {block.note}
                      </p>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-4 border-black dark:border-white">
              <CardHeader className="border-b-4 border-black pb-4 dark:border-white">
                <CardTitle className="text-2xl font-black uppercase tracking-[-0.05em]">
                  Daily Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 p-4 sm:p-6 lg:grid-cols-2">
                {mergedTripDays.map((day) => {
                  const assignedIdeas = ideasByDay.get(day.dateLabel) ?? [];

                  return (
                    <article
                      key={day.id}
                      onClick={() => handleOpenDayEditor(day)}
                      className="flex cursor-pointer flex-col gap-4 border-4 border-black bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-white dark:bg-zinc-900 dark:hover:bg-zinc-800"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
                            {day.dayOfWeek}
                          </p>
                          <h2 className="text-2xl font-black uppercase tracking-[-0.06em]">
                            {day.dateLabel}
                          </h2>
                        </div>
                        <Badge
                          className="border-2 border-black px-3 py-1 text-xs uppercase tracking-[0.2em] text-black"
                          style={{ backgroundColor: day.city === "Open" ? SECONDARY : SURFACE_ALT }}
                        >
                          {day.city}
                        </Badge>
                      </div>

                      <div className="grid gap-3">
                        <section className="border-2 border-black p-3 dark:border-white">
                          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                            Main Plan
                          </p>
                          <p className="mt-2 text-base font-semibold">
                            {day.mainPlan ?? "Open day"}
                          </p>
                        </section>

                        {day.otherPlans?.length ? (
                          <section className="border-2 border-black p-3 dark:border-white">
                            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                              Other Plans
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {day.otherPlans.map((plan) => (
                                <Badge
                                  key={plan}
                                  className="border-2 border-black bg-transparent px-2 py-1 text-xs font-bold uppercase tracking-[0.16em] text-black dark:border-white dark:text-white"
                                >
                                  {plan}
                                </Badge>
                              ))}
                            </div>
                          </section>
                        ) : null}

                        {assignedIdeas.length > 0 ? (
                          <section className="border-2 border-black p-3 dark:border-white">
                            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                              Assigned Ideas
                            </p>
                            <div className="mt-3 grid gap-3">
                              {assignedIdeas.map((idea) => (
                                <div
                                  key={idea._id}
                                  className="border-2 border-black bg-zinc-50 p-3 dark:border-white dark:bg-zinc-950"
                                >
                                  <div className="flex flex-wrap gap-2">
                                    <p className="text-base font-black uppercase tracking-[-0.04em]">
                                      {idea.title}
                                    </p>
                                    {idea.category ? (
                                      <Badge
                                        className="border-2 border-black px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-black"
                                        style={{ backgroundColor: SECONDARY }}
                                      >
                                        {idea.category}
                                      </Badge>
                                    ) : null}
                                  </div>
                                  {idea.description ? (
                                    <p className="mt-2 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                                      {idea.description}
                                    </p>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </section>
                        ) : null}

                        <section className="border-2 border-black p-3 dark:border-white">
                          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                            Food Ideas
                          </p>
                          {day.foodIdeas?.length ? (
                            <ul className="mt-2 space-y-1 font-mono text-sm">
                              {day.foodIdeas.map((idea) => (
                                <li key={idea}>{idea}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-2 font-mono text-sm text-zinc-500 dark:text-zinc-400">
                              Click this day card to add food ideas.
                            </p>
                          )}
                        </section>

                        <section className="border-2 border-black p-3 dark:border-white">
                          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                            Notes
                          </p>
                          {day.notes?.length ? (
                            <ul className="mt-2 space-y-2 font-mono text-sm leading-relaxed">
                              {day.notes.map((note) => (
                                <li key={note}>{note}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-2 font-mono text-sm text-zinc-500 dark:text-zinc-400">
                              No locked note yet.
                            </p>
                          )}
                        </section>
                      </div>
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                        Click card to edit day
                      </p>
                    </article>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ideas" className="mt-0 space-y-4">
            <IdeasErrorBoundary>
              <Card className="border-4 border-black dark:border-white">
                <CardHeader
                  className="border-b-4 border-black pb-4 dark:border-white"
                  style={{ backgroundColor: SURFACE }}
                >
                  <CardTitle className="text-2xl font-black uppercase tracking-[-0.05em] text-black dark:text-black">
                    Shared Idea Board
                  </CardTitle>
                  <p className="font-mono text-sm text-zinc-900">
                    Anyone can add ideas here. Use links, notes, and tags so the list stays useful on
                    mobile.
                  </p>
                </CardHeader>
                <CardContent
                  className="space-y-4 bg-white p-4 text-black dark:bg-zinc-950 dark:text-white sm:p-6"
                >
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <Dialog open={isAddIdeaOpen} onOpenChange={setIsAddIdeaOpen}>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            className="min-h-12 rounded-none border-2 border-black bg-black font-mono text-sm font-bold uppercase tracking-[0.2em] text-white hover:bg-zinc-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add idea
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-none border-4 border-black bg-white p-0 dark:border-white dark:bg-zinc-950">
                          <DialogHeader
                            className="border-b-4 border-black p-6 dark:border-white"
                            style={{ backgroundColor: SURFACE }}
                          >
                            <DialogTitle className="text-2xl font-black uppercase tracking-[-0.05em] text-black">
                              Add Idea
                            </DialogTitle>
                            <DialogDescription className="font-mono text-sm text-zinc-900">
                              Add a link, note, city, category, and optional day without crowding the board.
                            </DialogDescription>
                          </DialogHeader>

                          <form className="space-y-3 p-6" onSubmit={handleSubmit}>
                            <Input
                              value={formValues.title}
                              onChange={(event) =>
                                setFormValues((current) => ({ ...current, title: event.target.value }))
                              }
                              placeholder="Idea title"
                              className="min-h-12 rounded-none border-2 border-black bg-white font-mono text-base placeholder:text-zinc-500 dark:border-white dark:bg-zinc-950 dark:placeholder:text-zinc-400"
                            />
                            <Input
                              value={formValues.url}
                              onChange={(event) =>
                                setFormValues((current) => ({ ...current, url: event.target.value }))
                              }
                              placeholder="https://..."
                              className="min-h-12 rounded-none border-2 border-black bg-white font-mono text-base placeholder:text-zinc-500 dark:border-white dark:bg-zinc-950 dark:placeholder:text-zinc-400"
                            />
                            <Input
                              value={formValues.imageUrl}
                              onChange={(event) =>
                                setFormValues((current) => ({ ...current, imageUrl: event.target.value }))
                              }
                              placeholder="Image URL (optional)"
                              className="min-h-12 rounded-none border-2 border-black bg-white font-mono text-base placeholder:text-zinc-500 dark:border-white dark:bg-zinc-950 dark:placeholder:text-zinc-400"
                            />
                            <Textarea
                              value={formValues.description}
                              onChange={(event) =>
                                setFormValues((current) => ({
                                  ...current,
                                  description: event.target.value,
                                }))
                              }
                              placeholder="Why it is worth adding"
                              className="min-h-28 rounded-none border-2 border-black bg-white font-mono text-base placeholder:text-zinc-500 dark:border-white dark:bg-zinc-950 dark:placeholder:text-zinc-400"
                            />

                            <div className="grid gap-3 sm:grid-cols-2">
                              <Select
                                value={formValues.city}
                                onValueChange={(value) =>
                                  setFormValues((current) => ({ ...current, city: value }))
                                }
                              >
                                <SelectTrigger className="min-h-12 rounded-none border-2 border-black bg-white font-mono dark:border-white dark:bg-zinc-950">
                                  <SelectValue placeholder="City" />
                                </SelectTrigger>
                                <SelectContent>
                                  {cityOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select
                                value={formValues.category}
                                onValueChange={(value) =>
                                  setFormValues((current) => ({ ...current, category: value }))
                                }
                              >
                                <SelectTrigger className="min-h-12 rounded-none border-2 border-black bg-white font-mono dark:border-white dark:bg-zinc-950">
                                  <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ideaCategoryOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <Select
                              value={formValues.day || "none"}
                              onValueChange={(value) =>
                                setFormValues((current) => ({
                                  ...current,
                                  day: value === "none" ? "" : value,
                                }))
                              }
                            >
                              <SelectTrigger className="min-h-12 rounded-none border-2 border-black bg-white font-mono dark:border-white dark:bg-zinc-950">
                                <SelectValue placeholder="Relevant day" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No specific day</SelectItem>
                                {dayOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="min-h-12 w-full rounded-none border-2 border-black bg-black font-mono text-sm font-bold uppercase tracking-[0.2em] text-white hover:bg-zinc-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              {isSubmitting ? "Adding..." : "Add Idea"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <div className="grid gap-3 sm:grid-cols-3 lg:flex-1">
                      <Select value={cityFilter} onValueChange={setCityFilter}>
                        <SelectTrigger className="min-h-12 rounded-none border-2 border-black bg-white font-mono dark:border-white dark:bg-zinc-950">
                          <SelectValue placeholder="Filter city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All cities</SelectItem>
                          {cityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="min-h-12 rounded-none border-2 border-black bg-white font-mono dark:border-white dark:bg-zinc-950">
                          <SelectValue placeholder="Filter category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All categories</SelectItem>
                          {ideaCategoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={dayFilter} onValueChange={setDayFilter}>
                        <SelectTrigger className="min-h-12 rounded-none border-2 border-black bg-white font-mono dark:border-white dark:bg-zinc-950">
                          <SelectValue placeholder="Filter day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All days</SelectItem>
                          {dayOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      </div>
                    </div>

                    {ideas === undefined ? (
                      <div className="border-4 border-dashed border-black bg-zinc-50 p-6 font-mono text-sm dark:border-white dark:bg-zinc-900">
                        Loading ideas...
                      </div>
                    ) : filteredIdeas.length === 0 ? (
                      <div className="border-4 border-dashed border-black bg-zinc-50 p-6 dark:border-white dark:bg-zinc-900">
                        <p className="font-black uppercase tracking-[0.2em]">No ideas yet</p>
                        <p className="mt-2 font-mono text-sm text-zinc-800 dark:text-zinc-300">
                          Start the list with a food stop, a day trip, or a hotel option.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredIdeas.map((idea) => (
                          <article
                            key={idea._id}
                            onClick={() => startEditingIdea(idea)}
                            className="border-4 border-black bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-white dark:bg-zinc-900 dark:hover:bg-zinc-800"
                          >
                            {editingIdeaId === idea._id && ideaDrafts[idea._id] ? (
                              <div
                                className="space-y-3"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <p className="font-black uppercase tracking-[0.18em]">Edit idea</p>
                                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                                    {formatTimestamp(idea.createdAt)}
                                  </p>
                                </div>

                                <Input
                                  value={ideaDrafts[idea._id].title}
                                  onChange={(event) =>
                                    setIdeaDrafts((current) => ({
                                      ...current,
                                      [idea._id]: { ...current[idea._id], title: event.target.value },
                                    }))
                                  }
                                  className="min-h-11 rounded-none border-2 border-black bg-white font-mono dark:border-white dark:bg-zinc-950"
                                />
                                <Input
                                  value={ideaDrafts[idea._id].url}
                                  onChange={(event) =>
                                    setIdeaDrafts((current) => ({
                                      ...current,
                                      [idea._id]: { ...current[idea._id], url: event.target.value },
                                    }))
                                  }
                                  className="min-h-11 rounded-none border-2 border-black bg-white font-mono dark:border-white dark:bg-zinc-950"
                                  placeholder="https://..."
                                />
                                <Input
                                  value={ideaDrafts[idea._id].imageUrl}
                                  onChange={(event) =>
                                    setIdeaDrafts((current) => ({
                                      ...current,
                                      [idea._id]: { ...current[idea._id], imageUrl: event.target.value },
                                    }))
                                  }
                                  className="min-h-11 rounded-none border-2 border-black bg-white font-mono dark:border-white dark:bg-zinc-950"
                                  placeholder="Image URL (optional)"
                                />
                                <Textarea
                                  value={ideaDrafts[idea._id].description}
                                  onChange={(event) =>
                                    setIdeaDrafts((current) => ({
                                      ...current,
                                      [idea._id]: {
                                        ...current[idea._id],
                                        description: event.target.value,
                                      },
                                    }))
                                  }
                                  className="min-h-24 rounded-none border-2 border-black bg-white font-mono dark:border-white dark:bg-zinc-950"
                                  placeholder="Why it is worth adding"
                                />
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <Select
                                    value={ideaDrafts[idea._id].city}
                                    onValueChange={(value) =>
                                      setIdeaDrafts((current) => ({
                                        ...current,
                                        [idea._id]: { ...current[idea._id], city: value },
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="min-h-11 rounded-none border-2 border-black bg-white font-mono dark:border-white dark:bg-zinc-950">
                                      <SelectValue placeholder="City" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {cityOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  <Select
                                    value={ideaDrafts[idea._id].category}
                                    onValueChange={(value) =>
                                      setIdeaDrafts((current) => ({
                                        ...current,
                                        [idea._id]: { ...current[idea._id], category: value },
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="min-h-11 rounded-none border-2 border-black bg-white font-mono dark:border-white dark:bg-zinc-950">
                                      <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {ideaCategoryOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Select
                                  value={ideaDrafts[idea._id].day || "none"}
                                  onValueChange={(value) =>
                                    setIdeaDrafts((current) => ({
                                      ...current,
                                      [idea._id]: {
                                        ...current[idea._id],
                                        day: value === "none" ? "" : value,
                                      },
                                    }))
                                  }
                                >
                                  <SelectTrigger className="min-h-11 rounded-none border-2 border-black bg-white font-mono dark:border-white dark:bg-zinc-950">
                                    <SelectValue placeholder="Assign a day" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">No specific day</SelectItem>
                                    {dayOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <div className="flex flex-wrap gap-3">
                                  <Button
                                    type="button"
                                    onClick={() => handleSaveIdea(idea._id)}
                                    disabled={savingIdeaId === idea._id}
                                    className="min-h-11 rounded-none border-2 border-black bg-black font-mono text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-zinc-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                                  >
                                    {savingIdeaId === idea._id ? "Saving..." : "Save changes"}
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={() => setEditingIdeaId(null)}
                                    className="min-h-11 rounded-none border-2 border-black bg-white font-mono text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white dark:border-white dark:bg-zinc-950 dark:text-white dark:hover:bg-white dark:hover:text-black"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {(idea.imageUrl || isDirectImageUrl(idea.url)) ? (
                                  <img
                                    src={idea.imageUrl ?? idea.url}
                                    alt={idea.title}
                                    className="mb-4 aspect-[16/10] w-full border-2 border-black object-cover dark:border-white"
                                    loading="lazy"
                                  />
                                ) : null}
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="space-y-2">
                                    <h3 className="text-xl font-black uppercase tracking-[-0.05em]">
                                      {idea.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                      {idea.category ? (
                                        <Badge
                                          className="border-2 border-black px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-black"
                                          style={{ backgroundColor: SECONDARY }}
                                        >
                                          <TentTree className="mr-1 h-3 w-3" />
                                          {idea.category}
                                        </Badge>
                                      ) : null}
                                      {idea.city ? (
                                        <Badge
                                          className="border-2 border-black px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-black"
                                          style={{ backgroundColor: SURFACE_ALT }}
                                        >
                                          <MapPin className="mr-1 h-3 w-3" />
                                          {idea.city}
                                        </Badge>
                                      ) : null}
                                      {idea.day ? (
                                        <Badge className="border-2 border-black bg-black px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white">
                                          <MoonStar className="mr-1 h-3 w-3" />
                                          {idea.day}
                                        </Badge>
                                      ) : null}
                                    </div>
                                  </div>

                                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                                    {formatTimestamp(idea.createdAt)}
                                  </p>
                                </div>

                                {idea.description ? (
                                  <p className="mt-3 font-mono text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                                    {idea.description}
                                  </p>
                                ) : null}

                                {idea.url ? (
                                  <a
                                    href={idea.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(event) => event.stopPropagation()}
                                    className="mt-4 flex w-full items-center justify-between gap-3 border-2 border-black bg-transparent px-3 py-3 font-mono text-sm font-bold text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                                  >
                                    <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                      {idea.url}
                                    </span>
                                    <span className="flex shrink-0 items-center gap-1">
                                      <Link2 className="h-4 w-4" />
                                      <ExternalLink className="h-4 w-4" />
                                    </span>
                                  </a>
                                ) : null}

                                <p className="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                                  Click card to edit
                                </p>
                              </>
                            )}
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </IdeasErrorBoundary>
          </TabsContent>
        </Tabs>

        <Dialog open={isDayEditorOpen} onOpenChange={setIsDayEditorOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-none border-4 border-black bg-white p-0 dark:border-white dark:bg-zinc-950">
            <DialogHeader
              className="border-b-4 border-black p-6 dark:border-white"
              style={{ backgroundColor: SURFACE }}
            >
              <DialogTitle className="text-2xl font-black uppercase tracking-[-0.05em] text-black">
                Edit Day
              </DialogTitle>
              <DialogDescription className="font-mono text-sm text-zinc-900">
                Update the city, main plan, and line-by-line lists for other plans, food ideas, and notes.
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-3 p-6" onSubmit={handleSaveDay}>
              <Select
                value={dayFormValues.city}
                onValueChange={(value) => setDayFormValues((current) => ({ ...current, city: value }))}
              >
                <SelectTrigger className="min-h-12 rounded-none border-2 border-black bg-white font-mono dark:border-white dark:bg-zinc-950">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {cityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                value={dayFormValues.mainPlan}
                onChange={(event) =>
                  setDayFormValues((current) => ({ ...current, mainPlan: event.target.value }))
                }
                placeholder="Main plan"
                className="min-h-12 rounded-none border-2 border-black bg-white font-mono dark:border-white dark:bg-zinc-950"
              />

              <Textarea
                value={dayFormValues.otherPlans}
                onChange={(event) =>
                  setDayFormValues((current) => ({ ...current, otherPlans: event.target.value }))
                }
                placeholder="Other plans, one per line"
                className="min-h-28 rounded-none border-2 border-black bg-white font-mono dark:border-white dark:bg-zinc-950"
              />

              <Textarea
                value={dayFormValues.foodIdeas}
                onChange={(event) =>
                  setDayFormValues((current) => ({ ...current, foodIdeas: event.target.value }))
                }
                placeholder="Food ideas, one per line"
                className="min-h-28 rounded-none border-2 border-black bg-white font-mono dark:border-white dark:bg-zinc-950"
              />

              <Textarea
                value={dayFormValues.notes}
                onChange={(event) =>
                  setDayFormValues((current) => ({ ...current, notes: event.target.value }))
                }
                placeholder="Notes, one per line"
                className="min-h-28 rounded-none border-2 border-black bg-white font-mono dark:border-white dark:bg-zinc-950"
              />

              <Button
                type="submit"
                disabled={isSavingDay}
                className="min-h-12 w-full rounded-none border-2 border-black bg-black font-mono text-sm font-bold uppercase tracking-[0.2em] text-white hover:bg-zinc-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                {isSavingDay ? "Saving..." : "Save day"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

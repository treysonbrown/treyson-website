import { DragEvent, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Plus, Users, Columns2, GripVertical } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

type ColumnDoc = {
  _id: string;
  title: string;
  order: number;
};

type TaskDoc = {
  _id: string;
  title: string;
  description?: string;
  dueDate?: number;
  priority?: "low" | "medium" | "high";
  columnId: string;
  order: number;
  assigneeIds: string[];
};

type Member = {
  _id: string;
  username: string;
  name?: string;
  imageUrl?: string;
  role: "owner" | "member";
};

const getErrorMessage = (err: unknown) => {
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return "Something went wrong";
};

const formatDueDateInput = (dueDate?: number) => {
  if (!dueDate) return "";
  const date = new Date(dueDate);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
};

const formatDueDateLabel = (dueDate?: number) => {
  if (!dueDate) return null;
  return new Date(dueDate).toLocaleDateString();
};

const ACCENT_PRIMARY_BUTTON_CLASS =
  "bg-[#ff5cab] text-black hover:bg-[#ff78ba] dark:bg-[#ff5cab] dark:text-black dark:hover:bg-[#ff78ba] shadow-[3px_3px_0px_0px_rgba(255,92,171,0.35)]";
const ACCENT_UTILITY_BUTTON_CLASS =
  "bg-background dark:bg-zinc-950 text-black dark:text-white hover:border-[#ff5cab] hover:text-[#ff9fd0] hover:bg-[#ff5cab]/10";

export default function ProjectBoard({
  projectId,
  showProjectActions = true,
}: {
  projectId: string;
  showProjectActions?: boolean;
}) {
  const board = useQuery("planner:getBoard" as never, { projectId } as never) as
    | undefined
    | null
    | {
        project: { _id: string; name: string };
        columns: ColumnDoc[];
        tasks: TaskDoc[];
        members: Member[];
      };

  const createColumn = useMutation("planner:createColumn" as never) as unknown as (args: {
    projectId: string;
    title: string;
  }) => Promise<string>;

  const createTask = useMutation("planner:createTask" as never) as unknown as (args: {
    projectId: string;
    columnId: string;
    title: string;
  }) => Promise<string>;
  const reorderColumns = useMutation("planner:reorderColumns" as never) as unknown as (args: {
    projectId: string;
    orderedColumnIds: string[];
  }) => Promise<void>;

  const moveTaskToColumn = useMutation("planner:moveTaskToColumn" as never) as unknown as (args: {
    taskId: string;
    toColumnId: string;
  }) => Promise<void>;

  const setTaskAssignees = useMutation("planner:setTaskAssignees" as never) as unknown as (args: {
    taskId: string;
    assigneeIds: string[];
  }) => Promise<void>;

  const inviteByUsername = useMutation("planner:inviteByUsername" as never) as unknown as (args: {
    projectId: string;
    username: string;
  }) => Promise<string>;

  const updateTask = useMutation("planner:updateTask" as never) as unknown as (args: {
    taskId: string;
    title?: string;
    description?: string;
    dueDate?: number | null;
    priority?: "low" | "medium" | "high";
  }) => Promise<void>;

  const deleteTask = useMutation("planner:deleteTask" as never) as unknown as (args: {
    taskId: string;
  }) => Promise<void>;

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskColumnId, setNewTaskColumnId] = useState<string | null>(null);
  const [inviteUsername, setInviteUsername] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [editingPriority, setEditingPriority] = useState<"low" | "medium" | "high">("medium");
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const membersById = useMemo(() => {
    const map = new Map<string, Member>();
    if (!board?.members) return map;
    for (const m of board.members) map.set(m._id, m);
    return map;
  }, [board?.members]);

  const tasksByColumnId = useMemo(() => {
    const by = new Map<string, TaskDoc[]>();
    if (!board?.tasks) return by;
    for (const t of board.tasks) {
      const list = by.get(t.columnId) ?? [];
      list.push(t);
      by.set(t.columnId, list);
    }
    for (const [key, list] of by) {
      list.sort((a, b) => a.order - b.order);
      by.set(key, list);
    }
    return by;
  }, [board?.tasks]);

  const handleCreateColumn = async () => {
    const title = newColumnTitle.trim();
    if (!title) {
      toast.error("Column title is required");
      return;
    }
    try {
      await createColumn({ projectId, title });
      setNewColumnTitle("");
      toast.success("Column created");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCreateTask = async (columnId: string, titleInput?: string) => {
    const title = (titleInput ?? newTaskTitle).trim();
    if (!title) return;
    try {
      await createTask({ projectId, columnId, title });
      setNewTaskTitle("");
      setNewTaskColumnId(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDropOnColumn = async (event: DragEvent, toColumnId: string) => {
    event.preventDefault();
    const draggedColumnId = event.dataTransfer.getData("application/x-column-id");
    if (draggedColumnId) {
      if (draggedColumnId === toColumnId) {
        setDraggingColumnId(null);
        return;
      }
      try {
        const nextOrder = [...board.columns];
        const fromIndex = nextOrder.findIndex((c) => c._id === draggedColumnId);
        const toIndex = nextOrder.findIndex((c) => c._id === toColumnId);
        if (fromIndex < 0 || toIndex < 0) return;
        const [moved] = nextOrder.splice(fromIndex, 1);
        nextOrder.splice(toIndex, 0, moved);
        await reorderColumns({
          projectId,
          orderedColumnIds: nextOrder.map((c) => c._id),
        });
      } catch (err: unknown) {
        toast.error(getErrorMessage(err));
      } finally {
        setDraggingColumnId(null);
      }
      return;
    }

    const taskId = event.dataTransfer.getData("text/plain");
    if (!taskId) return;

    const task = board?.tasks?.find((t) => t._id === taskId);
    if (!task) return;
    if (task.columnId === toColumnId) return;

    try {
      await moveTaskToColumn({ taskId, toColumnId });
      toast.success("Task moved");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleAssignee = async (task: TaskDoc, userId: string) => {
    const current = new Set(task.assigneeIds ?? []);
    if (current.has(userId)) current.delete(userId);
    else current.add(userId);
    try {
      await setTaskAssignees({ taskId: task._id, assigneeIds: Array.from(current) });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleInvite = async () => {
    const username = inviteUsername.trim();
    if (!username) {
      toast.error("Username is required");
      return;
    }
    try {
      await inviteByUsername({ projectId, username });
      setInviteUsername("");
      toast.success(`Invited @${username}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const editingTask = useMemo(
    () => board?.tasks?.find((task) => task._id === editingTaskId) ?? null,
    [board?.tasks, editingTaskId],
  );

  const openTaskEditor = (task: TaskDoc) => {
    setEditingTaskId(task._id);
    setEditingTitle(task.title);
    setEditingDescription(task.description ?? "");
    setEditingDueDate(formatDueDateInput(task.dueDate));
    setEditingPriority(task.priority ?? "medium");
  };

  const closeTaskEditor = () => {
    setEditingTaskId(null);
  };

  const handleSaveTaskDetails = async () => {
    if (!editingTask) return;
    const title = editingTitle.trim();
    if (!title) {
      toast.error("Task title is required");
      return;
    }

    const normalizedDescription = editingDescription.trim();
    const dueDateTimestamp = editingDueDate
      ? new Date(`${editingDueDate}T12:00:00`).getTime()
      : null;

    try {
      await updateTask({
        taskId: editingTask._id,
        title,
        description: normalizedDescription || "",
        dueDate: dueDateTimestamp,
        priority: editingPriority,
      });
      toast.success("Task updated");
      closeTaskEditor();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteTask = async () => {
    if (!editingTask) return;
    try {
      await deleteTask({ taskId: editingTask._id });
      toast.success("Task deleted");
      closeTaskEditor();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const openCreateTaskModal = (columnId: string) => {
    setNewTaskColumnId(columnId);
    setNewTaskTitle("");
  };

  if (board === undefined) {
    return (
      <div className="border-4 border-black dark:border-white bg-card dark:bg-zinc-900 p-6 font-mono text-sm text-gray-600 dark:text-gray-300">
        Loading board...
      </div>
    );
  }

  if (board === null) {
    return (
      <div className="border-4 border-black dark:border-white bg-card dark:bg-zinc-900 p-6 font-mono text-sm text-gray-600 dark:text-gray-300">
        Initializing your account... try refreshing if this sticks.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="border-4 border-black dark:border-white bg-card dark:bg-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <div className="border-b-4 border-black dark:border-white bg-background dark:bg-zinc-950 p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Project
            </p>
            <h2 className="mt-1 text-3xl font-black uppercase tracking-tighter truncate dark:text-white">
              {board.project.name}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <div className="flex flex-wrap gap-1">
                {board.members.slice(0, 6).map((m) => (
                  <Badge
                    key={m._id}
                    variant="outline"
                    className="rounded-none border-2 border-black dark:border-white font-mono text-[10px] uppercase tracking-widest"
                  >
                    @{m.username}
                  </Badge>
                ))}
                {board.members.length > 6 ? (
                  <Badge
                    variant="outline"
                    className="rounded-none border-2 border-black dark:border-white font-mono text-[10px] uppercase tracking-widest"
                  >
                    +{board.members.length - 6}
                  </Badge>
                ) : null}
              </div>
            </div>

            {showProjectActions ? (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      className={`rounded-none border-2 border-black dark:border-white font-mono font-bold uppercase tracking-wider ${ACCENT_UTILITY_BUTTON_CLASS}`}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Invite
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-none border-2 border-black dark:border-white">
                    <DialogHeader>
                      <DialogTitle className="font-black uppercase tracking-tight">Invite by username</DialogTitle>
                      <DialogDescription className="font-mono">
                        They must have signed in at least once to claim a username.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Input
                        value={inviteUsername}
                        onChange={(e) => setInviteUsername(e.target.value)}
                        placeholder="username"
                        className="rounded-none border-2 border-black dark:border-white font-mono"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleInvite();
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleInvite}
                        className={`w-full rounded-none border-2 border-black dark:border-white font-mono font-bold uppercase tracking-wider ${ACCENT_PRIMARY_BUTTON_CLASS}`}
                      >
                        Send Invite
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      className={`rounded-none border-2 border-black dark:border-white font-mono font-bold uppercase tracking-wider ${ACCENT_UTILITY_BUTTON_CLASS}`}
                    >
                      <Columns2 className="mr-2 h-4 w-4" />
                      Column
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-none border-2 border-black dark:border-white">
                    <DialogHeader>
                      <DialogTitle className="font-black uppercase tracking-tight">Create column</DialogTitle>
                      <DialogDescription className="font-mono">Add a new section to the board.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Input
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        placeholder='e.g. "In Progress"'
                        className="rounded-none border-2 border-black dark:border-white font-mono"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateColumn();
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleCreateColumn}
                        className={`w-full rounded-none border-2 border-black dark:border-white font-mono font-bold uppercase tracking-wider ${ACCENT_PRIMARY_BUTTON_CLASS}`}
                      >
                        Create
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : null}
          </div>
        </div>

        <div className="p-4 font-mono text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
          <GripVertical className="h-4 w-4" />
          Drag tasks between columns.
        </div>
      </header>

      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-2">
          {board.columns.map((col) => {
            const tasks = tasksByColumnId.get(col._id) ?? [];
            return (
              <div
                key={col._id}
                ref={(el) => {
                  columnRefs.current[col._id] = el;
                }}
                className={`w-[320px] shrink-0 border-4 border-black dark:border-white bg-card dark:bg-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-opacity ${
                  draggingColumnId === col._id ? "ring-2 ring-[#ff5cab] opacity-60" : ""
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnColumn(e, col._id)}
              >
                <div className="border-b-4 border-black dark:border-white bg-background dark:bg-zinc-950 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("application/x-column-id", col._id);
                          e.dataTransfer.effectAllowed = "move";
                          const columnEl = columnRefs.current[col._id];
                          if (columnEl) {
                            e.dataTransfer.setDragImage(columnEl, 24, 24);
                          }
                          setDraggingColumnId(col._id);
                        }}
                        onDragEnd={() => setDraggingColumnId(null)}
                        className="shrink-0 border-2 border-black dark:border-white bg-card dark:bg-zinc-900 p-1 cursor-grab active:cursor-grabbing"
                        title="Drag to reorder column"
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <h3 className="font-black uppercase tracking-tight dark:text-white truncate">
                        {col.title}
                      </h3>
                    </div>
                    <Badge
                      variant="outline"
                      className="rounded-none border-2 border-black dark:border-white font-mono text-[10px] uppercase tracking-widest"
                    >
                      {tasks.length}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {tasks.map((task) => {
                    const assignees = (task.assigneeIds ?? [])
                      .map((id) => membersById.get(id))
                      .filter(Boolean) as Member[];

                    return (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", task._id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        className="border-2 border-black dark:border-white bg-background dark:bg-zinc-950 p-3 cursor-grab active:cursor-grabbing"
                        title="Drag to move"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-black dark:text-white leading-tight">{task.title}</p>
                          <div className="flex items-start gap-2">
                            <button
                              type="button"
                              className="shrink-0 border-2 border-black dark:border-white bg-card dark:bg-zinc-900 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest"
                              onClick={() => openTaskEditor(task)}
                            >
                              Details
                            </button>
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="shrink-0 border-2 border-black dark:border-white bg-card dark:bg-zinc-900 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest"
                                >
                                  Assign
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                align="end"
                                className="w-64 rounded-none border-2 border-black dark:border-white bg-white dark:bg-zinc-900"
                              >
                                <div className="space-y-2">
                                  <p className="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                    Assignees
                                  </p>
                                  <div className="grid gap-2">
                                    {board.members.map((m) => {
                                      const checked = (task.assigneeIds ?? []).includes(m._id);
                                      return (
                                        <label
                                          key={m._id}
                                          className="flex items-center gap-2 border-2 border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-2 cursor-pointer"
                                        >
                                          <Checkbox
                                            checked={checked}
                                            onCheckedChange={() => toggleAssignee(task, m._id)}
                                          />
                                          <span className="font-mono text-xs">@{m.username}</span>
                                          <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                            {m.role}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1">
                          <Badge
                            variant="outline"
                            className="rounded-none border-2 border-black dark:border-white font-mono text-[10px] uppercase tracking-widest"
                          >
                            {task.priority ?? "medium"} priority
                          </Badge>
                          {task.dueDate ? (
                            <Badge
                              variant="outline"
                              className="rounded-none border-2 border-black dark:border-white font-mono text-[10px] uppercase tracking-widest"
                            >
                              Due {formatDueDateLabel(task.dueDate)}
                            </Badge>
                          ) : null}
                        </div>

                        {assignees.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {assignees.map((m) => (
                              <Badge
                                key={m._id}
                                variant="outline"
                                className="rounded-none border-2 border-black dark:border-white font-mono text-[10px] uppercase tracking-widest"
                              >
                                @{m.username}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                            Unassigned
                          </p>
                        )}
                      </div>
                    );
                  })}

                  <div className="pt-1">
                    <Button
                      type="button"
                      onClick={() => openCreateTaskModal(col._id)}
                      className={`w-full rounded-none border-2 border-black dark:border-white font-mono font-bold uppercase tracking-wider ${ACCENT_PRIMARY_BUTTON_CLASS}`}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Task
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog
        open={Boolean(newTaskColumnId)}
        onOpenChange={(open) => {
          if (!open) {
            setNewTaskColumnId(null);
            setNewTaskTitle("");
          }
        }}
      >
        <DialogContent className="rounded-none border-2 border-black dark:border-white bg-white dark:bg-zinc-900">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">Create task</DialogTitle>
            <DialogDescription className="font-mono">
              Enter a task title for this column.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task name"
              className="rounded-none border-2 border-black dark:border-white bg-white dark:bg-zinc-950 font-mono"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTaskColumnId) {
                  handleCreateTask(newTaskColumnId, newTaskTitle);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => {
                if (newTaskColumnId) handleCreateTask(newTaskColumnId, newTaskTitle);
              }}
              className={`w-full rounded-none border-2 border-black dark:border-white font-mono font-bold uppercase tracking-wider ${ACCENT_PRIMARY_BUTTON_CLASS}`}
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingTask)} onOpenChange={(open) => !open && closeTaskEditor()}>
        <DialogContent className="rounded-none border-2 border-black dark:border-white bg-white dark:bg-zinc-900">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">Task details</DialogTitle>
            <DialogDescription className="font-mono">
              Edit title, notes, due date, and priority.
            </DialogDescription>
          </DialogHeader>
          {editingTask ? (
            <div className="space-y-3">
              <Input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                placeholder="Task title"
                className="rounded-none border-2 border-black dark:border-white bg-white dark:bg-zinc-950 font-mono"
              />
              <Textarea
                value={editingDescription}
                onChange={(e) => setEditingDescription(e.target.value)}
                placeholder="Description / notes"
                className="rounded-none border-2 border-black dark:border-white bg-white dark:bg-zinc-950 font-mono min-h-24"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  type="date"
                  value={editingDueDate}
                  onChange={(e) => setEditingDueDate(e.target.value)}
                  className="rounded-none border-2 border-black dark:border-white bg-white dark:bg-zinc-950 font-mono"
                />
                <select
                  value={editingPriority}
                  onChange={(e) => setEditingPriority(e.target.value as "low" | "medium" | "high")}
                  className="h-10 rounded-none border-2 border-black dark:border-white bg-white dark:bg-zinc-950 px-3 font-mono text-sm"
                >
                  <option value="low">low priority</option>
                  <option value="medium">medium priority</option>
                  <option value="high">high priority</option>
                </select>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <Button
                  type="button"
                  onClick={handleSaveTaskDetails}
                  className={`rounded-none border-2 border-black dark:border-white font-mono font-bold uppercase tracking-wider ${ACCENT_PRIMARY_BUTTON_CLASS}`}
                >
                  Save Task
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDeleteTask}
                  className="rounded-none border-2 border-black dark:border-white bg-white dark:bg-zinc-950 hover:bg-red-50 dark:hover:bg-red-950/30 font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400"
                >
                  Delete Task
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

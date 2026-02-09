import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

const ORDER_STEP = 1000;

type Ctx = Pick<QueryCtx, "auth" | "db"> | Pick<MutationCtx, "auth" | "db">;
type Db = QueryCtx["db"] | MutationCtx["db"];
type Identity = NonNullable<Awaited<ReturnType<QueryCtx["auth"]["getUserIdentity"]>>>;

async function requireIdentity(ctx: { auth: QueryCtx["auth"] }): Promise<Identity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

async function requireMeUserId({ auth, db }: Ctx): Promise<Id<"users">> {
  const identity = await requireIdentity({ auth });
  const me = await db
    .query("users")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .unique();
  if (!me) {
    throw new Error("User record missing. Call users.upsertMe first.");
  }
  return me._id;
}

async function getMeUserIdOptional({ auth, db }: Ctx): Promise<Id<"users"> | null> {
  const identity = await auth.getUserIdentity();
  if (!identity) return null;
  const me = await db
    .query("users")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .unique();
  return me?._id ?? null;
}

async function requireProjectMembership(
  db: Db,
  projectId: Id<"projects">,
  userId: Id<"users">,
): Promise<{ role: "owner" | "member" }> {
  const membership = await db
    .query("projectMembers")
    .withIndex("by_projectId_userId", (q) => q.eq("projectId", projectId).eq("userId", userId))
    .unique();
  if (!membership) throw new Error("Not authorized");
  return { role: membership.role };
}

async function getNextOrderForColumn(db: Db, columnId: Id<"columns">): Promise<number> {
  const last = await db
    .query("tasks")
    .withIndex("by_columnId_order", (q) => q.eq("columnId", columnId))
    .order("desc")
    .first();
  return (last?.order ?? 0) + ORDER_STEP;
}

export const listProjects = query(async (ctx) => {
  const userId = await getMeUserIdOptional(ctx);
  if (!userId) return [];
  const memberships = await ctx.db
    .query("projectMembers")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  const projects = await Promise.all(
    memberships.map(async (m) => {
      const project = await ctx.db.get(m.projectId);
      if (!project) return null;
      return {
        ...project,
        role: m.role,
      };
    }),
  );

  return projects.filter(Boolean);
});

export const createProject = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await requireMeUserId(ctx);
    const now = Date.now();

    const projectId = await ctx.db.insert("projects", {
      name: name.trim() || "Untitled Project",
      ownerUserId: userId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("projectMembers", {
      projectId,
      userId,
      role: "owner",
      createdAt: now,
    });

    await ctx.db.insert("columns", {
      projectId,
      title: "To-do",
      order: ORDER_STEP,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("columns", {
      projectId,
      title: "Done",
      order: ORDER_STEP * 2,
      createdAt: now,
      updatedAt: now,
    });

    return projectId;
  },
});

export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
    confirmName: v.string(),
  },
  handler: async (ctx, { projectId, confirmName }) => {
    const userId = await requireMeUserId(ctx);
    const membership = await requireProjectMembership(ctx.db, projectId, userId);
    if (membership.role !== "owner") {
      throw new Error("Only project owners can delete projects");
    }

    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    if (project.name !== confirmName.trim()) {
      throw new Error("Confirmation name does not match project name");
    }

    const columns = await ctx.db
      .query("columns")
      .withIndex("by_projectId_order", (q) => q.eq("projectId", projectId))
      .collect();
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_projectId_order", (q) => q.eq("projectId", projectId))
      .collect();
    const memberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();

    await Promise.all(tasks.map((task) => ctx.db.delete(task._id)));
    await Promise.all(columns.map((column) => ctx.db.delete(column._id)));
    await Promise.all(memberships.map((m) => ctx.db.delete(m._id)));
    await ctx.db.delete(projectId);
  },
});

export const getBoard = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const userId = await getMeUserIdOptional(ctx);
    if (!userId) return null;
    await requireProjectMembership(ctx.db, projectId, userId);

    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    const columns = await ctx.db
      .query("columns")
      .withIndex("by_projectId_order", (q) => q.eq("projectId", projectId))
      .order("asc")
      .collect();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_projectId_order", (q) => q.eq("projectId", projectId))
      .order("asc")
      .collect();

    const memberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();

    const members = (
      await Promise.all(
        memberships.map(async (m) => {
          const u = await ctx.db.get(m.userId);
          if (!u) return null;
          return {
            _id: u._id,
            username: u.username,
            name: u.name,
            imageUrl: u.imageUrl,
            role: m.role,
          };
        }),
      )
    ).filter((m): m is NonNullable<typeof m> => Boolean(m));

    return { project, columns, tasks, members };
  },
});

export const createColumn = mutation({
  args: { projectId: v.id("projects"), title: v.string() },
  handler: async (ctx, { projectId, title }) => {
    const userId = await requireMeUserId(ctx);
    await requireProjectMembership(ctx.db, projectId, userId);

    const last = await ctx.db
      .query("columns")
      .withIndex("by_projectId_order", (q) => q.eq("projectId", projectId))
      .order("desc")
      .first();

    const now = Date.now();
    return await ctx.db.insert("columns", {
      projectId,
      title: title.trim() || "Untitled",
      order: (last?.order ?? 0) + ORDER_STEP,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const reorderColumns = mutation({
  args: {
    projectId: v.id("projects"),
    orderedColumnIds: v.array(v.id("columns")),
  },
  handler: async (ctx, { projectId, orderedColumnIds }) => {
    const userId = await requireMeUserId(ctx);
    await requireProjectMembership(ctx.db, projectId, userId);

    const existing = await ctx.db
      .query("columns")
      .withIndex("by_projectId_order", (q) => q.eq("projectId", projectId))
      .collect();

    if (existing.length !== orderedColumnIds.length) {
      throw new Error("Invalid column order payload");
    }

    const existingIds = new Set(existing.map((c) => c._id));
    const incomingIds = new Set(orderedColumnIds);
    if (existingIds.size !== incomingIds.size) {
      throw new Error("Invalid column order payload");
    }
    for (const id of existingIds) {
      if (!incomingIds.has(id)) {
        throw new Error("Invalid column order payload");
      }
    }

    const now = Date.now();
    await Promise.all(
      orderedColumnIds.map((columnId, index) =>
        ctx.db.patch(columnId, {
          order: (index + 1) * ORDER_STEP,
          updatedAt: now,
        }),
      ),
    );
  },
});

export const createTask = mutation({
  args: { projectId: v.id("projects"), columnId: v.id("columns"), title: v.string() },
  handler: async (ctx, { projectId, columnId, title }) => {
    const userId = await requireMeUserId(ctx);
    await requireProjectMembership(ctx.db, projectId, userId);

    const column = await ctx.db.get(columnId);
    if (!column || column.projectId !== projectId) {
      throw new Error("Column not found");
    }

    const now = Date.now();
    const order = await getNextOrderForColumn(ctx.db, columnId);
    return await ctx.db.insert("tasks", {
      projectId,
      columnId,
      title: title.trim() || "Untitled task",
      description: undefined,
      dueDate: undefined,
      priority: "medium",
      order,
      assigneeIds: [],
      createdByUserId: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.union(v.number(), v.null())),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  },
  handler: async (ctx, { taskId, title, description, dueDate, priority }) => {
    const userId = await requireMeUserId(ctx);
    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");

    await requireProjectMembership(ctx.db, task.projectId, userId);

    await ctx.db.patch(taskId, {
      title: title === undefined ? task.title : title.trim() || "Untitled task",
      description: description === undefined ? task.description : description,
      dueDate: dueDate === undefined ? task.dueDate : dueDate ?? undefined,
      priority: priority === undefined ? task.priority : priority,
      updatedAt: Date.now(),
    });
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, { taskId }) => {
    const userId = await requireMeUserId(ctx);
    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");

    await requireProjectMembership(ctx.db, task.projectId, userId);
    await ctx.db.delete(taskId);
  },
});

export const moveTaskToColumn = mutation({
  args: {
    taskId: v.id("tasks"),
    toColumnId: v.id("columns"),
  },
  handler: async (ctx, { taskId, toColumnId }) => {
    const userId = await requireMeUserId(ctx);
    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");

    await requireProjectMembership(ctx.db, task.projectId, userId);

    const toColumn = await ctx.db.get(toColumnId);
    if (!toColumn || toColumn.projectId !== task.projectId) {
      throw new Error("Destination column not found");
    }

    const order = await getNextOrderForColumn(ctx.db, toColumnId);
    await ctx.db.patch(taskId, {
      columnId: toColumnId,
      order,
      updatedAt: Date.now(),
    });
  },
});

export const setTaskAssignees = mutation({
  args: {
    taskId: v.id("tasks"),
    assigneeIds: v.array(v.id("users")),
  },
  handler: async (ctx, { taskId, assigneeIds }) => {
    const userId = await requireMeUserId(ctx);
    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");
    await requireProjectMembership(ctx.db, task.projectId, userId);

    // Validate that assignees are members of the project.
    const unique = Array.from(new Set(assigneeIds));
    for (const uid of unique) {
      const m = await ctx.db
        .query("projectMembers")
        .withIndex("by_projectId_userId", (q) => q.eq("projectId", task.projectId).eq("userId", uid))
        .unique();
      if (!m) throw new Error("Assignee is not a project member");
    }

    await ctx.db.patch(taskId, {
      assigneeIds: unique,
      updatedAt: Date.now(),
    });
  },
});

export const inviteByUsername = mutation({
  args: {
    projectId: v.id("projects"),
    username: v.string(),
  },
  handler: async (ctx, { projectId, username }) => {
    const userId = await requireMeUserId(ctx);
    await requireProjectMembership(ctx.db, projectId, userId);

    const normalized = username.toLowerCase().trim();
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", normalized))
      .unique();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("projectMembers")
      .withIndex("by_projectId_userId", (q) => q.eq("projectId", projectId).eq("userId", user._id))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("projectMembers", {
      projectId,
      userId: user._id,
      role: "member",
      createdAt: Date.now(),
    });
  },
});

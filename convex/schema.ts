import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    username: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_username", ["username"]),

  projects: defineTable({
    name: v.string(),
    ownerUserId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_ownerUserId", ["ownerUserId"]),

  projectMembers: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("member")),
    createdAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_userId", ["userId"])
    .index("by_projectId_userId", ["projectId", "userId"]),

  columns: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_projectId_order", ["projectId", "order"]),

  tasks: defineTable({
    projectId: v.id("projects"),
    columnId: v.id("columns"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    order: v.number(),
    assigneeIds: v.array(v.id("users")),
    createdByUserId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_projectId_order", ["projectId", "order"])
    .index("by_columnId_order", ["columnId", "order"]),

  tripIdeas: defineTable({
    tripSlug: v.string(),
    title: v.string(),
    url: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    city: v.optional(v.string()),
    day: v.optional(v.string()),
    category: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_tripSlug_createdAt", ["tripSlug", "createdAt"]),

  tripDayOverrides: defineTable({
    tripSlug: v.string(),
    dayId: v.string(),
    city: v.optional(v.string()),
    mainPlan: v.optional(v.string()),
    otherPlans: v.array(v.string()),
    foodIdeas: v.array(v.string()),
    notes: v.array(v.string()),
    updatedAt: v.number(),
  })
    .index("by_tripSlug_dayId", ["tripSlug", "dayId"])
    .index("by_tripSlug_updatedAt", ["tripSlug", "updatedAt"]),
});

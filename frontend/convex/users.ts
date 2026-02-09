import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const deriveUsername = (identity: {
  name?: string | null;
  email?: string | null;
  nickname?: string | null;
}) => {
  const raw =
    identity.nickname ??
    identity.name ??
    (identity.email ? identity.email.split("@")[0] : null) ??
    "user";
  return raw
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 24);
};

export const me = query(async ({ auth, db }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) return null;

  return await db
    .query("users")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .unique();
});

export const upsertMe = mutation(async ({ auth, db }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const now = Date.now();
  const existing = await db
    .query("users")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .unique();

  const name = identity.name ?? identity.nickname ?? null;
  const imageUrl = (identity as { pictureUrl?: string | null }).pictureUrl ?? null;

  if (existing) {
    await db.patch(existing._id, {
      name: name ?? existing.name,
      imageUrl: imageUrl ?? existing.imageUrl,
      updatedAt: now,
    });
    return existing._id;
  }

  let username = deriveUsername({
    name: identity.name,
    email: identity.email,
    nickname: identity.nickname,
  });

  // Ensure uniqueness. If taken, append a short suffix.
  const base = username || "user";
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}${i}`;
    const taken = await db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", candidate))
      .unique();
    if (!taken) {
      username = candidate;
      break;
    }
  }

  return await db.insert("users", {
    clerkUserId: identity.subject,
    username,
    name: name ?? undefined,
    imageUrl: imageUrl ?? undefined,
    createdAt: now,
    updatedAt: now,
  });
});

export const setUsername = mutation({
  args: { username: v.string() },
  handler: async ({ auth, db }, { username }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const normalized = username
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_-]/g, "")
      .slice(0, 24);

    if (!normalized || normalized.length < 3) {
      throw new Error("Username must be at least 3 characters");
    }

    const meDoc = await db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    if (!meDoc) {
      throw new Error("User record not found. Try refreshing.");
    }

    const taken = await db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", normalized))
      .unique();

    if (taken && taken._id !== meDoc._id) {
      throw new Error("Username is already taken");
    }

    await db.patch(meDoc._id, {
      username: normalized,
      updatedAt: Date.now(),
    });
    return normalized;
  },
});

import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

const TRIP_SLUG = "japan2026";

const MAX_TITLE_LENGTH = 120;
const MAX_URL_LENGTH = 500;
const MAX_IMAGE_URL_LENGTH = 500;
const MAX_DESCRIPTION_LENGTH = 1200;
const MAX_CITY_LENGTH = 80;
const MAX_DAY_LENGTH = 40;
const MAX_CATEGORY_LENGTH = 40;
const MAX_MAIN_PLAN_LENGTH = 160;
const MAX_LIST_ITEM_LENGTH = 180;
const MAX_LIST_ITEMS = 12;

const trimOptional = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const validateLength = (label: string, value: string | undefined, maxLength: number) => {
  if (value && value.length > maxLength) {
    throw new Error(`${label} must be ${maxLength} characters or fewer`);
  }
};

const normalizeStringList = (label: string, values: string[]) => {
  const normalized = values
    .map((value) => value.trim())
    .filter(Boolean);

  if (normalized.length > MAX_LIST_ITEMS) {
    throw new Error(`${label} must contain ${MAX_LIST_ITEMS} items or fewer`);
  }

  normalized.forEach((value) => validateLength(label, value, MAX_LIST_ITEM_LENGTH));
  return normalized;
};

const normalizeUrl = (value: string | undefined) => {
  const trimmed = trimOptional(value);
  if (!trimmed) return undefined;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("Link must be a valid URL");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Link must start with http:// or https://");
  }

  return url.toString();
};

export const listIdeas = query({
  args: {},
  handler: async (ctx) => {
    const ideas = await ctx.db
      .query("tripIdeas")
      .withIndex("by_tripSlug_createdAt", (q) => q.eq("tripSlug", TRIP_SLUG))
      .order("desc")
      .collect();

    return ideas;
  },
});

export const listDayOverrides = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("tripDayOverrides")
      .withIndex("by_tripSlug_updatedAt", (q) => q.eq("tripSlug", TRIP_SLUG))
      .collect();
  },
});

export const addIdea = mutation({
  args: {
    title: v.string(),
    url: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    city: v.optional(v.string()),
    day: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const title = args.title.trim();
    if (!title) {
      throw new Error("Title is required");
    }

    const url = normalizeUrl(args.url);
    const imageUrl = normalizeUrl(args.imageUrl);
    const description = trimOptional(args.description);
    const city = trimOptional(args.city);
    const day = trimOptional(args.day);
    const category = trimOptional(args.category);

    validateLength("Title", title, MAX_TITLE_LENGTH);
    validateLength("Link", url, MAX_URL_LENGTH);
    validateLength("Image URL", imageUrl, MAX_IMAGE_URL_LENGTH);
    validateLength("Description", description, MAX_DESCRIPTION_LENGTH);
    validateLength("City", city, MAX_CITY_LENGTH);
    validateLength("Day", day, MAX_DAY_LENGTH);
    validateLength("Category", category, MAX_CATEGORY_LENGTH);

    return await ctx.db.insert("tripIdeas", {
      tripSlug: TRIP_SLUG,
      title,
      url,
      imageUrl,
      description,
      city,
      day,
      category,
      createdAt: Date.now(),
    });
  },
});

export const updateIdea = mutation({
  args: {
    ideaId: v.id("tripIdeas"),
    title: v.string(),
    url: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    city: v.optional(v.string()),
    day: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { ideaId, title, url, imageUrl, description, city, day, category }) => {
    const idea = await ctx.db.get(ideaId);
    if (!idea || idea.tripSlug !== TRIP_SLUG) {
      throw new Error("Idea not found");
    }

    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      throw new Error("Title is required");
    }

    const normalizedUrl = normalizeUrl(url);
    const normalizedImageUrl = normalizeUrl(imageUrl);
    const normalizedDescription = trimOptional(description);
    const normalizedCity = trimOptional(city);
    const normalizedDay = trimOptional(day);
    const normalizedCategory = trimOptional(category);

    validateLength("Title", normalizedTitle, MAX_TITLE_LENGTH);
    validateLength("Link", normalizedUrl, MAX_URL_LENGTH);
    validateLength("Image URL", normalizedImageUrl, MAX_IMAGE_URL_LENGTH);
    validateLength("Description", normalizedDescription, MAX_DESCRIPTION_LENGTH);
    validateLength("City", normalizedCity, MAX_CITY_LENGTH);
    validateLength("Day", normalizedDay, MAX_DAY_LENGTH);
    validateLength("Category", normalizedCategory, MAX_CATEGORY_LENGTH);

    await ctx.db.patch(ideaId as Id<"tripIdeas">, {
      title: normalizedTitle,
      url: normalizedUrl,
      imageUrl: normalizedImageUrl,
      description: normalizedDescription,
      city: normalizedCity,
      day: normalizedDay,
      category: normalizedCategory,
    });
  },
});

export const updateDayOverride = mutation({
  args: {
    dayId: v.string(),
    city: v.optional(v.string()),
    mainPlan: v.optional(v.string()),
    otherPlans: v.array(v.string()),
    foodIdeas: v.array(v.string()),
    notes: v.array(v.string()),
  },
  handler: async (ctx, { dayId, city, mainPlan, otherPlans, foodIdeas, notes }) => {
    const normalizedDayId = dayId.trim();
    if (!normalizedDayId) {
      throw new Error("Day is required");
    }

    const normalizedCity = trimOptional(city);
    const normalizedMainPlan = trimOptional(mainPlan);
    const normalizedOtherPlans = normalizeStringList("Other plans", otherPlans);
    const normalizedFoodIdeas = normalizeStringList("Food ideas", foodIdeas);
    const normalizedNotes = normalizeStringList("Notes", notes);

    validateLength("City", normalizedCity, MAX_CITY_LENGTH);
    validateLength("Main plan", normalizedMainPlan, MAX_MAIN_PLAN_LENGTH);

    const existing = await ctx.db
      .query("tripDayOverrides")
      .withIndex("by_tripSlug_dayId", (q) => q.eq("tripSlug", TRIP_SLUG).eq("dayId", normalizedDayId))
      .unique();

    const payload = {
      city: normalizedCity,
      mainPlan: normalizedMainPlan,
      otherPlans: normalizedOtherPlans,
      foodIdeas: normalizedFoodIdeas,
      notes: normalizedNotes,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("tripDayOverrides", {
      tripSlug: TRIP_SLUG,
      dayId: normalizedDayId,
      ...payload,
    });
  },
});

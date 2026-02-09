import { queryGeneric } from "convex/server";

const parseCsv = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const isAdmin = queryGeneric(async ({ auth }) => {
  const adminUserIds = parseCsv(process.env.ADMIN_CLERK_USER_IDS);
  if (!adminUserIds.length) return false;

  try {
    const identity = await auth.getUserIdentity();
    if (!identity) return false;
    return adminUserIds.includes(identity.subject);
  } catch (error) {
    console.error("auth:isAdmin failed to resolve user identity", error);
    return false;
  }
});

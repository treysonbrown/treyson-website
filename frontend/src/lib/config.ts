
const apiBaseUrl = (import.meta.env?.VITE_API_BASE_URL as string | undefined)
const githubUsername =
  (import.meta.env?.VITE_GITHUB_USERNAME as string | undefined)
const allowedWorkLogUserId =
  (import.meta.env?.VITE_ALLOWED_WORKLOG_USER_ID as string | undefined)

export const API_BASE_URL = apiBaseUrl.replace(/\/$/, "");
export const GITHUB_USERNAME = githubUsername;
export const ALLOWED_WORKLOG_USER_ID = allowedWorkLogUserId;

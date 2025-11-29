const DEFAULT_GITHUB_USERNAME = "treysonbrown";
const DEFAULT_API_BASE_URL = "http://localhost:8000";
const DEFAULT_ALLOWED_WORKLOG_USER_ID = "5dc7d990-4e98-4e92-9033-316ad9fd9af7";

const apiBaseUrl = (import.meta.env?.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_API_BASE_URL;
const githubUsername =
  (import.meta.env?.VITE_GITHUB_USERNAME as string | undefined) ?? DEFAULT_GITHUB_USERNAME;
const allowedWorkLogUserId =
  (import.meta.env?.VITE_ALLOWED_WORKLOG_USER_ID as string | undefined) ?? DEFAULT_ALLOWED_WORKLOG_USER_ID;

export const API_BASE_URL = apiBaseUrl.replace(/\/$/, "");
export const GITHUB_USERNAME = githubUsername;
export const ALLOWED_WORKLOG_USER_ID = allowedWorkLogUserId;

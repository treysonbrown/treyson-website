const GITHUB_API_BASE = "https://api.github.com";

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
  bio: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
}

export interface GitHubContributionDay {
  color: string;
  contributionCount: number;
  contributionLevel: "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";
  date: string;
}

export interface GitHubContributionsResponse {
  contributions: GitHubContributionDay[][];
  totalContributions: number;
}

async function githubRequest<T>(path: string): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE}${path}`);

  if (!response.ok) {
    const errorMessage = `GitHub request failed: ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export const getGitHubUser = (username: string) => githubRequest<GitHubUser>(`/users/${username}`);

export const getGitHubRepos = (username: string) =>
  githubRequest<GitHubRepo[]>(`/users/${username}/repos?per_page=100&sort=updated`);

export const getGitHubContributions = async (username: string) => {
  const response = await fetch(`https://github-contributions-api.deno.dev/${username}.json`);

  if (!response.ok) {
    throw new Error(`GitHub contributions request failed: ${response.status}`);
  }

  return response.json() as Promise<GitHubContributionsResponse>;
};

export interface GithubCommit {
  commit: {
    author?: { date?: string };
    committer?: { date?: string };
  };
  html_url: string;
}

export async function fetchGithubCommits(params: {
  owner: string;
  repo: string;
  sha?: string;
  since?: string;
  per_page?: number;
}): Promise<GithubCommit[]> {
  const query = new URLSearchParams({
    sha: params.sha || 'main',
    per_page: String(params.per_page || 10),
  });
  if (params.since) {
    query.set('since', params.since);
  }

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'FocusForge-App',
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(params.owner)}/${encodeURIComponent(params.repo)}/commits?${query.toString()}`,
    { headers }
  );

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.statusText}`);
  }

  return (await res.json()) as GithubCommit[];
}

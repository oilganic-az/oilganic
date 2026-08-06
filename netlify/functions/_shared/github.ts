export interface GitHubConfig {
  token: string;
  repo: string;
  branch: string;
}

export function getGitHubConfig(): GitHubConfig {
  const token = process.env.GITHUB_TOKEN || '';
  const repo = process.env.GITHUB_REPOSITORY || 'oilganic-az/oilganic';
  const branch = process.env.ADMIN_CONTENT_BRANCH || 'feature/admin-owned-menu';

  return { token, repo, branch };
}

export function validateBranchSafety(branch: string): void {
  if (!branch || typeof branch !== 'string' || !branch.trim()) {
    throw new Error('Invalid target branch name.');
  }

  if (branch === 'main' && process.env.ALLOW_MAIN_WRITE !== 'true') {
    throw new Error('Direct write to main branch is strictly prohibited.');
  }
}

export interface GitHubFileFetchResult {
  sha: string;
  content: string;
  encoding: string;
}

export async function fetchGitHubFile(
  config: GitHubConfig,
  filePath: string
): Promise<GitHubFileFetchResult> {
  const url = `https://api.github.com/repos/${config.repo}/contents/${filePath}?ref=${encodeURIComponent(config.branch)}`;

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Oilganic-Admin-Content-Writer'
  };

  if (config.token) {
    headers['Authorization'] = `Bearer ${config.token}`;
  }

  const response = await fetch(url, { headers });

  if (response.status === 404) {
    throw new Error(`File not found on branch ${config.branch}: ${filePath}`);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${text}`);
  }

  const data = (await response.json()) as { content: string; encoding?: string; sha: string };
  const rawContent = Buffer.from(data.content, (data.encoding as BufferEncoding) || 'base64').toString('utf8');

  return {
    sha: data.sha,
    content: rawContent,
    encoding: data.encoding || 'base64'
  };
}

export interface CommitFilePayload {
  path: string;
  content: string | Buffer;
}

export async function commitSingleFileToGitHub(
  config: GitHubConfig,
  filePath: string,
  content: string | Buffer,
  commitMessage: string,
  existingSha?: string
): Promise<{ commitSha: string; contentSha: string }> {
  validateBranchSafety(config.branch);

  if (!config.token) {
    throw new Error('GITHUB_TOKEN is missing. Cannot persist content changes.');
  }

  let sha = existingSha;
  if (!sha) {
    try {
      const currentFile = await fetchGitHubFile(config, filePath);
      sha = currentFile.sha;
    } catch (e) {
      // File might be new
      sha = undefined;
    }
  }

  const base64Content = typeof content === 'string'
    ? Buffer.from(content, 'utf8').toString('base64')
    : content.toString('base64');

  const url = `https://api.github.com/repos/${config.repo}/contents/${filePath}`;

  const bodyPayload: Record<string, unknown> = {
    message: commitMessage,
    content: base64Content,
    branch: config.branch
  };

  if (sha) {
    bodyPayload.sha = sha;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Oilganic-Admin-Content-Writer'
    },
    body: JSON.stringify(bodyPayload)
  });

  if (response.status === 409) {
    const text = await response.text();
    throw new Error(`409 Conflict: Concurrent edit detected on ${filePath}. ${text}`);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub commit error (${response.status}): ${text}`);
  }

  const data = (await response.json()) as { commit: { sha: string }; content: { sha: string } };
  return {
    commitSha: data.commit.sha,
    contentSha: data.content.sha
  };
}

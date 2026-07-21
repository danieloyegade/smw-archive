import { defineConfig } from 'astro/config';

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const siteUrl = isGitHubPages
  ? 'https://danieloyegade.github.io/smw-archive'
  : 'http://127.0.0.1:4328';

export default defineConfig({
  site: siteUrl,
  base: isGitHubPages ? '/smw-archive' : '/',
});

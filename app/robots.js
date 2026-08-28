export const dynamic = 'force-static';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://xvviix.github.io/xvviix-portfolio';

// Explicitly welcome AI/generative-engine crawlers so the site can be cited
// by ChatGPT, Perplexity, Claude, Gemini and friends (GEO).
const AI_CRAWLERS = [
  'GPTBot',            // OpenAI — training & retrieval
  'OAI-SearchBot',     // OpenAI — search grounding
  'ChatGPT-User',      // ChatGPT live browsing
  'PerplexityBot',     // Perplexity answers
  'Perplexity-User',   // Perplexity live browsing
  'ClaudeBot',         // Anthropic
  'Claude-User',       // Claude live browsing
  'anthropic-ai',
  'Google-Extended',   // Gemini / AI Overviews grounding
  'Applebot-Extended', // Apple Intelligence
  'CCBot',             // Common Crawl (feeds many open models)
  'meta-externalagent',
  'Bytespider',
];

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

# BlogSmith — Multi-Agent SEO Blog Writer

Give it a topic (and optionally a keyword + brand), and BlogSmith runs a **research → write → SEO** pipeline that returns a publish-ready post: a ~900-word article plus a complete SEO pack — meta title, meta description, URL slug, tags, primary/secondary keywords, and embedded links.

🔗 **Live demo:** https://blogsmith-mushaim-s-projects.vercel.app

## Why it exists
Quality SEO content is slow to produce and easy to get generic. Most "AI writers" hand you freeform prose that you still have to structure, fact-shape, and wrap in metadata. I built BlogSmith (from a real blog-automation freelance pipeline) so a single input yields a *complete, structured deliverable* — article **and** the SEO scaffolding around it.

## What makes it interesting (engineering)
- **Structured generation.** One Claude tool/JSON-schema call emits the article *and* every SEO field together, so the output is guaranteed to contain a valid meta title (≤60 chars), description (≤155), slug, tags, and keyword set — no post-processing or missing pieces.
- **Pipeline framing.** Research (keywords + outline) → writing → SEO metadata are modeled as distinct stages, and the UI surfaces them so you can see the "agents" at work.
- **Zero-dependency rendering.** A tiny custom Markdown→HTML renderer displays the finished article (no heavy libraries), keeping the bundle small.
- **Keyword-aware, not keyword-stuffed.** The prompt weaves primary/secondary keywords naturally and adds real embedded links (including an optional brand link).

## Stack
Next.js (App Router) · Anthropic Claude API (structured tool use) · TypeScript · Tailwind · Vercel.

## Run locally
```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev   # http://localhost:3000
```

## What I'd add next
A true multi-agent loop — separate research, drafting, fact-check, and SEO agents with a critique pass — plus internal-linking suggestions and a readability score.

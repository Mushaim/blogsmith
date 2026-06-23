import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

export async function POST(req: Request) {
  const { topic, keyword, brand, brandUrl } = await req.json();
  if (!topic) return NextResponse.json({ error: "Give it a topic." }, { status: 400 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "Server missing ANTHROPIC_API_KEY." }, { status: 503 });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const res = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    tools: [{
      name: "emit_article",
      description: "Emit a complete, SEO-optimized blog post produced by a research → write → SEO pipeline.",
      input_schema: {
        type: "object",
        properties: {
          primaryKeyword: { type: "string" },
          secondaryKeywords: { type: "array", items: { type: "string" }, description: "4-6 related keywords to weave in" },
          outline: { type: "array", items: { type: "string" }, description: "the H2 section headings, in order" },
          metaTitle: { type: "string", description: "<= 60 chars, includes the primary keyword" },
          metaDescription: { type: "string", description: "<= 155 chars, compelling, includes the keyword" },
          slug: { type: "string", description: "kebab-case url slug" },
          tags: { type: "array", items: { type: "string" } },
          markdown: { type: "string", description: "the full article in Markdown: an intro, the H2 sections from the outline, a short conclusion. Use ## for sections. Include 2-3 relevant embedded markdown links (one to the brand site if given), and use **bold** for key terms. ~700-900 words." },
        },
        required: ["primaryKeyword", "secondaryKeywords", "outline", "metaTitle", "metaDescription", "slug", "tags", "markdown"],
      },
    }],
    tool_choice: { type: "tool", name: "emit_article" },
    messages: [{
      role: "user",
      content:
        `Write an SEO-optimized blog post.\nTopic: ${topic}\nPrimary keyword: ${keyword || "(infer the best one)"}\n` +
        (brand ? `Brand to mention naturally (with a link${brandUrl ? ` to ${brandUrl}` : ""}): ${brand}\n` : "") +
        `Make it genuinely useful and specific — not fluffy SEO filler. Natural keyword usage, scannable structure, a clear intro and conclusion.`,
    }],
  });

  const tool = res.content.find((b) => b.type === "tool_use") as { input?: Record<string, unknown> } | undefined;
  if (!tool?.input) return NextResponse.json({ error: "No article produced." }, { status: 500 });
  return NextResponse.json({ article: tool.input });
}

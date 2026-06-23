"use client";
import { useState } from "react";

type Article = {
  primaryKeyword: string; secondaryKeywords: string[]; outline: string[];
  metaTitle: string; metaDescription: string; slug: string; tags: string[]; markdown: string;
};

// Tiny Markdown → HTML (headings, bold, links, lists, paragraphs).
function mdToHtml(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s: string) =>
    esc(s)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const lines = md.split("\n");
  let html = "", list: string[] = [];
  const flush = () => { if (list.length) { html += "<ul>" + list.map((l) => `<li>${inline(l)}</li>`).join("") + "</ul>"; list = []; } };
  for (const raw of lines) {
    const l = raw.trim();
    if (/^### /.test(l)) { flush(); html += `<h3>${inline(l.slice(4))}</h3>`; }
    else if (/^## /.test(l)) { flush(); html += `<h2>${inline(l.slice(3))}</h2>`; }
    else if (/^# /.test(l)) { flush(); html += `<h1>${inline(l.slice(2))}</h1>`; }
    else if (/^[-*] /.test(l)) { list.push(l.slice(2)); }
    else if (l === "") { flush(); }
    else { flush(); html += `<p>${inline(l)}</p>`; }
  }
  flush();
  return html;
}

const STEPS = ["🔎 Researcher — keywords & angle", "✍️ Writer — drafts the article", "📈 SEO — meta, slug, tags, links"];

export default function Home() {
  const [topic, setTopic] = useState("How small businesses can use AI chatbots for customer support");
  const [keyword, setKeyword] = useState("ai chatbot for customer support");
  const [brand, setBrand] = useState("");
  const [brandUrl, setBrandUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [article, setArticle] = useState<Article | null>(null);

  async function write() {
    setErr(""); setLoading(true); setArticle(null);
    try {
      const res = await fetch("/api/write", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, keyword, brand, brandUrl }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setArticle(data.article);
    } catch (e) { setErr((e as Error).message); } finally { setLoading(false); }
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <div className="mb-7">
        <h1 className="text-4xl font-bold">BlogSmith</h1>
        <p className="sans mt-1 text-[var(--color-soft)]">A multi-agent pipeline: research → write → SEO. From a topic to a publish-ready, optimized blog post. <span className="chip">demo</span></p>
      </div>

      <div className="card sans mb-6 space-y-3 p-5">
        <div><label className="label">Topic</label><textarea className="input mt-1" rows={2} value={topic} onChange={(e) => setTopic(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Primary keyword</label><input className="input mt-1" value={keyword} onChange={(e) => setKeyword(e.target.value)} /></div>
          <div><label className="label">Brand (optional)</label><input className="input mt-1" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Acme AI" /></div>
        </div>
        <div><label className="label">Brand URL (optional)</label><input className="input mt-1" value={brandUrl} onChange={(e) => setBrandUrl(e.target.value)} placeholder="https://…" /></div>
        <button className="btn" onClick={write} disabled={loading || !topic}>{loading ? "Writing…" : "Generate post →"}</button>
        {err && <p className="text-sm text-red-600">{err}</p>}
      </div>

      {loading && (
        <div className="card sans mb-6 space-y-2 p-5">
          {STEPS.map((s) => <p key={s} className="text-sm text-[var(--color-soft)]">⏳ {s}</p>)}
        </div>
      )}

      {article && (
        <>
          <div className="card sans mb-6 p-5">
            <p className="label mb-2">SEO pipeline output</p>
            {STEPS.map((s) => <p key={s} className="text-sm text-green-700">✓ {s}</p>)}
            <div className="mt-3 grid gap-2 text-sm">
              <div><span className="label">Meta title</span><p>{article.metaTitle} <span className="text-[var(--color-mute)]">({article.metaTitle.length} chars)</span></p></div>
              <div><span className="label">Meta description</span><p>{article.metaDescription} <span className="text-[var(--color-mute)]">({article.metaDescription.length} chars)</span></p></div>
              <div><span className="label">URL slug</span><p className="text-[var(--color-accent)]">/{article.slug}</p></div>
              <div><span className="label">Primary keyword</span><p>{article.primaryKeyword}</p></div>
              <div className="flex flex-wrap gap-1.5"><span className="label w-full">Secondary keywords</span>{article.secondaryKeywords.map((k) => <span key={k} className="chip">{k}</span>)}</div>
              <div className="flex flex-wrap gap-1.5"><span className="label w-full">Tags</span>{article.tags.map((t) => <span key={t} className="chip">#{t}</span>)}</div>
            </div>
          </div>

          <article className="card prose p-7" dangerouslySetInnerHTML={{ __html: mdToHtml(article.markdown) }} />
        </>
      )}
    </main>
  );
}

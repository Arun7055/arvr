"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Sparkles, IndianRupee } from "lucide-react";

export default function ShopperPage() {
  const [prompt, setPrompt] = useState("");
  const [budget, setBudget] = useState(6000);
  const [loading, setLoading] = useState(false);
  const [board, setBoard] = useState<any | null>(null);
  const [catalog, setCatalog] = useState<any[]>([]);

  useEffect(() => {
    api.shopper.getCatalog().then(setCatalog).catch(() => {});
  }, []);

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await api.shopper.recommend({ user_prompt: prompt, budget_inr: Number(budget) });
      setBoard(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Personal Shopper</h1>
          <p className="text-xs text-[var(--muted)]">
            Describe an occasion and set your budget in ₹—the agent builds a cohesive outfit from the catalog.
          </p>
        </div>

        {/* Prompt & Budget Form */}
        <form
          onSubmit={handleRecommend}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-[var(--muted)]">Occasion / Vibe</label>
            <input
              type="text"
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Smart-casual rooftop dinner in Bengaluru"
              className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted)]">Max Budget (₹)</label>
            <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5">
              <IndianRupee className="h-3.5 w-3.5 text-[var(--muted)]" />
              <input
                type="number"
                min={1000}
                step={500}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-2.5 px-4 text-sm font-semibold text-[var(--accent-fg)] hover:opacity-90 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Curating..." : "Build Outfit"}
          </button>
        </form>

        {/* Curated Outfit Board */}
        {board && (
          <section className="rounded-2xl border border-[var(--accent)] bg-[var(--surface)] p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono text-[var(--accent)]">CURATED OUTFIT BOARD</span>
                <h2 className="text-lg font-semibold mt-0.5">{board.user_prompt}</h2>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-right">
                <p className="text-[10px] text-[var(--muted)]">TOTAL PRICE</p>
                <p className="text-base font-bold">₹{board.total_price_inr}</p>
              </div>
            </div>

            <p className="text-sm text-[var(--muted)] leading-relaxed">{board.ai_reasoning}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {board.items?.map((item: any) => (
                <div key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="h-44 w-full object-cover" />
                  <div className="p-3.5">
                    <span className="text-[10px] font-mono uppercase text-[var(--accent)]">{item.category}</span>
                    <h3 className="text-sm font-semibold mt-0.5">{item.name}</h3>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      ₹{item.price_inr} • {item.fabric}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Full Catalog */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Available Catalog ({catalog.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {catalog.map((item) => (
              <div key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                <img src={item.image_url} alt={item.name} className="h-36 w-full object-cover" />
                <div className="p-3">
                  <span className="text-[10px] font-mono uppercase text-[var(--muted)]">{item.category}</span>
                  <h3 className="text-xs font-semibold mt-0.5 line-clamp-1">{item.name}</h3>
                  <p className="text-xs font-medium text-[var(--accent)] mt-1">₹{item.price_inr}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
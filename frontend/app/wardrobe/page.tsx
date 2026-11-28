"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CloudSun, Upload, Sparkles } from "lucide-react";

export default function WardrobePage() {
  const [items, setItems] = useState<any[]>([]);
  const [occasion, setOccasion] = useState("casual college day");
  const [planResult, setPlanResult] = useState<any | null>(null);
  const [planning, setPlanning] = useState(false);

  // Upload form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("top");
  const [color, setColor] = useState("");
  const [fabric, setFabric] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadCloset = () => api.wardrobe.listItems().then(setItems).catch(() => {});

  useEffect(() => {
    loadCloset();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select an image file.");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("category", category);
      fd.append("color", color);
      fd.append("fabric", fabric);
      fd.append("season", "all");
      fd.append("file", file);
      await api.wardrobe.addItem(fd);
      setName("");
      setColor("");
      setFabric("");
      setFile(null);
      loadCloset();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDailyPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanning(true);
    try {
      const res = await api.wardrobe.dailyOutfit({ occasion });
      setPlanResult(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPlanning(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Digital Wardrobe</h1>
          <p className="text-xs text-[var(--muted)]">
            Upload your clothes once and get weather-aware daily outfit combinations.
          </p>
        </div>

        {/* Daily Weather Outfit Planner */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
          <div className="flex items-center gap-2">
            <CloudSun className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-base font-semibold">Today&apos;s Weather-Smart Planner</h2>
          </div>

          <form onSubmit={handleDailyPlan} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="Occasion (e.g. office presentation, evening coffee)"
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
            />
            <button
              type="submit"
              disabled={planning}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-fg)] disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {planning ? "Planning..." : "Generate Outfits"}
            </button>
          </form>

          {planResult && (
            <div className="space-y-4 pt-2">
              <div className="inline-flex flex-wrap gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-xs">
                <span>Temp: <strong>{planResult.weather?.temperature_2m}°C</strong></span>
                <span>Humidity: <strong>{planResult.weather?.relative_humidity_2m}%</strong></span>
                <span>Rain: <strong>{planResult.weather?.rain} mm</strong></span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {planResult.plan?.outfits?.map((o: any, idx: number) => (
                  <div key={idx} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 space-y-2">
                    <h3 className="text-sm font-semibold text-[var(--accent)]">{o.title}</h3>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{o.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Upload New Item + Closet Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleUpload}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3 h-fit"
          >
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4 text-[var(--accent)]" />
              Add Closet Item
            </h2>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name (e.g. Navy Linen Shirt)"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs outline-none"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs outline-none"
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="outerwear">Outerwear</option>
              <option value="footwear">Footwear</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Color"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs outline-none"
              />
              <input
                type="text"
                required
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="Fabric"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs outline-none"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-[var(--muted)]"
            />
            <button
              type="submit"
              disabled={uploading}
              className="w-full rounded-lg bg-[var(--accent)] py-2 text-xs font-semibold text-[var(--accent-fg)] disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Save to Wardrobe"}
            </button>
          </form>

          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                <img src={item.image_url} alt={item.name} className="h-36 w-full object-cover" />
                <div className="p-3">
                  <span className="text-[10px] font-mono uppercase text-[var(--accent)]">{item.category}</span>
                  <h3 className="text-xs font-semibold mt-0.5 line-clamp-1">{item.name}</h3>
                  <p className="text-[11px] text-[var(--muted)]">{item.color} • {item.fabric}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
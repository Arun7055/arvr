"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Camera, CameraOff, MessageSquare } from "lucide-react";

export default function TryOnPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamOn, setStreamOn] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [scale, setScale] = useState(1);
  const [yOffset, setYOffset] = useState(0);

  const [question, setQuestion] = useState("");
  const [advice, setAdvice] = useState<any | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    api.tryon.getAssets().then((data) => {
      setAssets(data);
      if (data.length > 0) setSelected(data[0]);
    }).catch(() => {});

    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamOn(true);
      }
    } catch {
      alert("Camera permission denied or unavailable on this device.");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreamOn(false);
  };

  const askFitAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !selected) return;
    setLoadingAdvice(true);
    try {
      const res = await api.tryon.fitAdvice({
        garment_name: selected.name,
        user_question: question,
      });
      setAdvice(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingAdvice(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AR Mirror Try-On</h1>
            <p className="text-xs text-[var(--muted)]">
              Preview overlays on your live webcam and ask the AI Fit Advisor for styling feedback.
            </p>
          </div>
          <button
            onClick={streamOn ? stopCamera : startCamera}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent-fg)]"
          >
            {streamOn ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
            {streamOn ? "Stop Camera" : "Start Camera"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Camera + Overlay */}
          <div className="lg:col-span-2 relative h-[440px] rounded-2xl border border-[var(--border)] bg-black overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover scale-x-[-1]"
            />
            {!streamOn && (
              <p className="absolute text-xs text-zinc-400">
                Click &quot;Start Camera&quot; to activate the AR mirror
              </p>
            )}
            {streamOn && selected && (
              <img
                src={selected.png_url}
                alt={selected.name}
                style={{
                  transform: `translateY(${yOffset}px) scale(${scale})`,
                }}
                className="pointer-events-none absolute w-56 opacity-85 transition-transform"
              />
            )}
          </div>

          {/* Overlay Controls + Fit Advisor */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
              <h2 className="text-sm font-semibold">Select Garment Overlay</h2>
              <div className="space-y-2">
                {assets.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className={`w-full text-left rounded-lg border px-3 py-2.5 text-xs font-medium transition ${
                      selected?.id === a.id
                        ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]"
                        : "border-[var(--border)] bg-[var(--bg)]"
                    }`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <label className="flex justify-between text-[11px] text-[var(--muted)]">
                  <span>Overlay Scale</span>
                  <span>{scale.toFixed(2)}x</span>
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={1.8}
                  step={0.05}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full"
                />

                <label className="flex justify-between text-[11px] text-[var(--muted)]">
                  <span>Vertical Position</span>
                  <span>{yOffset}px</span>
                </label>
                <input
                  type="range"
                  min={-120}
                  max={120}
                  step={5}
                  value={yOffset}
                  onChange={(e) => setYOffset(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[var(--accent)]" />
                AI Fit Advisor
              </h2>
              <form onSubmit={askFitAdvisor} className="space-y-2.5">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. What pants pair best with this?"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs outline-none focus:border-[var(--accent)]"
                />
                <button
                  type="submit"
                  disabled={loadingAdvice}
                  className="w-full rounded-lg bg-[var(--accent)] py-2 text-xs font-semibold text-[var(--accent-fg)] disabled:opacity-50"
                >
                  {loadingAdvice ? "Thinking..." : "Ask Advisor"}
                </button>
              </form>

              {advice && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-xs space-y-2">
                  <p className="font-medium">{advice.fit_verdict}</p>
                  <ul className="list-disc pl-4 space-y-1 text-[var(--muted)]">
                    {advice.styling_tips?.map((tip: string, i: number) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
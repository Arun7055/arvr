"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Sparkles } from "lucide-react";

interface PBRConfig {
  color_hex: string;
  roughness: number;
  metalness: number;
  fabric_preset: string;
  decal_text?: string | null;
  styling_note?: string;
}

function GarmentMesh({ garment, pbr }: { garment: string; pbr: PBRConfig }) {
  const matProps = {
    color: pbr.color_hex || "#8A9A5B",
    roughness: pbr.roughness ?? 0.85,
    metalness: pbr.metalness ?? 0.05,
  };

  return (
    <group position={[0, -0.2, 0]}>
      {/* Torso */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.58, 1.55, 32]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {/* Left Sleeve */}
      <mesh position={[-0.85, 0.45, 0]} rotation={[0, 0, 0.45]} castShadow>
        <cylinderGeometry args={[0.2, 0.17, garment === "tshirt" ? 0.65 : 1.15, 24]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {/* Right Sleeve */}
      <mesh position={[0.85, 0.45, 0]} rotation={[0, 0, -0.45]} castShadow>
        <cylinderGeometry args={[0.2, 0.17, garment === "tshirt" ? 0.65 : 1.15, 24]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {/* Hood / Collar */}
      {garment === "hoodie" && (
        <mesh position={[0, 1.1, -0.15]} castShadow>
          <sphereGeometry args={[0.42, 24, 24]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      )}
    </group>
  );
}

export default function StudioPage() {
  const [garment, setGarment] = useState("hoodie");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [designs, setDesigns] = useState<any[]>([]);
  const [pbr, setPbr] = useState<PBRConfig>({
    color_hex: "#8A9A5B",
    roughness: 0.85,
    metalness: 0.05,
    fabric_preset: "cotton",
    decal_text: null,
    styling_note: "Default matte heavyweight cotton finish.",
  });

  useEffect(() => {
    api.studio.listDesigns().then(setDesigns).catch(() => {});
  }, []);

  const handleCustomize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const saved = await api.studio.customize({ base_garment: garment, user_prompt: prompt });
      setPbr(saved.pbr_config);
      setDesigns((prev) => [saved, ...prev]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">3D Garment Studio</h1>
          <p className="text-xs text-[var(--muted)]">
            Describe any color, fabric, or finish. Drag to rotate the 3D garment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Viewport */}
          <div className="lg:col-span-2 h-[420px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden relative">
            <Canvas shadows camera={{ position: [0, 0.4, 3.6], fov: 45 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[4, 6, 4]} intensity={1.2} castShadow />
              <GarmentMesh garment={garment} pbr={pbr} />
              <ContactShadows position={[0, -1.1, 0]} opacity={0.4} scale={6} blur={2} />
              <Environment preset="studio" />
              <OrbitControls enablePan={false} minDistance={2.2} maxDistance={6} />
            </Canvas>

            {pbr.decal_text && (
              <div className="absolute bottom-4 left-4 rounded-lg border border-[var(--border)] bg-[var(--bg)]/90 px-3 py-1.5 text-xs font-mono">
                Graphic Print: <span className="text-[var(--accent)]">{pbr.decal_text}</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between space-y-5">
            <form onSubmit={handleCustomize} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted)]">Base Garment</label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {["hoodie", "tshirt", "jacket"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGarment(g)}
                      className={`rounded-lg border py-2 text-xs font-medium capitalize transition ${
                        garment === g
                          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]"
                          : "border-[var(--border)] bg-[var(--bg)] text-[var(--muted)]"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--muted)]">Fabric Prompt</label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Deep burgundy silk bomber with glossy sheen"
                  className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-sm outline-none focus:border-[var(--accent)]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-2.5 text-sm font-semibold text-[var(--accent-fg)] hover:opacity-90 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {loading ? "Synthesizing PBR..." : "Apply AI Material"}
              </button>
            </form>

            {/* Live PBR Telemetry */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3.5 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Color</span>
                <span className="font-mono flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full border border-white/20" style={{ background: pbr.color_hex }} />
                  {pbr.color_hex}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Fabric</span>
                <span className="capitalize font-medium">{pbr.fabric_preset}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Roughness / Metalness</span>
                <span className="font-mono">{pbr.roughness} / {pbr.metalness}</span>
              </div>
              {pbr.styling_note && (
                <p className="pt-2 border-t border-[var(--border)] text-[var(--muted)] leading-relaxed">
                  {pbr.styling_note}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Saved Designs */}
        {designs.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Recent Saved Designs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {designs.slice(0, 6).map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setGarment(d.base_garment);
                    setPbr(d.pbr_config);
                  }}
                  className="text-left rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--accent)] transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-[var(--muted)]">{d.base_garment}</span>
                    <span
                      className="h-4 w-4 rounded-full border border-white/20"
                      style={{ background: d.pbr_config?.color_hex }}
                    />
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs font-medium">{d.user_prompt}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
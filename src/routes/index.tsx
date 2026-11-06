import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { fetchGeomag, buildGeomagUrl, type GeomagResult } from "@/lib/geomag.functions";

const WorldMap = lazy(() => import("@/components/WorldMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Magnetica — Earth's magnetic field anywhere" },
      { name: "description", content: "Click any place on Earth to see its magnetic declination, inclination and field strength from NOAA's World Magnetic Model." },
      { property: "og:title", content: "Magnetica — Earth's magnetic field anywhere" },
      { property: "og:description", content: "Explore NOAA World Magnetic Model data on an interactive map." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const fmt = (n: number, d = 1) => n.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });
const coord = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(4)}° ${v >= 0 ? pos : neg}`;

function Index() {
  const [point, setPoint] = useState<{ lat: number; lon: number } | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const q = useMutation({ mutationFn: (v: { lat: number; lon: number; date: string }) => fetchGeomag({ data: v }) });

  const pick = (lat: number, lon: number) => {
    setPoint({ lat, lon });
    q.mutate({ lat, lon, date });
  };
  const changeDate = (d: string) => {
    setDate(d);
    if (point && d) q.mutate({ ...point, date: d });
  };
  const url = point && date ? buildGeomagUrl(point.lat, point.lon, new Date(date)) : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-primary font-display text-primary">N</div>
          <div>
            <h1 className="font-display text-xl tracking-tight">Magnetica</h1>
            <p className="text-xs text-muted-foreground">NOAA World Magnetic Model explorer</p>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Date
          <input type="date" value={date} onChange={(e) => changeDate(e.target.value)}
            className="rounded-md border border-input bg-card px-3 py-1.5 text-foreground" />
        </label>
      </header>

      <main className="grid gap-0 lg:grid-cols-[1fr_440px]">
        <section className="relative h-[55vh] lg:h-[calc(100vh-73px)]">
          <ClientOnly fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
            <Suspense fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
              <WorldMap point={point} onPick={pick} />
            </Suspense>
          </ClientOnly>
          {!point && (
            <div className="pointer-events-none absolute left-1/2 top-6 z-[500] -translate-x-1/2 rounded-full border border-border bg-card/90 px-4 py-2 text-sm shadow-lg backdrop-blur">
              Click anywhere on the map to read the magnetic field
            </div>
          )}
        </section>

        <aside className="space-y-5 overflow-y-auto border-l border-border bg-card p-6 lg:h-[calc(100vh-73px)]">
          {!point && <Empty />}
          {point && (
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Selected location</p>
              <p className="mt-1 font-mono text-lg">{coord(point.lat, "N", "S")}, {coord(point.lon, "E", "W")}</p>
            </div>
          )}
          {q.isPending && <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}</div>}
          {q.isError && <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">Couldn't load data: {(q.error as Error).message}</div>}
          {q.data && !q.isPending && <Results r={q.data.result} model={q.data.model} />}
          {url && (
            <details className="rounded-lg border border-border p-3 text-xs">
              <summary className="cursor-pointer text-muted-foreground">Request URL</summary>
              <a href={url} target="_blank" rel="noreferrer" className="mt-2 block break-all font-mono text-primary hover:underline">{url}</a>
            </details>
          )}
        </aside>
      </main>
    </div>
  );
}

function Empty() {
  return (
    <div className="space-y-3 pt-8 text-center">
      <Compass deg={0} />
      <h2 className="font-display text-2xl">Pick a place on Earth</h2>
      <p className="text-sm text-muted-foreground">We'll show where a compass needle points there, how steeply it dips, and how strong the magnetic field is.</p>
    </div>
  );
}

function Compass({ deg }: { deg: number }) {
  return (
    <svg viewBox="0 0 100 100" className="mx-auto h-32 w-32">
      <circle cx="50" cy="50" r="46" className="fill-none stroke-border" strokeWidth="2" />
      {["N", "E", "S", "W"].map((l, i) => (
        <text key={l} x={50 + 36 * Math.sin((i * Math.PI) / 2)} y={54 - 36 * Math.cos((i * Math.PI) / 2)}
          textAnchor="middle" className="fill-muted-foreground text-[10px]">{l}</text>
      ))}
      <g style={{ transform: `rotate(${deg}deg)`, transformOrigin: "50px 50px", transition: "transform .8s" }}>
        <polygon points="50,14 55,50 45,50" className="fill-primary" />
        <polygon points="50,86 55,50 45,50" className="fill-muted-foreground" />
      </g>
      <circle cx="50" cy="50" r="3" className="fill-foreground" />
    </svg>
  );
}

function Stat({ label, value, unit, hint, sv, unc }: { label: string; value: string; unit: string; hint: string; sv?: string; unc?: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl">{value} <span className="text-sm text-muted-foreground">{unit}</span></p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      {(sv || unc) && <p className="mt-2 font-mono text-[11px] text-muted-foreground">{unc && `± ${unc}`}{sv && `  ·  change ${sv}/yr`}</p>}
    </div>
  );
}

function Results({ r, model }: { r: GeomagResult; model: string }) {
  const dir = r.declination >= 0 ? "east" : "west";
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-primary/40 bg-primary/5 p-5 text-center">
        <Compass deg={r.declination} />
        <p className="mt-2 text-sm">A compass here points <strong className="text-primary">{fmt(Math.abs(r.declination), 2)}° {dir}</strong> of true north.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Declination" value={fmt(r.declination, 2)} unit="°" hint={`Toward ${dir}`} unc={`${r.declination_uncertainty}°`} sv={`${fmt(r.declination_sv, 3)}°`} />
        <Stat label="Inclination" value={fmt(r.inclination, 2)} unit="°" hint={r.inclination >= 0 ? "Needle dips down" : "Needle tilts up"} unc={`${r.inclination_uncertainty}°`} sv={`${fmt(r.inclination_sv, 3)}°`} />
      </div>
      <Stat label="Total field strength" value={fmt(r.totalintensity)} unit="nT" hint={`≈ ${fmt(r.totalintensity / 1000, 1)} µT`} unc={`${r.totalintensity_uncertainty} nT`} sv={`${fmt(r.totalintensity_sv)} nT`} />
      <div>
        <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Field components (nT)</p>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            {([["Horizontal (H)", r.horintensity, r.horintensity_sv], ["North (X)", r.xcomponent, r.xcomponent_sv], ["East (Y)", r.ycomponent, r.ycomponent_sv], ["Down (Z)", r.zcomponent, r.zcomponent_sv]] as const).map(([k, v, sv]) => (
              <tr key={k}><td className="py-2 text-muted-foreground">{k}</td><td className="py-2 text-right font-mono">{fmt(v)}</td><td className="py-2 text-right font-mono text-xs text-muted-foreground">{sv >= 0 ? "+" : ""}{fmt(sv)}/yr</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">Model {model} · decimal year {r.date.toFixed(3)} · sea level</p>
    </div>
  );
}

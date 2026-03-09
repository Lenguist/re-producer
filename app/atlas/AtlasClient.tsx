"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { DeckGL } from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { OrthographicView } from "@deck.gl/core";

// ── Types ────────────────────────────────────────────────────────────────────
type Paper = {
  id: string;
  title: string;
  abstract: string;
  cat: string;
  cats: string[];
  date: string | null;
  x: number;
  y: number;
};

// ── Category colour map ───────────────────────────────────────────────────────
const CAT_COLORS: Record<string, [number, number, number]> = {
  "cs.LG":             [99,  179, 237],
  "cs.AI":             [154, 117, 234],
  "cs.CV":             [72,  187, 120],
  "cs.CL":             [246, 173,  85],
  "cs.RO":             [237, 100, 166],
  "cs.NE":             [56,  189, 248],
  "quant-ph":          [251, 191,  36],
  "hep-th":            [248, 113, 113],
  "hep-ph":            [251, 146,  60],
  "cond-mat.mtrl-sci": [52,  211, 153],
  "math.CO":           [167, 139, 250],
  "eess.IV":           [196, 181, 253],
  "stat.ML":           [110, 231, 183],
};
const DEFAULT_COLOR: [number, number, number] = [148, 163, 184];

function catColor(cat: string): [number, number, number] {
  return CAT_COLORS[cat] ?? DEFAULT_COLOR;
}

// ── Viewport helpers ──────────────────────────────────────────────────────────
const CANVAS_SIZE = 10000; // logical units; papers are in [0,1] → scaled below

// ── Component ─────────────────────────────────────────────────────────────────
export default function AtlasClient() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<Paper | null>(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 });
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/atlas_data.json")
      .then(r => r.json())
      .then((data: Paper[]) => {
        setPapers(data);
        setLoading(false);
      });
  }, []);

  // ── Search filter ──────────────────────────────────────────────────────────
  const filtered = search.trim()
    ? papers.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.cat.toLowerCase().includes(search.toLowerCase())
      )
    : papers;

  const visible = activeCat
    ? filtered.filter(p => p.cat === activeCat)
    : filtered;

  // ── Hover handler ──────────────────────────────────────────────────────────
  const onHover = useCallback((info: { object?: Paper; x: number; y: number }) => {
    if (info.object) {
      setHovered(info.object);
      setTooltip({ x: info.x, y: info.y });
    } else {
      setHovered(null);
    }
  }, []);

  // ── Layer ──────────────────────────────────────────────────────────────────
  const layer = new ScatterplotLayer<Paper>({
    id: "papers",
    data: visible,
    getPosition: (d: Paper) => [d.x * CANVAS_SIZE, d.y * CANVAS_SIZE],
    getFillColor: (d: Paper) => {
      const [r, g, b] = catColor(d.cat);
      return hovered?.id === d.id ? [255, 255, 255, 255] : [r, g, b, 180];
    },
    getRadius: 18,
    radiusMinPixels: 1.5,
    radiusMaxPixels: 6,
    pickable: true,
    onHover,
    updateTriggers: { getFillColor: [hovered?.id] },
  });

  // ── Top categories for legend ──────────────────────────────────────────────
  const topCats = Object.keys(CAT_COLORS).slice(0, 10);

  const initialViewState = {
    target: [CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0] as [number, number, number],
    zoom: -4,
    minZoom: -6,
    maxZoom: 2,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-400 text-sm">
        Loading 35k papers…
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-screen h-screen bg-gray-950 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-4 px-4 py-3 bg-gray-950/80 backdrop-blur border-b border-gray-800">
        <span className="text-white font-mono text-sm font-semibold tracking-tight">
          arXiv Atlas
        </span>
        <span className="text-gray-500 text-xs">December 2025 · {papers.length.toLocaleString()} papers</span>
        <input
          type="text"
          placeholder="Search title or category…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ml-auto w-56 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-gray-500"
        />
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-gray-900/90 border border-gray-800 rounded-lg p-3 flex flex-col gap-1">
        <span className="text-gray-500 text-xs mb-1 font-mono">category</span>
        {topCats.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(activeCat === cat ? null : cat)}
            className={`flex items-center gap-2 text-xs text-left rounded px-1 py-0.5 transition-opacity ${
              activeCat && activeCat !== cat ? "opacity-30" : "opacity-100"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: `rgb(${CAT_COLORS[cat].join(",")})` }}
            />
            <span className="text-gray-300 font-mono">{cat}</span>
          </button>
        ))}
        {activeCat && (
          <button
            onClick={() => setActiveCat(null)}
            className="mt-1 text-xs text-gray-500 hover:text-gray-300 text-left"
          >
            clear filter
          </button>
        )}
      </div>

      {/* Deck.gl canvas */}
      <DeckGL
        views={new OrthographicView({ id: "ortho", controller: true })}
        initialViewState={initialViewState}
        layers={[layer]}
        style={{ position: "absolute", inset: "0" }}
      />

      {/* Tooltip */}
      {hovered && (
        <div
          className="absolute z-20 max-w-xs bg-gray-900 border border-gray-700 rounded-lg p-3 pointer-events-none shadow-xl"
          style={{
            left: tooltip.x + 16,
            top: tooltip.y + 16,
            transform:
              tooltip.x > (containerRef.current?.clientWidth ?? 800) - 320
                ? "translateX(-110%)"
                : undefined,
          }}
        >
          <div className="text-white text-xs font-semibold leading-snug mb-1">
            {hovered.title}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `rgba(${catColor(hovered.cat).join(",")},0.2)`,
                color: `rgb(${catColor(hovered.cat).join(",")})`,
              }}
            >
              {hovered.cat}
            </span>
            {hovered.date && (
              <span className="text-gray-500 text-xs">{hovered.date}</span>
            )}
          </div>
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-4">
            {hovered.abstract}
          </p>
          <a
            href={`https://arxiv.org/abs/${hovered.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-xs text-blue-400 hover:text-blue-300 pointer-events-auto"
          >
            arxiv:{hovered.id} →
          </a>
        </div>
      )}
    </div>
  );
}

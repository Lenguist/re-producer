"use client";

import dynamic from "next/dynamic";

const AtlasClient = dynamic(() => import("./AtlasClient"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-400 text-sm">
      Loading…
    </div>
  ),
});

export default function AtlasLoader() {
  return <AtlasClient />;
}

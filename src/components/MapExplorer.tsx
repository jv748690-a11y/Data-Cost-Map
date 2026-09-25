"use client";

import { useState } from "react";
import RegionMap from "./RegionMap";

const PROVIDERS = [
  { slug: "", label: "All providers" },
  { slug: "mtn", label: "MTN" },
  { slug: "airtel", label: "Airtel" },
  { slug: "glo", label: "Glo" },
  { slug: "9mobile", label: "9mobile" },
];

const SIZES = [
  { mb: 1024, label: "1GB" },
  { mb: 5120, label: "5GB" },
];

export default function MapExplorer() {
  const [provider, setProvider] = useState("");
  const [dataMb, setDataMb] = useState(1024);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          Provider
          <select
            className="rounded border bg-white px-2 py-1 text-black"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            {PROVIDERS.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          Bundle size
          <select
            className="rounded border bg-white px-2 py-1 text-black"
            value={dataMb}
            onChange={(e) => setDataMb(Number(e.target.value))}
          >
            {SIZES.map((s) => (
              <option key={s.mb} value={s.mb}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <RegionMap dataMb={dataMb} provider={provider} />
    </div>
  );
}
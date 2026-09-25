"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});
const formatPrice = (minor: number) => naira.format(minor / 100);

type StatsFeature = {
  type: "Feature";
  geometry: object;
  properties: { name: string; aggregate: { medianPricePerGb: number | null } };
};

export default function RegionMap({
  dataMb,
  provider,
}: {
  dataMb: number;
  provider: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<{ min: number; max: number } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!container.current) return;

    maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

    const map = new maplibregl.Map({
      container: container.current,
      style: {
        version: 8,
        sources: {},
        layers: [
          { id: "bg", type: "background", paint: { "background-color": "#f8fafc" } },
        ],
      },
      center: [8.7, 9.1],
      zoom: 5,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));

    let cancelled = false;

    map.on("load", async () => {
      try {
        const query = new URLSearchParams({ dataMb: String(dataMb) });
        if (provider) query.set("provider", provider);
        const res = await fetch(`/api/regions/stats?${query.toString()}`);
        if (!res.ok) throw new Error("bad response");
        const data = await res.json();
        if (cancelled) return;

        const features = (data.features as StatsFeature[]).map((f) => ({
          type: "Feature" as const,
          geometry: f.geometry,
          properties: {
            name: f.properties.name,
            pricePerGb: f.properties.aggregate.medianPricePerGb ?? -1,
          },
        }));

        const prices = features
          .map((f) => f.properties.pricePerGb)
          .filter((p) => p >= 0);
        const min = prices.length ? Math.min(...prices) : 0;
        const rawMax = prices.length ? Math.max(...prices) : 1;
        const max = rawMax === min ? min + 1 : rawMax;
        setRange(prices.length ? { min, max: rawMax } : null);

        map.addSource("regions", {
          type: "geojson",
          data: { type: "FeatureCollection", features } as unknown as maplibregl.GeoJSONSourceSpecification["data"],
        });

        map.addLayer({
          id: "regions-fill",
          type: "fill",
          source: "regions",
          paint: {
            "fill-color": [
              "case",
              ["<", ["get", "pricePerGb"], 0],
              "#d1d5db",
              [
                "interpolate",
                ["linear"],
                ["get", "pricePerGb"],
                min,
                "#fde68a",
                max,
                "#b91c1c",
              ],
            ],
            "fill-opacity": 0.9,
          },
        });

        map.addLayer({
          id: "regions-line",
          type: "line",
          source: "regions",
          paint: { "line-color": "#ffffff", "line-width": 1 },
        });

        map.on("click", "regions-fill", (e) => {
          const p = e.features?.[0]?.properties;
          if (!p) return;
          const price = Number(p.pricePerGb);
          new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setText(`${p.name}: ${price < 0 ? "No data" : formatPrice(price) + " per GB"}`)
            .addTo(map);
        });
        map.on("mouseenter", "regions-fill", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "regions-fill", () => {
          map.getCanvas().style.cursor = "";
        });
      } catch {
        if (!cancelled) setError(true);
      }
    });

    return () => {
      cancelled = true;
      map.remove();
    };
  }, [dataMb, provider]);

  return (
    <div>
      <div ref={container} className="h-[70vh] w-full rounded border" />
      {error && (
        <p className="mt-2 text-sm text-red-600">Could not load map data.</p>
      )}
      {range && (
        <p className="mt-2 text-sm text-gray-600">
          Cheapest state {formatPrice(range.min)} per GB, priciest{" "}
          {formatPrice(range.max)} per GB. Click a state for its price.
        </p>
      )}
    </div>
  );
}
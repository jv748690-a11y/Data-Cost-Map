import MapExplorer from "@/components/MapExplorer";

export default function MapPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">Price map</h1>
      <p className="mt-1 text-sm text-gray-600">
        Median price per GB by state. Demo data, not real prices. Boundaries:
        geoBoundaries (GRID3), CC BY 4.0.
      </p>
      <div className="mt-4">
        <MapExplorer />
      </div>
    </main>
  );
}
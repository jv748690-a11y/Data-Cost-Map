import { listPlanSummaries } from "@/lib/db/plans";

export const dynamic = "force-dynamic";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const formatPrice = (minor: number) => naira.format(minor / 100);

export default async function Home() {
  const plans = await listPlanSummaries();

  const sorted = [...plans].sort(
    (a, b) =>
      (a.aggregate.medianPricePerGb ?? Infinity) -
      (b.aggregate.medianPricePerGb ?? Infinity)
  );

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Data Cost Map</h1>
      <p className="mt-1 text-sm text-gray-600">
        Compare mobile data prices by provider. Demo data, not real prices.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-2 pr-4">Provider</th>
              <th className="py-2 pr-4">Plan</th>
              <th className="py-2 pr-4">Validity</th>
              <th className="py-2 pr-4">Price per GB</th>
              <th className="py-2">Data status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.planId} className="border-b">
                <td className="py-2 pr-4 font-medium">{p.provider}</td>
                <td className="py-2 pr-4">{p.name}</td>
                <td className="py-2 pr-4">{p.validityDays} days</td>
                <td className="py-2 pr-4">
                  {p.aggregate.medianPricePerGb === null
                    ? "No data"
                    : formatPrice(p.aggregate.medianPricePerGb)}
                </td>
                <td className="py-2">
                  {p.aggregate.verifiedCount > 0 ? "Verified" : "Unverified"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
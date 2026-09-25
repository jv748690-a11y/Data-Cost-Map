import { z } from "zod";
import { getRegionStats } from "@/lib/db/regionStats";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  provider: z.string().regex(/^[a-z0-9-]{1,40}$/).optional(),
  dataMb: z.coerce.number().int().positive().max(1_048_576).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    provider: searchParams.get("provider") ?? undefined,
    dataMb: searchParams.get("dataMb") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json({ ok: false, error: "Invalid filters" }, { status: 400 });
  }

  try {
    const collection = await getRegionStats(parsed.data.provider, parsed.data.dataMb);
    return Response.json(collection);
  } catch (err) {
    console.error("regions stats error:", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
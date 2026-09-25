import { z } from "zod";
import { listPlanSummaries } from "@/lib/db/plans";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  provider: z.string().regex(/^[a-z0-9-]{1,40}$/).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    provider: searchParams.get("provider") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json({ ok: false, error: "Invalid provider" }, { status: 400 });
  }

  try {
    const plans = await listPlanSummaries(parsed.data.provider);
    return Response.json({ ok: true, plans });
  } catch (err) {
    console.error("plans route error:", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
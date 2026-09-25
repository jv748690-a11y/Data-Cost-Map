import { pool } from "@/lib/db/pool";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await pool.query(
      "select postgis_version() as postgis, (select count(*)::int from providers) as providers"
    );
    return Response.json({ ok: true, ...result.rows[0] });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
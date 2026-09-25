import { pool } from "./pool";
import {
  aggregateObservations,
  type Observation,
  type ObservationStatus,
} from "../domain/aggregate";

export async function getRegionStats(providerSlug?: string, dataMb?: number) {
  const [regions, observationRows] = await Promise.all([
    pool.query(
      `select id, name, ST_AsGeoJSON(geom, 4)::json as geometry
       from regions
       where level = 'state' and geom is not null
       order by name`
    ),
    pool.query(
      `select o.region_id, o.price_minor, o.observed_at, o.status, pl.data_mb
       from price_observations o
       join plans pl on pl.id = o.plan_id
       join providers pr on pr.id = pl.provider_id
       where o.region_id is not null
         and ($1::text is null or pr.slug = $1)
         and ($2::int is null or pl.data_mb = $2)`,
      [providerSlug ?? null, dataMb ?? null]
    ),
  ]);

  const byRegion = new Map<string, Observation[]>();
  for (const row of observationRows.rows) {
    const list = byRegion.get(row.region_id) ?? [];
    list.push({
      priceMinor: row.price_minor,
      dataMb: row.data_mb,
      observedAt: row.observed_at,
      status: row.status as ObservationStatus,
    });
    byRegion.set(row.region_id, list);
  }

  return {
    type: "FeatureCollection" as const,
    features: regions.rows.map((r) => ({
      type: "Feature" as const,
      geometry: r.geometry,
      properties: {
        regionId: r.id,
        name: r.name,
        aggregate: aggregateObservations(byRegion.get(r.id) ?? []),
      },
    })),
  };
}
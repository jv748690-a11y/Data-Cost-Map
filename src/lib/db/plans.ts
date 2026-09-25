import { pool } from "./pool";
import {
  aggregateObservations,
  type AggregateResult,
  type Observation,
  type ObservationStatus,
} from "../domain/aggregate";

export interface PlanSummary {
  planId: string;
  provider: string;
  providerSlug: string;
  name: string;
  dataMb: number;
  validityDays: number;
  networkType: string;
  aggregate: AggregateResult;
}

export async function listPlanSummaries(providerSlug?: string): Promise<PlanSummary[]> {
  const { rows } = await pool.query(
    `select pl.id as plan_id, pr.name as provider, pr.slug as provider_slug,
            pl.name, pl.data_mb, pl.validity_days, pl.network_type,
            o.price_minor, o.observed_at, o.status
     from plans pl
     join providers pr on pr.id = pl.provider_id
     left join price_observations o on o.plan_id = pl.id
     where ($1::text is null or pr.slug = $1)
     order by pr.name, pl.data_mb`,
    [providerSlug ?? null]
  );

  const byPlan = new Map<string, { base: Omit<PlanSummary, "aggregate">; observations: Observation[] }>();

  for (const row of rows) {
    let entry = byPlan.get(row.plan_id);
    if (!entry) {
      entry = {
        base: {
          planId: row.plan_id,
          provider: row.provider,
          providerSlug: row.provider_slug,
          name: row.name,
          dataMb: row.data_mb,
          validityDays: row.validity_days,
          networkType: row.network_type,
        },
        observations: [],
      };
      byPlan.set(row.plan_id, entry);
    }
    if (row.price_minor !== null) {
      entry.observations.push({
        priceMinor: row.price_minor,
        dataMb: row.data_mb,
        observedAt: row.observed_at,
        status: row.status as ObservationStatus,
      });
    }
  }

  return [...byPlan.values()].map(({ base, observations }) => ({
    ...base,
    aggregate: aggregateObservations(observations),
  }));
}
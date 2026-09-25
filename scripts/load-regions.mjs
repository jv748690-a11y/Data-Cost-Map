import { readFileSync } from "node:fs";
import pg from "pg";

const geojson = JSON.parse(readFileSync("nga-states.geojson", "utf8"));
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

await client.connect();

try {
  await client.query("begin");

  for (const feature of geojson.features) {
    const { shapeName, shapeID } = feature.properties;
    await client.query(
      `insert into regions (code, name, level, country_code, geom)
       values ($1, $2, 'state', 'NG',
         ST_Multi(ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON($3::text), 4326))))
       on conflict (code) do update
         set name = excluded.name, geom = excluded.geom`,
      [shapeID, shapeName, JSON.stringify(feature.geometry)]
    );
  }

  await client.query("commit");

  const { rows } = await client.query(
    "select count(*)::int as n, count(geom)::int as with_geom from regions"
  );
  console.log("Regions loaded:", rows[0]);
} catch (err) {
  await client.query("rollback");
  console.error("Load failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
-- Up Migration
create extension if not exists postgis;

create table providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  country_code char(2) not null,
  created_at timestamptz not null default now()
);

create table regions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  level text not null check (level in ('country', 'state', 'lga')),
  parent_id uuid references regions(id) on delete restrict,
  country_code char(2) not null,
  geom geometry(MultiPolygon, 4326),
  created_at timestamptz not null default now()
);

create index regions_geom_gix on regions using gist (geom);
create index regions_parent_idx on regions (parent_id);

-- Down Migration
drop table regions;
drop table providers;
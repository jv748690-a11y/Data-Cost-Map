-- Up Migration
create table sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text not null check (type in ('official', 'imported', 'community', 'ai')),
  trust_weight numeric(3,2) not null check (trust_weight between 0 and 1),
  created_at timestamptz not null default now()
);

create table plans (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  name text not null,
  data_mb integer not null check (data_mb > 0),
  validity_days integer not null check (validity_days > 0),
  network_type text not null default 'any' check (network_type in ('any', '3g', '4g', '5g')),
  created_at timestamptz not null default now(),
  unique (provider_id, data_mb, validity_days, network_type)
);

create table price_observations (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans(id) on delete cascade,
  region_id uuid references regions(id) on delete restrict,
  source_id uuid not null references sources(id),
  price_minor integer not null check (price_minor > 0),
  currency char(3) not null default 'NGN',
  observed_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected', 'stale')),
  submitted_by uuid,
  evidence_url text,
  location geography(Point, 4326),
  created_at timestamptz not null default now()
);

create unique index price_obs_dedupe_idx on price_observations
  (plan_id, coalesce(region_id, '00000000-0000-0000-0000-000000000000'::uuid), source_id, observed_at);
create index price_obs_plan_time_idx on price_observations (plan_id, observed_at desc);
create index price_obs_region_idx on price_observations (region_id);
create index price_obs_location_gix on price_observations using gist (location) where location is not null;

insert into providers (name, slug, country_code) values
  ('MTN', 'mtn', 'NG'),
  ('Airtel', 'airtel', 'NG'),
  ('Glo', 'glo', 'NG'),
  ('9mobile', '9mobile', 'NG');

insert into sources (name, type, trust_weight) values
  ('Official price pages', 'official', 1.00),
  ('Community submissions', 'community', 0.40);

-- Down Migration
drop table price_observations;
drop table plans;
drop table sources;
delete from providers where slug in ('mtn', 'airtel', 'glo', '9mobile');
create table estabelecimentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  endereco text,
  cidade text,
  status text not null default 'aberto' check (status in ('aberto','fechado')),
  owner_id uuid references auth.users(id) on delete cascade not null,
  criado_em timestamptz default now()
);

alter table estabelecimentos enable row level security;
create policy "owner acessa proprio estabelecimento"
  on estabelecimentos for all
  using (owner_id = auth.uid());

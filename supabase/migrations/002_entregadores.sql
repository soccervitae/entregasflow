create table entregadores (
  id uuid primary key default gen_random_uuid(),
  estabelecimento_id uuid references estabelecimentos(id) on delete cascade not null,
  nome text not null,
  telefone text,
  veiculo text check (veiculo in ('moto','bike','carro','a_pe')),
  status text not null default 'livre' check (status in ('livre','em_rota','inativo')),
  user_id uuid references auth.users(id) on delete set null,
  criado_em timestamptz default now()
);

alter table entregadores enable row level security;
create policy "entregador acessa proprios dados"
  on entregadores for all
  using (
    user_id = auth.uid()
    or estabelecimento_id in (
      select id from estabelecimentos where owner_id = auth.uid()
    )
  );

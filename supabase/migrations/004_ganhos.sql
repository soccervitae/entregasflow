create table ganhos_entregadores (
  id uuid primary key default gen_random_uuid(),
  entregador_id uuid references entregadores(id) on delete cascade not null,
  pedido_id uuid references pedidos(id) on delete cascade not null,
  valor numeric(10,2) not null,
  data date not null default current_date,
  criado_em timestamptz default now(),
  unique(pedido_id)
);

alter table ganhos_entregadores enable row level security;
create policy "entregador acessa proprios ganhos"
  on ganhos_entregadores for all
  using (
    entregador_id in (
      select id from entregadores where user_id = auth.uid()
    )
    or entregador_id in (
      select e.id from entregadores e
      join estabelecimentos est on est.id = e.estabelecimento_id
      where est.owner_id = auth.uid()
    )
  );

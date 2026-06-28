create table pedidos (
  id uuid primary key default gen_random_uuid(),
  estabelecimento_id uuid references estabelecimentos(id) on delete cascade not null,
  numero serial,
  cliente_nome text not null,
  cliente_telefone text,
  endereco_entrega text not null,
  bairro text,
  observacao text,
  itens jsonb not null default '[]',
  subtotal numeric(10,2) not null default 0,
  taxa_entrega numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  forma_pagamento text check (forma_pagamento in ('pix','dinheiro','cartao_credito','cartao_debito')),
  pago_antecipado boolean default false,
  troco_para numeric(10,2),
  status text not null default 'novo'
    check (status in ('novo','em_preparo','pronto','em_rota','entregue','cancelado')),
  entregador_id uuid references entregadores(id) on delete set null,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now(),
  entregue_em timestamptz
);

alter table pedidos enable row level security;
create policy "estabelecimento acessa proprios pedidos"
  on pedidos for all
  using (
    estabelecimento_id in (
      select id from estabelecimentos where owner_id = auth.uid()
    )
  );
create policy "entregador acessa pedidos atribuidos"
  on pedidos for select
  using (
    entregador_id in (
      select id from entregadores where user_id = auth.uid()
    )
  );
create policy "entregador atualiza status do proprio pedido"
  on pedidos for update
  using (
    entregador_id in (
      select id from entregadores where user_id = auth.uid()
    )
  )
  with check (status in ('em_rota','entregue'));

create or replace function atualiza_timestamp()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

create trigger pedido_atualizado
  before update on pedidos
  for each row execute function atualiza_timestamp();

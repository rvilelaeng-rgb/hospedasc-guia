-- Execute este script inteiro no Supabase: SQL Editor → New query → colar → Run

-- 1. Tabela única que guarda a senha do admin + todos os imóveis (em formato JSON)
create table if not exists guide_data (
  id int primary key,
  payload jsonb not null,
  updated_at timestamptz default now()
);

-- 2. Ativa Row Level Security (obrigatório no Supabase)
alter table guide_data enable row level security;

-- 3. Permite que o app (chave "anon") leia e grave os dados.
--    Observação de segurança: a senha do painel é validada dentro do próprio app
--    (é uma trava de uso, não uma autenticação real do Supabase). Isso é suficiente
--    para o uso pretendido (guia de check-in), mas não use este banco para dados
--    sensíveis além do necessário para o guia.
create policy "Permitir leitura pública"
  on guide_data for select
  using (true);

create policy "Permitir gravação pública"
  on guide_data for insert
  with check (true);

create policy "Permitir atualização pública"
  on guide_data for update
  using (true);

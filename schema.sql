-- Script SQL para criação das tabelas no Supabase
-- Acesse o painel do Supabase -> SQL Editor -> Novo Script -> Cole este código e clique em RUN.

-- 1. Criar tabela de Inscrições
CREATE TABLE IF NOT EXISTS public.inscricoes (
    id text PRIMARY KEY,
    nome text NOT NULL,
    email text NOT NULL,
    telefone text NOT NULL,
    data_nascimento date NOT NULL,
    cidade text NOT NULL,
    estado varchar(2) NOT NULL,
    igreja text,
    instrumento_oficina text, -- Nullable se comprar apenas camisa
    nivel_experiencia text, -- Nullable se comprar apenas camisa
    opcao_escolhida text NOT NULL, -- Apenas Inscrição, Apenas Camisa, Inscrição + Camisa
    tipo_participacao text, -- Coral, Orquestra
    detalhe_participacao text, -- Naipe ou Instrumento
    descricao_experiencia text, -- Relato de experiência musical
    hospedagem text, -- Sim/Não
    camisa_estilo text, -- Vinho - TULIP, Preta - CLÁSSICA
    camisa_tipo text, -- Masculino, Feminino (Baby Look)
    camisa_tamanho text, -- PP a XG
    camisa_obs text, -- Tamanhos especiais/observações
    valor_total numeric(10, 2) NOT NULL, -- R$ 20.00, R$ 45.00 ou R$ 65.00
    status text DEFAULT 'Pendente'::text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) para inscrições
ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso RLS para inscrições
CREATE POLICY "Permitir inserção pública de inscrições" ON public.inscricoes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permitir leitura pública das inscrições" ON public.inscricoes FOR SELECT TO public USING (true);
CREATE POLICY "Permitir deleção pública de inscrições" ON public.inscricoes FOR DELETE TO public USING (true);


-- 2. Criar tabela Financeira
CREATE TABLE IF NOT EXISTS public.financeiro (
    id text PRIMARY KEY,
    descricao text NOT NULL,
    tipo text NOT NULL CHECK (tipo IN ('Entrada', 'Saída')),
    centro_custo text NOT NULL CHECK (centro_custo IN ('Semana de Musica', 'Loja', 'Equipe')),
    valor numeric(10, 2) NOT NULL,
    data date NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) para financeiro
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso RLS para financeiro
CREATE POLICY "Permitir inserção pública de transações" ON public.financeiro FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permitir leitura pública de transações" ON public.financeiro FOR SELECT TO public USING (true);
CREATE POLICY "Permitir deleção pública de transações" ON public.financeiro FOR DELETE TO public USING (true);

-- 3. Criar tabela de Vídeos de Apresentação
CREATE TABLE IF NOT EXISTS public.videos_apresentacao (
    id text PRIMARY KEY,
    titulo text NOT NULL,
    descricao text,
    url text NOT NULL,
    youtube_id text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) para videos_apresentacao
ALTER TABLE public.videos_apresentacao ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso RLS para videos_apresentacao
CREATE POLICY "Permitir inserção pública de videos" ON public.videos_apresentacao FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permitir leitura pública de videos" ON public.videos_apresentacao FOR SELECT TO public USING (true);
CREATE POLICY "Permitir deleção pública de videos" ON public.videos_apresentacao FOR DELETE TO public USING (true);

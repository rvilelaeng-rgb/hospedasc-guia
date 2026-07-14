# Hospeda SC — Guia do Hóspede (versão para produção)

Este é o projeto convertido para rodar fora do Claude, com um banco de dados real
(Supabase) no lugar do armazenamento interno do artefato. Siga a Etapa A abaixo
com calma — é só configuração, sem precisar escrever código.

---

## Etapa A — Criar o banco de dados (Supabase)

### A.1 — Criar a conta e o projeto

1. Acesse **https://supabase.com** e clique em **"Start your project"**.
2. Crie uma conta (dá para usar login do GitHub ou e-mail/senha).
3. Clique em **"New project"**.
4. Preencha:
   - **Name**: `hospedasc-guia` (ou o nome que preferir)
   - **Database Password**: crie uma senha forte e **guarde ela** (não é a senha do painel do app, é a senha do banco de dados — só será pedida em situações raras)
   - **Region**: escolha a mais próxima, ex.: `South America (São Paulo)`
5. Clique em **"Create new project"** e aguarde ~1–2 minutos enquanto o Supabase prepara o projeto.

### A.2 — Criar a tabela de dados

1. No menu lateral esquerdo, clique no ícone **"SQL Editor"**.
2. Clique em **"New query"**.
3. Abra o arquivo **`supabase-setup.sql`** (está junto com este projeto), copie todo o conteúdo e cole na tela do SQL Editor.
4. Clique em **"Run"** (ou `Ctrl/Cmd + Enter`).
5. Deve aparecer "Success. No rows returned" — pronto, a tabela `guide_data` foi criada.

### A.3 — Criar o espaço para as fotos dos imóveis

1. No menu lateral, clique em **"Storage"**.
2. Clique em **"New bucket"**.
3. Nome do bucket: `property-photos` (exatamente assim, é o nome que o código espera).
4. Marque a opção **"Public bucket"** (assim as fotos aparecem para os hóspedes sem precisar de login).
5. Clique em **"Create bucket"**.
6. Ainda dentro do bucket `property-photos`, vá em **"Policies"** → **"New policy"** → escolha o modelo **"Allow access to everyone"** (ou crie uma policy permitindo `INSERT` e `SELECT` para o público) e salve. Isso permite que o admin envie fotos direto pelo navegador.

### A.4 — Pegar as chaves de acesso

O Supabase mudou recentemente esse menu — hoje existem dois caminhos:

**Caminho mais fácil:**
1. Na página do seu projeto, clique no botão **"Connect"** (geralmente no topo).
2. Vai abrir uma janela já mostrando a **Project URL** e a chave de acesso, prontas para copiar.

**Caminho pelo menu de configurações:**
1. No menu lateral, clique no ícone de engrenagem **"Settings"**.
2. Clique em **"API Keys"**.
3. Você vai ver uma ou duas abas:
   - **"Legacy API Keys"** → copie a chave **`anon` `public`** (começa com `eyJ...`).
   - **"Publishable and secret API Keys"** (projetos mais novos) → copie a **"Publishable key"** (começa com `sb_publishable_...`) — ela substitui a `anon key` e funciona do mesmo jeito para este projeto.
4. A **Project URL** (`https://xxxxxxxx.supabase.co`) aparece no topo dessa mesma página.

Guarde os dois valores — vamos usar no próximo passo. **Nunca use a "service_role" / "secret key"** neste projeto (essa é só para uso em servidor, nunca no navegador).

### A.5 — Configurar o projeto com suas chaves

1. Dentro da pasta deste projeto, encontre o arquivo **`.env.example`**.
2. Faça uma cópia dele e renomeie para **`.env`** (sem o "example").
3. Abra o `.env` e preencha:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...sua-chave-aqui
   ```
4. Salve o arquivo.

### A.6 — Instalar e testar localmente

Você vai precisar do **Node.js** instalado no seu computador (se não tiver, baixe em **https://nodejs.org** — a versão "LTS").

1. Abra o terminal (Prompt de Comando/PowerShell no Windows, Terminal no Mac) dentro da pasta do projeto.
2. Rode:
   ```
   npm install
   ```
   (isso baixa as bibliotecas necessárias — pode levar 1–2 minutos)
3. Depois rode:
   ```
   npm run dev
   ```
4. Vai aparecer um endereço tipo `http://localhost:5173` — abra no navegador.
5. Deve aparecer a tela **"Configurar seu painel"**. Se aparecer, o Supabase está conectado corretamente! 🎉

Se der erro de conexão, confira:
- O arquivo se chama exatamente `.env` (não `.env.example` nem `.env.txt`)
- As chaves foram coladas sem espaços extras
- Você rodou `npm install` antes de `npm run dev`

> 💡 **Não tem confiança com terminal?** Você pode pedir para o **Claude Code** (o app de desenvolvimento da Anthropic) rodar esses comandos para você — é só apontar a pasta do projeto e pedir "instale as dependências e rode o projeto".

---

## Etapa B — Publicar o site (hospedagem)

Depois que a Etapa A estiver funcionando localmente:

1. Crie um repositório no **GitHub** (github.com) e suba esta pasta do projeto para lá (pelo site do GitHub mesmo, arrastando os arquivos, ou via `git push` se souber usar).
2. Acesse **https://netlify.com**, crie uma conta, clique em **"Add new site" → "Import an existing project"** e conecte com o repositório do GitHub.
3. Nas configurações de build, o Netlify deve detectar automaticamente:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Importante**: antes de publicar, adicione as mesmas variáveis do `.env` nas configurações do Netlify (**Site settings → Environment variables**) — `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
5. Clique em **"Deploy site"**. Em 1–2 minutos você terá uma URL pública (tipo `hospedasc-guia.netlify.app`).

## Etapa C — Colocar no seu domínio

1. Em **Netlify → Domain settings → Add custom domain**, digite `guia.hospedasc.com.br`.
2. O Netlify vai te dar um registro para configurar no seu provedor de domínio (Registro.br ou onde o domínio estiver registrado) — geralmente um **CNAME** apontando para o endereço da Netlify.
3. Adicione esse registro no painel de DNS do domínio.
4. Aguarde a propagação (pode levar de minutos a poucas horas) e o site estará em `guia.hospedasc.com.br`.

---

## Primeiro acesso depois de publicado

Ao abrir o site pela primeira vez, ele vai pedir para você **criar sua própria senha de admin** (não existe senha padrão). Depois disso, use "Área do anfitrião" para cadastrar os imóveis e copiar o link único de cada um para enviar aos hóspedes.

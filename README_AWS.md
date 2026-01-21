
# Portfólio CloudDev - AWS S3 Edition

**Arquiteto:** Edivaldo Junior
**Versão:** 2.1 (Production Ready)

Este projeto foi refatorado para funcionar sem backend Node.js, utilizando o armazenamento local do navegador para persistência de dados. Isso permite hospedagem direta no AWS S3 ou Vercel.

---

## 🚨 PERGUNTA FREQUENTE: Qual link eu compartilho?

**NÃO COMPARTILHE** o link que termina em `.webcontainer.io` ou `localhost:5173`.
*   Este link é o seu ambiente de desenvolvimento privado.
*   Ele deixa de funcionar assim que você fecha o editor.

**PARA COMPARTILHAR O SITE:**
Você precisa fazer o processo de **BUILD** e hospedar a pasta gerada.

---

## Passo a Passo para Gerar o Site Real (Build)

1. **Parar o servidor atual:**
   Se o terminal estiver rodando, clique nele e aperte `Ctrl + C`.

2. **Gerar a pasta `dist`:**
   Digite o comando abaixo e aperte Enter:
   ```bash
   npm run build
   ```
   *O sistema vai criar uma nova pasta chamada `dist` na lista de arquivos à esquerda.*

3. **Publicar (Deploy):**

   ### Opção A: AWS S3 (Profissional)
   1. Acesse seu console AWS S3.
   2. Crie um Bucket (ex: `portfolio-edivaldo`) e habilite "Static Website Hosting" nas propriedades.
   3. Na aba "Permissões", desmarque "Block all public access" e adicione uma Bucket Policy de leitura pública.
   4. **Upload:** Faça o upload de **todo o conteúdo de dentro da pasta `dist`** para a raiz do bucket.
   5. O link será algo como: `http://portfolio-edivaldo.s3-website-us-east-1.amazonaws.com`

   ### Opção B: Netlify Drop (Teste Rápido)
   1. Localize a pasta `dist` no seu computador (se você baixou o projeto).
   2. Se estiver usando o editor online, você precisará baixar o projeto clicando no ícone de "Download" no topo esquerdo.
   3. Acesse `app.netlify.com/drop`.
   4. Arraste a pasta `dist` para lá.
   5. Ele gerará um link HTTPS seguro e permanente em segundos.

---

## Credenciais Padrão (Simulação)
Como não há backend real neste modo estático, use estas credenciais para testar:
- **Admin:** `admin@cloud.com` / `admin123`
- **Cadastro:** Você pode clicar em "Cadastrar Novo Aluno" na tela de login; ele salvará no navegador do usuário.

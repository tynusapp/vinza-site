# Vinza Site

Landing page estática do Vinza, pronta para GitHub Pages.

## Conteúdo do produto

A página apresenta adega, Sommelier, Vinza Match e ofertas, além das novidades
em testes internos: descobertas guiadas, diário, histórico e lembretes locais.
As descobertas têm destaque próprio; os três guias mostrados são exemplos
ilustrativos dos guias iniciais. O FAQ explica uso sem abrir garrafas, registros
fora da adega, permissões dos lembretes e disponibilidade por versão.

O site é estático: o painel **Gerenciar descobertas** do app altera o catálogo
da API, mas não atualiza os cartões desta página. Ao mudar os exemplos ou a
disponibilidade dos recursos, ajuste `index.html`. As descrições de dados e de
funcionalidades também estão em `privacy.html` e `terms.html`.

Eventos e parâmetros dos links, seções e FAQ estão em `ANALYTICS.md`.

Para conferir localmente, execute `python3 -m http.server 8765` neste diretório
e abra `http://localhost:8765`. Verifique a página em telas de celular e desktop.

## Publicação

1. Publique estes arquivos na branch `main` do repositório `tynusapp/vinza-site`.
2. Em **Settings → Pages**, selecione **Deploy from a branch**, `main` e `/ (root)`.
3. Em **Custom domain**, informe `vinza.app`.
4. Após a validação do DNS, habilite **Enforce HTTPS**.

O arquivo `CNAME` já contém o domínio e as páginas legais ficam disponíveis em:

- `https://vinza.app/privacy.html`
- `https://vinza.app/terms.html`

O catálogo Maissa agora é hospedado na VPS em
`https://catalogo.maissamansano.fst.br/`, com painel em `/admin`.
O endereço antigo `https://vinza.app/catalogo/` encaminha para o novo domínio.

## Analytics do site

1. No Firebase, adicione um app Web ao projeto do Vinza.
2. Ative o Google Analytics e crie o fluxo Web para `https://vinza.app`.
3. Copie o **Measurement ID** (`G-...`) do fluxo.
4. Cole o valor em `analytics-config.js`.

O Google Analytics só é carregado depois do consentimento. A escolha fica salva
localmente e pode ser revista pelo link **Preferências de cookies**.

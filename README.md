# Vinza Site

Landing page estática do Vinza, pronta para GitHub Pages.

## Publicação

1. Publique estes arquivos na branch `main` do repositório `tynusapp/vinza-site`.
2. Em **Settings → Pages**, selecione **Deploy from a branch**, `main` e `/ (root)`.
3. Em **Custom domain**, informe `vinza.app`.
4. Após a validação do DNS, habilite **Enforce HTTPS**.

O arquivo `CNAME` já contém o domínio e as páginas legais ficam disponíveis em:

- `https://vinza.app/privacy.html`
- `https://vinza.app/terms.html`

## Analytics do site

1. No Firebase, adicione um app Web ao projeto do Vinza.
2. Ative o Google Analytics e crie o fluxo Web para `https://vinza.app`.
3. Copie o **Measurement ID** (`G-...`) do fluxo.
4. Cole o valor em `analytics-config.js`.

O Google Analytics só é carregado depois do consentimento. A escolha fica salva
localmente e pode ser revista pelo link **Preferências de cookies**.

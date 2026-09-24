# Analytics do site

Os eventos são enviados pelo `trackEvent` de `script.js` somente quando o visitante aceita Analytics e há um Measurement ID configurado. Os links funcionam independentemente do Analytics.

## Download para Android

- `android_download_clicked`: clique para abrir o Google Play; `source` identifica `site_hero` ou `site_download_section`. Substitui `beta_signup_clicked`.
- `site_navigation_clicked`: o botão “Baixar para Android” do cabeçalho usa `destination: download` e `location: header`.
- `site_section_viewed`: a seção de download usa `section: download`.

Esses eventos medem a navegação e os cliques, não a instalação do app. Nenhum URL ou dado pessoal é enviado nos parâmetros.

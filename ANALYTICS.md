# Analytics do site

Os eventos são enviados pelo `trackEvent` de `script.js` somente quando o visitante aceita Analytics e há um Measurement ID configurado. Os links funcionam independentemente do Analytics.

As preferências podem alternar entre aceite e recusa na mesma visita. A recusa
desativa a propriedade no Google Analytics; um novo aceite restaura o
consentimento. Se o navegador bloquear o armazenamento local, a escolha vale
apenas para a visita atual e começa sem coleta na próxima visita.

## Download para Android

- `android_download_clicked`: clique para abrir o Google Play; `source` identifica `site_hero`, `site_discoveries` ou `site_download_section`. Substitui `beta_signup_clicked`.
- `site_navigation_clicked`: o botão “Baixar para Android” do cabeçalho usa `destination: download` e `location: header`.
- `site_section_viewed`: a seção de download usa `section: download`.

Esses eventos medem a navegação e os cliques, não a instalação do app. Nenhum URL ou dado pessoal é enviado nos parâmetros.

## Descobertas, recursos e dúvidas

- `site_navigation_clicked`: links do cabeçalho, hero e rodapé; `destination` usa `recursos`, `descobertas`, `como_funciona`, `vinza_match`, `duvidas` ou `download`; `location` usa `header`, `hero` ou `footer`.
- `site_section_viewed`: visualização das seções; `section` usa os IDs fixos `inicio`, `descobertas`, `recursos`, `inteligencia`, `como-funciona`, `duvidas` ou `download`.
- `site_faq_toggled`: abertura ou fechamento de uma resposta; `question` usa `guides_without_bottle`, `diary_without_cellar`, `local_reminders` ou `feature_availability`; `expanded` é um booleano.

Os cartões e a prévia do celular são ilustrações, sem ações de progresso ou
registro no diário. O site não recebe o catálogo administrativo da API.
Não enviamos títulos de guias editados, comentários, registros ou outros textos
livres ao Analytics. A medição continua condicionada ao consentimento.

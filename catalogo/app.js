const byId = (id) => document.getElementById(id);
function el(tag, content, className) {
  const node = document.createElement(tag);
  if (content) node.textContent = content;
  if (className) node.className = className;
  return node;
}
const norm = (value) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
fetch(document.querySelector('meta[name="catalog-api"]').content).then((response) => {
  if (!response.ok) throw new Error();
  return response.json();
}).then((products) => {
  const category = byId('categoria');
  const size = byId('tamanho');
  const search = byId('busca');
  const grade = byId('grade');
  for (const name of [...new Set(products.map((p) => p.category))].sort()) {
    category.add(new Option(name, name));
  }
  function render() {
    grade.replaceChildren();
    const query = norm(search.value.trim());
    let count = 0;
    for (const product of products) {
      if (category.value && category.value !== product.category) continue;
      const variants = product.variants.filter(({ color, size: variantSize }) =>
        (!size.value || size.value === variantSize) &&
        norm([product.name, product.ref, product.category, color].join(' ')).includes(query));
      if (!variants.length) continue;
      count++;
      const card = el('article', '', 'card');
      if (product.photo) {
        const img = el('img');
        img.src = product.photo;
        img.alt = product.name + ' em foto de referência da DiCorpo';
        img.loading = 'lazy';
        img.addEventListener('error', () => img.remove());
        card.append(img);
      }
      const info = el('section');
      info.append(el('p', 'REF. ' + product.ref, 'eyebrow'), el('h3', product.name));
      if (product.description) info.append(el('p', product.description));
      if (product.photo) info.append(el('p', 'Foto do modelo · confira as cores da grade', 'caption'));
      const list = el('ul');
      for (const variant of variants) {
        const row = el('li');
        row.append(el('span', variant.color), el('strong', variant.size === 'U' ? 'Único' : variant.size));
        list.append(row);
      }
      info.append(list);
      card.append(info);
      grade.append(card);
    }
    byId('total').textContent = count === 0 ? 'Nenhuma peça encontrada com esses filtros.' :
      count === 1 ? '1 referência' : count + ' referências';
  }
  for (const field of [search, category, size]) field.addEventListener('input', render);
  render();
}).catch(() => { byId('total').textContent = 'Não foi possível carregar o catálogo. Atualize a página para tentar novamente.'; });

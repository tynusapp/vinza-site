const byId = (id) => document.getElementById(id);
function el(tag, content, className) {
  const node = document.createElement(tag);
  if (content) node.textContent = content;
  if (className) node.className = className;
  return node;
}
const norm = (value) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const catalogUrl = new URL(document.querySelector('meta[name="catalog-api"]').content, location.href);
const photoBase = new URL('../', catalogUrl);

function carousel(product) {
  const photos = product.photos ?? (product.photo ? [product.photo] : []);
  const gallery = el('div', '', 'carousel');
  gallery.setAttribute('role', 'group');
  gallery.setAttribute('aria-roledescription', 'carrossel');
  gallery.setAttribute('aria-label', 'Fotos de ' + product.name);
  if (!photos.length) {
    gallery.append(el('div', 'Foto em breve', 'photo-placeholder'));
    return gallery;
  }
  const track = el('div', '', 'carousel-track');
  track.id = 'fotos-' + product.ref;
  track.tabIndex = 0;
  track.setAttribute('aria-label', 'Deslize para ver as fotos de ' + product.name);
  photos.forEach((photo, index) => {
    const slide = el('div', '', 'carousel-slide');
    const img = el('img');
    img.src = new URL(photo, photoBase).href;
    img.alt = product.name + ' · foto ' + (index + 1) + ' de ' + photos.length;
    img.loading = 'lazy';
    img.addEventListener('error', () => slide.replaceChildren(el('div', 'Foto indisponível', 'photo-placeholder')));
    slide.append(img);
    track.append(slide);
  });
  gallery.append(track);
  if (photos.length > 1) {
    const controls = el('div', '', 'carousel-controls');
    const previous = el('button', '←');
    const next = el('button', '→');
    const count = el('span');
    count.setAttribute('aria-live', 'polite');
    let index = 0;
    function update() {
      index = Math.max(0, Math.min(photos.length - 1, Math.round(track.scrollLeft / (track.clientWidth || 1))));
      count.textContent = (index + 1) + ' / ' + photos.length;
      previous.disabled = index === 0;
      next.disabled = index === photos.length - 1;
    }
    for (const [button, label, direction] of [[previous, 'Foto anterior', -1], [next, 'Próxima foto', 1]]) {
      button.type = 'button';
      button.setAttribute('aria-label', label + ' de ' + product.name);
      button.setAttribute('aria-controls', track.id);
      button.addEventListener('click', () => track.scrollTo({ left: (index + direction) * track.clientWidth, behavior: 'smooth' }));
    }
    track.addEventListener('scroll', update, { passive: true });
    controls.append(previous, count, next);
    gallery.append(controls);
    update();
  }
  return gallery;
}

fetch(catalogUrl).then((response) => {
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
      card.append(carousel(product));
      const info = el('section');
      info.append(el('p', 'REF. ' + product.ref, 'eyebrow'), el('h3', product.name));
      if (product.description) info.append(el('p', product.description));
      if (product.photos?.length || product.photo) info.append(el('p', 'Confira as cores e os tamanhos disponíveis abaixo.', 'caption'));
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

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');

function page({ consent = null, blockedStorage = false, configured = true } = {}) {
  const observers = [];
  const scripts = [];
  const sections = [{ id: 'inicio' }, { id: 'recursos' }];
  const banner = { hidden: true };
  function element(dataset) {
    return { dataset, addEventListener(type, callback) { this[type] = callback; } };
  }
  const accept = element({ consent: 'granted' });
  const decline = element({ consent: 'denied' });
  const download = element({ analyticsEvent: 'android_download_clicked', analyticsSource: 'site_hero' });
  class Observer {
    constructor(callback) {
      this.callback = callback;
      this.observed = new Set();
      observers.push(this);
    }
    observe(target) { this.observed.add(target); }
    unobserve(target) { this.observed.delete(target); }
    disconnect() { this.observed.clear(); }
    show(target) {
      if (this.observed.has(target)) this.callback([{ isIntersecting: true, target }]);
    }
  }
  const document = {
    querySelector(selector) { return selector === '[data-consent-banner]' ? banner : null; },
    querySelectorAll(selector) {
      if (selector === '[data-consent]') return [accept, decline];
      if (selector === '[data-analytics-event]') return [download];
      if (selector === 'main section[id]') return sections;
      return [];
    },
    createElement() { return {}; },
    head: { appendChild(script) { scripts.push(script); } },
  };
  const window = {
    VINZA_ANALYTICS: configured ? { measurementId: 'G-TEST123' } : {},
    IntersectionObserver: Observer,
    matchMedia: () => ({ matches: true }),
  };
  const context = vm.createContext({ window, document, IntersectionObserver: Observer,
    localStorage: {
      getItem() { if (blockedStorage) throw new Error('Storage bloqueado'); return consent; },
      setItem(key, value) { if (blockedStorage) throw new Error('Storage bloqueado'); consent = value; },
    },
  });
  vm.runInContext(script, context);
  return { window, observers, sections, scripts, accept, decline, download, banner,
    events: () => (window.dataLayer || []).filter(args => args[0] === 'event'),
  };
}

test('sem consentimento não carrega Google nem observa seções ou envia cliques', () => {
  const p = page();
  p.download.click();
  assert.equal(p.banner.hidden, false);
  assert.equal(p.scripts.length, 0);
  assert.equal(p.observers.length, 0);
  assert.equal(p.events().length, 0);
});

test('ao aceitar registra a seção atualmente visível uma vez por página', () => {
  const p = page();
  p.accept.click();
  assert.equal(p.scripts.length, 1);
  const observer = p.observers[0];
  assert.equal(observer.observed.has(p.sections[0]), true);
  observer.show(p.sections[0]);
  observer.callback([{ isIntersecting: true, target: p.sections[0] }]);
  const views = p.events().filter(event => event[1] === 'site_section_viewed');
  assert.equal(views.length, 1);
  assert.equal(views[0][2].section, 'inicio');
});

test('recusar interrompe observação, cliques e callbacks que já estavam pendentes', () => {
  const p = page({ consent: 'granted' });
  const observer = p.observers[0];
  p.decline.click();
  p.download.click();
  observer.callback([{ isIntersecting: true, target: p.sections[0] }]);
  assert.equal(observer.observed.size, 0);
  assert.equal(p.events().length, 0);
  assert.equal(p.window['ga-disable-G-TEST123'], true);
});

test('novo aceite observa seções restantes sem repetir as já registradas', () => {
  const p = page({ consent: 'granted' });
  const observer = p.observers[0];
  observer.show(p.sections[0]);
  p.decline.click();
  p.accept.click();
  assert.equal(observer.observed.has(p.sections[0]), false);
  assert.equal(observer.observed.has(p.sections[1]), true);
  observer.show(p.sections[1]);
  assert.equal(p.scripts.length, 1);
  assert.equal(p.window['ga-disable-G-TEST123'], false);
  const sections = p.events().filter(event => event[1] === 'site_section_viewed')
    .map(event => event[2].section);
  assert.deepEqual([...sections], ['inicio', 'recursos']);
});

test('armazenamento bloqueado mantém consentimento apenas durante a visita', () => {
  const p = page({ blockedStorage: true });
  p.accept.click();
  p.download.click();
  assert.equal(p.events().filter(event => event[1] === 'android_download_clicked').length, 1);
  p.decline.click();
  p.download.click();
  assert.equal(p.events().filter(event => event[1] === 'android_download_clicked').length, 1);
  assert.equal(page({ blockedStorage: true }).scripts.length, 0);
});

test('sem Measurement ID não envia eventos nem observa seções', () => {
  const p = page({ consent: 'granted', configured: false });
  p.accept.click();
  p.download.click();
  assert.equal(p.scripts.length, 0);
  assert.equal(p.observers.length, 0);
  assert.equal(p.events().length, 0);
});

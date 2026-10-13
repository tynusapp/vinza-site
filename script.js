const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');
const analyticsConfig = window.VINZA_ANALYTICS || {};
const analyticsConfigured = /^G-[A-Z0-9]+$/i.test(analyticsConfig.measurementId || '');
const consentKey = 'vinza_analytics_consent';
let analyticsConsent = null;
try {
  analyticsConsent = localStorage.getItem(consentKey);
} catch {}

function hasAnalyticsConsent() {
  return analyticsConsent === 'granted';
}

function loadAnalytics() {
  if (!analyticsConfigured || window.vinzaAnalyticsLoaded) return;
  window.vinzaAnalyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', analyticsConfig.measurementId, {
    anonymize_ip: true,
    send_page_view: true,
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsConfig.measurementId)}`;
  document.head.appendChild(script);
}

function trackEvent(name, parameters = {}) {
  if (!hasAnalyticsConsent() || !analyticsConfigured) return;
  try {
    loadAnalytics();
    window.gtag('event', name, parameters);
  } catch {}
}

if (hasAnalyticsConsent()) loadAnalytics();

if (menuButton && navLinks) {
  menuButton.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if (open) trackEvent('site_menu_opened');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    });
  });
}

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const consentBanner = document.querySelector('[data-consent-banner]');
if (consentBanner && analyticsConfigured && !analyticsConsent) {
  consentBanner.hidden = false;
}

document.querySelectorAll('[data-consent]').forEach((button) => {
  button.addEventListener('click', () => {
    const consent = button.dataset.consent;
    const analyticsWasLoaded = window.vinzaAnalyticsLoaded;
    analyticsConsent = consent;
    try {
      localStorage.setItem(consentKey, consent);
    } catch {}
    window[`ga-disable-${analyticsConfig.measurementId}`] = consent !== 'granted';
    if (consent === 'granted') {
      loadAnalytics();
      if (window.vinzaAnalyticsLoaded) {
        window.gtag('consent', 'update', { analytics_storage: 'granted' });
      }
      trackEvent('analytics_consent_updated', { enabled: true });
      startSectionTracking();
    } else if (analyticsWasLoaded) {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
    if (consent !== 'granted') sectionObserver?.disconnect();
    if (consentBanner) consentBanner.hidden = true;
  });
});

document.querySelectorAll('[data-analytics-preferences]').forEach((button) => {
  button.addEventListener('click', () => {
    if (consentBanner && analyticsConfigured) consentBanner.hidden = false;
  });
});

document.querySelectorAll('[data-nav-destination]').forEach((link) => {
  link.addEventListener('click', () => {
    trackEvent('site_navigation_clicked', {
      destination: link.dataset.navDestination,
      location: link.dataset.navLocation || 'header',
    });
  });
});

document.querySelectorAll('[data-analytics-event]').forEach((link) => {
  link.addEventListener('click', () => {
    trackEvent(link.dataset.analyticsEvent, {
      source: link.dataset.analyticsSource,
    });
  });
});

document.querySelectorAll('[data-legal-link]').forEach((link) => {
  link.addEventListener('click', () => {
    trackEvent('site_legal_link_clicked', {
      document: link.dataset.legalLink,
    });
  });
});

document.querySelectorAll('[data-outbound-destination]').forEach((link) => {
  link.addEventListener('click', () => {
    trackEvent('site_outbound_clicked', {
      destination: link.dataset.outboundDestination,
    });
  });
});

document.querySelectorAll('[data-faq]').forEach((item) => {
  item.addEventListener('toggle', () => {
    trackEvent('site_faq_toggled', {
      question: item.dataset.faq,
      expanded: item.open,
    });
  });
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

const trackedSections = document.querySelectorAll('main section[id]');
const viewedSections = new Set();
let sectionObserver;

function startSectionTracking() {
  if (!hasAnalyticsConsent() || !analyticsConfigured || !('IntersectionObserver' in window)) return;
  sectionObserver ??= new IntersectionObserver((entries) => {
    if (!hasAnalyticsConsent()) return;
    entries.forEach((entry) => {
      if (!entry.isIntersecting || viewedSections.has(entry.target.id)) return;
      trackEvent('site_section_viewed', { section: entry.target.id });
      viewedSections.add(entry.target.id);
      sectionObserver.unobserve(entry.target);
    });
  }, { threshold: 0.35 });
  trackedSections.forEach((section) => {
    if (!viewedSections.has(section.id)) sectionObserver.observe(section);
  });
}

startSectionTracking();

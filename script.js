const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');
const analyticsConfig = window.VINZA_ANALYTICS || {};
const analyticsConfigured = /^G-[A-Z0-9]+$/i.test(analyticsConfig.measurementId || '');
const consentKey = 'vinza_analytics_consent';

function hasAnalyticsConsent() {
  return localStorage.getItem(consentKey) === 'granted';
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
  loadAnalytics();
  window.gtag('event', name, parameters);
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
if (consentBanner && analyticsConfigured && !localStorage.getItem(consentKey)) {
  consentBanner.hidden = false;
}

document.querySelectorAll('[data-consent]').forEach((button) => {
  button.addEventListener('click', () => {
    const consent = button.dataset.consent;
    const analyticsWasLoaded = window.vinzaAnalyticsLoaded;
    localStorage.setItem(consentKey, consent);
    if (consent === 'granted') {
      loadAnalytics();
      trackEvent('analytics_consent_updated', { enabled: true });
    } else if (analyticsWasLoaded) {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
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
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      trackEvent('site_section_viewed', { section: entry.target.id });
      sectionObserver.unobserve(entry.target);
    });
  }, { threshold: 0.35 });
  trackedSections.forEach((section) => sectionObserver.observe(section));
}

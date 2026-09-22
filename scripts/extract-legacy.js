/**
 * One-time migration helper: reads the ORIGINAL static HTML pages (backed up
 * under legacy/*.html) and extracts structured content into
 * scripts/legacy-content.json, which server/seed.js then loads to populate
 * the database. This lets the CMS launch with the exact content that was
 * live on the static site, instead of retyping it by hand.
 */
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const LEGACY_DIR = path.join(__dirname, '..', 'legacy');
const OUT = path.join(__dirname, 'legacy-content.json');

function load(file) {
  return cheerio.load(fs.readFileSync(path.join(LEGACY_DIR, file), 'utf8'));
}

function text($el) {
  return $el.text().trim().replace(/\s+/g, ' ');
}

const result = {};

/* ---------------- index.html ---------------- */
{
  const $ = load('index.html');

  result.home = {
    hero_eyebrow: text($('.hero__inner .eyebrow')).replace(/^•\s*/, ''),
    hero_title_line1: text($('.hero__title .line:nth-child(1)')),
    hero_title_line2_html: $('.hero__title .line:nth-child(2) span[data-reveal]').html().trim(),
    hero_lead: text($('.hero__lead')),
    hero_cta_primary: text($('.hero__cta .btn--primary span')),
    hero_cta_secondary: text($('.hero__cta .btn--ghost')),
    hero_stats: $('.hero__stats .stat').map((i, el) => {
      const $el = $(el);
      return {
        num: $el.find('[data-count]').first().attr('data-count'),
        suffix: text($el.find('.stat__num')).replace(/^0+/, '').replace(/^\d+/, ''),
        label: text($el.find('.stat__label')),
      };
    }).get(),
    about_kicker: text($('#about .section-kicker')),
    about_title_html: $('#about .section-title').html().trim(),
    about_paragraphs: $('#about .about__text > p.reveal').map((i, el) => $(el).html().trim()).get(),
    about_quote: text($('.about__card blockquote')),
    about_quote_author: text($('.about__signature strong')),
    about_quote_role: text($('.about__signature span')),
    about_photo_stat_num: text($('.about__photo-stat strong')),
    about_photo_stat_label: text($('.about__photo-stat span')),
    pillars: $('.pillars > li').map((i, el) => {
      const $el = $(el);
      return {
        letter: text($el.find('.pillars__icon')),
        title: text($el.find('h3')),
        text: text($el.find('p')),
      };
    }).get(),
    activities_kicker: text($('#activities .section-kicker')),
    activities_title_html: $('#activities .section-title').html().trim(),
    activities_tagline: text($('.activities__tagline')),
    activities_desc: text($('.activities__desc')),
    activities: $('.act-card').map((i, el) => {
      const $el = $(el);
      return {
        icon_svg: $el.find('.act-card__icon svg').parent().html().match(/<svg[\s\S]*?<\/svg>/)[0],
        title: text($el.find('h3')),
        text: text($el.find('p')),
      };
    }).get(),
    realisations_kicker: text($('#realisations .section-kicker')),
    realisations_title_html: $('#realisations .section-title').html().trim(),
    realisations_desc: text($('#realisations .section-sub')),
    realisations_stats: $('.realisations__stats .rstat').map((i, el) => {
      const $el = $(el);
      return {
        num: $el.find('[data-count]').attr('data-count'),
        suffix: text($el.find('.rstat__num')).replace(/^0+/, '').replace(/^\d+/, ''),
        label: text($el.find('.rstat__label')),
      };
    }).get(),
    contact_kicker: text($('#contact .section-kicker')),
    contact_title_html: $('#contact .section-title').html().trim(),
    contact_desc: text($('#contact .section-sub')),
    footer_tagline: text($('.footer__brand p')),
    clients_kicker: text($('#clients .section-kicker')),
    clients_title_html: $('#clients .section-title').html().trim(),
    clients_desc: text($('#clients .section-sub')),
    services_kicker: text($('#services .section-kicker')),
    services_title_html: $('#services .section-title').html().trim(),
    services_desc: text($('#services .section-sub')),
  };

  result.gallery = $('#gallery .gallery__item').map((i, el) => {
    const $el = $(el);
    return {
      image: $el.find('img').attr('src'),
      alt: $el.find('img').attr('alt') || '',
      category: $el.attr('data-cat'),
      wide: $el.hasClass('gallery__item--wide'),
      tall: $el.hasClass('gallery__item--tall'),
      tag: text($el.find('.gallery__tag')),
      title: text($el.find('h3')),
      subtitle: text($el.find('.gallery__cap p')),
    };
  }).get();

  result.clients = [];
  const seen = new Set();
  $('.clients__track .client-logo img').each((i, el) => {
    const src = $(el).attr('src');
    if (seen.has(src)) return;
    seen.add(src);
    result.clients.push({ logo: src, name: $(el).attr('alt') || '' });
  });

  result.faq = $('.faq__item').map((i, el) => {
    const $el = $(el);
    return {
      question: text($el.find('summary span').first()),
      answer_html: $el.find('.faq__body').html().trim(),
    };
  }).get();

  // Services tabs -> training programs, grouped by domain slug
  result.programsByDomain = {};
  $('.services__panels .panel').each((i, panel) => {
    const slug = $(panel).attr('data-panel');
    result.programsByDomain[slug] = $(panel).find('.card').map((j, card) => {
      const $c = $(card);
      return { title: text($c.find('h3')), description: text($c.find('p')) };
    }).get();
  });
}

/* ---------------- formation.html ---------------- */
{
  const $ = load('formation.html');
  result.trainingHero = {
    lead: text($('.formation-hero__lead')),
  };
  result.domains = $('.domain-block').map((i, el) => {
    const $el = $(el);
    return {
      slug: $el.attr('id'),
      num: text($el.find('.domain-block__num')),
      kicker: text($el.find('.domain-block__kicker')),
      name: text($el.find('.domain-block__title')),
      count_label: text($el.find('.domain-block__count')),
      description: text($el.find('.domain-overview__desc')),
      themes: $el.find('.domain-overview__themes li').map((j, li) => $(li).text().trim()).get(),
    };
  }).get();
}

/* ---------------- qui-sommes-nous.html ---------------- */
{
  const $ = load('qui-sommes-nous.html');
  result.about = {
    hero_title_html: $('.about-hero h1').html().trim(),
    hero_quote: text($('.about-hero__quote p')),
    hero_quote_author: text($('.about-hero__quote cite strong')),
    hero_quote_role: text($('.about-hero__quote cite span')),
    mva: $('.mva__card').map((i, el) => {
      const $el = $(el);
      return { tag: text($el.find('.mva__tag')), title: text($el.find('h3')), text: text($el.find('p')) };
    }).get(),
    histoire_kicker: text($('.histoire .section-kicker')),
    histoire_title_html: $('.histoire .section-title').html().trim(),
    histoire_desc: text($('.histoire .section-sub')),
    histoire_photo: $('.histoire__photo img').attr('src'),
    histoire_badge_num: text($('.histoire__photo-badge strong')),
    histoire_badge_label: text($('.histoire__photo-badge span')),
    valeurs: $('.rire__card').map((i, el) => {
      const $el = $(el);
      return { letter: text($el.find('.rire__letter')), title: text($el.find('h3')), text: text($el.find('p')) };
    }).get(),
    stats: $('.about-stats__grid .astat').map((i, el) => {
      const $el = $(el);
      return {
        num: $el.find('[data-count]').attr('data-count'),
        suffix: text($el.find('.astat__num')).replace(/^0+/, '').replace(/^\d+/, ''),
        label: text($el.find('.astat__label')),
      };
    }).get(),
    cta_title_html: $('.about-cta h2').html().trim(),
    cta_text: text($('.about-cta p')),
  };

  result.historySteps = $('.histoire__step').map((i, el) => {
    const $el = $(el);
    return {
      year_label: text($el.find('.histoire__year')),
      title: text($el.find('h3')),
      description: text($el.find('p')),
    };
  }).get();

  result.team = $('.team-card').map((i, el) => {
    const $el = $(el);
    return {
      photo: $el.find('img').attr('src'),
      name: text($el.find('.team-card__name')),
      role: text($el.find('.team-card__role')),
      bio: text($el.find('.team-card__bio')),
    };
  }).get();
}

/* ---------------- contact.html ---------------- */
{
  const $ = load('contact.html');
  result.contact = {
    hero_title_html: $('.contact-left h1').html().trim(),
    hero_lead: text($('.contact-left__lead')),
    email: text($('.cinfo-value a[href^="mailto:"]')).trim(),
    phone: text($('.cinfo-item:nth-child(2) .cinfo-value a')),
    address: $('.cinfo-item:nth-child(3) .cinfo-value').html().replace(/<br\s*\/?>/gi, '\n').trim(),
    hours: text($('.cinfo-item:nth-child(4) .cinfo-value')),
    topics: $('.ctopic').map((i, el) => $(el).text().trim()).get(),
    needs: $('.need-item').map((i, el) => {
      const $el = $(el);
      return { title: text($el.find('h3')), text: text($el.find('p')) };
    }).get(),
  };
}

/* ---------------- legal pages: keep verbatim <main> HTML ---------------- */
result.legal = {};
for (const [slug, file] of [
  ['politique-confidentialite', 'politique-confidentialite.html'],
  ['conditions-utilisation', 'conditions-utilisation.html'],
  ['conformite-donnees', 'conformite-donnees.html'],
]) {
  const $ = load(file);
  result.legal[slug] = {
    title: text($('title')).split('—')[0].trim(),
    main_html: $('main').html().trim(),
  };
}

fs.writeFileSync(OUT, JSON.stringify(result, null, 2), 'utf8');
console.log('Wrote', OUT);
console.log('home programs domains:', Object.keys(result.programsByDomain));
console.log('gallery items:', result.gallery.length, 'clients:', result.clients.length, 'faq:', result.faq.length);
console.log('domains:', result.domains.length, 'team:', result.team.length, 'history steps:', result.historySteps.length);

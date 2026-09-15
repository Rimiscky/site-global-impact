const express = require('express');
const db = require('../db');
const { getPageBlocks, getSettings } = require('../lib/content');

const router = express.Router();

const SETTINGS_KEYS = ['site_title', 'site_tagline', 'contact_email', 'contact_phone', 'contact_address', 'contact_hours', 'meta_description'];

function common() {
  return { settings: getSettings(SETTINGS_KEYS) };
}

router.get('/', (req, res) => {
  const blocks = getPageBlocks('home');
  const clients = db.prepare('SELECT * FROM clients WHERE published = 1 ORDER BY position ASC').all();
  const pillars = blocks.pillars;
  const activities = blocks.activities;
  const domains = db.prepare('SELECT * FROM training_domains WHERE published = 1 ORDER BY position ASC').all();
  const programsByDomain = {};
  for (const d of domains) {
    programsByDomain[d.slug] = db.prepare('SELECT * FROM training_programs WHERE domain_id = ? AND published = 1 ORDER BY position ASC').all(d.id);
  }
  const gallery = db.prepare('SELECT * FROM gallery_items WHERE published = 1 ORDER BY position ASC').all();
  const faq = db.prepare('SELECT * FROM faq_items WHERE published = 1 ORDER BY position ASC').all();
  res.render('pages/home', { ...common(), blocks, clients, pillars, activities, domains, programsByDomain, gallery, faq });
});

router.get('/formation.html', (req, res) => {
  const blocks = getPageBlocks('formation');
  const domains = db.prepare('SELECT * FROM training_domains WHERE published = 1 ORDER BY position ASC').all();
  const programsByDomain = {};
  let totalPrograms = 0;
  for (const d of domains) {
    programsByDomain[d.slug] = db.prepare('SELECT * FROM training_programs WHERE domain_id = ? AND published = 1 ORDER BY position ASC').all(d.id);
    totalPrograms += programsByDomain[d.slug].length;
  }
  res.render('pages/formation', { ...common(), blocks, domains, programsByDomain, totalPrograms });
});

router.get('/qui-sommes-nous.html', (req, res) => {
  const blocks = getPageBlocks('about');
  const team = db.prepare('SELECT * FROM team_members WHERE published = 1 ORDER BY position ASC').all();
  const historySteps = db.prepare('SELECT * FROM history_steps WHERE published = 1 ORDER BY position ASC').all();
  res.render('pages/about', { ...common(), blocks, team, historySteps });
});

router.get('/contact.html', (req, res) => {
  const blocks = getPageBlocks('contact');
  const domains = db.prepare('SELECT * FROM training_domains WHERE published = 1 ORDER BY position ASC').all();
  res.render('pages/contact', { ...common(), blocks, domains });
});

const LEGAL_SLUGS = ['politique-confidentialite', 'conditions-utilisation', 'conformite-donnees'];
for (const slug of LEGAL_SLUGS) {
  router.get(`/${slug}.html`, (req, res) => {
    const page = db.prepare('SELECT * FROM legal_pages WHERE slug = ?').get(slug);
    if (!page) return res.status(404).send('Page introuvable');
    res.render('pages/legal', { ...common(), page });
  });
}

module.exports = router;

const express = require('express');
const db = require('../db');
const { findByEmail, verifyPassword, updatePassword, requireAuth } = require('../lib/auth');
const { PAGES } = require('../lib/blocks');
const { setBlock, getSetting, setSetting } = require('../lib/content');
const { createCrudRouter } = require('../lib/crud');
const { upload, recordMedia, UPLOAD_DIR } = require('../lib/upload');
const trainingRouter = require('./admin-training');
const fs = require('fs');
const path = require('path');

const router = express.Router();

/* ---------------- auth ---------------- */
router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/admin');
  res.render('admin/login', { error: null });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = email ? findByEmail(email) : null;
  if (!user || !verifyPassword(user, password || '')) {
    return res.render('admin/login', { error: 'Identifiants incorrects.' });
  }
  req.session.userId = user.id;
  res.redirect('/admin');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

router.use(requireAuth);
router.use((req, res, next) => {
  res.locals.currentPath = req.path === '/' ? '/admin' : '/admin' + req.path;
  next();
});

/* ---------------- dashboard ---------------- */
router.get('/', (req, res) => {
  const counts = {
    domains: db.prepare('SELECT COUNT(*) c FROM training_domains').get().c,
    programs: db.prepare('SELECT COUNT(*) c FROM training_programs').get().c,
    team: db.prepare('SELECT COUNT(*) c FROM team_members').get().c,
    clients: db.prepare('SELECT COUNT(*) c FROM clients').get().c,
    gallery: db.prepare('SELECT COUNT(*) c FROM gallery_items').get().c,
    faq: db.prepare('SELECT COUNT(*) c FROM faq_items').get().c,
    messages: db.prepare('SELECT COUNT(*) c FROM contact_messages').get().c,
    unreadMessages: db.prepare('SELECT COUNT(*) c FROM contact_messages WHERE is_read = 0').get().c,
  };
  const recentMessages = db.prepare('SELECT * FROM contact_messages ORDER BY id DESC LIMIT 5').all();
  res.render('admin/dashboard', { counts, recentMessages });
});

/* ---------------- account ---------------- */
router.get('/account', (req, res) => {
  res.render('admin/account', { error: null, success: null });
});

router.post('/account', (req, res) => {
  const { current_password, new_password, new_password_confirm } = req.body;
  if (!verifyPassword(req.adminUser, current_password || '')) {
    return res.render('admin/account', { error: 'Mot de passe actuel incorrect.', success: null });
  }
  if (!new_password || new_password.length < 8) {
    return res.render('admin/account', { error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.', success: null });
  }
  if (new_password !== new_password_confirm) {
    return res.render('admin/account', { error: 'La confirmation ne correspond pas.', success: null });
  }
  updatePassword(req.adminUser.id, new_password);
  res.render('admin/account', { error: null, success: 'Mot de passe mis à jour.' });
});

/* ---------------- page content blocks ---------------- */
router.get('/pages/:page', (req, res) => {
  const pageKey = req.params.page;
  const def = PAGES[pageKey];
  if (!def) return res.redirect('/admin');
  const { getPageBlocks } = require('../lib/content');
  const values = getPageBlocks(pageKey);
  res.render('admin/page-blocks', { pageKey, def, values, saved: req.query.saved === '1' });
});

router.post('/pages/:page', (req, res) => {
  const pageKey = req.params.page;
  const def = PAGES[pageKey];
  if (!def) return res.redirect('/admin');
  for (const b of def.blocks) {
    if (b.type === 'list') {
      // Merge onto the existing rows instead of rebuilding them, so any
      // non-editable properties (e.g. an icon baked in at seed time) survive.
      const existingRow = db.prepare('SELECT value FROM content_blocks WHERE page = ? AND block_key = ?').get(pageKey, b.key);
      let existingArr = [];
      try { existingArr = existingRow ? JSON.parse(existingRow.value || '[]') : []; } catch { existingArr = []; }
      const submitted = req.body[b.key] || [];
      const arr = submitted.map((row, i) => {
        const merged = { ...(existingArr[i] || {}) };
        for (const f of b.itemFields) merged[f.name] = (row?.[f.name] ?? '').toString();
        return merged;
      });
      setBlock(pageKey, b.key, b.type, JSON.stringify(arr), b.label);
    } else {
      setBlock(pageKey, b.key, b.type, (req.body[b.key] ?? '').toString(), b.label);
    }
  }
  res.redirect(`/admin/pages/${pageKey}?saved=1`);
});

/* ---------------- legal pages ---------------- */
router.get('/legal', (req, res) => {
  const pages = db.prepare('SELECT * FROM legal_pages ORDER BY slug').all();
  res.render('admin/legal-list', { pages });
});

router.get('/legal/:slug', (req, res) => {
  const page = db.prepare('SELECT * FROM legal_pages WHERE slug = ?').get(req.params.slug);
  if (!page) return res.redirect('/admin/legal');
  res.render('admin/legal-form', { page, saved: req.query.saved === '1' });
});

router.post('/legal/:slug', (req, res) => {
  db.prepare(`
    UPDATE legal_pages SET title = ?, body_html = ?, updated_at = datetime('now') WHERE slug = ?
  `).run(req.body.title || '', req.body.body_html || '', req.params.slug);
  res.redirect(`/admin/legal/${req.params.slug}?saved=1`);
});

/* ---------------- settings ---------------- */
const SETTINGS_FIELDS = [
  { name: 'site_title', label: 'Nom du site' },
  { name: 'site_tagline', label: 'Slogan' },
  { name: 'contact_email', label: 'Email de contact' },
  { name: 'contact_phone', label: 'Téléphone' },
  { name: 'contact_address', label: 'Adresse (plusieurs lignes possibles)', textarea: true },
  { name: 'contact_hours', label: 'Horaires' },
  { name: 'meta_description', label: 'Description SEO (balise meta description)', textarea: true },
];

router.get('/settings', (req, res) => {
  const values = {};
  for (const f of SETTINGS_FIELDS) values[f.name] = getSetting(f.name);
  values.site_logo = getSetting('site_logo');
  res.render('admin/settings', { fields: SETTINGS_FIELDS, values, saved: req.query.saved === '1' });
});

router.post('/settings', upload.single('logo'), (req, res) => {
  for (const f of SETTINGS_FIELDS) setSetting(f.name, (req.body[f.name] ?? '').toString());
  if (req.file) setSetting('site_logo', recordMedia(req.file));
  res.redirect('/admin/settings?saved=1');
});

/* ---------------- media library ---------------- */
router.get('/media', (req, res) => {
  const items = db.prepare('SELECT * FROM media ORDER BY id DESC').all();
  res.render('admin/media', { items, error: null });
});

router.post('/media', upload.single('file'), (req, res) => {
  if (req.file) recordMedia(req.file);
  res.redirect('/admin/media');
});

router.post('/media/:id/delete', (req, res) => {
  const item = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id);
  if (item) {
    const filePath = path.join(UPLOAD_DIR, item.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
  }
  res.redirect('/admin/media');
});

/* ---------------- contact messages ---------------- */
router.get('/messages', (req, res) => {
  const messages = db.prepare('SELECT * FROM contact_messages ORDER BY id DESC').all();
  res.render('admin/messages', { messages });
});

router.post('/messages/:id/read', (req, res) => {
  db.prepare('UPDATE contact_messages SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.redirect('/admin/messages');
});

router.post('/messages/:id/delete', (req, res) => {
  db.prepare('DELETE FROM contact_messages WHERE id = ?').run(req.params.id);
  res.redirect('/admin/messages');
});

/* ---------------- collections (generic CRUD) ---------------- */
router.use('/team', createCrudRouter({
  table: 'team_members',
  singular: 'membre',
  plural: 'Équipe',
  basePath: '/admin/team',
  hasPublished: true,
  fields: [
    { name: 'photo', label: 'Photo', type: 'image' },
    { name: 'name', label: 'Nom complet', type: 'text', required: true },
    { name: 'role', label: 'Fonction', type: 'text' },
    { name: 'bio', label: 'Biographie', type: 'richtext' },
  ],
}));

router.use('/clients', createCrudRouter({
  table: 'clients',
  singular: 'client / référence',
  plural: 'Références clients',
  basePath: '/admin/clients',
  hasPublished: true,
  fields: [
    { name: 'logo', label: 'Logo', type: 'image' },
    { name: 'name', label: 'Nom (texte alternatif)', type: 'text', required: true },
  ],
}));

router.use('/gallery', createCrudRouter({
  table: 'gallery_items',
  singular: 'photo',
  plural: 'Réalisations (galerie)',
  basePath: '/admin/gallery',
  hasPublished: true,
  fields: [
    { name: 'image', label: 'Image', type: 'image' },
    { name: 'category', label: 'Catégorie', type: 'select', options: ['seminaire', 'formation', 'conference', 'coaching'] },
    { name: 'tag', label: 'Étiquette affichée', type: 'text' },
    { name: 'title', label: 'Titre', type: 'text' },
    { name: 'subtitle', label: 'Sous-titre', type: 'text' },
    { name: 'size', label: 'Taille de la vignette', type: 'select', options: ['normal', 'wide', 'tall'] },
  ],
}));

router.use('/faq', createCrudRouter({
  table: 'faq_items',
  singular: 'question',
  plural: 'FAQ',
  basePath: '/admin/faq',
  hasPublished: true,
  fields: [
    { name: 'question', label: 'Question', type: 'text', required: true },
    { name: 'answer', label: 'Réponse', type: 'richtext' },
  ],
}));

router.use('/history', createCrudRouter({
  table: 'history_steps',
  singular: 'étape',
  plural: 'Notre histoire (frise chronologique)',
  basePath: '/admin/history',
  hasPublished: true,
  fields: [
    { name: 'year_label', label: 'Repère (ex: 2020, Origines, Aujourd’hui)', type: 'text', required: true },
    { name: 'title', label: 'Titre', type: 'text' },
    { name: 'description', label: 'Description', type: 'richtext' },
  ],
}));

router.use('/training', trainingRouter);

module.exports = router;

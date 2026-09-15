const express = require('express');
const db = require('../db');

const router = express.Router();

function slugify(str) {
  return String(str).toLowerCase().trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'domaine';
}

router.get('/', (req, res) => {
  const domains = db.prepare('SELECT * FROM training_domains ORDER BY position ASC, id ASC').all();
  for (const d of domains) {
    d.programCount = db.prepare('SELECT COUNT(*) c FROM training_programs WHERE domain_id = ?').get(d.id).c;
  }
  res.render('admin/training-list', { domains });
});

router.get('/new', (req, res) => {
  res.render('admin/training-domain-form', { domain: null, error: null });
});

router.post('/', (req, res) => {
  const { name, kicker, level_label, description } = req.body;
  const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) m FROM training_domains').get().m;
  let slug = slugify(name);
  const exists = db.prepare('SELECT id FROM training_domains WHERE slug = ?').get(slug);
  if (exists) slug = slug + '-' + Date.now().toString(36);
  db.prepare(`
    INSERT INTO training_domains (slug, name, kicker, level_label, description, position)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(slug, name || 'Nouveau domaine', kicker || '', level_label || '', description || '', maxPos + 1);
  res.redirect('/admin/training');
});

router.get('/:id/edit', (req, res) => {
  const domain = db.prepare('SELECT * FROM training_domains WHERE id = ?').get(req.params.id);
  if (!domain) return res.redirect('/admin/training');
  const programs = db.prepare('SELECT * FROM training_programs WHERE domain_id = ? ORDER BY position ASC, id ASC').all(domain.id);
  res.render('admin/training-domain-edit', { domain, programs, saved: req.query.saved === '1' });
});

router.post('/:id', (req, res) => {
  const { name, kicker, level_label, description, published } = req.body;
  db.prepare(`
    UPDATE training_domains SET name = ?, kicker = ?, level_label = ?, description = ?, published = ? WHERE id = ?
  `).run(name || '', kicker || '', level_label || '', description || '', published ? 1 : 0, req.params.id);
  res.redirect(`/admin/training/${req.params.id}/edit?saved=1`);
});

router.post('/:id/delete', (req, res) => {
  db.prepare('DELETE FROM training_domains WHERE id = ?').run(req.params.id);
  res.redirect('/admin/training');
});

router.post('/:id/move', (req, res) => {
  const dir = req.body.dir === 'up' ? 'up' : 'down';
  const domains = db.prepare('SELECT id, position FROM training_domains ORDER BY position ASC, id ASC').all();
  const idx = domains.findIndex((d) => String(d.id) === String(req.params.id));
  const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= domains.length) return res.redirect('/admin/training');
  const a = domains[idx];
  const b = domains[swapIdx];
  const update = db.prepare('UPDATE training_domains SET position = ? WHERE id = ?');
  db.transaction(() => {
    update.run(b.position, a.id);
    update.run(a.position, b.id);
  })();
  res.redirect('/admin/training');
});

/* ---- programs nested under a domain ---- */
router.post('/:id/programs', (req, res) => {
  const { title, description } = req.body;
  const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) m FROM training_programs WHERE domain_id = ?').get(req.params.id).m;
  db.prepare(`
    INSERT INTO training_programs (domain_id, title, description, position) VALUES (?, ?, ?, ?)
  `).run(req.params.id, title || 'Nouveau programme', description || '', maxPos + 1);
  res.redirect(`/admin/training/${req.params.id}/edit`);
});

router.post('/:id/programs/:programId', (req, res) => {
  const { title, description, published } = req.body;
  db.prepare(`
    UPDATE training_programs SET title = ?, description = ?, published = ? WHERE id = ? AND domain_id = ?
  `).run(title || '', description || '', published ? 1 : 0, req.params.programId, req.params.id);
  res.redirect(`/admin/training/${req.params.id}/edit`);
});

router.post('/:id/programs/:programId/delete', (req, res) => {
  db.prepare('DELETE FROM training_programs WHERE id = ? AND domain_id = ?').run(req.params.programId, req.params.id);
  res.redirect(`/admin/training/${req.params.id}/edit`);
});

router.post('/:id/programs/:programId/move', (req, res) => {
  const dir = req.body.dir === 'up' ? 'up' : 'down';
  const programs = db.prepare('SELECT id, position FROM training_programs WHERE domain_id = ? ORDER BY position ASC, id ASC').all(req.params.id);
  const idx = programs.findIndex((p) => String(p.id) === String(req.params.programId));
  const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= programs.length) return res.redirect(`/admin/training/${req.params.id}/edit`);
  const a = programs[idx];
  const b = programs[swapIdx];
  const update = db.prepare('UPDATE training_programs SET position = ? WHERE id = ?');
  db.transaction(() => {
    update.run(b.position, a.id);
    update.run(a.position, b.id);
  })();
  res.redirect(`/admin/training/${req.params.id}/edit`);
});

module.exports = router;

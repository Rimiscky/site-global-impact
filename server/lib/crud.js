const express = require('express');
const db = require('../db');
const { upload, recordMedia } = require('./upload');

/**
 * Generic CRUD router for a simple, flat, position-ordered table.
 * Renders with views/admin/resource-list.ejs and views/admin/resource-form.ejs.
 */
function createCrudRouter(config) {
  const { table, singular, plural, basePath, fields, extraColumns = [] } = config;
  const router = express.Router();
  const imageFields = fields.filter((f) => f.type === 'image').map((f) => f.name);
  const textColumns = fields.map((f) => f.name).concat(extraColumns);

  function listItems() {
    return db.prepare(`SELECT * FROM ${table} ORDER BY position ASC, id ASC`).all();
  }

  router.get('/', (req, res) => {
    res.render('admin/resource-list', { config, items: listItems(), basePath });
  });

  router.get('/new', (req, res) => {
    res.render('admin/resource-form', { config, item: null, basePath, error: null });
  });

  router.get('/:id/edit', (req, res) => {
    const item = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!item) return res.redirect(basePath);
    res.render('admin/resource-form', { config, item, basePath, error: null });
  });

  function handleUpload(req, res, next) {
    if (imageFields.length === 0) return next();
    upload.any()(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  }

  function extractValues(req) {
    const values = {};
    for (const f of fields) {
      if (f.type === 'image') continue;
      values[f.name] = (req.body[f.name] ?? '').toString();
    }
    if (config.hasPublished) values.published = req.body.published ? 1 : 0;
    return values;
  }

  function applyUploadedFiles(req, values, existing) {
    for (const name of imageFields) {
      const file = (req.files || []).find((f) => f.fieldname === name);
      if (file) {
        values[name] = recordMedia(file);
      } else if (existing) {
        values[name] = existing[name];
      } else {
        values[name] = req.body[name + '_url'] || '';
      }
    }
  }

  router.post('/', handleUpload, (req, res) => {
    const values = extractValues(req);
    applyUploadedFiles(req, values, null);
    const maxPos = db.prepare(`SELECT COALESCE(MAX(position), -1) m FROM ${table}`).get().m;
    values.position = maxPos + 1;
    if (config.hasPublished && values.published === undefined) values.published = 1;
    const cols = Object.keys(values);
    const placeholders = cols.map((c) => `@${c}`).join(', ');
    db.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`).run(values);
    res.redirect(basePath);
  });

  router.post('/:id', handleUpload, (req, res) => {
    const existing = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!existing) return res.redirect(basePath);
    const values = extractValues(req);
    applyUploadedFiles(req, values, existing);
    const cols = Object.keys(values);
    const setClause = cols.map((c) => `${c} = @${c}`).join(', ');
    db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = @id`).run({ ...values, id: req.params.id });
    res.redirect(basePath);
  });

  router.post('/:id/delete', (req, res) => {
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
    res.redirect(basePath);
  });

  router.post('/:id/move', (req, res) => {
    const dir = req.body.dir === 'up' ? 'up' : 'down';
    const items = listItems();
    const idx = items.findIndex((i) => String(i.id) === String(req.params.id));
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (idx === -1 || swapIdx < 0 || swapIdx >= items.length) return res.redirect(basePath);
    const a = items[idx];
    const b = items[swapIdx];
    const update = db.prepare(`UPDATE ${table} SET position = ? WHERE id = ?`);
    const tx = db.transaction(() => {
      update.run(b.position, a.id);
      update.run(a.position, b.id);
    });
    tx();
    res.redirect(basePath);
  });

  return router;
}

module.exports = { createCrudRouter };

const db = require('../db');
const { PAGES } = require('./blocks');

/** Returns { block_key: value } for a page, values parsed to arrays for list blocks. */
function getPageBlocks(page) {
  const def = PAGES[page];
  if (!def) throw new Error(`Unknown page "${page}"`);
  const rows = db.prepare('SELECT block_key, value FROM content_blocks WHERE page = ?').all(page);
  const map = {};
  for (const r of rows) map[r.block_key] = r.value;

  const out = {};
  for (const b of def.blocks) {
    const raw = map[b.key] ?? '';
    if (b.type === 'list') {
      try {
        out[b.key] = JSON.parse(raw || '[]');
      } catch {
        out[b.key] = [];
      }
    } else if (b.isLines) {
      out[b.key] = raw ? raw.split('\n').filter(Boolean) : [];
    } else {
      out[b.key] = raw;
    }
  }
  return out;
}

function setBlock(page, key, type, value, label = '') {
  db.prepare(`
    INSERT INTO content_blocks (page, block_key, type, value, label)
    VALUES (@page, @key, @type, @value, @label)
    ON CONFLICT(page, block_key) DO UPDATE SET value = excluded.value, type = excluded.type, label = excluded.label
  `).run({ page, key, type, value, label });
}

function getSetting(key, fallback = '') {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

function getSettings(keys) {
  const out = {};
  for (const k of keys) out[k] = getSetting(k);
  return out;
}

function setSetting(key, value) {
  db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}

module.exports = { getPageBlocks, setBlock, getSetting, getSettings, setSetting };

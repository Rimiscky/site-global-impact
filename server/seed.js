/**
 * Populates the database with the content extracted from the original
 * static site (scripts/legacy-content.json) so the CMS launches with the
 * exact same content that was live before. Safe to re-run: it only fills
 * tables that are currently empty, and only inserts a content_block if it
 * doesn't already exist (so it never clobbers edits made from the admin).
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { PAGES } = require('./lib/blocks');
const { setBlock, setSetting, getSetting } = require('./lib/content');

const legacyPath = path.join(__dirname, '..', 'scripts', 'legacy-content.json');
const legacy = fs.existsSync(legacyPath) ? JSON.parse(fs.readFileSync(legacyPath, 'utf8')) : null;

const blockExists = db.prepare('SELECT 1 FROM content_blocks WHERE page = ? AND block_key = ?');

function seedBlocksForPage(page, data) {
  const def = PAGES[page];
  for (const b of def.blocks) {
    if (blockExists.get(page, b.key)) continue; // never clobber an existing (possibly edited) block
    let value = data[b.key];
    if (value === undefined) value = '';
    if (b.type === 'list') value = JSON.stringify(value || []);
    else if (b.isLines) value = Array.isArray(value) ? value.join('\n') : (value || '');
    setBlock(page, b.key, b.type, String(value ?? ''), b.label);
  }
}

function run() {
  if (!legacy) {
    console.log('No legacy content found (scripts/legacy-content.json) — skipping content seed.');
  } else {
    // ---- content blocks ----
    seedBlocksForPage('home', legacy.home || {});
    seedBlocksForPage('formation', legacy.trainingHero || {});
    seedBlocksForPage('about', legacy.about || {});
    seedBlocksForPage('contact', legacy.contact || {});

    // ---- settings ---- (only fills a setting that doesn't already exist, so it
    // can pick up newly added defaults without ever clobbering an edited value)
    const defaultSettings = {
      site_title: 'Global Impact Consulting',
      site_tagline: 'Formation, Coaching & Conseil stratégique',
      contact_email: legacy.contact?.email || 'bcontact@globalimpactconsulting.cg',
      contact_phone: legacy.contact?.phone || '06 857 71 41',
      contact_phone_2: '05 384 37 72',
      contact_address: legacy.contact?.address || 'Centre-ville Pointe-Noire\nRépublique du Congo',
      contact_hours: legacy.contact?.hours || 'Lun – Ven · 8h00 – 17h00',
      meta_description: 'Global Impact Consulting (GIC) — cabinet de formation, coaching et conseil stratégique.',
      site_logo: 'assets/photo et logo/LOGO-GLOBAL-IMPACT-3-png.png',
    };
    for (const [key, value] of Object.entries(defaultSettings)) {
      if (!getSetting(key)) setSetting(key, value);
    }

    // ---- training domains + programs ----
    if (db.prepare('SELECT COUNT(*) c FROM training_domains').get().c === 0) {
      const insertDomain = db.prepare(`
        INSERT INTO training_domains (slug, name, kicker, level_label, description, position)
        VALUES (@slug, @name, @kicker, @level_label, @description, @position)
      `);
      const insertProgram = db.prepare(`
        INSERT INTO training_programs (domain_id, title, description, position)
        VALUES (@domain_id, @title, @description, @position)
      `);
      (legacy.domains || []).forEach((d, i) => {
        const info = insertDomain.run({
          slug: d.slug,
          name: d.name,
          kicker: d.kicker,
          level_label: d.count_label,
          description: d.description,
          position: i,
        });
        const programs = (legacy.programsByDomain || {})[d.slug] || [];
        programs.forEach((p, j) => {
          insertProgram.run({ domain_id: info.lastInsertRowid, title: p.title, description: p.description, position: j });
        });
      });
    }

    // ---- team members ----
    if (db.prepare('SELECT COUNT(*) c FROM team_members').get().c === 0) {
      const insert = db.prepare(`
        INSERT INTO team_members (name, role, bio, photo, position) VALUES (@name, @role, @bio, @photo, @position)
      `);
      (legacy.team || []).forEach((t, i) => insert.run({ ...t, position: i }));
    }

    // ---- clients (logos) ----
    if (db.prepare('SELECT COUNT(*) c FROM clients').get().c === 0) {
      const insert = db.prepare(`INSERT INTO clients (name, logo, position) VALUES (@name, @logo, @position)`);
      (legacy.clients || []).forEach((c, i) => insert.run({ ...c, position: i }));
    }

    // ---- gallery ----
    if (db.prepare('SELECT COUNT(*) c FROM gallery_items').get().c === 0) {
      const insert = db.prepare(`
        INSERT INTO gallery_items (image, category, tag, title, subtitle, size, position)
        VALUES (@image, @category, @tag, @title, @subtitle, @size, @position)
      `);
      (legacy.gallery || []).forEach((g, i) => {
        const size = g.wide ? 'wide' : g.tall ? 'tall' : 'normal';
        insert.run({ image: g.image, category: g.category, tag: g.tag, title: g.title, subtitle: g.subtitle, size, position: i });
      });
    }

    // ---- faq ----
    if (db.prepare('SELECT COUNT(*) c FROM faq_items').get().c === 0) {
      const insert = db.prepare(`INSERT INTO faq_items (question, answer, position) VALUES (@question, @answer, @position)`);
      (legacy.faq || []).forEach((f, i) => insert.run({ question: f.question, answer: f.answer_html, position: i }));
    }

    // ---- history steps ----
    if (db.prepare('SELECT COUNT(*) c FROM history_steps').get().c === 0) {
      const insert = db.prepare(`
        INSERT INTO history_steps (year_label, title, description, position) VALUES (@year_label, @title, @description, @position)
      `);
      (legacy.historySteps || []).forEach((h, i) => insert.run({ ...h, position: i }));
    }

    // ---- legal pages ----
    if (db.prepare('SELECT COUNT(*) c FROM legal_pages').get().c === 0) {
      const insert = db.prepare(`INSERT INTO legal_pages (slug, title, body_html) VALUES (@slug, @title, @body_html)`);
      for (const [slug, page] of Object.entries(legacy.legal || {})) {
        insert.run({ slug, title: page.title, body_html: page.main_html });
      }
    }
  }

  // ---- default admin user ----
  if (db.prepare('SELECT COUNT(*) c FROM admin_users').get().c === 0) {
    const email = process.env.ADMIN_EMAIL || 'admin@globalimpact.com';
    const password = process.env.ADMIN_PASSWORD || 'ChangeMoi123!';
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO admin_users (email, password_hash, name) VALUES (?, ?, ?)').run(email, hash, 'Administrateur');
    console.log('--------------------------------------------------------');
    console.log('Compte administrateur créé :');
    console.log('  Email    :', email);
    console.log('  Mot de passe :', password);
    console.log('  ⚠ Changez ce mot de passe dès la première connexion (/admin/account).');
    console.log('--------------------------------------------------------');
  }

  console.log('Seed terminé.');
}

run();

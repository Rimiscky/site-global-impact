const express = require('express');
const db = require('../db');

const router = express.Router();

router.post('/contact', (req, res) => {
  const { name, email, message, org = '', phone = '', topic = '' } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'missing_fields' });
  }
  db.prepare(`
    INSERT INTO contact_messages (name, email, org, phone, topic, message)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(String(name).slice(0, 200), String(email).slice(0, 200), String(org).slice(0, 200), String(phone).slice(0, 60), String(topic).slice(0, 120), String(message).slice(0, 5000));
  res.json({ ok: true });
});

module.exports = router;

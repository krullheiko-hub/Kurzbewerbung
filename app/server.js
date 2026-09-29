const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bewerbungen (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      telefon VARCHAR(40) NOT NULL,
      wunschtaetigkeit VARCHAR(200),
      wohnort VARCHAR(120),
      pkw_fs_vorhanden VARCHAR(3),
      job_referenz VARCHAR(200),
      quelle VARCHAR(60) DEFAULT 'kleinanzeigen',
      erstellt_am TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('Tabelle bewerbungen ist bereit');
}

app.post('/api/bewerbungen', async (req, res) => {
  const { name, telefon, wunschtaetigkeit, wohnort, pkwFs, jobReferenz } = req.body;

  if (!name || !telefon) {
    return res.status(400).json({ error: 'Name und Telefonnummer sind Pflichtfelder' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO bewerbungen (name, telefon, wunschtaetigkeit, wohnort, pkw_fs_vorhanden, job_referenz)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        name.trim(),
        telefon.trim(),
        wunschtaetigkeit ? wunschtaetigkeit.trim() : null,
        wohnort ? wohnort.trim() : null,
        pkwFs || null,
        jobReferenz ? jobReferenz.trim() : null
      ]
    );
    res.status(201).json({ ok: true, id: result.rows[0].id });
  } catch (err) {
    console.error('Fehler beim Speichern', err);
    res.status(500).json({ error: 'Interner Fehler' });
  }
});

app.get('/api/bewerbungen', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, telefon, wunschtaetigkeit, wohnort, pkw_fs_vorhanden, job_referenz, erstellt_am FROM bewerbungen ORDER BY erstellt_am DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fehler beim Laden', err);
    res.status(500).json({ error: 'Interner Fehler' });
  }
});

const port = 3000;
ensureTable()
  .then(() => {
    app.listen(port, () => console.log(`Server läuft auf Port ${port}`));
  })
  .catch(err => {
    console.error('Fehler beim Anlegen der Tabelle', err);
    process.exit(1);
  });

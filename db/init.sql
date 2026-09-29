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

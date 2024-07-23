const sqlite3 = require('sqlite3').verbose();
const { Router } = require('@netlify/functions');

const scheduleDb = new sqlite3.Database('./wnba_schedule_2024.db', (err) => {
  if (err) {
    console.error('Error opening wnba_schedule_2024.db database ' + err.message);
  } else {
    console.log('Connected to the wnba_schedule_2024.db database.');
  }
});

const router = Router();

const queryDatabase = (db, query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

router.get('/games', async (req, res) => {
  try {
    const rows = await queryDatabase(scheduleDb, 'SELECT * FROM wnba_schedule');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Add other routes similarly...

module.exports.handler = router.handler;

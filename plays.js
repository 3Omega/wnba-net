const sqlite3 = require('sqlite3').verbose();
const { Router } = require('@netlify/functions');

const pbpDb = new sqlite3.Database('./play_by_play_2024.db', (err) => {
  if (err) {
    console.error('Error opening play_by_play_2024.db database ' + err.message);
  } else {
    console.log('Connected to the play_by_play_2024.db database.');
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

router.get('/plays', async (req, res) => {
  try {
    const rows = await queryDatabase(pbpDb, 'SELECT * FROM wnba_pbp');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

router.get('/plays/:game_id', async (req, res) => {
  const { game_id } = req.params;
  if (!game_id) {
    return res.status(400).json({ error: 'Game ID is required' });
  }
  try {
    const rows = await queryDatabase(pbpDb, 'SELECT * FROM wnba_pbp WHERE game_id = ?', [game_id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No records found for the specified game ID' });
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Add other routes similarly...

module.exports.handler = router.handler;

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3100;

// Connect to the SQLite database
let db = new sqlite3.Database('./wnba_schedule_2024.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the wnba_schedule SQLite database.');
});

// Middleware to handle JSON requests
app.use(express.json());

// Define an endpoint to fetch all games
app.get('/games', (req, res) => {
  let sql = `SELECT * FROM wnba_schedule`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": rows
    });
  });
});

// Define an endpoint to fetch a specific game by id
app.get('/games/:id', (req, res) => {
  let sql = `SELECT * FROM wnba_schedule WHERE id = ?`;
  let params = [req.params.id];

  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": row
    });
  });
});

// Define an endpoint to fetch games by home_short_display_name
app.get('/games/home/:name', (req, res) => {
  let sql = `SELECT * FROM wnba_schedule WHERE home_short_display_name = ?`;
  let params = [req.params.name];

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": rows
    });
  });
});

// Define an endpoint to fetch games by away_short_display_name
app.get('/games/away/:name', (req, res) => {
  let sql = `SELECT * FROM wnba_schedule WHERE away_short_display_name = ?`;
  let params = [req.params.name];

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": rows
    });
  });
});

// Define an endpoint to fetch games by status_type_name
app.get('/games/status/:status', (req, res) => {
  const validStatuses = ['STATUS_FINAL', 'STATUS_SCHEDULED'];
  const status = req.params.status;

  if (!validStatuses.includes(status)) {
    res.status(400).json({ "error": "Invalid status type" });
    return;
  }

  let sql = `SELECT * FROM wnba_schedule WHERE status_type_name = ?`;
  let params = [status];

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": rows
    });
  });
});

// Define an endpoint to fetch games by date (YYYY-MM-DD format)
app.get('/games/date/:date', (req, res) => {
  let date = req.params.date;
  
  // Ensure the date is in YYYY-MM-DD format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ "error": "Invalid date format. Use YYYY-MM-DD" });
    return;
  }

  let sql = `
    SELECT * FROM wnba_schedule 
    WHERE strftime('%Y-%m-%d', date) = ?`;
  let params = [date];

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": rows
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Close the database connection when the app is closed
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the database connection.');
    process.exit(0);
  });
});

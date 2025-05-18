const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));


// Connect to the SQLite database
const db = new sqlite3.Database('./restaurants.db');

// Create restaurants table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    address TEXT,
    category TEXT,
    image TEXT
  )
`);

// GET all restaurants
app.get('/api/restaurants', (req, res) => {
  db.all('SELECT * FROM restaurants', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST a new restaurant
app.post('/api/restaurants', (req, res) => {
  const { name, address, category, image } = req.body;
  db.run(
    'INSERT INTO restaurants (name, address, category, image) VALUES (?, ?, ?, ?)',
    [name, address, category, image],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

const PORT = 3001;
// PATCH /api/restaurants/:id/like - increase like count
app.patch('/api/restaurants/:id/like', (req, res) => {
  const id = req.params.id;
 db.run("UPDATE restaurants SET likes = likes + 1 WHERE id = ?", [id], function(err) {

    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});


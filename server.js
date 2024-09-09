// server.js
const express = require('express');
const path = require('path');
const app = express();
const db = require('./dbConfig'); // Import database configuration
const { cache } = require('./globals'); // Import global variables
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for views
app.use(express.static(path.join(__dirname, 'views')));

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if user status is already cached
  const cachedStatus = cache.get(username);
  if (cachedStatus) {
    console.log(`Cache hit for ${username}: ${cachedStatus}`);
    return res.redirect(`/dashboard?username=${username}`);
  }

  // Query to authenticate user
  const query = `SELECT status FROM users WHERE username = ? AND password = ?`; // Ensure hashed password
  db.get(query, [username, password], (err, row) => {
    if (err) {
      console.error('Error during query execution:', err.message);
      return res.status(500).send('Internal server error');
    }

    if (row) {
      // User authenticated, cache the status
      cache.set(username, row.status || 'New'); // Default status to 'New'
      console.log(`User authenticated: ${username}, Status: ${row.status || 'New'}`);
      res.redirect(`/dashboard?username=${username}`);
    } else {
      res.status(401).send('Authentication failed');
    }
  });
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Fetch latest status route
app.get('/status', (req, res) => {
  const { username } = req.query;

  const query = `SELECT status FROM users WHERE username = ?`;
  db.get(query, [username], (err, row) => {
    if (err) {
      console.error('Error fetching status:', err.message);
      return res.status(500).send('Error fetching status');
    }

    if (row) {
      res.json({ status: row.status });
    } else {
      res.status(404).send('User not found');
    }
  });
});

// Update status route
app.post('/status', (req, res) => {
  const { username, status } = req.body;

  const query = `UPDATE users SET status = ? WHERE username = ?`;
  db.run(query, [status, username], function (err) {
    if (err) {
      console.error('Error updating status:', err.message);
      return res.status(500).send('Error updating status');
    }

    cache.set(username, status); // Update cache
    res.send('Status updated');
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

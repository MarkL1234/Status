const sqlite3 = require('sqlite3').verbose();
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// Connection settings - use the username, password, and URL for your specific setup
const db = new sqlite3.Database('sqlitecloud://chsaclt6sz.sqlite.cloud:8860', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Failed to connect to the database:', err.message);
  } else {
    console.log('Connected to the SQLite Cloud database.');
  }
});

// Function to authenticate and cache user status
async function authenticateUser(username, password) {
  // Check if user status is already cached
  const cachedStatus = cache.get(username);
  if (cachedStatus) {
    console.log(`Cache hit for ${username}: ${cachedStatus}`);
    return cachedStatus;
  }

  // Query to check username and hashed password
  const query = `SELECT status FROM users WHERE username = ? AND password = ?`; // Make sure passwords are hashed in the same way
  return new Promise((resolve, reject) => {
    db.get(query, [username, password], (err, row) => {
      if (err) {
        console.error('Error during query execution:', err.message);
        reject(err);
      } else if (row) {
        // User found, cache the status
        cache.set(username, row.status);
        console.log(`User authenticated: ${username}, Status: ${row.status}`);
        resolve(row.status);
      } else {
        console.log('Authentication failed');
        resolve(null);
      }
    });
  });
}

// Example usage:
(async () => {
  try {
    const status = await authenticateUser('testuser', 'hashedpassword');
    if (status) {
      console.log(`Authenticated. User status: ${status}`);
    } else {
      console.log('Failed to authenticate user.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
})();

// dbConfig.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('sqlitecloud://chsaclt6sz.sqlite.cloud:8860', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Failed to connect to the database:', err.message);
  } else {
    console.log('Connected to the SQLite Cloud database.');
  }
});

module.exports = db;

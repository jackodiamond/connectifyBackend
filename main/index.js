const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const userRoutes = require('./userRoutes'); // Import user routes
const authentication = require('./authentication');
const profileRoutes = require('./profileRoutes');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to SQLite database
//const db = new sqlite3.Database(':memory:'); // In-memory database for this example
// You can also use a file-based database like this:
const db = new sqlite3.Database('database.db');

// Create a table (if not exists)
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, email TEXT, password TEXT,profilePic TEXT)");
});

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());
// User API routes
app.use('/users', userRoutes(db));
app.use('/auth', authentication(db));
app.use('/profile', profileRoutes(db));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

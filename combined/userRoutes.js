const express = require('express');
const router = express.Router();

// Middleware to parse JSON bodies
router.use(express.json());

// Define routes with the db parameter
module.exports = function(db) {

    router.get('/', (req, res) => {
      db.all("SELECT username FROM users", (err, rows) => {
          if (err) {
              console.error(err.message);
              return res.status(500).json({ error: 'Failed to fetch usernames' });
          }
          // Extract only the usernames from the rows
          const usernames = rows.map(row => row.username);
          res.json(usernames);
      });
  });

    return router;
};

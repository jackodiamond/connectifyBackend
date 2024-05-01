const express = require('express');
const router = express.Router();

// Middleware to parse JSON bodies
router.use(express.json());

module.exports = function (db) {


// Endpoint to fetch profile picture URL by username
router.get('/:username', (req, res) => {
  const { username } = req.params; 

    // Fetch profile picture URL based on user ID
    db.get("SELECT profilePic FROM users WHERE username = ?", [username], (err, row) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Failed to fetch profile picture' });
      }
      res.json({ profilePicURL: row?.profilePic }); // Return profilePicURL if found
    });
  
});

// Endpoint to update profile picture URL (requires user ID in request body)
router.put('/', (req, res) => {
  const { username, profilePicURL } = req.body;

  console.log("username ",username)


  // Update profile picture URL for the user
  db.run("UPDATE users SET profilePic = ? WHERE username = ?", [profilePicURL, username], (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Failed to update profile picture' });
    }
    res.json({ message: 'Profile picture updated successfully' });
  });

  
});

return router;
};

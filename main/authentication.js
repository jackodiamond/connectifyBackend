const express = require('express');
const router = express.Router();

// Middleware to parse JSON bodies
router.use(express.json());

// Define routes with the db parameter
module.exports = function(db) {
    // Endpoint to create a user
    router.post('/signup', (req, res) => {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        let profilePic;
        const num = Math.random()
        if(num<0.5)
        {
            profilePic = "https://avatar.iran.liara.run/public/boy?username="+username;
        }else
        {
            profilePic = "https://avatar.iran.liara.run/public/girl?username="+username;
        }

        db.run("INSERT INTO users (username, email, password, profilePic) VALUES (?, ?, ?, ?)", [username, email, password, profilePic], function(err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Failed to create user' });
            }
            res.json({res: "success"});
        });

    });

    // Endpoint for user login
    router.post('/login', (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Failed to authenticate user' });
            }
            if (!row) {
                return res.status(404).json({ error: 'Invalid email or password' });
            }
            res.json({username:row.username ,profilePic:row.profilePic});
        });
    });

    return router;
};

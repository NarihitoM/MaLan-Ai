const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MySQL database connection //
const db = mysql.createConnection({
    host: "",
    user: "",
    password: "",
    database: ""
});

app.post("/signup", (req, res) => {
    const { email, password } = req.body;
    db.query(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, password],
        (err, result) => {
            if (err) {
                console.error(err);
                console.log(result);
                res.status(500).send("Error saving user.");
            } else {
                res.status(200).json({
                    message: "User registered successfully",
                    email,
                    password
                });
            }
        }
    );
});

app.post("/google-signup", (req, res) => {
    const { email, name, picture, googleId } = req.body;

    db.query(
        `INSERT INTO users (email, name, picture, google_id)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), picture = VALUES(picture)`,
        [email, name, picture, googleId, name, picture],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Error saving Google user" });
            }
            res.status(200).json({
                message: "Google Account registered successfully",
                email,
                name,
                picture,
                googleId
            });
        }
    );
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

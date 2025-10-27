const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const app = express();
require('dotenv').config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
      }
      if (results.length === 0) {
        return res.status(400).json({ success: false, message: "Incorrect Email And Password" });
      }
      const user = results[0];
      if (user.password !== password) {
        return res.status(401).json({ success: false, message: "Incorrect Email And Password" });
      }
      res.status(200).json({ success: true, message: "Login successful", email: user.email });
    }
  );
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
                    message: "Account Successfully Created",
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
        [email, name, picture, googleId],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Error saving Google user" });
            }
            const token = jwt.sign({ email, googleId }, "1049755586928-v3vu7imnscl9cod3qq9vi6k43ohpsht4.apps.googleusercontent.com", { expiresIn: "1h" });
            res.status(200).json({
                message: "Google Login Successful",
                email,
                name,
                picture,
                googleId,
                token,
            });
        }
    );
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

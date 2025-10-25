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

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL database.");
    }
});

app.post("/signup", (req, res) => {
    const { email, password } = req.body;
    db.query(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, password],
        (err, result) => {
            if (err) {
                console.error(err);
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

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const router = require("express").Router();
const axios = require("axios");
const db = require("../db");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");
const JWT = process.env.JWT || 'shhh';
const { isLoggedIn } = require("../api/users")


// Register a new user account
router.post("/register", async (req, res, next) => {
    try {
        // 
        const hashed_pass = await bcrypt.hash(req.body.password, 5);
        const {
            rows: [user],
        } = await db.query(
            // Change to bcrypt
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
            [req.body.username, hashed_pass]
        );

        // Create a token with the user id
        const token = jwt.sign({ id: user.id }, JWT);

        res.status(201).send({ token });
    } catch (error) {
        next(error);
    }
});

// Login to an existing user account
router.post("/login", async (req, res, next) => {
    try {
        const {
            rows: [user],
        } = await db.query(
            "SELECT * FROM users WHERE username = $1 ",
            // Compare passwords with bcrypt

            [req.body.username]
        );

        if (!user || (await bcrypt.compare(req.body.password, user.password)) === false) {
            return res.status(401).send("Invalid login credentials.");
        };

        // Create a token with the user id
        const token = jwt.sign({ id: instructor.id }, JWT);

        res.send({ token });
    } catch (error) {
        next(error);
    }
});

// Get the currently logged in user
router.get("/me", isLoggedIn, async (req, res, next) => {
    try {
        const {
            rows: [instructor],
        } = await db.query("SELECT * FROM instructor WHERE id = $1", [
            req.user?.id,
        ]);

        res.send(instructor);
    } catch (error) {
        next(error);
    }
});

module.exports = router;

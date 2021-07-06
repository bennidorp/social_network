const express = require("express");
const database = require("./../db.js");
const passwords = require("./../passwords.js");
const router = new express.Router();

router.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    database
        .getUserByEmail(email)
        .then((result) => (result.rows ? result.rows[0] : false))
        .then((user) => {
            if (!user) {
                return res.json({ success: false });
            }
            passwords
                .compare(password, user.password_hash)
                .then((passwordIsCorrect) => {
                    if (passwordIsCorrect) {
                        req.session.userId = user.id;
                        res.json({ success: true, userId: user.id });
                    }
                });
        })
        .catch((error) => {
            console.error(error);
            res.send({ success: false });
        });
});

router.post("/api/register", (req, res) => {
    const { firstname, lastname, email, password } = req.body;

    passwords
        .hash(password)
        .then((hashedPassword) => {
            return database.addUser(firstname, lastname, email, hashedPassword);
        })
        .then((results) => {
            req.session.userId = results.rows[0].id;
        })
        .then(() => {
            res.json({
                success: true,
                newUserId: req.session.userId,
            });
        })
        .catch((error) => {
            console.error("Error registering user.", error);
            res.status(500).json({
                success: false,
                error,
            });
        });
});

module.exports = router;

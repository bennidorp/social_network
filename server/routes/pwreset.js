const express = require("express");
const cryptoRandomString = require("crypto-random-string");
const database = require("./../db.js");
const ses = require("./../ses.js");
const router = new express.Router();

//PASSWORD RESET
router.post("/api/sendMail", (req, res) => {
    // 1. Generate code
    //const secretCode = cryptoRandomString({ length: 8 });

    // 2. Save to database

    // 3. Send via email (See registration email)

    // 4. Send positibe JSON response

    const { email } = req.body;
    if (!email) {
        return res.json({
            success: false,
            error: "Yo! we need your Mail",
        });
    } else {
        database
            .getUserByEmail(email)
            .then((result) => {
                if (result.rows.length > 0) {
                    const secretcode = cryptoRandomString({
                        length: 5,
                    });
                    database
                        .addResetCode(email, secretcode)
                        .then(() => {
                            var subj = "Vue-Tang Password";
                            var msg = "Peep dis: " + secretcode;
                            ses.sendEmail(email, msg, subj)
                                .then(() => {
                                    return response.json({
                                        success: true,
                                    });
                                })
                                .catch(() =>
                                    response.json({
                                        success: false,
                                        error: "No Mail for you Homie!",
                                    })
                                );
                        })
                        .catch((error) => {
                            console.log("Could not get reset code", error);
                        });
                } else {
                    console.log("User is not in database");
                    return res.json({
                        success: false,
                        error: "Please try again",
                    });
                }
            })
            .catch((error) => {
                console.log("Something wrong with checking user in db", error);
                return res.json({
                    success: false,
                    error: "Something went wrong",
                });
            });
    }
});

//PASSWORD RESET
router.post("/api/passwordreset", (req, res) => {
    // 1. Check if secret code is correct
    // 1.1 Get secret code for this email address from database
    // database.getPasswordResetForEmail...
    // 1.2 Compare what's in thte database to what's in the request body
    // 2. If the secret code is ok, update the password in the database
    // 2.1 has password
    // 2.2 Update the user in the database, so that the new hash is saved
    // 3. Send positive JSON response
    //
    const { email, secretcode, newPassword } = req.body;
    database
        .getResetCode(email)
        .then(({ rows }) => {
            if (secretcode === rows[0].secretcode) {
                bcrypt.genHash(newPassword).then((new_password_hashed) => {
                    database
                        .updatePassword(email, new_password_hashed)
                        .then((result) => {
                            res.json({ success: true });
                        })
                        .catch((error) => {
                            res.json({ success: false, error });
                        });
                });
            } else {
                res.json({
                    success: false,
                    error: "Something is wrong with the secret code",
                });
            }
        })
        .catch((error) => {
            res.json({ success: false });
        });
});

//

module.exports = router;

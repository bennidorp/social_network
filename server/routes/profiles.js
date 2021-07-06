const express = require("express");
const multer = require("multer");
const path = require("path");
const uidSafe = require("uid-safe");
const database = require("./../db.js");
const router = new express.Router();

const diskStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        const destinationDirectory = __dirname + "/../uploads";
        callback(null, destinationDirectory);
    },
    filename: (request, file, callback) => {
        uidSafe(24).then((uuid) => {
            const originalExtension = path.extname(file.originalname);
            const filename = uuid + originalExtension;
            callback(null, filename);
        });
    },
});

const uploader = multer({
    limits: {
        fileSize: 5242880, // = 5MB in bytes
    },
    storage: diskStorage,
});

router.get("/api/me", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            error: "User is not logged in",
        });
    }

    database.getUserById(req.session.userId).then((result) => {
        if (result.rows.length == 0) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        delete result.rows[0].password_hash;

        res.json({
            success: true,
            user: result.rows[0],
        });
    });
});

router.get("/api/users/:id", async (req, res) => {
    const id = req.params.id;
    const sessionUserId = req.session.userId;
    const isSelf = id == sessionUserId;

    try {
        const result = await database.getUserById(id);

        if (result.rows.length == 0) {
            return res.status(404).json({
                error: "User does not exist.",
            });
        }
        res.json({
            user: result.rows[0],
            isSelf,
        });
    } catch (error) {
        return res.status(401).json({
            error: "Error: Request does not work.",
        });
    }
});
router.post(
    "/api/user/profilepicture",
    uploader.single("file"),

    // (req, res) => {
    //     database
    //         .updatePictureURL(
    //             req.session.user.email,
    //             "./uploads" + req.file.filename
    //         )
    //         .then((result) => {
    //             delete result.rows[0].hashed_password;
    //             res.json(result.rows[0]);
    //         })
    //         .catch((err) => console.log(err));
    // });

    async (req, res) => {
        const userId = req.session.userId;
        const pictureUrl = "/uploads/" + req.file.filename;

        try {
            await database.updatePic(userId, pictureUrl);
            res.json({
                success: true,
                pictureUrl,
            });
        } catch (error) {
            console.log("Fehler", error);
            res.status(500).json({ success: false });
        }
    }
);

router.post("/api/user/bio", async (req, res) => {
    const { userId } = req.session;
    const { bio } = req.body;

    try {
        await database.updateBio(userId, bio);
        res.send({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false });
    }
});

router.get("/api/users/:id", async (req, res) => {
    const id = req.params.id;
    const sessionUserId = req.session.user.id;
    const isSelf = id == sessionUserId;

    try {
        const result = await database.getUserById(id);

        if (result.rows.length == 0) {
            return res.status(404).json({
                error: "Can't find user",
            });
        }
        res.json({
            user: result.rows[0],
            isSelf,
        });
    } catch (error) {
        return res.status(401).json({
            error: "Error",
        });
    }
});

router.get("/api/friendsearch/:q", (req, res) => {
    database
        .getMatchingUsers(req.params.q)
        .then((result) => {
            return res.json({
                success: true,
                found_people: result.rows,
            });
        })
        .catch((error) => {
            console.log("Error", error);
        });
});

module.exports = router;

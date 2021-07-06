const express = require("express");
const compression = require("compression");
const path = require("path");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
//Routes
const pwresetRouter = require("./routes/pwreset.js");
const authRouter = require("./routes/auth.js");
const profilesRouter = require("./routes/profiles.js");
const reqRouter = require("./routes/friendreq.js");
const app = express();
//
app.use(compression());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "client", "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
//
app.use(
    cookieSession({
        secret: "michaels-secret-stuff",
        maxAge: 1000 * 60 * 60 * 24,
    })
);
app.use(csurf());
//
app.use(function (req, res, next) {
    res.cookie("mytoken", req.csrfToken());
    next();
});
//
app.use(pwresetRouter);
app.use(authRouter);
app.use(profilesRouter);
app.use(reqRouter);
//
app.get("/welcome", (req, res) => {
    if (req.session.userId) {
        return res.redirect(302, "/");
    }

    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});
//
app.get("*", (req, res) => {
    if (!req.session.userId) {
        return res.redirect(302, "/welcome");
    }

    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});
//
app.listen(process.env.PORT || 3001, function () {});

const spicedPG = require("spiced-pg");

const db = spicedPG(
    process.env.DATABASE_URL ||
        "postgres:bennidorp:postgres@localhost:5432/social"
);

//
exports.addUser = (firstname, lastname, email, passwordHash) => {
    return db.query(
        `
        INSERT INTO users
            (firstname, lastname, email, password_hash)
        VALUES
            ($1, $2, $3, $4)
        RETURNING *;`,
        [firstname, lastname, email, passwordHash]
    );
};

exports.updatePassword = (email, hashed_newPassword) => {
    return db.query(
        ` UPDATE users SET hashed_password = $2 WHERE email = $1 `,
        [email, hashed_newPassword]
    );
};

exports.getUserByEmail = (email) => {
    return db.query(`SELECT * FROM users WHERE email = $1;`, [email]);
};
exports.getUserById = (id) => {
    return db.query(`SELECT * FROM users WHERE id = $1;`, [id]);
};

exports.updatePic = (userId, new_profile_picture_url) => {
    return db.query(
        `UPDATE users SET profile_picture_url = $2 WHERE id = $1 RETURNING * `,
        [userId, new_profile_picture_url]
    );
};

exports.updateBio = (userId, bio) => {
    return db.query(`UPDATE users SET bio = $2 WHERE id = $1 RETURNING *`, [
        userId,
        bio,
    ]);
};

exports.getMatchingUsers = (query) => {
    return db.query(
        `SELECT * FROM users WHERE firstname ILIKE $1 OR lastname ILIKE $1
ORDER BY created_at DESC
        ;`,
        [query + "%"]
    );
};

exports.getFriendRequest = (userId, otherId) => {
    return db.query(
        ` SELECT * FROM friend_requests WHERE (from_id=$1 AND to_id=$2) OR (from_id=$2 AND to_id=$1); `,
        [userId, otherId]
    );
};

exports.addFriendRequest = (userId, otherId) => {
    return db.query(
        `INSERT INTO friend_requests (from_id, to_id, accepted) VALUES ($1,$2, false) RETURNING * `,
        [userId, otherId]
    );
};

exports.deleteFriendRequest = (userId, otherId) => {
    return db.query(
        "DELETE FROM friend_requests WHERE (to_id = $1 AND from_id = $2) OR (to_id = $2 AND from_id = $1);",
        [userId, otherId]
    );
};

exports.setFriendRequestAccepted = (userId, otherId) => {
    return db.query(
        "UPDATE friend_requests SET accepted=true WHERE to_id = $1 AND from_id = $2;",
        [userId, otherId]
    );
};

exports.getFriends = (userId) => {
    return db.query(
        `
    SELECT
            users.id, firstname, lastname, profile_picture_url, accepted
        FROM friend_requests
        JOIN users
            ON (from_id=users.id AND to_id=$1          AND accepted=false)
            OR (from_id=users.id AND to_id=$1          AND accepted=true)
            OR (from_id=$1        AND to_id=users.id   AND accepted=true);
    `,
        [userId]
    );
};

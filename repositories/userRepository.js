const db = require("../configs/db/claudexBars");
require("dotenv").config();
var crypto = require('crypto');
class UserRepository {
    async findUserByUsername(username) {
        return await db.claudexBarsDB.query(`SELECT u.id,
                                                        u.username,
                                                        u.firstname,
                                                        u.lastname,
                                                        u.email,
                                                        u.profile
                                                 FROM users u
                                                 WHERE u.username = ?
                                                 GROUP BY u.id;`, [username]);
    }

    async findUserByUsernameAndPassword(username, password) {
        return await db.claudexBarsDB.query(`SELECT u.id,
                                                        u.username,
                                                        u.firstname,
                                                        u.lastname,
                                                        u.email,
                                                        u.profile
                                                 FROM users u
                                                 WHERE u.username = ?
                                                    AND u.password = ?`, [username, password]);
    }

    async findByIdBis(id) {
        return (await db.claudexBarsDB.query(
            "SELECT id, lower(username) AS username, msisdn, email, firstname, lastname, society, department, otp_mode AS otpMode, agency_id AS agencyId, " +
            "created_at AS createdAt, created_by AS createdBy, updated_at As updatedAt, updated_by AS updatedBy, deleted_at As deletedAt, deleted_by AS deletedBy " +
            "FROM users " +
            "WHERE id = ? AND deleted_at IS NULL",
            [id]
        ));
    }

    async save(user) {
        var text = process.env.KEY_PASS_SECRET
        var algorithm = process.env.ALGO
        var cipher = crypto.createCipher(algorithm, user.password)
        var crypted = cipher.update(text,'utf8','hex')
        crypted += cipher.final('hex')
        return await db.claudexBarsDB.query(
            `INSERT INTO users(username, email, firstname, lastname, password, created_at, created_by, profile)
             VALUES (?, ?, ?, ?, ?,now(), ?, ?)`,
            [user.username, user.email, user.firstname, user.lastname, crypted, user.createdBy, user.profile]
        );
    }

    async findById(id) {
        return (await db.claudexBarsDB.query(
            `SELECT u.id,
                    lower(u.username) AS username,
                    u.profile      AS profile,
                    u.email,
                    u.firstname,
                    u.lastname,
                    u.created_at      AS createdAt,
                    u.created_by      AS createdBy,
                    u.updated_at      As updatedAt,
                    u.updated_by      AS updatedBy,
                    u.deleted_at      As deletedAt,
                    u.deleted_by      AS deletedBy
             FROM users u
             WHERE u.id = ?
            AND u.deleted_at IS NULL
             GROUP BY u.id`,
            [id]
        ))[0];
    }

    async update(user) {
        var text = process.env.KEY_PASS_SECRET
        var algorithm = 'aes256';
        var cipher = crypto.createCipher(algorithm, user.password);
        var crypted = cipher.update(text,'utf8','hex');
        crypted += cipher.final('hex');
        return await db.claudexBarsDB.query(
            `UPDATE users
             SET username   = CASE WHEN ? IS NOT NULL THEN UPPER(?) ELSE username END,
                 email      = CASE WHEN ? IS NOT NULL THEN ? ELSE email END,
                 firstname  = CASE WHEN ? IS NOT NULL THEN ? ELSE firstname END,
                 lastname   = CASE WHEN ? IS NOT NULL THEN ? ELSE lastname END,
                 profile    = CASE WHEN ? IS NOT NULL THEN ? ELSE profile END,
                 password   = CASE WHEN ? IS NOT NULL THEN ? ELSE password END,
                 updated_at = now(),
                 updated_by = ?
             WHERE id = ?
               AND deleted_at is NULL`,
            [
                user.username, user.username,
                user.email, user.email,
                user.firstname, user.firstname,
                user.lastname, user.lastname,
                user.profile, user.profile,
                crypted, crypted,
                user.updatedBy,
                user.id
            ]
        );
    }

    async delete(authUserId, userId) {
        return await db.claudexBarsDB.query(
            "UPDATE users SET deleted_at = now(), deleted_by = ? WHERE id = ?", [authUserId, userId]
        );
    }

    async findAll() {
        return await db.claudexBarsDB.query(
            `SELECT u.id,
                    lower(u.username) AS username,
                    u.email,
                    u.firstname,
                    u.lastname,
                    u.created_at      AS createdAt,
                    u.created_by      AS createdBy,
                    u.updated_at      As updatedAt,
                    u.updated_by      AS updatedBy,
                    u.deleted_at      As deletedAt,
                    u.deleted_by      AS deletedBy,
                    u.profile,
                    u.password
             FROM users u
             WHERE deleted_at IS NULL
             GROUP BY u.id 
             ORDER BY u.id DESC `,
        );
    }

    async countFindAllUsers() {
        return (await db.claudexBarsDB.query(`SELECT CAST(count(id) AS VARCHAR(255)) AS userNumber
                                                  FROM users
                                                  WHERE deleted_by is null;`))[0];
    }

    async findAllByAgencyId(agencyId) {
        return await db.claudexBarsDB.query(
            `SELECT u.id,
                    lower(u.username) AS username,
                    u.msisdn,
                    u.email,
                    u.firstname,
                    u.lastname,
                    u.society,
                    u.department,
                    u.otp_mode        AS otpMode,
                    u.agency_id       AS agencyId,
                    u.created_at      AS createdAt,
                    u.created_by      AS createdBy,
                    u.updated_at      As updatedAt,
                    u.updated_by      AS updatedBy,
                    u.deleted_at      As deletedAt,
                    u.deleted_by      AS deletedBy,
                    p.name            AS profile
             FROM users u
                      INNER JOIN profile p on u.profile_id = p.id
                      INNER JOIN profile_role pr on p.id = pr.profile_id
                      INNER JOIN role r on pr.role_id = r.id
             WHERE deleted_at IS NULL
               AND u.agency_id = ?
             GROUP BY u.id`, [agencyId]
        );
    }

    async findAllByProfileId(profileId) {
        return await db.claudexBarsDB.query(
            `SELECT u.id,
                    lower(u.username) AS username,
                    u.msisdn,
                    u.email,
                    u.firstname,
                    u.lastname,
                    u.profile_id      AS profileId,
                    u.society,
                    u.department,
                    u.otp_mode        AS otpMode,
                    u.agency_id       AS agencyId,
                    u.created_at      AS createdAt,
                    u.created_by      AS createdBy,
                    u.updated_at      As updatedAt,
                    u.updated_by      AS updatedBy,
                    u.deleted_at      As deletedAt,
                    u.deleted_by      AS deletedBy,
                    p.name            AS profile
             FROM users u
                      INNER JOIN profile p on u.profile_id = p.id
                      INNER JOIN profile_role pr on p.id = pr.profile_id
                      INNER JOIN role r on pr.role_id = r.id
             WHERE deleted_at IS NULL
               AND u.profile_id = ?
             GROUP BY u.id`, [profileId]
        );
    }

    async getOptions() {
        return await db.claudexBarsDB.query(
            `SELECT COLUMN_NAME AS columnName, COLUMN_TYPE AS columnType
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = 'device_financing'
               AND TABLE_NAME = 'users'
               AND (COLUMN_NAME = 'society' OR COLUMN_NAME = 'department')`
        );
    }

    async findMatchedUniqueColumn(username, email) {
        return (await db.claudexBarsDB.query(
            `SELECT CASE
                        WHEN UPPER(username) = UPPER(?) THEN 'username'
                        WHEN UPPER(email) = UPPER(?) THEN 'email'
                        END AS matchedColumn
             FROM users
             WHERE UPPER(username) = UPPER(?)
                OR UPPER(email) = UPPER(?)`,
            [
                username, email,
                username, email
            ]
        ))[0];
    }
}

module.exports = new UserRepository();
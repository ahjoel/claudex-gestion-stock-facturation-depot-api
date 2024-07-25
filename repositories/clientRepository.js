const db = require("../configs/db/claudexBars");

class ClientRepository {

    async save(client) {
        return await db.claudexBarsDB.query(
            "INSERT INTO clients(code, name, description, type, tel, mail, created_by, created_at) VALUES(?, ?, ?, ?, ?, ?, ?, now())",
            [client.code, client.name, client.description, client.type, client.tel, client.mail, client.createdBy]
        );
    }

    async findById(id) {
        return (await db.claudexBarsDB.query(
            "SELECT id, code, name, description, type, tel, mail, created_at AS createdAt, created_by AS createdBy, updated_at As updatedAt, updated_by AS updatedBy, deleted_at As deletedAt, deleted_by AS deletedBy FROM clients WHERE deleted_at IS NULL AND id = ?",
            [id]
        ))[0];
    }

    async update(client) {
        return await db.claudexBarsDB.query(
            "UPDATE clients " +
            "SET" +
            "    code = CASE WHEN ? IS NOT NULL THEN ? ELSE code END," +
            "    name = CASE WHEN ? IS NOT NULL THEN ? ELSE name END," +
            "    description = CASE WHEN ? IS NOT NULL THEN ? ELSE description END," +
            "    type = CASE WHEN ? IS NOT NULL THEN ? ELSE type END," +
            "    tel = CASE WHEN ? IS NOT NULL THEN ? ELSE tel END," +
            "    mail = CASE WHEN ? IS NOT NULL THEN ? ELSE mail END," +
            "    updated_at = now()," +
            "    updated_by = ? " +
            "WHERE" +
            "    id = ?",
            [client.code, client.code, client.name, client.name, client.description, client.description,  client.type, client.type, client.tel, client.tel, client.mail, client.mail, client.updatedBy, client.id]
        );
    }

    async findAll(limit, offset) {
        return await db.claudexBarsDB.query(
            "SELECT id, code, name, description, type, tel, mail, created_at AS createdAt, created_by AS createdBy, updated_at As updatedAt, updated_by AS updatedBy, deleted_at As deletedAt, deleted_by AS deletedBy FROM clients WHERE deleted_at IS NULL ORDER BY id DESC LIMIT ? OFFSET ?",[limit, offset]
        );
    }

    async countFindAllClients() {
        return (await db.claudexBarsDB.query(`SELECT CAST(count(id) AS VARCHAR(255)) AS clientNumber
                                                  FROM clients
                                                  WHERE deleted_by is null;`))[0];
    }

    async delete(authUserId, clientId) {
        return await db.claudexBarsDB.query(
            "UPDATE clients SET deleted_at = now(), deleted_by = ? WHERE id = ?", [authUserId, clientId]
        );
    }
}

module.exports = new ClientRepository();
const db = require("../configs/db/claudexBars");

class ModelRepository {

    async save(model) {
        return await db.claudexBarsDB.query(
            "INSERT INTO models(name, description, created_by, created_at) VALUES(?, ?, ?, now())",
            [model.name, model.description, model.createdBy]
        );
    }

    async findById(id) {
        return (await db.claudexBarsDB.query(
            "SELECT id, name, description, created_at AS createdAt, created_by AS createdBy, updated_at As updatedAt, updated_by AS updatedBy, deleted_at As deletedAt, deleted_by AS deletedBy FROM models WHERE deleted_at IS NULL AND id = ?",
            [id]
        ))[0];
    }

    async update(model) {
        return await db.claudexBarsDB.query(
            "UPDATE models " +
            "SET" +
            "    name = CASE WHEN ? IS NOT NULL THEN ? ELSE name END," +
            "    description = CASE WHEN ? IS NOT NULL THEN ? ELSE description END," +
            "    updated_at = now()," +
            "    updated_by = ? " +
            "WHERE" +
            "    id = ?",
            [model.name, model.name, model.description, model.description, model.updatedBy, model.id]
        );
    }

    async findAll(limit, offset) {
        return await db.claudexBarsDB.query(
            "SELECT id, name, description, created_at AS createdAt, created_by AS createdBy, updated_at As updatedAt, updated_by AS updatedBy, deleted_at As deletedAt, deleted_by AS deletedBy FROM models WHERE deleted_at IS NULL ORDER BY id DESC LIMIT ? OFFSET ?",[limit, offset]
        );
    }

    async countFindAllModels() {
        return (await db.claudexBarsDB.query(`SELECT CAST(count(id) AS VARCHAR(255)) AS modelNumber
                                                  FROM models
                                                  WHERE deleted_by is null;`))[0];
    }

    async delete(authUserId, modelId) {
        return await db.claudexBarsDB.query(
            "UPDATE models SET deleted_at = now(), deleted_by = ? WHERE id = ?", [authUserId, modelId]
        );
    }
}

module.exports = new ModelRepository();
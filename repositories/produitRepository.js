const db = require("../configs/db/claudexBars");

class ProduitRepository {
  async save(produit) {
    return await db.claudexBarsDB.query(
      "INSERT INTO produits (code, name, description, model_id, fournisseur_id, pv, stock_min, created_by, created_at) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, now());",
      [
        produit.code,
        produit.name,
        produit.description,
        produit.modelId,
        produit.fournisseurId,
        produit.pv,
        produit.stock_min,
        produit.createdBy,
      ]
    );
  }

  async update(produit) {
    return await db.claudexBarsDB.query(
      `UPDATE produits
             SET code             = CASE WHEN ? IS NOT NULL THEN ? ELSE code END,
                 name             = CASE WHEN ? IS NOT NULL THEN ? ELSE name END,
                 description             = CASE WHEN ? IS NOT NULL THEN ? ELSE description END,
                 model_id = CASE WHEN ? IS NOT NULL THEN ? ELSE model_id END,
                 fournisseur_id         = CASE WHEN ? IS NOT NULL THEN ? ELSE fournisseur_id END,
                 pv         = CASE WHEN ? IS NOT NULL THEN ? ELSE pv END,
                 stock_min          = CASE WHEN ? IS NOT NULL THEN ? ELSE stock_min END,
                 updated_by        = ?,
                 updated_at        = now()
             WHERE id = ?`,
      [
        produit.code,
        produit.code,
        produit.name,
        produit.name,
        produit.description,
        produit.description,
        produit.modelId,
        produit.modelId,
        produit.fournisseurId,
        produit.fournisseurId,
        produit.pv,
        produit.pv,
        produit.stock_min,
        produit.stock_min,
        produit.updatedBy,
        produit.id,
      ]
    );
  }

  async findById(id) {
    return (
      await db.claudexBarsDB.query(
            `SELECT p.id,
                    p.code,
                    p.name,
                    p.description,
                    p.model_id      AS modelId,
                    p.fournisseur_id      AS fournisseurId,
                    p.pv,
                    p.stock_min,
                    p.created_at      AS createdAt,
                    p.created_by      AS createdBy,
                    p.updated_at      As updatedAt,
                    p.updated_by      AS updatedBy,
                    p.deleted_at      As deletedAt,
                    p.deleted_by      AS deletedBy,
                    f.name            AS fournisseur,
                    m.name            AS model
            FROM produits p    
                    INNER JOIN fournisseurs f on p.fournisseur_id = f.id
                    INNER JOIN models m on p.model_id = m.id
            WHERE p.id = ?
            AND p.deleted_at IS NULL
            GROUP BY p.id`,
        [id]
      )
    )[0];
  }

  async findAll(limit, offset) {
    return await db.claudexBarsDB.query(
            `SELECT p.id,
                    p.code,
                    p.name,
                    p.description,
                    p.model_id      AS modelId,
                    p.fournisseur_id      AS fournisseurId,
                    p.pv,
                    p.stock_min,
                    p.created_at      AS createdAt,
                    p.created_by      AS createdBy,
                    p.updated_at      As updatedAt,
                    p.updated_by      AS updatedBy,
                    p.deleted_at      As deletedAt,
                    p.deleted_by      AS deletedBy,
                    f.name            AS fournisseur,
                    m.name            AS model
            FROM produits p    
                    INNER JOIN fournisseurs f on p.fournisseur_id = f.id
                    INNER JOIN models m on p.model_id = m.id
            WHERE p.deleted_at IS NULL
            GROUP BY p.id 
            ORDER BY p.id DESC
            LIMIT ?
            OFFSET ?`,
      [limit, offset]
    );
  }

  async countFindAllProduit() {
    return (
      await db.claudexBarsDB
        .query(`SELECT CAST(count(id) AS VARCHAR(255)) AS produitNumber
                                                  FROM produits
                                                  WHERE deleted_by is null`)
    )[0];
  }

  async delete(authUserId, produitId) {
    return await db.claudexBarsDB.query(
      "UPDATE produits SET deleted_at = now(), deleted_by = ? WHERE id = ?",
      [authUserId, produitId]
    );
  }
}

module.exports = new ProduitRepository();

const db = require("../configs/db/claudexBars");

class MouvementRepository {
  async save(mouvement) {
    return await db.claudexBarsDB.query(
      "INSERT INTO mouvements (code, produit_id, types, qte, stock, created_by, created_at) VALUES ( ?, ?, ?, ?, ?, ?, now());",
      [
        mouvement.code,
        mouvement.produitId,
        mouvement.types,
        mouvement.qte,
        mouvement.stock,
        mouvement.createdBy,
      ]
    );
  }

  async saveSortie(mouvement) {
    return await db.claudexBarsDB.query(
      "INSERT INTO mouvements (code, produit_id, facture_id, types, qte, pv, stock, created_by, created_at) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, now());",
      [
        mouvement.code,
        mouvement.produitId,
        mouvement.factureId,
        mouvement.types,
        mouvement.qte,
        mouvement.pv,
        mouvement.stock,
        mouvement.createdBy,
      ]
    );
  }

  async update(mouvement) {
    return await db.claudexBarsDB.query(
            `UPDATE mouvements
             SET code             = CASE WHEN ? IS NOT NULL THEN ? ELSE code END,
                 produit_id             = CASE WHEN ? IS NOT NULL THEN ? ELSE produit_id END,
                 types             = CASE WHEN ? IS NOT NULL THEN ? ELSE types END,
                 qte             = CASE WHEN ? IS NOT NULL THEN ? ELSE qte END,
                 stock          = CASE WHEN ? IS NOT NULL THEN ? ELSE stock END,
                 updated_by        = ?,
                 updated_at        = now()
             WHERE id = ?`,
      [
        mouvement.code,
        mouvement.code,
        mouvement.produitId,
        mouvement.produitId,
        mouvement.types,
        mouvement.types,
        mouvement.qte,
        mouvement.qte,
        mouvement.stock,
        mouvement.stock,
        mouvement.updatedBy,
        mouvement.id,
      ]
    );
  }

  async findById(id) {
    return (
      await db.claudexBarsDB.query(
            `SELECT m.id,
                    m.code,
                    m.produit_id      AS produitId,
                    m.types,
                    m.qte,
                    m.stock,
                    m.created_at      AS createdAt,
                    m.created_by      AS createdBy,
                    m.updated_at      As updatedAt,
                    m.updated_by      AS updatedBy,
                    m.deleted_at      As deletedAt,
                    m.deleted_by      AS deletedBy,
                    p.name            AS produit,
                    mo.name           AS model,
                    f.name            AS fournisseur
            FROM mouvements m    
                    INNER JOIN produits p on m.produit_id = p.id
                    INNER JOIN models mo on p.model_id = mo.id
                    INNER JOIN fournisseurs f on p.fournisseur_id = f.id
            WHERE m.id = ?
            AND m.stock= 'R1'
            AND m.deleted_at IS NULL
            GROUP BY m.id`,
        [id]
      )
    )[0];
  }

  async findByIdRC(id) {
    return (
      await db.claudexBarsDB.query(
            `SELECT m.id,
                    m.code,
                    m.produit_id      AS produitId,
                    m.types,
                    m.qte,
                    m.stock,
                    m.created_at      AS createdAt,
                    m.created_by      AS createdBy,
                    m.updated_at      As updatedAt,
                    m.updated_by      AS updatedBy,
                    m.deleted_at      As deletedAt,
                    m.deleted_by      AS deletedBy,
                    p.name            AS produit,
                    mo.name           AS model,
                    f.name            AS fournisseur
            FROM mouvements m    
                    INNER JOIN produits p on m.produit_id = p.id
                    INNER JOIN models mo on p.model_id = mo.id
                    INNER JOIN fournisseurs f on p.fournisseur_id = f.id
            WHERE m.id = ?
            AND m.stock= 'RC'
            AND m.deleted_at IS NULL
            GROUP BY m.id`,
        [id]
      )
    )[0];
  }

  async findAllEntreeR1(limit, offset) {
    return await db.claudexBarsDB.query(
            `SELECT m.id,
                    m.code,
                    m.produit_id      AS produitId,
                    m.types,
                    m.qte,
                    m.stock,
                    m.created_at      AS createdAt,
                    m.created_by      AS createdBy,
                    m.updated_at      As updatedAt,
                    m.updated_by      AS updatedBy,
                    m.deleted_at      As deletedAt,
                    m.deleted_by      AS deletedBy,
                    p.name            AS produit,
                    mo.name           AS model,
                    f.name            AS fournisseur
            FROM mouvements m    
                    INNER JOIN produits p on m.produit_id = p.id
                    INNER JOIN models mo on p.model_id = mo.id
                    INNER JOIN fournisseurs f on p.fournisseur_id = f.id
            WHERE m.deleted_at IS NULL
            AND m.stock= 'R1'
            AND m.types= 'ADD'
            GROUP BY m.id 
            ORDER BY m.id DESC
            LIMIT ?
            OFFSET ?`,
      [limit, offset]
    );
  }

  async findAllEntreeRC(limit, offset) {
    return await db.claudexBarsDB.query(
            `SELECT m.id,
                    m.code,
                    m.produit_id      AS produitId,
                    m.types,
                    m.qte,
                    m.stock,
                    m.created_at      AS createdAt,
                    m.created_by      AS createdBy,
                    m.updated_at      As updatedAt,
                    m.updated_by      AS updatedBy,
                    m.deleted_at      As deletedAt,
                    m.deleted_by      AS deletedBy,
                    p.name            AS produit,
                    mo.name           AS model,
                    f.name            AS fournisseur
            FROM mouvements m    
                    INNER JOIN produits p on m.produit_id = p.id
                    INNER JOIN models mo on p.model_id = mo.id
                    INNER JOIN fournisseurs f on p.fournisseur_id = f.id
            WHERE m.deleted_at IS NULL
            AND m.stock= 'RC'
            AND m.types= 'ADD'
            GROUP BY m.id 
            ORDER BY m.id DESC
            LIMIT ?
            OFFSET ?`,
      [limit, offset]
    );
  }

  async factureCode() {
    return await db.claudexBarsDB.query(
      `
        SELECT
        CAST(MONTH(f.created_at) AS VARCHAR(255)) as num_mois,
        CAST(COUNT(f.id) AS VARCHAR(255)) as nb_id_deja
        FROM factures f 
        WHERE MONTH(f.created_at) = MONTH(CURRENT_DATE)
      `
    );
  }

  // async findAllEntreeRC(limit, offset) {
  //   return await db.claudexBarsDB.query(
  //           `SELECT m.id,
  //                   m.code,
  //                   m.produit_id      AS produitId,
  //                   m.types,
  //                   m.qte,
  //                   m.stock,
  //                   m.created_at      AS createdAt,
  //                   m.created_by      AS createdBy,
  //                   m.updated_at      As updatedAt,
  //                   m.updated_by      AS updatedBy,
  //                   m.deleted_at      As deletedAt,
  //                   m.deleted_by      AS deletedBy,
  //                   p.name            AS produit,
  //                   mo.name           AS model
  //           FROM mouvements m    
  //                   INNER JOIN produits p on m.produit_id = p.id
  //                   INNER JOIN models mo on p.model_id = mo.id
  //           WHERE m.deleted_at IS NULL
  //           AND m.stock= 'RC'
  //           AND m.types= 'ADD'
  //           GROUP BY m.id LIMIT ?
  //           OFFSET ?`,
  //     [limit, offset]
  //   );
  // }

  async findAllEntreeR1Dispo(limit, offset) {
    return await db.claudexBarsDB.query(
            `
            SELECT p.id as id, p.name as produit, m2.name as model, f.name as fournisseur,
              sum(case 
                      when m.created_at  < '2024-05-19'
                      then case m.types when 'OUT' then -1 else 1 end
                      else 0 
                  end * qte) AS st_init,
              sum(case
                      when m.created_at BETWEEN '2024-05-19' AND now()
                      AND m.types = 'ADD' then qte 
                      else 0 
              end) AS qt_e,
              sum(case 
                      when m.created_at BETWEEN '2024-05-19' AND now()
                      AND m.types = 'OUT' then qte 
                      else 0 
                  end) AS qt_s, 
              sum(case m.types when 'OUT' then -1 else 1 end * qte) AS st_dispo, p.stock_min as stockMinimal, p.pv as pv
            FROM mouvements m
            inner join produits p on m.produit_id = p.id 
            INNER JOIN models m2 on p.model_id = m2.id
            INNER JOIN fournisseurs f on p.fournisseur_id = f.id
            AND m.deleted_at IS NULL
            AND m.stock= 'R1'
            AND m.created_at <= now()
            GROUP BY p.id 
            order by p.name 
            LIMIT ? OFFSET ?
          `,
      [limit, offset]
    );
  }

  async findAllEntreeRCDispo(limit, offset) {
    return await db.claudexBarsDB.query(
            `
            SELECT p.id as id, p.name as produit, m2.name as model, f.name as fournisseur,
              sum(case 
                      when m.created_at  < '2024-05-19'
                      then case m.types when 'OUT' then -1 else 1 end
                      else 0 
                  end * qte) AS st_init,
              sum(case
                      when m.created_at BETWEEN '2024-05-19' AND now()
                      AND m.types = 'ADD' then qte 
                      else 0 
              end) AS qt_e,
              sum(case 
                      when m.created_at BETWEEN '2024-05-19' AND now()
                      AND m.types = 'OUT' then qte 
                      else 0 
                  end) AS qt_s, 
              sum(case m.types when 'OUT' then -1 else 1 end * qte) AS st_dispo, p.stock_min as stockMinimal, p.pv as pv
            FROM mouvements m
            inner join produits p on m.produit_id = p.id 
            INNER JOIN models m2 on p.model_id = m2.id
            INNER JOIN fournisseurs f on p.fournisseur_id = f.id
            AND m.deleted_at IS NULL
            AND m.stock= 'RC'
            AND m.created_at <= now()
            GROUP BY p.id 
            order by p.name 
            LIMIT ? OFFSET ?
          `,
      [limit, offset]
    );
  }

  async findAllVerifierStockR1DispoProduit(produitId) {
    return await db.claudexBarsDB.query(
            `
            SELECT p.id as id, p.name as produit, m2.name as model, f.name as fournisseur,
              sum(case 
                      when m.created_at  < '2024-05-19'
                      then case m.types when 'OUT' then -1 else 1 end
                      else 0 
                  end * qte) AS st_init,
              sum(case
                      when m.created_at BETWEEN '2024-05-19' AND now()
                      AND m.types = 'ADD' then qte 
                      else 0 
              end) AS qt_e,
              sum(case 
                      when m.created_at BETWEEN '2024-05-19' AND now()
                      AND m.types = 'OUT' then qte 
                      else 0 
                  end) AS qt_s, 
              sum(case m.types when 'OUT' then -1 else 1 end * qte) AS st_dispo, p.stock_min as stockMinimal, p.pv as pv
            FROM mouvements m
            inner join produits p on m.produit_id = p.id 
            INNER JOIN models m2 on p.model_id = m2.id
            INNER JOIN fournisseurs f on p.fournisseur_id = f.id
            AND m.deleted_at IS NULL
            AND m.stock= ?
            AND m.created_at <= now()
            WHERE p.id= ?
          `,
      ["R1", produitId]
    );
  }

  async findAllVerifierStockRCDispoProduit(produitId) {
    return await db.claudexBarsDB.query(
            `
            SELECT p.id as id, p.name as produit, m2.name as model, f.name as fournisseur,
              sum(case 
                      when m.created_at  < '2024-05-19'
                      then case m.types when 'OUT' then -1 else 1 end
                      else 0 
                  end * qte) AS st_init,
              sum(case
                      when m.created_at BETWEEN '2024-05-19' AND now()
                      AND m.types = 'ADD' then qte 
                      else 0 
              end) AS qt_e,
              sum(case 
                      when m.created_at BETWEEN '2024-05-19' AND now()
                      AND m.types = 'OUT' then qte 
                      else 0 
                  end) AS qt_s, 
              sum(case m.types when 'OUT' then -1 else 1 end * qte) AS st_dispo, p.stock_min as stockMinimal, p.pv as pv
            FROM mouvements m
            inner join produits p on m.produit_id = p.id 
            INNER JOIN models m2 on p.model_id = m2.id
            INNER JOIN fournisseurs f on p.fournisseur_id = f.id
            AND m.deleted_at IS NULL
            AND m.stock= ?
            AND m.created_at <= now()
            WHERE p.id= ?
          `,
      ["RC", produitId]
    );
  }

  async countFindAllEntreeR1Dispo() {
    return (
      await db.claudexBarsDB
        .query(`
        SELECT CAST(count(sous_requete.produitId) AS VARCHAR(255)) AS entreeR1DispoNumber 
        FROM
        (SELECT p.id as produitId, p.name as produit, m2.name as model, f.name as fournisseur,
          sum(case 
                  when m.created_at  < '2024-05-19'
                  then case m.types when 'OUT' then -1 else 1 end
                  else 0 
              end * qte) AS st_init,
          sum(case
                  when m.created_at BETWEEN '2024-05-19' AND now() 
                  AND m.types = 'ADD' then qte 
                  else 0 
          end) AS qt_e,
          sum(case 
                  when m.created_at BETWEEN '2024-05-19' AND now() 
                  AND m.types = 'OUT' then qte 
                  else 0 
              end) AS qt_s, 
          sum(case m.types when 'OUT' then -1 else 1 end * qte) AS st_dispo, p.stock_min as stockMinimal
        FROM mouvements m
        inner join produits p on m.produit_id = p.id 
        INNER JOIN models m2 on p.model_id = m2.id
        INNER JOIN fournisseurs f on p.fournisseur_id = f.id
        AND m.deleted_at IS NULL
        AND m.stock= 'R1'
        AND m.created_at <= now()
        GROUP BY p.id
        order by p.name)
        as sous_requete
        `)
    )[0];
  }

  async countFindAllEntreeRCDispo() {
    return (
      await db.claudexBarsDB
        .query(`
        SELECT CAST(count(sous_requete.produitId) AS VARCHAR(255)) AS entreeRCDispoNumber 
        FROM
        (SELECT p.id as produitId, p.name as produit, m2.name as model, f.name as fournisseur,
          sum(case 
                  when m.created_at  < '2024-05-19'
                  then case m.types when 'OUT' then -1 else 1 end
                  else 0 
              end * qte) AS st_init,
          sum(case
                  when m.created_at BETWEEN '2024-05-19' AND now() 
                  AND m.types = 'ADD' then qte 
                  else 0 
          end) AS qt_e,
          sum(case 
                  when m.created_at BETWEEN '2024-05-19' AND now() 
                  AND m.types = 'OUT' then qte 
                  else 0 
              end) AS qt_s, 
          sum(case m.types when 'OUT' then -1 else 1 end * qte) AS st_dispo, p.stock_min as stockMinimal
        FROM mouvements m
        inner join produits p on m.produit_id = p.id 
        INNER JOIN models m2 on p.model_id = m2.id
        INNER JOIN fournisseurs f on p.fournisseur_id = f.id
        AND m.deleted_at IS NULL
        AND m.stock= 'RC'
        AND m.created_at <= now()
        GROUP BY p.id
        order by p.name)
        as sous_requete
        `)
    )[0];
  }

  async countFindAllEntreeR1() {
    return (
      await db.claudexBarsDB
        .query(`SELECT CAST(count(id) AS VARCHAR(255)) AS entreeR1Number
                                                  FROM mouvements
                                                  WHERE deleted_by is null AND types='ADD' AND stock='R1'`)
    )[0];
  }

  async countFindAllEntreeRC() {
    return (
      await db.claudexBarsDB
        .query(`SELECT CAST(count(id) AS VARCHAR(255)) AS entreeRCNumber
                                                  FROM mouvements
                                                  WHERE deleted_by is null AND types='ADD' AND stock='RC'`)
    )[0];
  }

  async countFindAllEntreeRC() {
    return (
      await db.claudexBarsDB
        .query(`SELECT CAST(count(id) AS VARCHAR(255)) AS entreeRCNumber
                                                  FROM mouvements
                                                  WHERE deleted_by is null AND types='ADD' AND stock='RC'`)
    )[0];
  }

  
  async delete(authUserId, produitId) {
    return await db.claudexBarsDB.query(
      "UPDATE mouvements SET deleted_at = now(), deleted_by = ? WHERE id = ?",
      [authUserId, produitId]
    );
  }
  
  async deleteMouvementSortie(mouvementId) {
    return await db.claudexBarsDB.query(
      "DELETE FROM mouvements WHERE id = ?", [mouvementId]
    );
  }
}

module.exports = new MouvementRepository();

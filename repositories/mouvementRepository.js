const db = require("../configs/db/claudexBars");

class MouvementRepository {
  async save(mouvement) {
    return await db.claudexBarsDB.query(
      "INSERT INTO mouvements (code, produit_id, types, qte, created_by, created_at) VALUES ( ?, ?, ?, ?, ?, now());",
      [
        mouvement.code,
        mouvement.produitId,
        mouvement.types,
        mouvement.qte,
        mouvement.createdBy,
      ]
    );
  }

  async saveSortie(mouvement) {
    return await db.claudexBarsDB.query(
      "INSERT INTO mouvements (code, produit_id, facture_id, types, qte, pv, created_by, created_at) VALUES ( ?, ?, ?, ?, ?, ?, ?, now());",
      [
        mouvement.code,
        mouvement.produitId,
        mouvement.factureId,
        mouvement.types,
        mouvement.qte,
        mouvement.pv,
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
        CAST(YEAR(CURDATE()) AS VARCHAR(255)) as annee,
        CAST(MONTH(CURDATE()) AS VARCHAR(255)) as num_mois,
        CAST(MAX(f.id) AS VARCHAR(255)) as nb_id_deja
        FROM 
        factures f;
      `
    );
  }

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
              sum(case m.types when 'OUT' then -1 else 1 end * qte) AS st_dispo, p.seuil as seuil, p.pv as pv
            FROM mouvements m
            inner join produits p on m.produit_id = p.id 
            INNER JOIN models m2 on p.model_id = m2.id
            INNER JOIN fournisseurs f on p.fournisseur_id = f.id
            AND m.deleted_at IS NULL
            AND m.created_at <= now()
            GROUP BY p.id 
            order by p.name 
            LIMIT ? OFFSET ?
          `,
      [limit, offset]
    );
  }
  async findAllEntreeR1DispoByProduit(produitId, limit, offset) {
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
              sum(case m.types when 'OUT' then -1 else 1 end * qte) AS st_dispo, p.seuil as seuil, p.pv as pv
            FROM mouvements m
            inner join produits p on m.produit_id = p.id 
            INNER JOIN models m2 on p.model_id = m2.id
            INNER JOIN fournisseurs f on p.fournisseur_id = f.id
            AND m.deleted_at IS NULL
            AND m.created_at <= now()
            AND p.id = ?
            GROUP BY p.id 
            order by p.name 
            LIMIT ? OFFSET ?
          `,
      [produitId, limit, offset]
    );
  }

  async findAllVerifierStockR1DispoProduit(produitId) {
    return await db.claudexBarsDB.query(
      `
            SELECT p.id as id, p.name as produit, m2.name as model, f.name as fournisseur,
              sum(case 
                      when m.created_at  < '2024-07-06'
                      then case m.types when 'OUT' then -1 else 1 end
                      else 0 
                  end * qte) AS st_init,
              sum(case
                      when m.created_at BETWEEN '2024-07-06' AND now()
                      AND m.types = 'ADD' then qte 
                      else 0 
              end) AS qt_e,
              sum(case 
                      when m.created_at BETWEEN '2024-07-06' AND now()
                      AND m.types = 'OUT' then qte 
                      else 0 
                  end) AS qt_s, 
              sum(case m.types when 'OUT' then -1 else 1 end * qte) AS st_dispo, p.seuil as stockMinimal, p.pv as pv
            FROM mouvements m
            inner join produits p on m.produit_id = p.id 
            INNER JOIN models m2 on p.model_id = m2.id
            INNER JOIN fournisseurs f on p.fournisseur_id = f.id
            AND m.deleted_at IS NULL
            AND m.created_at <= now()
            AND p.id= ?
          `,
      [produitId]
    );
  }

  async findAllStatReglementParMois() {
    return await db.claudexBarsDB.query(
      `
            SELECT
            CAST(ROW_NUMBER() OVER () AS VARCHAR(255)) AS id,
            CONCAT(
                CASE MONTH(r.created_at)
                    WHEN 1 THEN 'Janvier'
                    WHEN 2 THEN 'Février'
                    WHEN 3 THEN 'Mars'
                    WHEN 4 THEN 'Avril'
                    WHEN 5 THEN 'Mai'
                    WHEN 6 THEN 'Juin'
                    WHEN 7 THEN 'Juillet'
                    WHEN 8 THEN 'Août'
                    WHEN 9 THEN 'Septembre'
                    WHEN 10 THEN 'Octobre'
                    WHEN 11 THEN 'Novembre'
                    WHEN 12 THEN 'Décembre'
                END,
                ' ',
                YEAR(r.created_at)
            ) AS Mois_Annee,
            SUM(r.totalFacture) AS MontantTotal
        FROM
            reglements r
        GROUP BY
            YEAR(r.created_at), MONTH(r.created_at)
        ORDER BY
            YEAR(r.created_at), MONTH(r.created_at)
          `
    );
  }

  async findAllStatReglementParMoisTotal() {
    return (await db.claudexBarsDB.query(
      `
        SELECT SUM(MontantTotal) AS Grand_Total
        FROM (
        SELECT
            CONCAT(
                CASE MONTH(r.created_at)
                    WHEN 1 THEN 'Janvier'
                    WHEN 2 THEN 'Février'
                    WHEN 3 THEN 'Mars'
                    WHEN 4 THEN 'Avril'
                    WHEN 5 THEN 'Mai'
                    WHEN 6 THEN 'Juin'
                    WHEN 7 THEN 'Juillet'
                    WHEN 8 THEN 'Août'
                    WHEN 9 THEN 'Septembre'
                    WHEN 10 THEN 'Octobre'
                    WHEN 11 THEN 'Novembre'
                    WHEN 12 THEN 'Décembre'
                END,
                ' ',
                YEAR(r.created_at)
            ) AS Mois_Annee,
            SUM(r.totalFacture) AS MontantTotal
        FROM
            reglements r
        GROUP BY
            YEAR(r.created_at), MONTH(r.created_at)
        ORDER BY
            YEAR(r.created_at), MONTH(r.created_at)
            ) AS sous_requete
          `)
    )[0];
  }

  async countFindAllEntreeR1Dispo() {
    return (
      await db.claudexBarsDB.query(`
        SELECT CAST(count(sous_requete.produitId) AS VARCHAR(255)) AS entreeR1DispoNumber 
        FROM
        (SELECT p.id as produitId, p.name as produit, m2.name as model, f.name as fournisseur,
          sum(case 
                  when m.created_at  < '2024-07-06'
                  then case m.types when 'OUT' then -1 else 1 end
                  else 0 
              end * qte) AS st_init,
          sum(case
                  when m.created_at BETWEEN '2024-07-06' AND now() 
                  AND m.types = 'ADD' then qte 
                  else 0 
          end) AS qt_e,
          sum(case 
                  when m.created_at BETWEEN '2024-07-06' AND now() 
                  AND m.types = 'OUT' then qte 
                  else 0 
              end) AS qt_s, 
          sum(case m.types when 'OUT' then -1 else 1 end * qte) AS st_dispo, p.seuil as seuil
        FROM mouvements m
        inner join produits p on m.produit_id = p.id 
        INNER JOIN models m2 on p.model_id = m2.id
        INNER JOIN fournisseurs f on p.fournisseur_id = f.id
        AND m.deleted_at IS NULL
        AND m.created_at <= now()
        GROUP BY p.id
        order by p.name)
        as sous_requete
        `)
    )[0];
  }

  async countFindAllEntreeR1DispoByProduit(produitId) {
    return (
      await db.claudexBarsDB.query(`
        SELECT CAST(count(sous_requete.produitId) AS VARCHAR(255)) AS entreeR1DispoNumber 
        FROM
        (SELECT p.id as produitId, p.name as produit, m2.name as model, f.name as fournisseur,
          sum(case 
                  when m.created_at  < '2024-07-06'
                  then case m.types when 'OUT' then -1 else 1 end
                  else 0 
              end * qte) AS st_init,
          sum(case
                  when m.created_at BETWEEN '2024-07-06' AND now() 
                  AND m.types = 'ADD' then qte 
                  else 0 
          end) AS qt_e,
          sum(case 
                  when m.created_at BETWEEN '2024-07-06' AND now() 
                  AND m.types = 'OUT' then qte 
                  else 0 
              end) AS qt_s, 
          sum(case m.types when 'OUT' then -1 else 1 end * qte) AS st_dispo, p.seuil as seuil
        FROM mouvements m
        inner join produits p on m.produit_id = p.id 
        INNER JOIN models m2 on p.model_id = m2.id
        INNER JOIN fournisseurs f on p.fournisseur_id = f.id
        AND m.deleted_at IS NULL
        AND m.created_at <= now()
        AND p.id = ?
        GROUP BY p.id
        order by p.name)
        as sous_requete
        `, [produitId])
    )[0];
  }

  async countFindAllEntreeR1() {
    return (
      await db.claudexBarsDB
        .query(`SELECT CAST(count(id) AS VARCHAR(255)) AS entreeR1Number
                                                  FROM mouvements
                                                  WHERE deleted_by is null AND types='ADD'`)
    )[0];
  }

  async delete(produitId) {
    return await db.claudexBarsDB.query("DELETE FROM mouvements WHERE id = ?", [
      produitId,
    ]);
  }

  async deleteMouvementSortie(mouvementId) {
    return await db.claudexBarsDB.query("DELETE FROM mouvements WHERE id = ?", [
      mouvementId,
    ]);
  }
}

module.exports = new MouvementRepository();

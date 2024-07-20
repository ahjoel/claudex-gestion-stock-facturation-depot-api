const db = require("../configs/db/claudexBars");

class ReglementRepository {
  async save(reglement) {
    return await db.claudexBarsDB.query(
      "INSERT INTO reglements(facture_id, mtrecu, mtpayer, created_by, created_at) VALUES(?, ?, ?, ?, now())",
      [
        reglement.factureId,
        reglement.mtrecu,
        reglement.mtpayer,
        reglement.createdBy,
      ]
    );
  }

  // async delete(reglementId) {
  //   return await db.claudexBarsDB.query("DELETE FROM reglements WHERE id = ?", [
  //     reglementId,
  //   ]);
  // }

  async delete(authUserId, reglementId) {
    return await db.claudexBarsDB.query(
      "UPDATE reglements SET deleted_at = now(), deleted_by = ? WHERE id = ?",
      [authUserId, reglementId]
    );
  }

  async findById(id) {
    return (
      await db.claudexBarsDB.query(
        "SELECT id, facture_id, mtrecu, mtpayer, created_at AS createdAt, created_by AS createdBy, updated_at As updatedAt, updated_by AS updatedBy FROM reglements WHERE id = ?",
        [id]
      )
    )[0];
  }

  async update(reglement) {
    return await db.claudexBarsDB.query(
        "UPDATE reglements " +
        "SET" +
        "    facture_id = CASE WHEN ? IS NOT NULL THEN ? ELSE facture_id END," +
        "    mtrecu = CASE WHEN ? IS NOT NULL THEN ? ELSE mtrecu END," +
        "    mtpayer = CASE WHEN ? IS NOT NULL THEN ? ELSE mtpayer END," +
        "    updated_at = now()," +
        "    updated_by = ? " +
        "WHERE" +
        "    id = ?",
        [reglement.factureId, reglement.factureId, reglement.mtrecu, reglement.mtrecu, reglement.mtpayer, reglement.mtpayer, reglement.updatedBy, reglement.id]
    );
}

  async findAll(limit, offset) {
    return await db.claudexBarsDB.query(
      `
        SELECT 
            r2.id AS id,
            f.code AS code,
            r2.created_at as createdAt,
            f.id AS factureId,
            c.name as client,
            r2.mtrecu,
            r2.mtpayer,
            u.username as auteur
        FROM 
            claudex_depot.reglements r2
        LEFT JOIN 
            claudex_depot.factures f ON f.id = r2.facture_id
        LEFT JOIN 
            claudex_depot.clients c ON c.id = f.client_id
        LEFT JOIN 
            claudex_depot.users u ON u.id = r2.created_by 
        WHERE 
          r2.deleted_by is null 
        AND 
          c.deleted_by is null
        ORDER BY
          r2.id DESC 
        LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );
  }

  async findAll_Situation_Reglement(limit, offset) {
    return await db.claudexBarsDB.query(
      `
        SELECT 
            f.id AS id,
            f.code AS codeFacture,
            f.created_at as createdAt,
            c.name as client,
            (m.mt_a_payerr - f.remise) AS mt_a_payer,
            COALESCE(r.mt_encaisse, 0) AS mt_encaisse,
            (m.mt_a_payerr - f.remise - COALESCE(r.mt_encaisse, 0)) AS mt_restant,
            u.username as auteur
        FROM 
            claudex_depot.factures f
        LEFT JOIN 
            (SELECT 
                facture_id, 
                SUM(pv * qte) AS mt_a_payerr 
            FROM 
                claudex_depot.mouvements 
            WHERE 
                deleted_by IS NULL 
            GROUP BY 
                facture_id
            ) m ON f.id = m.facture_id
        LEFT JOIN 
            (SELECT 
                facture_id, 
                SUM(mtpayer) AS mt_encaisse 
            FROM 
                claudex_depot.reglements 
            WHERE 
                deleted_by IS NULL 
            GROUP BY 
                facture_id
            ) r ON f.id = r.facture_id
        LEFT JOIN 
            claudex_depot.clients c ON c.id = f.client_id
        LEFT JOIN 
            claudex_depot.users u ON u.id = f.created_by 
        WHERE 
            c.deleted_by IS NULL
        GROUP BY 
            f.id, f.code, f.created_at, c.name, m.mt_a_payerr, r.mt_encaisse, u.username
        LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );
  }

  async findAll_Reglement_Month() {
    return await db.claudexBarsDB.query(
      `
        SELECT
            CAST(ROW_NUMBER() OVER (ORDER BY created_at) AS VARCHAR(255)) AS id,
            CONCAT(MONTHNAME(created_at), ' ', YEAR(created_at)) AS moisAnnee,
            SUM(mtpayer) AS Mtotal
        FROM
            reglements
        WHERE
            deleted_at IS NULL
        GROUP BY
            YEAR(created_at), MONTH(created_at)
        ORDER BY
            YEAR(created_at) DESC, MONTH(created_at) DESC
      `
    );
  }

  async countFindAllReglement_Situation_Reglement() {
    return (
      await db.claudexBarsDB.query(`
        SELECT CAST(count(sous_requete.id) AS VARCHAR(255)) AS situationReglementTotalNumber 
        FROM (
            SELECT 
                f.id AS id,
                f.code AS codeFacture,
                f.created_at as createdAt,
                c.name as client,
                (m.mt_a_payerr - f.remise) AS mt_a_payer,
                COALESCE(r.mt_encaisse, 0) AS mt_encaisse,
                (m.mt_a_payerr - f.remise - COALESCE(r.mt_encaisse, 0)) AS mt_restant,
                u.username as auteur
            FROM 
                claudex_depot.factures f
            LEFT JOIN 
                (SELECT 
                    facture_id, 
                    SUM(pv * qte) AS mt_a_payerr 
                FROM 
                    claudex_depot.mouvements 
                WHERE 
                    deleted_by IS NULL 
                GROUP BY 
                    facture_id
                ) m ON f.id = m.facture_id
            LEFT JOIN 
                (SELECT 
                    facture_id, 
                    SUM(mtpayer) AS mt_encaisse 
                FROM 
                    claudex_depot.reglements 
                WHERE 
                    deleted_by IS NULL 
                GROUP BY 
                    facture_id
                ) r ON f.id = r.facture_id
            LEFT JOIN 
                claudex_depot.clients c ON c.id = f.client_id
            LEFT JOIN 
                claudex_depot.users u ON u.id = f.created_by 
            WHERE 
                c.deleted_by IS NULL
            GROUP BY 
                f.id, f.code, f.created_at, c.name, m.mt_a_payerr, r.mt_encaisse, u.username
        ) as sous_requete
        `)
    )[0];
  }

  async countFindAllReglement() {
    return (
      await db.claudexBarsDB.query(`
        SELECT CAST(count(sous_requete.id) AS VARCHAR(255)) AS reglementTotalNumber 
        FROM (
            SELECT 
                r2.id AS id,
                f.code AS code,
                r2.created_at as createdAt,
                c.name as client,
                r2.mtrecu,
                r2.mtpayer,
                u.username as auteur
            FROM 
                claudex_depot.reglements r2
            LEFT JOIN 
                claudex_depot.factures f ON f.id = r2.facture_id
            LEFT JOIN 
                claudex_depot.clients c ON c.id = f.client_id
            LEFT JOIN 
                claudex_depot.users u ON u.id = r2.created_by 
            WHERE 
              r2.deleted_by is null 
            AND 
              c.deleted_by is null
            ORDER BY
              r2.id DESC 
        ) as sous_requete
        `)
    )[0];
  }

  async countFindAllReglementMonth() {
    return (
      await db.claudexBarsDB.query(`
        SELECT CAST(SUM(mtpayer) AS VARCHAR(255)) AS reglementMonthTotalNumber 
        FROM reglements
        WHERE YEAR(reglements.created_at) = YEAR(CURDATE())
        AND MONTH(reglements.created_at) = MONTH(CURDATE());
        `)
    )[0];
  }

  async countFindAllReglementDay() {
    return (
      await db.claudexBarsDB.query(`
        SELECT CAST(SUM(mtpayer) AS VARCHAR(255)) AS reglementDayTotalNumber 
        FROM reglements
        WHERE YEAR(reglements.created_at) = YEAR(CURDATE())
        AND day (reglements.created_at) = day(CURDATE());
        `)
    )[0];
  }
}

module.exports = new ReglementRepository();

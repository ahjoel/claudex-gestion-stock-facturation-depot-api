const db = require("../configs/db/claudexBars");

class ReglementRepository {

  async delete(reglementId) {
    return await db.claudexBarsDB.query("DELETE FROM reglements WHERE id = ?", [
      reglementId,
    ]);
  }

  async findById(id) {
    return (
      await db.claudexBarsDB.query(
        `SELECT r.id,
        r.totalFacture as totalFacture
        FROM reglements r    
        WHERE r.id = ?
        AND r.deleted_at IS NULL
        GROUP BY r.id`,
        [id]
      )
    )[0];
  }

  async findAll(limit, offset) {
    return await db.claudexBarsDB.query(
      `
                SELECT r.id, r.created_at AS createdAt, u.firstname, u.lastname, f.code as codeFacture, f.client as client, r.totalFacture as totalFacture 
                FROM reglements r 
                inner join factures f ON r.facture_id = f.id 
                inner join users u on r.created_by = u.id 
                where r.deleted_at is null 
                and r.deleted_by is null 
                ORDER BY r.id DESC LIMIT ? OFFSET ?
            `,
      [limit, offset]
    );
  }

  async countFindAllReglement() {
    return (
      await db.claudexBarsDB.query(`
        SELECT CAST(count(sous_requete.id) AS VARCHAR(255)) AS reglementTotalNumber 
        FROM (
            SELECT r.id, r.created_at AS createdAt, u.firstname, u.lastname, f.code as codeFacture, f.client as client, r.totalFacture as totalFacture 
            FROM reglements r 
            inner join factures f ON r.facture_id = f.id 
            inner join users u on r.created_by = u.id 
            where r.deleted_at is null 
            and r.deleted_by is null 
        ) as sous_requete
        `)
    )[0];
  }
}

module.exports = new ReglementRepository();

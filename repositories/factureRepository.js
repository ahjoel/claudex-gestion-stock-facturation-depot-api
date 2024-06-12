const db = require("../configs/db/claudexBars");

class FactureRepository {

    async save(facture) {
        return await db.claudexBarsDB.query(
            "INSERT INTO factures(code, client, tax, created_by, created_at) VALUES(?, ?, ?, ?, now())",
            [facture.code, facture.client, facture.tax, facture.createdBy]
        );
    }

    async saveLigneFacture(facture) {
        return await db.claudexBarsDB.query(
            "INSERT INTO mouvements(facture_id, produit_id, qte, pv, stock, types, created_by, created_at) VALUES(?, ?, ?, ?, ?, ?, ?, now())",
            [facture.facture_id, facture.productId, facture.qte, facture.pv, facture.stock, facture.types, facture.createdBy]
        );
    }

    async findById(id) {
        return (await db.claudexBarsDB.query(
            "SELECT id, code, client, tax, created_at AS createdAt, created_by AS createdBy, updated_at As updatedAt, updated_by AS updatedBy FROM factures WHERE id = ?",
            [id]
        ))[0];
    }

    async findByIdReglement(id) {
        return (await db.claudexBarsDB.query(
            "SELECT id, facture_id, totalFacture, created_at AS createdAt, created_by AS createdBy, updated_at As updatedAt, updated_by AS updatedBy FROM reglements WHERE id = ?",
            [id]
        ))[0];
    }

    async findLigneFactureById(id) {
        return (await db.claudexBarsDB.query(
            "SELECT id, code, facture_id, produit_id, created_at AS createdAt, created_by AS createdBy, updated_at As updatedAt, updated_by AS updatedBy FROM mouvements WHERE id = ?",
            [id]
        ))[0];
    }

    async update(facture) {
        return await db.claudexBarsDB.query(
            "UPDATE factures " +
            "SET" +
            "    code = CASE WHEN ? IS NOT NULL THEN ? ELSE code END," +
            "    client = CASE WHEN ? IS NOT NULL THEN ? ELSE client END," +
            "    tax = CASE WHEN ? IS NOT NULL THEN ? ELSE tax END," +
            "    updated_at = now()," +
            "    updated_by = ? " +
            "WHERE" +
            "    id = ?",
            [facture.code, facture.code, facture.client, facture.client, facture.tax, facture.tax, facture.updatedBy, facture.id]
        );
    }

    async findAll(limit, offset) {
        return await db.claudexBarsDB.query(
            "SELECT id, code, client, created_at AS createdAt, created_by AS createdBy, updated_at As updatedAt, updated_by AS updatedBy FROM factures ORDER BY id DESC LIMIT ? OFFSET ?",[limit, offset]
        );
    }
    
    async findAllFacturesR1(limit, offset) {
        return await db.claudexBarsDB.query(
            `
            SELECT f2.id as id, f2.code as code, f2.client as client, f2.created_at AS createdAt, f2.tax as taxe, cast(count(m.produit_id) as varchar(50)) as nbproduit, sum(m.pv * m.qte) AS totalfacture,
            CASE WHEN r.facture_id IS NOT NULL AND r.deleted_at IS NULL and r.deleted_by IS NULL THEN 'payée' ELSE 'impayée' END AS statut
            FROM mouvements m
            inner join factures f2 on m.facture_id = f2.id 
            INNER JOIN produits p2 on m.produit_id = p2.id
            LEFT JOIN  reglements r ON f2.id = r.facture_id
            AND m.deleted_at IS NULL
            GROUP BY f2.id 
            order by f2.id desc 
            LIMIT ? OFFSET ?`,[limit, offset]
        );
    }

    async findAllFacturesRC(stock, limit, offset) {
        return await db.claudexBarsDB.query(
            `
            SELECT f2.id as id, f2.code as code, f2.client as client, f2.created_at AS createdAt, f2.tax as taxe, cast(count(m.produit_id) as varchar(50)) as nbproduit, sum(m.pv * m.qte) AS totalfacture,
            CASE WHEN r.facture_id IS NOT NULL AND r.deleted_at IS NULL and r.deleted_by IS NULL THEN 'payée' ELSE 'impayée' END AS statut
            FROM mouvements m
            inner join factures f2 on m.facture_id = f2.id 
            INNER JOIN produits p2 on m.produit_id = p2.id
            LEFT JOIN  reglements r ON f2.id = r.facture_id
            AND m.deleted_at IS NULL
            AND m.stock= ?
            GROUP BY f2.id 
            order by f2.id desc 
            LIMIT ? OFFSET ?`,[stock, limit, offset]
        );
    }

    async findAllDetailFacturesR1(code) {
        return await db.claudexBarsDB.query(
            `
            SELECT m.id, f2.code, m.facture_id as factureId, f2.client, f2.created_at, f2.tax, p2.name as produit, p2.id as produitId, m2.name as modele, f.name as fournisseur, m.qte, m.pv 
            FROM mouvements m
            inner join factures f2 on m.facture_id = f2.id 
            INNER JOIN produits p2 on m.produit_id = p2.id
            INNER JOIN fournisseurs f on p2.fournisseur_id = f.id
            INNER JOIN models m2 on p2.model_id = m2.id
            AND m.deleted_at IS NULL
            where f2.code= ?
            `,[code]
        );
    }

    async findAllDetailFacturesRC(stock, code) {
        return await db.claudexBarsDB.query(
            `
            SELECT m.id, f2.code, m.facture_id as factureId, f2.client, f2.created_at, f2.tax, p2.name as produit, p2.id as produitId, m2.name as modele, f.name as fournisseur, m.qte, m.pv 
            FROM mouvements m
            inner join factures f2 on m.facture_id = f2.id 
            INNER JOIN produits p2 on m.produit_id = p2.id
            INNER JOIN fournisseurs f on p2.fournisseur_id = f.id
            INNER JOIN models m2 on p2.model_id = m2.id
            AND m.deleted_at IS NULL
            AND m.stock= ?
            where f2.code= ?
            `,[stock, code]
        );
    }

    async countFindAllFactureR1() {
        return (await db.claudexBarsDB.query(`
        SELECT CAST(count(sous_requete.id) AS VARCHAR(255)) AS factureTotalR1Number 
        FROM (
            SELECT f2.id as id, f2.code as code, f2.client as client, f2.created_at AS createdAt, f2.tax as taxe, count(m.produit_id) as NbProduit, sum(m.pv * m.qte) AS totalFacture,
            CASE WHEN r.facture_id IS NOT NULL THEN 'payée' ELSE 'impayée' END AS statut
            FROM mouvements m
            inner join factures f2 on m.facture_id = f2.id 
            INNER JOIN produits p2 on m.produit_id = p2.id
            LEFT JOIN 
                reglements r ON f2.id = r.facture_id
            AND m.deleted_at IS NULL
            AND m.stock= 'R1'
            GROUP BY f2.id 
            order by f2.id desc
        ) as sous_requete
        `))[0];
    }

    async countFindAllFactureImpayee() {
        return (await db.claudexBarsDB.query(`
        SELECT CAST(count(sous_requete.id) AS VARCHAR(255)) AS factureTotalImpayeNumber 
        FROM (
            SELECT f2.id as id,
                CASE WHEN r.facture_id IS NOT NULL THEN 'payée' ELSE 'impayée' END AS statut
            FROM mouvements m
            INNER JOIN factures f2 ON m.facture_id = f2.id 
            INNER JOIN produits p2 ON m.produit_id = p2.id
            LEFT JOIN reglements r ON f2.id = r.facture_id
            WHERE m.deleted_at IS NULL
            GROUP BY f2.id 
            HAVING statut = 'impayée'
            ORDER BY f2.id DESC
        ) as sous_requete;
        `))[0];
    }

    async countFindAllFactureRC() {
        return (await db.claudexBarsDB.query(`
        SELECT CAST(count(sous_requete.id) AS VARCHAR(255)) AS factureTotalRCNumber 
        FROM (
            SELECT f2.id as id, f2.code as code, f2.client as client, f2.created_at AS createdAt, f2.tax as taxe, count(m.produit_id) as NbProduit, sum(m.pv * m.qte) AS totalFacture,
            CASE WHEN r.facture_id IS NOT NULL THEN 'payée' ELSE 'impayée' END AS statut
            FROM mouvements m
            inner join factures f2 on m.facture_id = f2.id 
            INNER JOIN produits p2 on m.produit_id = p2.id
            LEFT JOIN 
                reglements r ON f2.id = r.facture_id
            AND m.deleted_at IS NULL
            AND m.stock= 'RC'
            GROUP BY f2.id 
            order by f2.id desc
        ) as sous_requete
        `))[0];
    }

    async countFindAllFacture() {
        return (await db.claudexBarsDB.query(`SELECT CAST(count(id) AS VARCHAR(255)) AS facturesNumber
                                                  FROM factures `))[0];
    }

    async delete(factureId) {
        return await db.claudexBarsDB.query(
            "DELETE FROM factures WHERE id = ?", [factureId]
        );
    }

    async regler(facture) {
        return await db.claudexBarsDB.query(
            "INSERT INTO reglements(facture_id, totalFacture, created_by, created_at) VALUES(?, ?, ?, now())",
            [facture.facture_id, facture.total, facture.createdBy]
        );
    }
}

module.exports = new FactureRepository();
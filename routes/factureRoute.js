const factureHandler = require("../apis/factureHandler");
const authController = require("../controllers/authController");

module.exports = function (app) {
    app.post("/claudex_depot/v1/factures", [authController.verifyToken], factureHandler.addFacture);
    app.post("/claudex_depot/v1/factures/lignes", [authController.verifyToken], factureHandler.addLigneFacture);
    app.post("/claudex_depot/v1/factures/reglement", [authController.verifyToken], factureHandler.addReglementFacture);
    app.get("/claudex_depot/v1/factures", [authController.verifyToken], factureHandler.findFacture);
    app.put("/claudex_depot/v1/factures", [authController.verifyToken], factureHandler.updateFacture);
    app.get("/claudex_depot/v1/factures/detail", [authController.verifyToken], factureHandler.findAllFactureDetailById);
    app.get("/claudex_depot/v1/factures/client", [authController.verifyToken], factureHandler.findFactureImpayeeClient);
    app.get("/claudex_depot/v1/factures/all", [authController.verifyToken], factureHandler.findAllFactureR1);
    app.get("/claudex_depot/v1/factures/all/impayee", [authController.verifyToken], factureHandler.findAllFactureImpayee);
    app.get("/claudex_depot/v1/factures/impayee/count", [authController.verifyToken], factureHandler.findCountAllFactureImpaye);
    app.get("/claudex_depot/v1/factures/one", [authController.verifyToken], factureHandler.findAllFactureOneR1);
    app.get("/claudex_depot/v1/factures/detail/all", [authController.verifyToken], factureHandler.findAllDetailFactureR1);
    app.delete("/claudex_depot/v1/factures", [authController.verifyToken], factureHandler.deleteFacture);
    
    // A faire
    app.post("/claudex_depot/v1/stat/stock/factures", [authController.verifyToken], factureHandler.findAllStatListeFacturesRegleNonRegle);
    app.post("/claudex_depot/v1/stat/stock/ventes", [authController.verifyToken], factureHandler.findAllStatListeFacturesReglement);
    app.post("/claudex_depot/v1/stat/stock/factures/archivees", [authController.verifyToken], factureHandler.findAllStatListeFacturesArchivees);
    app.get("/claudex_depot/v1/stat/stock/factures/penalitees", [authController.verifyToken], factureHandler.findAllStatListeFacturesPenalite);
    app.post("/claudex_depot/v1/stat/stock/factures/general", [authController.verifyToken], factureHandler.findAllStatListeStockGeneralVente);
    app.get("/claudex_depot/v1/stock/factures/jour", [authController.verifyToken], factureHandler.findCountFacturesJour);

    app.post("/claudex_depot/v1/stat/producteur/r1", [authController.verifyToken], factureHandler.findAllStatParProducteurR1);
    app.post("/claudex_depot/v1/stat/producteur/rc", [authController.verifyToken], factureHandler.findAllStatParProducteurRc);

    app.post("/claudex_depot/v1/stat/stock/gene/r1", [authController.verifyToken], factureHandler.findAllStatListeStockGeneralVenteR1);
    app.post("/claudex_depot/v1/stat/stock/gene/rc", [authController.verifyToken], factureHandler.findAllStatListeStockGeneralVenteRC);

    app.post("/claudex_depot/v1/stat/fact/archiv/r1", [authController.verifyToken], factureHandler.findAllStatArchivageR1);
    app.post("/claudex_depot/v1/stat/fact/archiv/rc", [authController.verifyToken], factureHandler.findAllStatArchivageRC);

}
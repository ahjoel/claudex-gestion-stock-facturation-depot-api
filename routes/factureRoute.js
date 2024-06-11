const factureHandler = require("../apis/factureHandler");
const authController = require("../controllers/authController");

module.exports = function (app) {
    app.post("/claudex_bars/v1/factures", [authController.verifyToken], factureHandler.addFacture);
    app.post("/claudex_bars/v1/factures/lignes", [authController.verifyToken], factureHandler.addLigneFacture);
    app.post("/claudex_bars/v1/factures/reglement", [authController.verifyToken], factureHandler.addReglementFacture);
    app.get("/claudex_bars/v1/factures", [authController.verifyToken], factureHandler.findFacture);
    app.put("/claudex_bars/v1/factures", [authController.verifyToken], factureHandler.updateFacture);
    app.get("/claudex_bars/v1/factures/all", [authController.verifyToken], factureHandler.findAllFactureR1);
    app.get("/claudex_bars/v1/factures/one", [authController.verifyToken], factureHandler.findAllFactureOneR1);
    app.get("/claudex_bars/v1/factures/detail/all", [authController.verifyToken], factureHandler.findAllDetailFactureR1);
    app.delete("/claudex_bars/v1/factures", [authController.verifyToken], factureHandler.deleteFacture);

    // Old
    app.get("/claudex_bars/v1/factures/all/rc", [authController.verifyToken], factureHandler.findAllFactureRC);
    app.get("/claudex_bars/v1/factures/one/rc", [authController.verifyToken], factureHandler.findAllFactureOneRC);
    app.get("/claudex_bars/v1/factures/detail/all/rc", [authController.verifyToken], factureHandler.findAllDetailFactureR1);
}
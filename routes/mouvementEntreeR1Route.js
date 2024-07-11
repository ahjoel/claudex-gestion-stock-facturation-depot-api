const mouvementEntreeRCHandler = require("../apis/mouvementEntreeRCHandler");
const mouvementEntreeR1Handler = require("../apis/mouvementEntreeR1Handler");
const authController = require("../controllers/authController");

module.exports = function (app) {
    app.post("/claudex_depot/v1/entreer1", [authController.verifyToken], mouvementEntreeR1Handler.addMouvementEntreeR1);
    app.post("/claudex_depot/v1/sortier1", [authController.verifyToken], mouvementEntreeR1Handler.addMouvementSortieR1);
    app.get("/claudex_depot/v1/entreer1", [authController.verifyToken], mouvementEntreeR1Handler.findMouvementEntreeR1);
    app.put("/claudex_depot/v1/entreer1", [authController.verifyToken], mouvementEntreeR1Handler.updateMouvementEntreeR1);
    app.get("/claudex_depot/v1/entreer1/all", [authController.verifyToken], mouvementEntreeR1Handler.findAllMouvementEntreeR1);
    app.get("/claudex_depot/v1/codefacture", [authController.verifyToken], mouvementEntreeR1Handler.findCodeFacture);
    app.get("/claudex_depot/v1/entreer1/all/dispo", [authController.verifyToken], mouvementEntreeR1Handler.findAllMouvementEntreeR1Dispo);
    app.delete("/claudex_depot/v1/entreer1", [authController.verifyToken], mouvementEntreeR1Handler.deleteMouvementEntreeR1);
    app.delete("/claudex_depot/v1/sortier1", [authController.verifyToken], mouvementEntreeR1Handler.deleteMouvementSortieR1);
    app.get("/claudex_depot/v1/caisse/mois", [authController.verifyToken], mouvementEntreeR1Handler.findAllStatCaisseMois);
}
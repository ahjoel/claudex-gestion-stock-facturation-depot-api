const reglementHandler = require("../apis/reglementHandler");
const authController = require("../controllers/authController");

module.exports = function (app) {
    app.get("/claudex_depot/v1/reglements/all", [authController.verifyToken], reglementHandler.findAll);
    app.get("/claudex_depot/v1/reglements/situation", [authController.verifyToken], reglementHandler.findAllSituation);
    app.post("/claudex_depot/v1/reglements", [authController.verifyToken], reglementHandler.addReglement);
    app.put("/claudex_depot/v1/reglements", [authController.verifyToken], reglementHandler.updateReglement);
    app.get("/claudex_depot/v1/reglements/month/count", [authController.verifyToken], reglementHandler.findAllReglementMonth);
    app.get("/claudex_depot/v1/reglements/day/count", [authController.verifyToken], reglementHandler.findAllReglementDay);
    app.delete("/claudex_depot/v1/reglements", [authController.verifyToken], reglementHandler.deleteReglement);
}
const reglementHandler = require("../apis/reglementHandler");
const authController = require("../controllers/authController");

module.exports = function (app) {
    app.get("/claudex_bars/v1/reglements/all", [authController.verifyToken], reglementHandler.findAll);
    app.get("/claudex_bars/v1/reglements/month/count", [authController.verifyToken], reglementHandler.findAllReglementMonth);
    app.get("/claudex_bars/v1/reglements/day/count", [authController.verifyToken], reglementHandler.findAllReglementDay);
    app.delete("/claudex_bars/v1/reglements", [authController.verifyToken], reglementHandler.deleteReglement);
}
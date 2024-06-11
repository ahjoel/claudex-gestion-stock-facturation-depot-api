const reglementHandler = require("../apis/reglementHandler");
const authController = require("../controllers/authController");

module.exports = function (app) {
    app.get("/claudex_bars/v1/reglements/all", [authController.verifyToken], reglementHandler.findAll);
    app.delete("/claudex_bars/v1/reglements", [authController.verifyToken], reglementHandler.deleteReglement);
}
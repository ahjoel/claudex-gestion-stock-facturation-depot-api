const fournisseurHandler = require("../apis/fournisseurHandler");
const authController = require("../controllers/authController");

module.exports = function (app) {
    app.post("/claudex_bars/v1/fournisseurs", [authController.verifyToken], fournisseurHandler.addFournisseur);
    app.get("/claudex_bars/v1/fournisseurs", [authController.verifyToken], fournisseurHandler.findFournisseur);
    app.put("/claudex_bars/v1/fournisseurs", [authController.verifyToken], fournisseurHandler.updateFournisseur);
    app.get("/claudex_bars/v1/fournisseurs/all", [authController.verifyToken], fournisseurHandler.findAll);
    app.delete("/claudex_bars/v1/fournisseurs", [authController.verifyToken], fournisseurHandler.deleteFournisseur);
}
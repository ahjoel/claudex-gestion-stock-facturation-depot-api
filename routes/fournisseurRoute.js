const fournisseurHandler = require("../apis/fournisseurHandler");
const authController = require("../controllers/authController");

module.exports = function (app) {
    app.post("/claudex_depot/v1/fournisseurs", [authController.verifyToken], fournisseurHandler.addFournisseur);
    app.get("/claudex_depot/v1/fournisseurs", [authController.verifyToken], fournisseurHandler.findFournisseur);
    app.put("/claudex_depot/v1/fournisseurs", [authController.verifyToken], fournisseurHandler.updateFournisseur);
    app.get("/claudex_depot/v1/fournisseurs/all", [authController.verifyToken], fournisseurHandler.findAll);
    app.delete("/claudex_depot/v1/fournisseurs", [authController.verifyToken], fournisseurHandler.deleteFournisseur);
}
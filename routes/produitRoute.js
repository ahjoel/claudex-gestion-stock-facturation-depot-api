const produitHandler = require("../apis/produitHandler");
const authController = require("../controllers/authController");

module.exports = function (app) {
    app.post("/claudex_bars/v1/produits", [authController.verifyToken], produitHandler.addProduit);
    app.get("/claudex_bars/v1/produits", [authController.verifyToken], produitHandler.findProduit);
    app.put("/claudex_bars/v1/produits", [authController.verifyToken], produitHandler.updateProduit);
    app.get("/claudex_bars/v1/produits/all", [authController.verifyToken], produitHandler.findAll);
    app.delete("/claudex_bars/v1/produits", [authController.verifyToken], produitHandler.deleteProduit);
}
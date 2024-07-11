const produitHandler = require("../apis/produitHandler");
const authController = require("../controllers/authController");

module.exports = function (app) {
    app.post("/claudex_depot/v1/produits", [authController.verifyToken], produitHandler.addProduit);
    app.get("/claudex_depot/v1/produits", [authController.verifyToken], produitHandler.findProduit);
    app.put("/claudex_depot/v1/produits", [authController.verifyToken], produitHandler.updateProduit);
    app.get("/claudex_depot/v1/produits/all", [authController.verifyToken], produitHandler.findAll);
    app.get("/claudex_depot/v1/produits/count", [authController.verifyToken], produitHandler.findCountProducts);
    app.delete("/claudex_depot/v1/produits", [authController.verifyToken], produitHandler.deleteProduit);
}
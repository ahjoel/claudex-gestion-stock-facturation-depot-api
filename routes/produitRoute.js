const produitHandler = require("../apis/produitHandler");
const authController = require("../controllers/authController");

module.exports = function (app) {
    app.post("/claudex_bars/v1/produits", [authController.verifyToken], produitHandler.addProduit);
    app.get("/claudex_bars/v1/produits", [authController.verifyToken], produitHandler.findProduit);
    app.put("/claudex_bars/v1/produits", [authController.verifyToken], produitHandler.updateProduit);
    app.get("/claudex_bars/v1/produits/all", [authController.verifyToken], produitHandler.findAll);
    app.get("/claudex_bars/v1/produits/count", [authController.verifyToken], produitHandler.findCountProducts);
    app.delete("/claudex_bars/v1/produits", [authController.verifyToken], produitHandler.deleteProduit);

    // PRODUCT RC
    app.post("/claudex_bars/v1/produits/rc", [authController.verifyToken], produitHandler.addProduitRc);
    app.get("/claudex_bars/v1/produits/rc", [authController.verifyToken], produitHandler.findProduitRc);
    app.put("/claudex_bars/v1/produits/rc", [authController.verifyToken], produitHandler.updateProduit);
    app.get("/claudex_bars/v1/produits/all/rc", [authController.verifyToken], produitHandler.findAllRc);
    app.get("/claudex_bars/v1/produits/count/rc", [authController.verifyToken], produitHandler.findCountProductsRc);
    app.delete("/claudex_bars/v1/produits/rc", [authController.verifyToken], produitHandler.deleteProduit);
}
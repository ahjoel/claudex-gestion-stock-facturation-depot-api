const clientHandler = require("../apis/clientHandler");
const authController = require("../controllers/authController");

module.exports = function (app) {
    app.post("/claudex_depot/v1/clients", [authController.verifyToken], clientHandler.addClient);
    app.get("/claudex_depot/v1/clients", [authController.verifyToken], clientHandler.findClient);
    app.put("/claudex_depot/v1/clients", [authController.verifyToken], clientHandler.updateClient);
    app.get("/claudex_depot/v1/clients/all", [authController.verifyToken], clientHandler.findAll);
    app.delete("/claudex_depot/v1/clients", [authController.verifyToken], clientHandler.deleteClient);
}
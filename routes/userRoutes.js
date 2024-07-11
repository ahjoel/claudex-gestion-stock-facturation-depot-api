const userHandler = require("../apis/userHandler");
const authController = require("../controllers/authController");

module.exports = function (app) {
    app.post("/claudex_depot/v1/sign/in", userHandler.signIn);
    app.get("/claudex_depot/v1/users", [authController.verifyToken], userHandler.findUser);
    app.get("/claudex_depot/v1/users/all", [authController.verifyToken], userHandler.findAll);
    app.post("/claudex_depot/v1/users", [authController.verifyToken], userHandler.addUser);
    app.put("/claudex_depot/v1/users", [authController.verifyToken], userHandler.updateUser);
    app.delete("/claudex_depot/v1/users", [authController.verifyToken], userHandler.deleteUser);
}
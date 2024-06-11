const modelHandler = require("../apis/modelHandler");
const authController = require("../controllers/authController");

module.exports = function (app) {
    app.post("/claudex_bars/v1/models", [authController.verifyToken], modelHandler.addModel);
    app.get("/claudex_bars/v1/models", [authController.verifyToken], modelHandler.findModel);
    app.put("/claudex_bars/v1/models", [authController.verifyToken], modelHandler.updateModel);
    app.get("/claudex_bars/v1/models/all", [authController.verifyToken], modelHandler.findAll);
    app.delete("/claudex_bars/v1/models", [authController.verifyToken], modelHandler.deleteModel);
}
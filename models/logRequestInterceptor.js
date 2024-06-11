const {logger} = require("../utils/logger")


module.exports = {
    logReq: function(req, body) {
        // Implement your logging logic here using loggingService
        logger.info('Logging request ==> ', req.method, req.url, body);
    }
};
const {logger} = require('../utils/logger');
const JWTUtilities = require("../utils/JWTUtilities");
const userRepository = require("../repositories/userRepository");
const genericResponse = require("../models/genericResponseModel");
require("dotenv").config();

class AuthController {
    async authenticateUser(req, res) {

        const usernameOrPasswordIncorrect = "Wrong username or password.";
        const notAuthorizedToAccessThisPlatform = "You're not authorized to access this platform.";
        let status = 200;
        let message = "SUCCESS";
        let description = "Authentication successfully";

        try {
            const user = await userRepository.findUserByUsername(req.body.username.trim().toUpperCase());

            if (user.length === 0) {
                return res.status(200).send(new genericResponse(401, 'FAILURE', notAuthorizedToAccessThisPlatform, null));
            }

            logger.info("User found in database.")

            const userInfos = await userRepository.findUserByUsernameAndPassword(req.body.username.trim(), req.body.password.trim());

            if (userInfos.length > 0) {    
                const token = JWTUtilities.generateToken(userInfos[0].id, process.env.JWT_EXPIRATION_DELAY.toString());
                return res.status(200).send(new genericResponse(status, message, description, {
                    accessToken: token,
                    userInfos: userInfos
                }));
            } else {
                return res.status(200).send(new genericResponse(400, 'FAILURE', usernameOrPasswordIncorrect, {
                    accessToken: null,
                    message: null
                }));
            }

        } catch (err) {
            logger.error(req.correlationId + " ==> Error caught in [authenticateUser] ==> " + err.stack);
            return res.status(200).send(new genericResponse(500, 'FAILURE', 'Internal Server Error', null));
        }
    }

    async verifyToken(req, res, next) {
        const token = req.headers["access-token"];


        if (!token) {
            return res.status(200).send(new genericResponse(403, "FAILURE", "Access token not provided", null));
        }

        try {
            const rep = await JWTUtilities.checkTokenValidity(token.toString());

            // console.log(rep)

            if (!rep.isOk) {
                return res.status(200).send(new genericResponse(401, "FAILURE", "Incorrect access token", null));
            }

            req.authUserId = rep.userId;

        } catch (e) {
            logger.error(req.correlationId + " ==> Error caught in [verify token] " + e);
            return res.status(200).send(new genericResponse(500, "FAILURE", "Internal Error", null));
        }

        next();
    }

    async checkRole(req, res, next, roleName) {
        try {
            const rep = await userRepository.findByRoleNameAndId(roleName, req.authUserId)
            if (!(rep.length > 0)) {
                return res.status(200).send(new genericResponse(403, "FAILURE", "Incorrect ROLE, you can't have access to this resource", null));
            }
        } catch (e) {
            return res.status(200).send(new genericResponse(500, "FAILURE", "Internal Error", null));
        }

        next();
    }

    checkRoleMiddleware(roleName) {
        // Return the actual middleware function that will be called by Express
        return async function(req, res, next) {
            try {
                const rep = await userRepository.findByRoleNameAndId(roleName, req.authUserId);
                if (!(rep.length > 0)) {
                    return res.status(403).send(new genericResponse(403, "FAILURE", "Incorrect ROLE, you can't have access to this resource", null));
                }
            } catch (e) {
                return res.status(500).send(new genericResponse(500, "FAILURE", "Internal Error", null));
            }

            next();
        };
    }
}


module.exports = new AuthController();


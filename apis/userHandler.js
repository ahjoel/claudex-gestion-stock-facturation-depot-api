const authController = require("../controllers/authController");
const {logger} = require("../utils/logger");
const JsonValidator = require("ajv");
const jsonValidator = new JsonValidator();
const genericJsonResponse = require('../models/genericResponseModel');
const userRepository = require("../repositories/userRepository");
var crypto = require('crypto');

function sendResponse(response, status, message, description, data, httpStatus) {
    httpStatus = httpStatus != null ? httpStatus : status;
    response.status(200).json(new genericJsonResponse(status, message, description, data));
}

//LOGIN
exports.signIn = async (request, response) => {
    try {
        const schema = require("../configs/JSONSchemas/signIn.json");
        const jsonBody = request.body;
        const valid = jsonValidator.validate(schema, jsonBody);
        
        if (valid === false) {
            logger.error(`Failed to validate JSon schemas ==> ${JSON.stringify(jsonValidator.errors)}`);
            response.status(400).json(new genericJsonResponse(400, "FAILURE", jsonValidator.errors[0].instancePath + " " + jsonValidator.errors[0].message, null));
            return;
        }

        await authController.authenticateUser(request, response);

    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [exports.signIn] ==> " + e.stack);
        response.status(500).json(new genericJsonResponse(500, "FAILURE", "Unhandled error occurred", null));
    }
}


//SUPER ADMIN
exports.addUser = async (request, response) => {
    try {
        const schema = require("../configs/JSONSchemas/addUser.json");
        const valid = jsonValidator.validate(schema, request.body);
        if (!valid) {
            return sendResponse(
                response,
                400,
                "FAILURE",
                jsonValidator.errors[0].message,
                null
            );
        }
        const checking = await userRepository.findMatchedUniqueColumn(request.body.username, request.body.email);
        if (checking && checking.matchedColumn) {
            return sendResponse(
                response,
                400,
                "FAILURE",
                "The specified value of '" + checking.matchedColumn + "' is already in use",
                null
            );
        }
        const userObject = request.body;
        userObject.createdBy = request.authUserId;

        const result = await userRepository.save(userObject);
        const savedUser = await userRepository.findById(result.insertId);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            savedUser
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [Add user] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
}
exports.findUser = async (request, response) => {
    try {
        const user = await userRepository.findById(request.query.id);
        if (!user) {
            sendResponse(response, 404, "SUCCESS", "User not found", null);
        } else {
            sendResponse(
                response,
                200,
                "SUCCESS",
                "Request executed successfully",
                user
            );
        }
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findUser] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
}
exports.findUserByProfile = async (request, response) => {
    try {
        const userList = await userRepository.findByProfile(request.query.profile.toString());
        if (!(userList.length > 0)) {
            sendResponse(response, 404, "SUCCESS", "No user found", null);
        } else {
            sendResponse(
                response,
                200,
                "SUCCESS",
                "Request executed successfully",
                userList
            );
        }
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findUserByRole] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
}
exports.updateUser = async (request, response) => {
    try {
        const userObject = request.body;
        userObject.updatedBy = request.authUserId;

        const result = await userRepository.update(userObject);
        if (!result.affectedRows) {
            sendResponse(response, 404, "FAILURE", "User not found", null);
        } else {
            const updatedUser = await userRepository.findById(request.body.id);
            sendResponse(
                response,
                200,
                "SUCCESS",
                "Request executed successfully",
                updatedUser
            );
        }
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [Update user] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.findAll = async (request, response) => {
    try {
        const users = await userRepository.findAll();

        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                users: users
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAll Users] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};
exports.deleteUser = async (request, response) => {
    try {
        const id = request.query.id;
        if (!id) {
            sendResponse(
                response,
                400,
                "FAILURE",
                "The id query param is required",
                null
            );
        }
        const result = await userRepository.delete(request.authUserId, id);
        if (!result.affectedRows) {
            sendResponse(response, 404, "FAILURE", "User not found", null);
        } else {
            sendResponse(
                response,
                200,
                "SUCCESS",
                "Request executed successfully",
                null
            );
        }
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [deleteUser] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.getOptions = async (request, response) => {
    try {
        const result = await userRepository.getOptions();
        const profiles = await userRepository.findProfiles();
        let data = {};

        for (let i = 0; i < result.length; i++) {
            if (result[i].columnName === "society") {
                let options = result[i].columnType.replaceAll("'", "").replaceAll("enum(", "").replaceAll(")", "");
                data.societies = options.split(",");
            }
            if (result[i].columnName === "department") {
                let options = result[i].columnType.replaceAll("'", "").replaceAll("enum(", "").replaceAll(")", "");
                data.departments = options.split(",");
            }
        }

        data.profiles = profiles;

        return sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            data
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [getOptions] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
}
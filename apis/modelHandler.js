const {logger} = require("../utils/logger");
const modelRepository = require("../repositories/modelRepository");
const genericJsonResponse = require("../models/genericResponseModel");
const JsonValidator = require("ajv");
const jsonValidator = new JsonValidator();

function sendResponse(response, status, message, description, data, httpStatus) {
    httpStatus = httpStatus != null ? httpStatus : status;
    response.status(httpStatus).json(new genericJsonResponse(status, message, description, data));
}

exports.addModel = async (request, response) => {
    try {
        const schema = require("../configs/JSONSchemas/addModel.json");
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
        const modelObject = {
            name: request.body.name,
            description: request.body.description,
            createdBy: request.authUserId,
        };
        const result = await modelRepository.save(modelObject);
        const savedModel = await modelRepository.findById(result.insertId);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            savedModel
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [addModel Model] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.updateModel = async (request, response) => {
    try {
        const modelObject = request.body;
        modelObject.updatedBy = request.authUserId;

        const result = await modelRepository.update(modelObject);
        if (!result.affectedRows) {
            sendResponse(response, 404, "FAILURE", "Model not found", null);
        } else {
            const updatedModel = await modelRepository.findById(request.body.id);
            sendResponse(
                response,
                200,
                "SUCCESS",
                "Request executed successfully",
                updatedModel
            );
        }
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [updateModel Model] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.findModel = async (request, response) => {
    try {
        const model = await modelRepository.findById(request.query.id);
        if (!model) {
            sendResponse(response, 404, "SUCCESS", "Model not found", null);
        } else {
            sendResponse(
                response,
                200,
                "SUCCESS",
                "Request executed successfully",
                model
            );
        }
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findModel] ==> " + e.stack);
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
        const page = request.query.page;
        const length = request.query.length;

        if (page === undefined || page === null || page === '') {
            return sendResponse(
                response,
                400,
                "FAILURE",
                "page attribute required",
                null
            );
        }

        if (length === undefined || length === null || length === '') {
            return sendResponse(
                response,
                400,
                "FAILURE",
                "length attribute required",
                null
            );
        }

        const limit = parseInt(length);
        const offset = (parseInt(page) - 1) * parseInt(length);

        const models = await modelRepository.findAll(limit, offset);
        const allModelsCount = await modelRepository.countFindAllModels();

        return sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                modelsNumber: allModelsCount.modelNumber,
                models: models
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAll Models] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.deleteModel = async (request, response) => {
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
        const result = await modelRepository.delete(request.authUserId, id);
        if (!result.affectedRows) {
            sendResponse(response, 404, "FAILURE", "Model not found", null);
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
        logger.error(request.correlationId + " ==> Error caught in [deleteModel] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

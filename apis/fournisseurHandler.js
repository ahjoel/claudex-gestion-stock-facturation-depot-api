const {logger} = require("../utils/logger");
const fournisseurRepository = require("../repositories/fournisseurRepository");
const genericJsonResponse = require("../models/genericResponseModel");
const JsonValidator = require("ajv");
const jsonValidator = new JsonValidator();

function sendResponse(response, status, message, description, data, httpStatus) {
    httpStatus = httpStatus != null ? httpStatus : status;
    response.status(httpStatus).json(new genericJsonResponse(status, message, description, data));
}

exports.addFournisseur = async (request, response) => {
    try {
        const schema = require("../configs/JSONSchemas/addFournisseur.json");
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
        const fournisseurObject = {
            name: request.body.name,
            description: request.body.description,
            createdBy: request.authUserId,
        };
        const result = await fournisseurRepository.save(fournisseurObject);
        const savedFournisseur = await fournisseurRepository.findById(result.insertId);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            savedFournisseur
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [addFournisseur Fournisseurs] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.updateFournisseur = async (request, response) => {
    try {
        const fournisseurObject = request.body;
        fournisseurObject.updatedBy = request.authUserId;

        const result = await fournisseurRepository.update(fournisseurObject);
        if (!result.affectedRows) {
            sendResponse(response, 404, "FAILURE", "Fournisseur not found", null);
        } else {
            const updatedFournisseur = await fournisseurRepository.findById(request.body.id);
            sendResponse(
                response,
                200,
                "SUCCESS",
                "Request executed successfully",
                updatedFournisseur
            );
        }
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [updateFournisseur Fournisseurs] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.findFournisseur = async (request, response) => {
    try {
        const fournisseur = await fournisseurRepository.findById(request.query.id);
        if (!model) {
            sendResponse(response, 404, "SUCCESS", "Fournisseur not found", null);
        } else {
            sendResponse(
                response,
                200,
                "SUCCESS",
                "Request executed successfully",
                fournisseur
            );
        }
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findFournisseur] ==> " + e.stack);
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

        const fournisseurs = await fournisseurRepository.findAll(limit, offset);
        const allFournisseursCount = await fournisseurRepository.countFindAllFournisseurs();

        return sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                fournisseursNumber: allFournisseursCount.fournisseursNumber,
                fournisseurs: fournisseurs
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAll Fournisseurs] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.deleteFournisseur = async (request, response) => {
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
        const result = await fournisseurRepository.delete(request.authUserId, id);
        if (!result.affectedRows) {
            sendResponse(response, 404, "FAILURE", "Fournisseur not found", null);
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
        logger.error(request.correlationId + " ==> Error caught in [deleteFournisseur] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

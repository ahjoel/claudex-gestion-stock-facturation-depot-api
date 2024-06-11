const {logger} = require("../utils/logger");
const produitRepository = require("../repositories/produitRepository");
const genericJsonResponse = require("../models/genericResponseModel");
const JsonValidator = require("ajv");
const jsonValidator = new JsonValidator();

function sendResponse(response, status, message, description, data, httpStatus) {
    httpStatus = httpStatus != null ? httpStatus : status;
    response.status(httpStatus).json(new genericJsonResponse(status, message, description, data));
}

exports.addProduit = async (request, response) => {
    try {
        const schema = require("../configs/JSONSchemas/addProduit.json");
        console.log("productObject ::", request.body);
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
        const produitObject = {
            code: request.body.code,
            name: request.body.name,
            description: request.body.description,
            modelId: request.body.modelId,
            fournisseurId: request.body.fournisseurId,
            pv: request.body.pv,
            stock_min: request.body.stock_min,
            createdBy: request.authUserId,
        };
        console.log("productObject ::", produitObject);
        const result = await produitRepository.save(produitObject);
        const savedProduit = await produitRepository.findById(result.insertId);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            savedProduit
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [addProduit Produits] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.updateProduit = async (request, response) => {
    try {
        const produitObject = request.body;
        produitObject.updatedBy = request.authUserId;

        const result = await produitRepository.update(produitObject);
        if (!result.affectedRows) {
            sendResponse(response, 404, "FAILURE", "Produit not found", null);
        } else {
            const updatedProduit = await produitRepository.findById(request.body.id);
            sendResponse(
                response,
                200,
                "SUCCESS",
                "Request executed successfully",
                updatedProduit
            );
        }
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [updateProduit Produit] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.findProduit = async (request, response) => {
    try {
        const produit = await produitRepository.findById(request.query.id);
        if (!model) {
            sendResponse(response, 404, "SUCCESS", "Produit not found", null);
        } else {
            sendResponse(
                response,
                200,
                "SUCCESS",
                "Request executed successfully",
                produit
            );
        }
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findProduit] ==> " + e.stack);
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

        const produits = await produitRepository.findAll(limit, offset);
        const allProduitsCount = await produitRepository.countFindAllProduit();

        return sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                produitNumber: allProduitsCount.produitNumber,
                produits: produits
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAll Produits] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.deleteProduit = async (request, response) => {
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
        const result = await produitRepository.delete(request.authUserId, id);
        if (!result.affectedRows) {
            sendResponse(response, 404, "FAILURE", "Produit not found", null);
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
        logger.error(request.correlationId + " ==> Error caught in [deleteProduit] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

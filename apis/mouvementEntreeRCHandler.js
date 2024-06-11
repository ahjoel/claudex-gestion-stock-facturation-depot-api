const {logger} = require("../utils/logger");
const mouvementRepository = require("../repositories/mouvementRepository");
const genericJsonResponse = require("../models/genericResponseModel");
const JsonValidator = require("ajv");
const jsonValidator = new JsonValidator();

function sendResponse(response, status, message, description, data, httpStatus) {
    httpStatus = httpStatus != null ? httpStatus : status;
    response.status(httpStatus).json(new genericJsonResponse(status, message, description, data));
}

exports.addMouvementEntreeRC = async (request, response) => {
    try {
        const schema = require("../configs/JSONSchemas/addMouvement.json");
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
        const entreeRCObject = {
            code: request.body.code,
            produitId: request.body.produitId,
            types: "ADD",
            qte: request.body.qte,
            stock: "RC",
            createdBy: request.authUserId,
        };
        const result = await mouvementRepository.save(entreeRCObject);
        const savedEntreeRC = await mouvementRepository.findById(result.insertId);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            savedEntreeRC
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [addEntreeRC Mouvements] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.addMouvementSortieRC = async (request, response) => {
    try {
        const sortieRCObject = {
            code: "ADD_PROD_FACT",
            produitId: request.body.produitId,
            factureId: request.body.factureId,
            types: "OUT",
            qte: request.body.qte,
            stock: "RC",
            createdBy: request.authUserId,
        };
        console.log("pdId :::", sortieRCObject.produitId);
        const mouvementsSortieProduitRC = await mouvementRepository.findAllVerifierStockRCDispoProduit(sortieRCObject.produitId);
        const stockDispo = Number(mouvementsSortieProduitRC[0].st_dispo)
        const pv = Number(mouvementsSortieProduitRC[0].pv)
        const sortieR1ObjectUpdateWithPv = {
            code: "ADD_PROD_FACT",
            produitId: request.body.produitId,
            factureId: request.body.factureId,
            types: "OUT",
            qte: request.body.qte,
            stock: "RC",
            pv: pv,
            createdBy: request.authUserId,
        };
        if (sortieRCObject.qte <= stockDispo) {
            const result = await mouvementRepository.saveSortie(sortieR1ObjectUpdateWithPv);
            const savedSortieRC = await mouvementRepository.findById(result.insertId);
            sendResponse(
                response,
                200,
                "SUCCESS",
                "Request executed successfully",
                savedSortieRC
            );
        } else {
            return sendResponse(
                response,
                400,
                "FAILURE",
                "La quantité est supérieur au stock disponible",
                null
            );
        }
        const result = await mouvementRepository.save(entreeRCObject);
        const savedEntreeRC = await mouvementRepository.findById(result.insertId);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            savedEntreeRC
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [addMouvementSortieRC Mouvements] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.updateMouvementEntreeRC = async (request, response) => {
    try {
        const entreeRCObject = request.body;
        entreeRCObject.updatedBy = request.authUserId;

        const result = await mouvementRepository.update(entreeRCObject);
        if (!result.affectedRows) {
            sendResponse(response, 404, "FAILURE", "EntreeRC not found", null);
        } else {
            console.log("ok");
            const updatedEntreeRC = await mouvementRepository.findByIdRC(request.body.id);
            console.log("ok-1");
            sendResponse(
                response,
                200,
                "SUCCESS",
                "Request executed successfully",
                updatedEntreeRC
            );
        }
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [updateMouvementEntreeRC MouvementEntreeRC] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.findMouvementEntreeRC = async (request, response) => {
    try {
        const mouvementEntreeRC = await mouvementRepository.findByIdRC(request.query.id);
        if (!model) {
            sendResponse(response, 404, "SUCCESS", "MouvementEntreeRC not found", null);
        } else {
            sendResponse(
                response,
                200,
                "SUCCESS",
                "Request executed successfully",
                mouvementEntreeRC
            );
        }
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findMouvementEntreeRC] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.findAllMouvementEntreeRC = async (request, response) => {
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

        const mouvementsEntreeRC = await mouvementRepository.findAllEntreeRC(limit, offset);
        const allMouvementsEntreeRCCount = await mouvementRepository.countFindAllEntreeRC();

        return sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                mouvementsEntreeRCNumber: allMouvementsEntreeRCCount.entreeRCNumber,
                mouvementsEntreeRC: mouvementsEntreeRC
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAllMouvementEntreeRC entreeRCNumber] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.findCodeFacture = async (request, response) => {
    try {
        
        const codeFactureCount = await mouvementRepository.factureCode();

        return sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                infos: codeFactureCount
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findCodeFacture findCodeFacture] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.findAllMouvementEntreeRCDispo = async (request, response) => {
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

        const mouvementsEntreeRCDispo = await mouvementRepository.findAllEntreeRCDispo(limit, offset);
        const allMouvementsEntreeRCDispoCount = await mouvementRepository.countFindAllEntreeRCDispo();

        return sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                mouvementsEntreeRCDispoNumber: allMouvementsEntreeRCDispoCount.entreeRCDispoNumber,
                mouvementsEntreeRCDispo: mouvementsEntreeRCDispo
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAllMouvementEntreeRCDispo entreeRCNumberDispo] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.deleteMouvementEntreeRC = async (request, response) => {
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
        const result = await mouvementRepository.delete(request.authUserId, id);
        if (!result.affectedRows) {
            sendResponse(response, 404, "FAILURE", "MouvementEntreeRC not found", null);
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
        logger.error(request.correlationId + " ==> Error caught in [deleteMouvementEntreeRC] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

exports.deleteMouvementSortieRC = async (request, response) => {
    try {
        const id = Number(request.query.id);
        if (!id) {
            sendResponse(
                response,
                400,
                "FAILURE",
                "The id query param is required",
                null
            );
        }
        const result = await mouvementRepository.deleteMouvementSortie(id);
        if (!result.affectedRows) {
            sendResponse(response, 404, "FAILURE", "MouvementSortieRC not found", null);
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
        logger.error(request.correlationId + " ==> Error caught in [deleteMouvementEntreeRC] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request",
            null
        );
    }
};

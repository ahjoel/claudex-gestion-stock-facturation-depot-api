const {logger} = require("../utils/logger");
const reglementRepository = require("../repositories/reglementRepository");
const genericJsonResponse = require("../models/genericResponseModel");
const JsonValidator = require("ajv");
const jsonValidator = new JsonValidator();

function sendResponse(response, status, message, description, data, httpStatus) {
    httpStatus = httpStatus != null ? httpStatus : status;
    response.status(httpStatus).json(new genericJsonResponse(status, message, description, data));
}

// exports.updateReglement = async (request, response) => {
//     try {
//         const id = request.query.id;
//         if (!id) {
//             sendResponse(
//                 response,
//                 400,
//                 "FAILURE",
//                 "The id query param is required",
//                 null
//             );
//         }
//         const result = await reglementRepository.delete(request.authUserId, id);
//         if (!result.affectedRows) {
//             sendResponse(response, 404, "FAILURE", "Reglement not found", null);
//         } else {
//             sendResponse(
//                 response,
//                 200,
//                 "SUCCESS",
//                 "Request executed successfully",
//                 null
//             );
//         }
//     } catch (e) {
//         logger.error(request.correlationId + " ==> Error caught in [deleteReglement] ==> " + e.stack);
//         sendResponse(
//             response,
//             500,
//             "ERROR",
//             "An error occurred while processing the request",
//             null
//         );
//     }
// };

exports.addReglement = async (request, response) => {
    try {
        const schema = require("../configs/JSONSchemas/addReglementFacture.json");
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

        const reglementObject = {
            mtrecu: Number(request.body.mtrecu),
            mtpayer: Number(request.body.mtpayer),
            factureId: Number(request.body.factureId),
            createdBy: request.authUserId,
        };
        const result = await reglementRepository.save(reglementObject);
        const savedReglement = await reglementRepository.findById(result.insertId);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            savedReglement
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [addReglement Reglements] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request addReglement Reglements",
            null
        );
    }
};

exports.updateReglement = async (request, response) => {
    try {
        const reglementObject = request.body;
        reglementObject.updatedBy = request.authUserId;

        const result = await reglementRepository.update(reglementObject);
        if (!result.affectedRows) {
            sendResponse(response, 404, "FAILURE", "Reglement not found", null);
        } else {
            const updatedReglement = await reglementRepository.findById(request.body.id);
            sendResponse(
                response,
                200,
                "SUCCESS",
                "Request executed successfully",
                updatedReglement
            );
        }
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [updateReglement Reglement] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request updateReglement Reglement",
            null
        );
    }
};

exports.deleteReglement = async (request, response) => {
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
        await reglementRepository.delete(request.authUserId, id);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            null
        );

    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [deleteReglement] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request deleteReglement",
            null
        );
    }
};

exports.findReglement = async (request, response) => {
    try {
        const facture = await factureRepository.findById(request.query.id);
        if (!model) {
            sendResponse(response, 404, "SUCCESS", "Facture not found", null);
        } else {
            sendResponse(
                response,
                200,
                "SUCCESS",
                "Request executed successfully",
                facture
            );
        }
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findFacture Facture not found] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findFacture Facture not found",
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

        const reglements = await reglementRepository.findAll(limit, offset);
        const allReglementsCount = await reglementRepository.countFindAllReglement();

        return sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                reglementTotalNumber: allReglementsCount.reglementTotalNumber,
                reglements: reglements
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAll Reglements] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findAll Reglements",
            null
        );
    }
};

exports.findAllSituation = async (request, response) => {
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

        const situations = await reglementRepository.findAll_Situation_Reglement(limit, offset);
        const allSituationCount = await reglementRepository.countFindAllReglement_Situation_Reglement();

        return sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                allSituationCount: allSituationCount.situationReglementTotalNumber,
                situations: situations
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAllSituation Reglements] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findAllSituation Reglements",
            null
        );
    }
};

exports.findAllReglementMonth = async (request, response) => {
    try {
        const allReglementsCount = await reglementRepository.countFindAllReglementMonth();

        return sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                reglementMonthTotalNumber: allReglementsCount.reglementMonthTotalNumber
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAllReglementMonth Reglements] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findAllReglementMonth Reglements",
            null
        );
    }
};

exports.findAllReglementDay = async (request, response) => {
    try {
        const allReglementsCount = await reglementRepository.countFindAllReglementDay();

        return sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                reglementDayTotalNumber: allReglementsCount.reglementDayTotalNumber
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAllReglementDay Reglements] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findAllReglementDay Reglements",
            null
        );
    }
};

const {logger} = require("../utils/logger");
const factureRepository = require("../repositories/factureRepository");
const genericJsonResponse = require("../models/genericResponseModel");
const JsonValidator = require("ajv");
const jsonValidator = new JsonValidator();

function sendResponse(response, status, message, description, data, httpStatus) {
    httpStatus = httpStatus != null ? httpStatus : status;
    response.status(httpStatus).json(new genericJsonResponse(status, message, description, data));
}

exports.addFacture = async (request, response) => {
    try {
        const schema = require("../configs/JSONSchemas/addFacture.json");
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
        const client_id = request.body.client_id.split('-')[0];
        const client_code = request.body.client_id.split('-')[1];

        let code_clt = request.body.code
        const parts = code_clt.split("/");
        parts.splice(1, 0, client_code);
        code_clt = parts.join("/");

        const factureObject = {
            code: code_clt,
            client_id: Number(client_id),
            tax: Number(request.body.tax),
            remise: request.body.remise,
            createdBy: request.authUserId,
        };
        const result = await factureRepository.save(factureObject);
        const savedFacture = await factureRepository.findById(result.insertId);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            savedFacture
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [addFacture Factures] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request addFacture Factures",
            null
        );
    }
};

exports.addReglementFacture = async (request, response) => {
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
        const factureObject = {
            facture_id: request.body.facture_id,
            total: request.body.total,
            createdBy: request.authUserId,
        };
        const result = await factureRepository.regler(factureObject);
        const savedReglementFacture = await factureRepository.findByIdReglement(result.insertId);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            savedReglementFacture
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [addReglementFacture Factures Reglement] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request addReglementFacture Factures Reglement",
            null
        );
    }
};

exports.addLigneFacture = async (request, response) => {
    try {
        const schema = require("../configs/JSONSchemas/addLigneFacture.json");
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
        const factureLigneObject = {
            productId: request.body.productId,
            facture_id: request.body.facture_id,
            pv: request.body.pv,
            qte: request.body.quantity,
            types: "OUT",
            createdBy: request.authUserId,
        };
        const result = await factureRepository.saveLigneFacture(factureLigneObject);
        const savedLigneFacture = await factureRepository.findLigneFactureById(result.insertId);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            savedLigneFacture
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [addFacture Factures] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request addFacture Factures",
            null
        );
    }
};

exports.updateFacture = async (request, response) => {
    try {
        const factureObject = request.body;
        factureObject.updatedBy = request.authUserId;

        const result = await factureRepository.update(factureObject);
        if (!result.affectedRows) {
            sendResponse(response, 404, "FAILURE", "Facture not found", null);
        } else {
            const updatedFacture = await factureRepository.findById(request.body.id);
            sendResponse(
                response,
                200,
                "SUCCESS",
                "Request executed successfully",
                updatedFacture
            );
        }
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [updateFacture Facture] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request updateFacture Facture",
            null
        );
    }
};

exports.findFacture = async (request, response) => {
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

        const factures = await factureRepository.findAll(limit, offset);
        const allFacturesCount = await factureRepository.countFindAllFacture();

        return sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                fournisseursNumber: allFacturesCount.facturesNumber,
                factures: factures
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAll Factures] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findAll Factures",
            null
        );
    }
};

exports.findAllFactureR1 = async (request, response) => {
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

        const facturesR1 = await factureRepository.findAllFacturesR1(limit, offset);
        const allFacturesCount = await factureRepository.countFindAllFactureR1();

        return sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                factureTotalR1Number: allFacturesCount.factureTotalR1Number,
                facturesR1: facturesR1
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAllFactureR1 Factures] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findAllFactureR1 Factures",
            null
        );
    }
};

exports.findAllFactureImpayee = async (request, response) => {
    try {
    
        const facturesImp = await factureRepository.findAllFacturesImp();
        
        return sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                facturesImp: facturesImp
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAllFactureImpayee Factures] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findAllFactureImpayee Factures",
            null
        );
    }
};

exports.findAllFactureDetailById = async (request, response) => {
    try {
    
        const factureInfo = await factureRepository.findAllFactureDetailsClient(request.query.id);
        
        return sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                factureInfo: factureInfo
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAllFactureDetailById Factures] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findAllFactureDetailById Factures",
            null
        );
    }
};

exports.findCountAllFactureImpaye = async (request, response) => {
    try {
        
        const allFacturesCount = await factureRepository.countFindAllFactureImpayee();

        return sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                factureTotalImpayeeNumber: allFacturesCount.factureTotalImpayeNumber
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findCountAllFactureImpaye Factures] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findCountAllFactureImpaye Factures",
            null
        );
    }
};

// exports.findAllFactureRC = async (request, response) => {
//     try {
//         const page = request.query.page;
//         const length = request.query.length;

//         if (page === undefined || page === null || page === '') {
//             return sendResponse(
//                 response,
//                 400,
//                 "FAILURE",
//                 "page attribute required",
//                 null
//             );
//         }

//         if (length === undefined || length === null || length === '') {
//             return sendResponse(
//                 response,
//                 400,
//                 "FAILURE",
//                 "length attribute required",
//                 null
//             );
//         }

//         const limit = parseInt(length);
//         const offset = (parseInt(page) - 1) * parseInt(length);
//         const facturesRC = await factureRepository.findAllFacturesRC("RC", limit, offset);
//         const allFacturesCount = await factureRepository.countFindAllFactureRC();

//         return sendResponse(
//             response,
//             200,
//             "SUCCESS",
//             "Request executed successfully",
//             {
//                 factureTotalRCNumber: allFacturesCount.factureTotalRCNumber,
//                 facturesRC: facturesRC
//             }
//         );
//     } catch (e) {
//         logger.error(request.correlationId + " ==> Error caught in [findAllFactureRC Factures] ==> " + e.stack);
//         sendResponse(
//             response,
//             500,
//             "ERROR",
//             "An error occurred while processing the request findAllFactureRC Factures",
//             null
//         );
//     }
// };

exports.findAllFactureOneR1 = async (request, response) => {
    try {
        const id = request.query.id;
        if (id === undefined || id === null || id === '') {
            return sendResponse(
                response,
                400,
                "FAILURE",
                "id attribute required",
                null
            );
        }
        const oneFacture = await factureRepository.findById(id);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                oneFacture: oneFacture
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAllFactureOneR1 Factures-Details] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findAllFactureOneR1 Factures-Details",
            null
        );
    }
};

// exports.findAllFactureOneRC = async (request, response) => {
//     try {
//         const id = request.query.id;
//         if (id === undefined || id === null || id === '') {
//             return sendResponse(
//                 response,
//                 400,
//                 "FAILURE",
//                 "id attribute required",
//                 null
//             );
//         }
//         const oneFacture = await factureRepository.findById(id);
//         sendResponse(
//             response,
//             200,
//             "SUCCESS",
//             "Request executed successfully",
//             {
//                 oneFacture: oneFacture
//             }
//         );
//     } catch (e) {
//         logger.error(request.correlationId + " ==> Error caught in [findAllFactureOneRC Factures-Details] ==> " + e.stack);
//         sendResponse(
//             response,
//             500,
//             "ERROR",
//             "An error occurred while processing the request findAllFactureOneRC Factures-Details",
//             null
//         );
//     }
// };

exports.findAllDetailFactureR1 = async (request, response) => {
    try {
        const code = request.query.code;

        if (code === undefined || code === null || code === '') {
            return sendResponse(
                response,
                400,
                "FAILURE",
                "code attribute required",
                null
            );
        }

        const facturesDetailR1 = await factureRepository.findAllDetailFacturesR1(code);

        return sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                facturesDetailR1: facturesDetailR1
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAllDetailFactureR1 Factures - All products] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findAllDetailFactureR1 Factures All products",
            null
        );
    }
};

exports.findAllDetailFactureRC = async (request, response) => {
    try {
        const code = request.query.code;

        if (code === undefined || code === null || code === '') {
            return sendResponse(
                response,
                400,
                "FAILURE",
                "code attribute required",
                null
            );
        }

        const facturesDetailRC = await factureRepository.findAllDetailFacturesRC("RC", code);

        return sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                facturesDetailRC: facturesDetailRC
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAllDetailFactureRC Factures - All products] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findAllDetailFactureRC Factures All products",
            null
        );
    }
};

exports.deleteFacture = async (request, response) => {
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
        await factureRepository.delete(id);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            null
        );

    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [deleteFacture] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request deleteFacture",
            null
        );
    }
};

// stats - r1
exports.findAllStatParProducteurR1 = async (request, response) => {
    try {
        const dateDebutFin = {
            date_debut: request.body.date_debut,
            date_fin: request.body.date_fin,
        };

        const data = await factureRepository.statistitqueParProducteurR1(dateDebutFin);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                data: data
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAllStatParProducteurR1 Statistique Producteur] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findAllStatParProducteurR1 Statistique Producteur",
            null
        );
    }
};

exports.findAllStatListeStockGeneralVenteR1 = async (request, response) => {
    try {
        const dateDebutFin = {
            date_debut: request.body.date_debut,
            date_fin: request.body.date_fin,
        };

        const data = await factureRepository.statistitqueListeStockGeneralVenteR1(dateDebutFin);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                data: data
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAllStatListeStockGeneralVenteR1 Statistique Liste general stock vente r1] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findAllStatListeStockGeneralVenteR1 Statistique Liste general stock vente r1",
            null
        );
    }
};

// stats - rc
exports.findAllStatParProducteurRc = async (request, response) => {
    try {
        const dateDebutFin = {
            date_debut: request.body.date_debut,
            date_fin: request.body.date_fin,
        };

        const data = await factureRepository.statistitqueParProducteurRC(dateDebutFin);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                data: data
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAllStatParProducteurRc Statistique Producteur] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findAllStatParProducteurRc Statistique Producteur",
            null
        );
    }
};

exports.findAllStatListeStockGeneralVenteRC = async (request, response) => {
    try {
        const dateDebutFin = {
            date_debut: request.body.date_debut,
            date_fin: request.body.date_fin,
        };

        const data = await factureRepository.statistitqueListeStockGeneralVenteRC(dateDebutFin);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                data: data
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAllStatListeStockGeneralVenteRC Statistique Liste general stock vente rc] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findAllStatListeStockGeneralVenteRC Statistique Liste general stock vente rc",
            null
        );
    }
};

exports.findAllStatArchivageR1 = async (request, response) => {
    try {
        const dateDebutFin = {
            date_debut: request.body.date_debut,
            date_fin: request.body.date_fin,
        };

        const data = await factureRepository.statistitqueArchivageFactureR1(dateDebutFin);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                data: data
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAllStatArchivageR1 Statistique Archivage facture R1] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findAllStatArchivageR1 Statistique Archivage facture R1",
            null
        );
    }
};

exports.findAllStatArchivageRC = async (request, response) => {
    try {
        const dateDebutFin = {
            date_debut: request.body.date_debut,
            date_fin: request.body.date_fin,
        };

        const data = await factureRepository.statistitqueArchivageFactureRC(dateDebutFin);
        sendResponse(
            response,
            200,
            "SUCCESS",
            "Request executed successfully",
            {
                data: data
            }
        );
    } catch (e) {
        logger.error(request.correlationId + " ==> Error caught in [findAllStatArchivageRC Statistique Archivage facture RC] ==> " + e.stack);
        sendResponse(
            response,
            500,
            "ERROR",
            "An error occurred while processing the request findAllStatArchivageRC Statistique Archivage facture RC",
            null
        );
    }
};

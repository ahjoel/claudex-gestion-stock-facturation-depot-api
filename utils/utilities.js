//this file will contain all the generic functions
const bcrypt = require('bcrypt');
const saltRounds = 12;
const axios = require("axios");
const {logger} = require('../utils/logger');
const fs = require('fs');
const handlebars = require('handlebars');
const FormData = require('form-data');
const Excel = require('excel4node');
const moment = require('moment');


class Utilities {

    getRandomIntWithSize(size) {
        if (size <= 0) {
            throw new Error('Size must be a positive integer');
        }

        const min = Math.pow(10, size - 1); // Minimum value (inclusive)
        const max = Math.pow(10, size);     // Maximum value (exclusive)

        // Generate a random integer between min (inclusive) and max (exclusive)
        return Math.floor(Math.random() * (max - min)) + min;
    }

    async hashPassword(password) {
        try {
            return await bcrypt.hash(password, saltRounds);
        } catch (error) {
            throw error;
        }
    }

    async verifyPassword(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            return false;
        }
    }

    formattingMailContentOtp(otp) {
        try {
            // Read the email template from the file
            const emailTemplateSource = fs.readFileSync("./configs/email_templates/otp.hbs", "utf8");

            // Compile the template
            const emailTemplate = handlebars.compile(emailTemplateSource);

            // Define the data to fill in the template
            const emailData = {
                subject: process.env.OTP_MAIL_OBJECT.toString(),
                message: process.env.OTP_EMAIL_CONTENT.toString().replace("%otp%", otp),
            };


            return emailTemplate(emailData);
        } catch (e) {
            logger.error(request.correlationId + " ==> Error while formatting the mail's content " + e.stack);
            return "Nothing to send";
        }
    }

    async sendEmail(jsonBody, attachedFiles) {
        const eventContent = ``;
        let requestBody = new FormData();

        requestBody.append('fields', JSON.stringify(jsonBody));

        // logger.info(JSON.stringify(jsonBody));

        if (attachedFiles.length > 0) {
            for (const file of attachedFiles) {
                const [filename, pathname] = file.split(";");
                const mediaType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // Change this to the appropriate media type if needed
                logger.info("pathOfFile :: " + pathname)
                requestBody.append('files[]', fs.createReadStream(pathname), {
                    filename,
                    contentType: mediaType
                });
            }
        }


        try {
            const response = await axios.post(process.env.MS_EMAIL_SERVICE_URL, requestBody, {
                headers: {
                    ...await requestBody.getHeaders(),
                },
            });

            const result = response.data || '';

            logger.info(result)

            if (!result.isEmpty && !result.startsWith('FAILURE')) {
                logger.info(
                    "Mail sent " + eventContent
                );
            } else {
                logger.info(
                    "Mail not sent " + eventContent
                );
            }
        } catch (error) {
            console.error(error);
        }
    }

    async sendSms(message, mobile, smsSender) {
        const jsonRequest = {
            appName: "Device_Financing",
            senderOfSms: smsSender,
            destination: mobile,
            message: message,
            smsAccount: process.env.SMS_ACCOUNT.toString()
        };

        try {
            logger.info("Start sending sms with content ==> " + message);

            axios.post(process.env.SMS_URL, jsonRequest, {
                headers: {
                    "Accept": 'application/json',
                    "Content-Type": 'application/json'
                }
            }).then(response => {
                logger.info("sendSms response status ==> " + response.status + " response data ==> " + JSON.stringify(response.data));
            });

        } catch (e) {
            logger.error(request.correlationId + " ==> Error caught in sendSms ==> " + e + " error content ==> " + e.response.data);
        }
    }

    extractPhoneNumberPart(number) {
        const prefixes = [
            '228',
            '+228',
            '00228'
        ];

        let extractedNumber = number.toString();
        for (const prefix of prefixes) {
            if (extractedNumber.startsWith(prefix)) {
                extractedNumber = extractedNumber.slice(prefix.length);
                break;
            }
        }

        return extractedNumber;
    }

    async writeXLSXFileBis(path, jsonDataArray) {
        logger.info("Data size ==> " + jsonDataArray.length)
        for (let item of jsonDataArray) {
            delete item.images;
            delete item.deviceStockId;
            delete item.agencyId;
            delete item.offerId;
            delete item.deviceId;
        }

        let success = false;
        let workbook;

        try {
            // Create a new workbook
            workbook = new Excel.Workbook();
            const worksheet = workbook.addWorksheet('Résultat');

            // Define a style for the header row (bold font)
            const headerStyle = workbook.createStyle({
                font: {bold: true},
                alignment: {
                    horizontal: 'center',
                    vertical: 'center',
                }
            });
            const bodyStyle = workbook.createStyle({
                alignment: {
                    horizontal: 'center',
                    vertical: 'center',
                    textRotation: 0, // Text rotation angle
                    indent: 1, // Indentation in points
                }
            });

            // Extract the keys (column names) from the first object in the JSON data
            const columnNames = Object.keys(jsonDataArray[0]);


            // Add column headers with the defined style
            columnNames.forEach((columnName, colIndex) => {
                worksheet.cell(1, colIndex + 1).string(columnNameMapping(columnName)).style(headerStyle);
            });

            // Add JSON data to the worksheet
            jsonDataArray.forEach((data, rowIndex) => {
                columnNames.forEach((columnName, colIndex) => {
                    const cellValueToPrint = columnDataMapping(columnName, String(data[columnName]));

                    worksheet.cell(rowIndex + 2, colIndex + 1).string(
                        cellValueToPrint === 'null' ? '' : cellValueToPrint
                    ).style(bodyStyle);
                    worksheet.column(colIndex + 1).setWidth(columnName.length + 15); //justify content
                });
            });


            // Write the workbook to a file
            const buffer = await workbook.writeToBuffer();

            // Write the buffer to the file
            fs.writeFileSync(path, buffer);

            success = true;
            logger.info('Excel file created successfully.');
        } catch (error) {
            logger.error(`Error while creating XLSX file: ${error.stack}`);
        }

        return success;
    }
}

function columnNameMapping(columnName) {
    let returnValue;
    switch (columnName.toString()) {
        case 'color':
            // Do something for 'color'
            returnValue = "Code Couleur"
            break;
        case 'colorDescription':
            // Do something for 'colorDescription'
            returnValue = "Description Couleur"
            break;
        case 'sold':
            returnValue = "Etat de vente"

            break;
        case 'createdAt':
            returnValue = "Date de création"

            break;
        case 'updatedAt':
            returnValue = "Date de mise à jour"
            break;
        case 'ref':
            returnValue = "Référence"
            break;
        case 'brand':
            returnValue = "Marque"
            break;
        case 'model':
            returnValue = "Modèle"
            break;
        case 'description':
            returnValue = "Description"
            break;
        case 'agencyName':
            returnValue = "Agence"
            break;
        case 'agencyAddress':
            returnValue = "Adresse agence"
            break;
        case 'offerCode':
            returnValue = "Code offre"
            break;
        case 'offerName':
            returnValue = "Nom offre"
            break;
        case 'sellingPrice':
            returnValue = "Prix de vente"
            break;
        case 'refundPeriod':
            returnValue = "Période de remboursement"
            break;
        case 'refundFrequency':
            returnValue = "Fréquence de remboursement"
            break;
        case 'initialDepositAmount':
            returnValue = "Montant de dépôt initial"
            break;
        case 'warrantyDuration':
            returnValue = "Durée de garantie"
            break;
        case 'savProposed':
            returnValue = "SAV proposé"
            break;
        default:
            returnValue = columnName;
    }

    return returnValue;

}

function columnDataMapping(columnName, value) {
    let returnValue;
    switch (columnName.toString()) {
        case 'sold':
            if (value.toString() === "0") {
                returnValue = "Disponible"
            } else {
                returnValue = "Indisponible"
            }
            break;

        default:
            returnValue = value;
    }

    return returnValue;

}

module.exports = new Utilities();

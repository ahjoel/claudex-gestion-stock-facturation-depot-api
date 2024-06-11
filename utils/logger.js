//define here the basic module to handle our logs

const winston = require('winston');
require('winston-daily-rotate-file');

const LOGS_PATH = process.env.LOGS_PATH;

const logger = winston.createLogger({
    transports: [
        new winston.transports.DailyRotateFile({
            filename: `${LOGS_PATH}` + '%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: false,
            maxSize: '450m',
            maxFiles: '30d',
            level: 'info',
            format: winston.format.combine(
                winston.format.printf(
                    (info) => {
                        return `${(new Date()).toJSON().replace("T", " ").replace("Z","")}: ${info.level.toUpperCase()}: ${info.message}`;
                    })
            )
        }),
        new (winston.transports.Console)({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(
                    (info) => {
                        return `${(new Date()).toJSON().replace("T", " ").replace("Z","")}: ${info.level}: ${info.message}`;
                    })
            ),
        })
    ]
});

module.exports.logger = logger
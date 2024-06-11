//This file will help you to connect to a specific db
const mariadb = require("mariadb");
require("dotenv").config();

const claudexBarsDB = mariadb.createPool({
  host: process.env.CLAUDEX_BARS_HOST,
  port: process.env.CLAUDEX_BARS_PORT,
  user: process.env.CLAUDEX_BARS_USER,
  password: process.env.CLAUDEX_BARS_PASSWORD,
  database: process.env.CLAUDEX_BARS_NAME,
  timezone: 'Z'
});

// Expose the Pool object within this module
module.exports = Object.freeze({
  claudexBarsDB,
});

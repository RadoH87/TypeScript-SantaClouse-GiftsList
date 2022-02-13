const { createPool } = require("mysql2/promise");

const pool = createPool({
  host: "localhost",
  user: "root",
  database: "megak_santa_gifts",
  namedPlaceholders: true,
  decimalNumbers: true,
});

module.exports = {
  pool,
};

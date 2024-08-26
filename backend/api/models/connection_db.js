const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: "localhost",
    user: "root",
    database: "pwdka_db",
  },
  pool: { min: 0, max: 7 },
});

knex.raw("SELECT VERSION()").then(() => {
  console.log(`Connection To DB is Successful`);
});
module.exports = knex;

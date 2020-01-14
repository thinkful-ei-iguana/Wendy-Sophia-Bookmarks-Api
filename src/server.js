const knex = require("knex");
const app = require("./app");
const { PORT, DB_URL } = require("./config");

// connect to my database, and save that logged in state into a variable called db
const db = knex({
  client: "pg",
  connection: DB_URL
});

// express declares the equivalent of a global variable called db
app.set("db", db);

// open ups a port on specificed port number
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost: ${PORT}`);
});
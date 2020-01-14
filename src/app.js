require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const { NODE_ENV } = require("./config");
const app = express();
const BookmarkRouter = require("./bookmarks/bookmarks-router")

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

// third party usings
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

// routing usings
app.use("/bookmarks", BookmarkRouter);
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
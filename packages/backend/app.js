var express = require("express");
var logger = require("morgan");

var pendingRounter = require("./routes/pending");
var verifyRouter = require("./routes/verify");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/pending", pendingRounter);
app.use("/verify", verifyRouter);

module.exports = app;

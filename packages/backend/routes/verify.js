var express = require("express");
var router = express.Router();

/* GET users listing. */
router.post("/", function (req, res, next) {
  res.send(
    `verify router response. Received data: ${JSON.stringify(req.body)}`
  );
});

module.exports = router;

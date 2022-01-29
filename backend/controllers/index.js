var router =  require('express').Router();
var routes = require("./routes");

router.use("/", routes);
module.exports = router;
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send({
      name : 'api',
      version: '0.0.1'
  });
});

module.exports = router;
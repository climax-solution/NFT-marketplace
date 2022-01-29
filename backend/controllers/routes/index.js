var router = require('express').Router();
const { route } = require('..');
var users = require('./users');
var auth = require('./auth');

router.use('/user', users);
router.auth('/auth', auth);

module.exports = router;
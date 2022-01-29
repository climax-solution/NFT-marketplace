var router = require('express').Router();
const { route } = require('..');
var users = require('./users');
var auth = require('./auth');

router.use('/user', users);
router.use('/auth', auth);

module.exports = router;
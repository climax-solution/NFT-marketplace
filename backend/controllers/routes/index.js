let router = require('express').Router();
let users = require('./users');
let auth = require('./auth');
let activity = require('./activitiy');

router.use('/user', users);
router.use('/auth', auth);
router.use('/activity', activity);

module.exports = router;
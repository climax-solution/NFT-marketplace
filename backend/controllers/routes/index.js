let router = require('express').Router();
let users = require('./users');
let auth = require('./auth');
let activity = require('./activitiy');
let newsletter = require('./externals');

router.use('/user', users);
router.use('/auth', auth);
router.use('/activity', activity);
router.use('/news', newsletter);

module.exports = router;
let router = require('express').Router();
let users = require('./users');
let auth = require('./auth');
let activity = require('./activitiy');
let newsletter = require('./externals');
let sale = require('./sale');
let folder = require('./folder');
let admin = require('./admin');

router.use('/user', users);
router.use('/auth', auth);
router.use('/activity', activity);
router.use('/news', newsletter);
router.use('/folder', folder);
router.use('/sale', sale);
router.use('/admin', admin);

module.exports = router;
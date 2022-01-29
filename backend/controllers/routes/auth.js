var router = require('express').Router();
var emailValidator = require('email-validator');
var walletValidator = require('wallet-address-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
var UserSchema = require('../../models/users');

const { secret, tokenLife } = require("../../config/key");

router.use('/login', (req, res) => {

});

router.use('/register', (req, res) => {
    try {
        const { username, firstName, lastName, email, country, phoneNumber, walletAddress, password } = req.body;
        if (!emailValidator(email)) {
            return res.status(400).json({ error: 'You must enter an correct email address.' });
        }

        else if (!walletValidator(walletAddress, 'ETH')) {
            return res.status(400).json({ error: 'You must enter an correct BSC wallet address.' });
        }

        if (!firstName || !lastName) {
            return res.status(400).json({ error: 'You must enter your full name.' });
        }
    
        if (!password) {
            return res.status(400).json({ error: 'You must enter a password.' });
        }

        if (!country) {
            return res.status(400).json({ error: 'You must enter a country.' });
        }

        if (!phoneNumber) {
            return res.status(400).json({ error: 'You must enter a phone number.' });
        }

        if (!username) {
            return res.status(400).json({ error: 'You must enter a user name.' });
        }

        const existingEmail = await UserSchema({ email });
        const existingUserName = await UserSchema({ username });
        const existingWallet =  await UserSchema({ walletAddress });

        if (existingEmail) {
            return res.status(400).json({ error: 'That email address is already in use.' });
        }

        if (eexistingUserName) {
            return res.status(400).json({ error: 'That username is already in use.' });
        }

        if (existingWallet) {
            return res.status(400).json({ error: 'That wallet address is already in use.' });
        }

        let user = new UserSchema({
            email,
            username,
            firstName,
            lastName,
            country,
            phoneNumber,
            walletAddress,
            password
        });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        
        user.password = hash;
        const registeredUser = await user.save();

        const payload = {
            id: registeredUser.id
        };

        const token = jwt.sign(payload, secret, { expiresIn: tokenLife });

        return res.status(200).json({
            success: true,
            token: `Bearer ${token}`,
            user: registeredUser
        });
        
    } catch(err) {
        console.error(err);
    }
});

module.exports = router;
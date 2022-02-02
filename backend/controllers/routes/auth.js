let router = require('express').Router();
let emailValidator = require('email-validator');
let walletValidator = require('wallet-address-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const checkAuth = require("../../helpers/auth");
let UserSchema = require('../../models/users');
const { jwt: JWT } = require("../../config/key");

router.post('/login', async(req, res) => {
    try {
        let { id, password } = req.body;
        const exitingEmail = await UserSchema.findOne({ email: id });
        const existingUserName = await UserSchema.findOne({ username: id });
        if (existingUserName || exitingEmail) {
            const user = existingUserName ? existingUserName : exitingEmail;
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (!isMatch) {
                return res.status(400).json({
                    error: 'No existing user1.'
                });
            }

            const payload = {
                id: user.id
            };

            const token = jwt.sign(payload, JWT.secret, { expiresIn: JWT.tokenLife });

            return res.status(200).json({
                success: true,
                token: `Bearer ${token}`
            });
        }
        else {
            res.status(400).json({
                error: 'No existing user'
            });
        }
    } catch(err) {
        res.status(400).json({
            error: 'Your request could not be processed. Please try again.'
        }); 
    }
});

router.post('/register', async(req, res) => {
    try {
        const { username, firstName, lastName, email, country, phoneNumber, walletAddress, password, brithday } = req.body;
        if (!emailValidator.validate(email)) {
            return res.status(400).json({ error: 'You must enter an correct email address.' });
        }

        else if (!walletValidator.validate(walletAddress, 'ETH')) {
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

        const existingEmail = await UserSchema.findOne({ email });
        const existingUserName = await UserSchema.findOne({ username });
        const existingWallet =  await UserSchema.findOne({ walletAddress });
        if (existingEmail) {
            return res.status(400).json({ error: 'That email address is already in use.' });
        }

        if (existingUserName) {
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
            brithday,
            password
        });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        
        user.password = hash;
        const registeredUser = await user.save();

        const payload = {
            id: registeredUser.id
        };

        const token = jwt.sign(payload, JWT.secret, { expiresIn: JWT.tokenLife });

        return res.status(200).json({
            success: true,
            token: `Bearer ${token}`,
            user: registeredUser
        });

    } catch(err) {
        console.error(err);
    }
});

router.post('/check-authentication', async(req, res) => {
    const result = await checkAuth(req);
    if (!result) return res.status(400).json({ error: "No validation"});
    res.status(200).json({ token: result});
});

router.post('/logout', async(req, res) => {
    
})
module.exports = router;
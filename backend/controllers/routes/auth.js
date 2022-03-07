let router = require('express').Router();
let emailValidator = require('email-validator');
let walletValidator = require('wallet-address-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { CourierClient } = require("@trycourier/courier");

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
                    error: 'No existing user.'
                });
            }

            const payload = {
                id: user.id
            };

            const token = jwt.sign(payload, JWT.secret, { expiresIn: JWT.tokenLife });

            return res.status(200).json({
                success: true,
                token: `Bearer ${token}`,
                user: existingUserName
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

router.post('/forgot', async(req, res) => {
    try {
        const { email } = req.body;
        if (!emailValidator.validate(email)) {
            return res.status(400).json({ error: 'You must enter an correct email address.' });
        }

        const existingUser = await UserSchema.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ error: "We can't find user with your email." });
        }

        const buffer = crypto.randomBytes(48);
        const resetToken = buffer.toString('hex');

        existingUser.resetPasswordToken = resetToken;
        existingUser.resetPasswordExpires = Date.now() + 3600000;

        existingUser.save();
        const courier = CourierClient({ authorizationToken: "pk_prod_YTMEXMYZA84MWVPTW3KHYS44B1S0"});

        const { requestId } = await courier.send({
            message: {
                content: {
                    title: "Reset Password",
                    body: `${
                        'You are receiving this because you have requested to reset your password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'https://marketplace.nftdevelopments.site/reset-password/'
                    }${resetToken}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`
                },
                data: {
                    joke: ""
                },
                to: {
                    email: email
                }
            }
        });
        res.status(200).json({
            status: true,
            message: 'Please check your email and reset password.'
        })
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
})

router.post('/reset/:token', async(req, res) => {

    try {
        const { password } = req.body;

        const resetUser = await UserSchema.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });
    
        if (!resetUser) {
            return res.status(400).json({
            error:
                'Your token has expired. Please attempt to reset your password again.'
            });
        }
    
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
    
        resetUser.password = hash;
        resetUser.resetPasswordToken = undefined;
        resetUser.resetPasswordExpires = undefined;
        resetUser.save();

        res.status(200).json({
            success: true,
            message:
            'Password changed successfully. Please login with your new password.'
        });
    } catch(err) {
        console.error(err);
        res.status(400).json({
            error: "Your request is restricted"
        });
    }

});

router.post('/check-authentication', async(req, res) => {
    const result = await checkAuth(req);
    if (!result) return res.status(400).json({ error: "No validation"});
    const user = await UserSchema.findOne({ _id: { $in: [result.id]}})
    res.status(200).json(user);
});

module.exports = router;
let router = require('express').Router();
let emailValidator = require('email-validator');
let walletValidator = require('wallet-address-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const checkAuth = require("../../helpers/auth");
let UserSchema = require('../../models/users');
const { jwt: JWT } = require("../../config/key");

const { CourierClient } = require("@trycourier/courier");
const mongoose = require('mongoose');
const { authSign } = require('../../helpers/check_sign');
const courier = CourierClient({ authorizationToken: "pk_prod_YTMEXMYZA84MWVPTW3KHYS44B1S0"});

router.post('/login', async(req, res) => {
    try {
        let { id, password } = req.body;
        // const exitingEmail = await UserSchema.findOne({ email: id });
        const existingUserName = await UserSchema.findOne({ username: id });
        if (existingUserName) {
            // const user = existingUserName ? existingUserName : exitingEmail;
            const user = existingUserName;
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (!isMatch) {
                return res.status(400).json({
                    error: 'Password is not correct.'
                });
            }

            // if (!user.verified) {

            //     const buffer = crypto.randomBytes(48);
            //     const verifyToken = buffer.toString('hex');

            //     user.verifyToken = verifyToken;
            //     await user.save();

            //     // await courier.send({
            //     //     message: {
            //     //         content: {
            //     //             title: "Verify your account",
            //     //             body: `${
            //     //                 'You are receiving this because you have requested to regsitered into platform.\n\n' +
            //     //                 'Please verify account\n\n' +
            //     //                 'https://marketplace.nftdevelopments.site/verify/'
            //     //             }${verifyToken}/${user.email}/${user.username}`
            //     //         },
            //     //         data: {
            //     //             joke: ""
            //     //         },
            //     //         to: {
            //     //             email: user.email
            //     //         },
            //     //         timeout: {
            //     //             message: 600000
            //     //         }
            //     //     }
            //     // });
            //     return res.status(400).json({
            //         status: true,
            //         error: 'Your account is not verified. Please check your email and verify account.'
            //     })

            // };

            const payload = {
                id: user.id
            };

            const token = jwt.sign(payload, JWT.secret, { expiresIn: JWT.tokenLife });

            return res.status(200).json({
                success: true,
                token: `Bearer ${token}`,
                user: user
            });
        }
        else {
            res.status(400).json({
                error: 'No existing user'
            });
        }
    } catch(err) {
        res.status(400).json({
            error: 'Your request is restricted'
        }); 
    }
});

router.post('/register', async(req, res) => {
    try {
        const { walletAddress, signature, action } = req.body;
        // if (!emailValidator.validate(email)) {
        //     return res.status(400).json({ error: 'You must enter an correct email address.' });
        // }

        if (!walletValidator.validate(walletAddress, 'ETH')) {
            return res.status(400).json({ error: 'You must enter an correct BSC wallet address.' });
        }

        // if (!name) {
        //     return res.status(400).json({ error: 'You must enter your full name.' });
        // }
    
        // if (!password) {
        //     return res.status(400).json({ error: 'You must enter a password.' });
        // }

        // if (!username) {
        //     return res.status(400).json({ error: 'You must enter a user name.' });
        // }

        // const existingEmail = await UserSchema.findOne({ email });
        // const existingUserName = await UserSchema.findOne({ username });
        const existingWallet =  await UserSchema.findOne({ walletAddress });
        // if (existingEmail) {
        //     return res.status(400).json({ error: 'That email address is already in use.' });
        // }

        // if (existingUserName) {
        //     return res.status(400).json({ error: 'That username is already in use.' });
        // }

        if (existingWallet) {
            return res.status(400).json({ error: 'That wallet address is already in use.' });
        }

        const validateSign  = await authSign(walletAddress, action, signature);
        if (!validateSign) {
            return res.status(400).json({ error: 'Signature is invalid.' });
        }
        const buffer = crypto.randomBytes(48);
        // const verifyToken = buffer.toString('hex');

        let user = new UserSchema({
            // email,
            // username,
            // name,
            walletAddress,
            // password,
            // verifyToken
        });

        // const salt = await bcrypt.genSalt(10);
        // const hash = await bcrypt.hash(user.password, salt);
        
        // user.password = hash;
        await user.save();

        // const payload = {
        //     id: registeredUser.id
        // };

        // const token = jwt.sign(payload, JWT.secret, { expiresIn: JWT.tokenLife });

        // await courier.send({
        //     message: {
        //         content: {
        //             title: "Verify your account",
        //             body: `${
        //                 'You are receiving this because you have requested to regsitered into platform.\n\n' +
        //                 'Please verify account.\n\n' +
        //                 'https://marketplace.nftdevelopments.site/verify/'
        //             }${verifyToken}/${email}/${username}`
        //         },
        //         data: {
        //             joke: ""
        //         },
        //         to: {
        //             email: email
        //         },
        //         timeout: {
        //             message: 600000
        //         }
        //     }
        // });
        res.status(200).json({
            status: true,
            message: 'You have registered. Please login.'
        })

        // return res.status(200).json({
        //     success: true,
        //     token: `Bearer ${token}`,
        //     user: registeredUser
        // });

    } catch(err) {
        console.log(err)
        res.status(400).json({
            error: "Your request is restricted"
        });
    }
});

router.post('/verify', async(req, res) => {
    try {
        const { token, email, username } = req.body;
        console.log(email, username);
        let _existed = await UserSchema.findOne({ email, username });
        if (!_existed) {
            return res.status(400).json({
                error: "Your account is unregistered"
            });
        }
        _existed = await UserSchema.findOne({ verifyToken: token, email, username, verified: false});
        if (!_existed) {
            return res.status(400).json({
                error: "Token is expired"
            });
        }
        _existed.verified = true;
        _existed.verifyToken = '';
        await _existed.save();
        res.status(200).json({
            message: "Your account is verfied."
        })
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
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
                },
                timeout: {
                    message: 600000
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
    const user = await UserSchema.findOne({ _id: mongoose.Types.ObjectId(result.id)});
    res.status(200).json(user);
});

module.exports = router;
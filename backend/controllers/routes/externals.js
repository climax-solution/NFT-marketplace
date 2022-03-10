let router = require('express').Router();
let emailValidator = require('email-validator');
const { CourierClient } = require("@trycourier/courier");

router.post('/request', async(req, res) => {
    try {
        const { email } = req.body;
        if (!emailValidator.validate(email)) {
            return res.status(400).json({
                error: "Not validate email"
            })
        }

        const courier = CourierClient({ authorizationToken: "pk_prod_YTMEXMYZA84MWVPTW3KHYS44B1S0"});
        const { requestId } = await courier.send({
            message: {
                content: {
                    title: "Request News",
                    body: `${email}`
                },
                data: {
                    joke: ""
                },
                to: {
                    email: "enquires@nftdevelopments.com"
                }
            }
        });

        res.status(200).json({
            message: "Success sent"
        })
    } catch(err) {
        res.status(400).json({
            error: "Your request is restricted"
        });
    }

})

router.post('/reply', async(req, res) => {

})

module.exports = router;
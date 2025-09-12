var express = require("express");
var router = express.Router();
var dbUtils = require("./common/dbUtility");
const bcrypt = require('bcrypt');
console.log("frm signup")
    var randomNo = Math.floor(Math.random() * 10)
    console.log(randomNo)

router.post('/', async (req, res) => {
    var resObj = {};
    var userAccountDetails = req.body;
    // Validation for required fields
    if (!userAccountDetails.email || !userAccountDetails.password || !userAccountDetails.mobile) {
        resObj.msg = 'All fields are required: email, password, and mobile.';
        resObj.type = 'required';
        return res.status(400).send(JSON.stringify(resObj));
    }

    // Restrict future DOB
    if (userAccountDetails.dob) {
        const dobDate = new Date(userAccountDetails.dob);
        const now = new Date();
        if (dobDate > now) {
            resObj.msg = 'Date of Birth cannot be in the future.';
            resObj.type = 'invalid_dob';
            return res.status(400).send(JSON.stringify(resObj));
        }
    }
    try {
        // Check for existing email or mobile number
        const duplicateUser = await dbUtils.doDbCommunication({
            $or: [
                { email: userAccountDetails.email },
                { mobile: userAccountDetails.mobile }
            ]
        }, 'find', 'userAccountDetails');

        if (duplicateUser && duplicateUser.length > 0) {
            const emailExists = duplicateUser.some(u => u.email === userAccountDetails.email);
            const mobileExists = duplicateUser.some(u => u.mobile === userAccountDetails.mobile);
            if (emailExists && mobileExists) {
                resObj.msg = 'Both email and mobile number are already registered.';
                resObj.type = 'duplicate_both';
            } else if (emailExists) {
                resObj.msg = 'Email is already registered.';
                resObj.type = 'duplicate_email';
            } else {
                resObj.msg = 'Mobile number is already registered.';
                resObj.type = 'duplicate_mobile';
            }
            return res.status(400).send(JSON.stringify(resObj));
        }

        bcrypt.hash(userAccountDetails.password, 5, function(err, hash) {
            if (err) {
                resObj.msg = 'An error occurred. Please try again.';
                return res.send(JSON.stringify(resObj));
            }
            userAccountDetails.password = hash;
            dbUtils.doDbCommunication(userAccountDetails, 'insertOne', 'userAccountDetails').then((result) => {
                if(!result) {
                    resObj.msg = 'An error occurred. Please try again.';
                } else {
                    resObj.msg = 'Done';
                }
                res.send(JSON.stringify(resObj));
            }).catch((err) => {
                resObj.msg = 'An error occurred. Please try again.';
                res.send(JSON.stringify(resObj));
            });
        });
    } catch(err) {
        console.log(err);
    resObj.msg = 'An error occurred. Please try again.';
        res.send(JSON.stringify(resObj));
    }
});


module.exports = router;
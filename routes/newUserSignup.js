var express = require("express");
var router = express.Router();
var dbUtils = require("./common/dbUtility");
const bcrypt = require('bcrypt');
console.log("frm signup")
    var randomNo = Math.floor(Math.random() * 10)
    console.log(randomNo)

router.post('/', async (req, res) => {
    var resObj = {};
    var userAccountDetails = req.body || {};

    // Backend validations
    const errors = [];

    // Name/accountId: 3-20 characters
    const name = (userAccountDetails.accountId || '').trim();
    if (!name || name.length < 3 || name.length > 20) {
        errors.push({ field: 'accountId', message: 'Name must be between 3 and 20 characters.' });
    }

    // Email required and basic format
    const email = (userAccountDetails.email || '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push({ field: 'email', message: 'Please provide a valid email address.' });
    }

    // Password: 1 uppercase, 1 lowercase, 1 number, 1 special, length 8-12
    const password = userAccountDetails.password || '';
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,12}$/;
    if (!password || !pwdRegex.test(password)) {
        errors.push({ field: 'password', message: 'Password must be 8-12 characters, include uppercase, lowercase, number and a special character.' });
    }

    // Mobile: exactly 10 digits, positive only, no special chars
    const mobileRaw = (typeof userAccountDetails.mobile !== 'undefined') ? userAccountDetails.mobile : userAccountDetails.mobileNumber;
    const mobileRegex = /^\d{10}$/;
    let mobile = '';
    if (typeof mobileRaw === 'number') {
        if (mobileRaw < 0) {
            errors.push({ field: 'mobile', message: 'Mobile number must be a positive 10-digit number.' });
        }
        mobile = Math.abs(mobileRaw).toString();
    } else {
        mobile = (mobileRaw || '').toString().trim();
    }
    if (!mobile || !mobileRegex.test(mobile)) {
        errors.push({ field: 'mobile', message: 'Mobile number must be exactly 10 digits and contain only numbers.' });
    }

    // Address: optional but max 250 characters
    const address = (userAccountDetails.address || '').trim();
    if (address.length > 250) {
        errors.push({ field: 'address', message: 'Address cannot exceed 250 characters.' });
    }

    if (errors.length > 0) {
        // Respond with structured errors and firstError pointer so frontend can focus
        return res.status(400).json({ errors: errors, firstError: errors[0].field });
    }
    try {
        // Check for existing email or mobile number
        const duplicateUser = await dbUtils.doDbCommunication({
            $or: [
                { email: email },
                { mobile: mobile }
            ]
        }, 'find', 'userAccountDetails');

        if (duplicateUser && duplicateUser.length > 0) {
            if (duplicateUser.some(u => u.email === email)) {
                return res.status(409).json({ errors: [{ field: 'email', message: 'Email is already registered.' }], firstError: 'email' });
            } else {
                return res.status(409).json({ errors: [{ field: 'mobile', message: 'Mobile number is already registered.' }], firstError: 'mobile' });
            }
        }

            bcrypt.hash(password, 5, function(err, hash) {
            if (err) {
                resObj.msg = 'An error occurred. Please try again.';
                return res.send(JSON.stringify(resObj));
            }
            userAccountDetails.password = hash;
            // normalize fields to match DB shape
            userAccountDetails.email = email;
            userAccountDetails.mobile = mobile;
            userAccountDetails.accountId = name;

            dbUtils.doDbCommunication(userAccountDetails, 'insertOne', 'userAccountDetails').then((result) => {
                if(!result) {
                    resObj.msg = 'An error occurred. Please try again.';
                } else {
                    resObj.msg = 'Done';
                }
                res.json(resObj);
            }).catch((err) => {
                resObj.msg = 'An error occurred. Please try again.';
                res.status(500).json(resObj);
            });
        });
    } catch(err) {
        console.log(err);
    resObj.msg = 'An error occurred. Please try again.';
        res.send(JSON.stringify(resObj));
    }
});


module.exports = router;